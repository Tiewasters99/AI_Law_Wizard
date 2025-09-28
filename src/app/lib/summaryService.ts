import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { prisma } from '../../lib/database';

// Initialize OpenAI for summary generation
const summaryModel = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 500,
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface for summary generation options
interface SummaryOptions {
  maxLength?: number;
  includeKeywords?: boolean;
  focusAreas?: string[];
}

// Generate a concise summary for a document chunk
export async function generateChunkSummary(
  content: string,
  options: SummaryOptions = {}
): Promise<string> {
  const { maxLength = 200, includeKeywords = true, focusAreas = [] } = options;

  const systemPrompt = `You are an expert document summarizer. Create a concise, informative summary that captures the key points and main ideas of the provided content.

Guidelines:
- Keep the summary under ${maxLength} characters
- Focus on the most important information
- Use clear, professional language
- ${includeKeywords ? 'Include key terms and concepts' : 'Focus on main ideas'}
- ${focusAreas.length > 0 ? `Pay special attention to: ${focusAreas.join(', ')}` : ''}
- Make it useful for quick reference and search

Return only the summary text, no additional formatting.`;

  const userPrompt = `Please summarize the following content:\n\n${content}`;

  try {
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ];

    const response = await summaryModel.invoke(messages);
    return response.content.toString().trim();
  } catch (error) {
    console.error('Error generating chunk summary:', error);
    // Fallback to a simple truncation if AI fails
    return content.length > maxLength 
      ? content.substring(0, maxLength - 3) + '...'
      : content;
  }
}

// Generate metadata for enhanced search
export async function generateChunkMetadata(
  content: string,
  summary: string
): Promise<Record<string, any>> {
  const systemPrompt = `You are an expert at extracting metadata from documents. Analyze the content and summary to extract useful metadata for search and categorization.

Extract the following information:
- Key topics and subjects
- Document type (legal, technical, business, etc.)
- Important dates, numbers, or statistics
- Key entities (people, organizations, locations)
- Document structure indicators
- Complexity level (basic, intermediate, advanced)

Return ONLY a valid JSON object with the extracted metadata. Do not wrap it in markdown code blocks or any other formatting. Return pure JSON that can be parsed directly.`;

  const userPrompt = `Content: ${content}\n\nSummary: ${summary}\n\nExtract metadata as JSON.`;

  try {
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ];

    const response = await summaryModel.invoke(messages);
    const metadataText = response.content.toString().trim();
    
    // Try to parse the JSON response directly
    try {
      return JSON.parse(metadataText);
    } catch (parseError) {
      console.warn('Failed to parse metadata JSON, using fallback');
      return {
        topics: extractTopics(content),
        documentType: 'general',
        complexity: 'intermediate',
        wordCount: content.split(' ').length,
        hasNumbers: /\d+/.test(content),
        hasDates: /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(content)
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      topics: extractTopics(content),
      documentType: 'general',
      complexity: 'intermediate',
      wordCount: content.split(' ').length,
      hasNumbers: /\d+/.test(content),
      hasDates: /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(content)
    };
  }
}

// Simple topic extraction as fallback
function extractTopics(content: string): string[] {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

// Update chunk with summary and metadata
export async function updateChunkWithSummary(
  chunkId: string,
  summary: string,
  metadata: Record<string, any>
): Promise<void> {
  try {
    await prisma.embeddingChunk.update({
      where: { id: chunkId },
      data: {
        summary,
        metadata,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating chunk with summary:', error);
    throw error;
  }
}

// Batch process chunks to generate summaries
export async function processChunkSummaries(
  jobId: string,
  options: SummaryOptions = {}
): Promise<{ processed: number; failed: number }> {
  try {
    // Get all chunks for the job that don't have summaries yet
    const chunks = await prisma.embeddingChunk.findMany({
      where: {
        jobId,
        summary: null,
        status: 'COMPLETED'
      },
      select: {
        id: true,
        content: true
      }
    });

    let processed = 0;
    let failed = 0;

    // Process chunks in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const promises = batch.map(async (chunk) => {
        try {
          const summary = await generateChunkSummary(chunk.content, options);
          const metadata = await generateChunkMetadata(chunk.content, summary);
          
          await updateChunkWithSummary(chunk.id, summary, metadata);
          processed++;
        } catch (error) {
          console.error(`Failed to process chunk ${chunk.id}:`, error);
          failed++;
        }
      });

      await Promise.all(promises);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { processed, failed };
  } catch (error) {
    console.error('Error processing chunk summaries:', error);
    throw error;
  }
}

// Get chunks with summaries for quick retrieval
export async function getChunksWithSummaries(
  jobId: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  content: string;
  summary: string;
  metadata: any;
  chunkIndex: number;
}>> {
  try {
    const chunks = await prisma.embeddingChunk.findMany({
      where: {
        jobId,
        summary: { not: null }
      },
      select: {
        id: true,
        content: true,
        summary: true,
        metadata: true,
        chunkIndex: true
      },
      orderBy: { chunkIndex: 'asc' },
      take: limit
    });

    return chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      summary: chunk.summary!,
      metadata: chunk.metadata,
      chunkIndex: chunk.chunkIndex
    }));
  } catch (error) {
    console.error('Error fetching chunks with summaries:', error);
    throw error;
  }
}

// Search chunks by summary content
export async function searchChunksBySummary(
  jobId: string,
  query: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  content: string;
  summary: string;
  metadata: any;
  chunkIndex: number;
  relevanceScore: number;
}>> {
  try {
    const chunks = await prisma.embeddingChunk.findMany({
      where: {
        jobId,
        summary: { not: null }
      },
      select: {
        id: true,
        content: true,
        summary: true,
        metadata: true,
        chunkIndex: true
      }
    });

    // Simple text-based relevance scoring
    const queryLower = query.toLowerCase();
    const scoredChunks = chunks.map(chunk => {
      const summaryLower = chunk.summary!.toLowerCase();
      const contentLower = chunk.content.toLowerCase();
      
      let score = 0;
      
      // Check for exact matches in summary (higher weight)
      if (summaryLower.includes(queryLower)) {
        score += 10;
      }
      
      // Check for partial matches in summary
      const summaryWords = queryLower.split(' ');
      const summaryMatches = summaryWords.filter(word => 
        summaryLower.includes(word)
      ).length;
      score += summaryMatches * 2;
      
      // Check for matches in content (lower weight)
      if (contentLower.includes(queryLower)) {
        score += 5;
      }
      
      const contentMatches = summaryWords.filter(word => 
        contentLower.includes(word)
      ).length;
      score += contentMatches;
      
      return {
        ...chunk,
        summary: chunk.summary!,
        relevanceScore: score
      };
    });

    return scoredChunks
      .filter(chunk => chunk.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching chunks by summary:', error);
    throw error;
  }
}
