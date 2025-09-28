import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { prisma } from '../../lib/database';
import { pineIndex, openapi } from './pineConfig';

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
// Helper function to calculate fuzzy string similarity
function calculateFuzzySimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Helper function to calculate Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Helper function to extract meaningful words (remove common stop words)
function extractMeaningfulWords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

// Helper function to calculate semantic similarity using word overlap
function calculateSemanticSimilarity(queryWords: string[], textWords: string[]): number {
  const querySet = new Set(queryWords);
  const textSet = new Set(textWords);
  
  const intersection = new Set([...querySet].filter(word => textSet.has(word)));
  const union = new Set([...querySet, ...textSet]);
  
  return intersection.size / union.size;
}

// Helper function to find fuzzy word matches
function findFuzzyMatches(queryWords: string[], textWords: string[], threshold: number = 0.7): number {
  let matches = 0;
  
  for (const queryWord of queryWords) {
    for (const textWord of textWords) {
      const similarity = calculateFuzzySimilarity(queryWord, textWord);
      if (similarity >= threshold) {
        matches += similarity; // Weight by similarity score
        break; // Only count the best match for each query word
      }
    }
  }
  
  return matches;
}

// Helper function to search using vector database directly
async function searchVectorDatabase(query: string, jobId: string, limit: number = 5): Promise<Array<{
  id: string;
  content: string;
  summary: string | null;
  metadata: any;
  chunkIndex: number;
  relevanceScore: number;
}>> {
  try {
    // Create embedding for the query
    const queryEmbedding = await openapi.embedQuery(query);
    
    // Prepare query parameters with jobId filter
    const queryParams: {
      vector: number[];
      topK: number;
      includeMetadata: boolean;
      includeValues: boolean;
      filter?: Record<string, unknown>;
    } = {
      vector: queryEmbedding,
      topK: limit * 2, // Get more results to filter by jobId
      includeMetadata: true,
      includeValues: false,
      filter: { jobId } // Filter by specific job
    };

    // Perform similarity search
    const searchResults = await pineIndex.query(queryParams);
    
    if (!searchResults.matches || searchResults.matches.length === 0) {
      return [];
    }

    // Convert vector search results to our format
    return searchResults.matches.map((match: any) => ({
      id: match.id,
      content: match.metadata?.content || '',
      summary: match.metadata?.summary || null,
      metadata: match.metadata || {},
      chunkIndex: match.metadata?.chunkIndex || 0,
      relevanceScore: match.score || 0
    }));
  } catch (error) {
    console.error('Vector database search error:', error);
    return [];
  }
}

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
    // First, try to find chunks with summaries using enhanced text matching
    const chunksWithSummaries = await prisma.embeddingChunk.findMany({
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

    let results: Array<{
      id: string;
      content: string;
      summary: string;
      metadata: any;
      chunkIndex: number;
      relevanceScore: number;
    }> = [];

    // If we have chunks with summaries, use enhanced text matching
    if (chunksWithSummaries.length > 0) {
      const queryWords = extractMeaningfulWords(query);
      
      const scoredChunks = chunksWithSummaries.map(chunk => {
        const summary = chunk.summary!;
        const content = chunk.content;
        
        // Extract meaningful words from summary and content
        const summaryWords = extractMeaningfulWords(summary);
        const contentWords = extractMeaningfulWords(content);
        
        let score = 0;
        
        // 1. Exact phrase match in summary (highest weight)
        if (summary.toLowerCase().includes(query.toLowerCase())) {
          score += 20;
        }
        
        // 2. Exact phrase match in content (high weight)
        if (content.toLowerCase().includes(query.toLowerCase())) {
          score += 15;
        }
        
        // 3. Semantic similarity in summary (high weight)
        const summarySemanticScore = calculateSemanticSimilarity(queryWords, summaryWords);
        score += summarySemanticScore * 15;
        
        // 4. Semantic similarity in content (medium weight)
        const contentSemanticScore = calculateSemanticSimilarity(queryWords, contentWords);
        score += contentSemanticScore * 10;
        
        // 5. Fuzzy matching in summary (medium weight)
        const summaryFuzzyScore = findFuzzyMatches(queryWords, summaryWords, 0.6);
        score += summaryFuzzyScore * 8;
        
        // 6. Fuzzy matching in content (lower weight)
        const contentFuzzyScore = findFuzzyMatches(queryWords, contentWords, 0.6);
        score += contentFuzzyScore * 5;
        
        // 7. Word boundary exact matches in summary (medium weight)
        const summaryExactMatches = queryWords.filter(word => 
          summaryWords.some(summaryWord => summaryWord === word)
        ).length;
        score += summaryExactMatches * 6;
        
        // 8. Word boundary exact matches in content (lower weight)
        const contentExactMatches = queryWords.filter(word => 
          contentWords.some(contentWord => contentWord === word)
        ).length;
        score += contentExactMatches * 3;
        
        // 9. Bonus for longer summaries that match (indicates more relevant content)
        if (summary.length > 100 && score > 5) {
          score += 2;
        }
        
        return {
          ...chunk,
          summary: chunk.summary!,
          relevanceScore: Math.round(score * 100) / 100 // Round to 2 decimal places
        };
      });

      results = scoredChunks
        .filter(chunk => chunk.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    }

    // If we don't have enough results from summary-based search, fall back to vector database
    if (results.length < limit) {
      console.log(`📊 Summary-based search found ${results.length} results, falling back to vector database for job ${jobId}`);
      
      const vectorResults = await searchVectorDatabase(query, jobId, limit);
      
      // Filter out results we already have and add new ones
      const existingIds = new Set(results.map(r => r.id));
      const newResults = vectorResults
        .filter(result => !existingIds.has(result.id) && result.summary !== null)
        .map(result => ({
          ...result,
          summary: result.summary! // We know it's not null from filter
        }));

      // Combine results and sort by relevance score
      results = [...results, ...newResults]
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    }

    // If still no results, try vector search without summary requirement
    if (results.length === 0) {
      console.log(`🔍 No summary-based results found, using vector database fallback for job ${jobId}`);
      
      const vectorResults = await searchVectorDatabase(query, jobId, limit);
      
      // For vector results without summaries, we'll use the vector score directly
      results = vectorResults
        .filter(result => result.content) // Ensure we have content
        .map(result => ({
          ...result,
          summary: result.summary || 'No summary available', // Provide fallback
          relevanceScore: result.relevanceScore * 0.8 // Slightly reduce score for non-summary results
        }))
        .slice(0, limit);
    }

    return results;
  } catch (error) {
    console.error('Error searching chunks by summary:', error);
    throw error;
  }
}
