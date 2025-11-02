import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";
import { z } from "zod";

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Models configuration
const MODELS = {
  GPT4O_MINI: "openai/gpt-4o-mini",
  GROK_4_LATEST: "x-ai/grok-4-latest",
} as const;

interface ProcessingRequest {
  userPrompt: string;
  searchQuery?: string;
  fileContent?: string;
  fileName?: string;
  skipVectorSearch?: boolean;
}

interface ProcessingResponse {
  success: boolean;
  result?: string;
  error?: string;
  processedFiles?: ProcessedFileInfo[];
  confidence?: number;
  operationChain?: OperationStep[];
  totalSteps?: number;
  completedSteps?: number;
  queryId?: string;
  responseMode?: "question_answering" | "action_performance";
  editedFiles?: EditedFileInfo[];
}

interface ProcessedFileInfo {
  fileId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  downloadUrl?: string;
  fileType?: string;
  jobId?: string;
  totalChunks?: number;
  processedChunks?: number;
  isOneDriveFile?: boolean;
  oneDriveId?: string | null;
}

interface EditedFileInfo {
  fileId: string;
  fileName: string;
  originalContent: string;
  editedContent: string;
  changes: string[];
}

interface OperationStep {
  operation: "summary" | "analysis" | "qa" | "action_performance";
  confidence?: number;
}

// OpenRouter API client
const createOpenRouterClient = (model: string) => ({
  async invoke(messages: any[], options: any = {}) {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AI Law Wizard Document Analysis",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.1,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
      usage: data.usage,
    };
  },
});

// Fast response mode detection using keyword matching + OpenRouter fallback
const detectResponseMode = async (
  userPrompt: string
): Promise<"question_answering" | "action_performance"> => {
  console.log("🔍 Detecting response mode");

  const questionKeywords = [
    "what",
    "how",
    "why",
    "when",
    "where",
    "who",
    "which",
    "explain",
    "describe",
    "tell me",
    "show me",
    "give me",
    "find",
    "search",
    "look for",
    "identify",
    "define",
    "clarify",
    "understand",
    "learn",
    "know",
    "discover",
    "reveal",
    "summarize",
    "summary",
    "analyze",
    "analysis",
    "extract",
    "key points",
    "main points",
    "overview",
    "highlights",
    "details",
    "content",
    "information",
    "data",
    "what does it say",
    "what is in",
    "what contains",
    "what includes",
  ];

  const actionKeywords = [
    "edit",
    "modify",
    "change",
    "update",
    "add",
    "remove",
    "delete",
    "insert",
    "rewrite",
    "reformat",
    "restructure",
    "improve",
    "fix",
    "correct",
    "adjust",
    "create",
    "write",
    "generate",
    "draft",
    "compose",
    "prepare",
    "develop",
    "build",
    "construct",
    "formulate",
    "translate",
    "convert",
    "transform",
    "adapt",
    "revise",
    "refine",
    "polish",
    "enhance",
    "optimize",
    "streamline",
    "simplify",
    "expand",
    "condense",
    "merge",
    "combine",
    "split",
    "divide",
    "organize",
    "categorize",
    "classify",
    "format",
    "style",
    "design",
    "layout",
    "structure",
    "outline",
    "plan",
    "fill",
    "populate",
    "update content",
  ];

  const lowerPrompt = userPrompt.toLowerCase();

  // Check for question patterns first
  const questionPatterns = [
    /^(what|how|why|when|where|who|which|explain|describe)/i,
    /(what|how|why|when|where|who|which|explain|describe)\s+(is|are|does|do|can|could|would|should)/i,
    /(tell me|show me|give me|find|search|look for|identify|define|clarify)/i,
    /(summarize|summary|analyze|analysis|extract|key points|main points|overview|highlights)/i,
    /(what does it say|what is in|what contains|what includes|what are the)/i,
  ];

  const actionPatterns = [
    /^(edit|modify|change|update|create|write|add|remove|delete|insert|rewrite|reformat|restructure)/i,
    /(edit|modify|change|update|create|write|add|remove|delete|insert|rewrite|reformat|restructure)\s+(the|this|my|a|an)/i,
    /(fill|populate|update content|add content|insert content|modify content)/i,
    /(merge|combine|split|divide|organize|categorize|classify|format|style|design|layout)/i,
  ];

  // Check patterns first
  const hasQuestionPatterns = questionPatterns.some(pattern =>
    pattern.test(userPrompt)
  );
  if (hasQuestionPatterns) {
    console.log(
      "❓ Detected question pattern - user wants information from documents"
    );
    return "question_answering";
  }

  const hasActionPatterns = actionPatterns.some(pattern =>
    pattern.test(userPrompt)
  );
  if (hasActionPatterns) {
    console.log(
      "🎯 Detected action pattern - user wants to perform actions on documents"
    );
    return "action_performance";
  }

  // Fallback to keyword counting
  const questionScore = questionKeywords.reduce((score, keyword) => {
    return score + (lowerPrompt.includes(keyword) ? 1 : 0);
  }, 0);

  const actionScore = actionKeywords.reduce((score, keyword) => {
    return score + (lowerPrompt.includes(keyword) ? 1 : 0);
  }, 0);

  if (questionScore > 0) {
    console.log(
      `❓ Keyword detection: question answering (score: ${questionScore})`
    );
    return "question_answering";
  }

  if (actionScore > 0) {
    console.log(
      `🎯 Keyword detection: action performance (score: ${actionScore})`
    );
    return "action_performance";
  }

  // Final fallback to OpenRouter
  console.log("🤖 Using OpenRouter fallback for mode detection");
  const client = createOpenRouterClient(MODELS.GPT4O_MINI);

  try {
    const response = (await Promise.race([
      client.invoke(
        [
          {
            role: "system",
            content:
              "Respond with only 'question' or 'action'. \n\nQUESTION: User wants to GET INFORMATION from documents (summarize, analyze, extract, overview, key points, what is in, what contains, etc.)\nACTION: User wants to PERFORM ACTIONS on documents (edit, modify, create, write, add, remove, merge, fill, populate, etc.)",
          },
          {
            role: "user",
            content: `Classify this request: "${userPrompt}"`,
          },
        ],
        { maxTokens: 10, temperature: 0.1 }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Mode detection timeout")), 5000)
      ),
    ])) as any;

    const mode = response.content.toLowerCase().trim();
    console.log(`🤖 OpenRouter fallback detected: ${mode}`);
    return mode === "action" ? "action_performance" : "question_answering";
  } catch (error) {
    console.error("OpenRouter fallback failed:", error);
    return "question_answering"; // Default fallback
  }
};

// Search for relevant files using vector similarity
const searchRelevantFiles = async (query: string): Promise<any> => {
  console.log("🔍 Finding relevant files with vector search");

  try {
    // For now, return mock data - this would integrate with Pinecone in production
    const mockFiles = [
      {
        fileId: "file-1",
        fileName: "Sample Document 1.pdf",
        originalName: "Sample Document 1.pdf",
        fileSize: 1024000,
        fileType: "pdf",
        content: "This is sample content from document 1...",
        summary: "Document 1 summary",
        relevanceScore: 0.95,
      },
      {
        fileId: "file-2",
        fileName: "Sample Document 2.docx",
        originalName: "Sample Document 2.docx",
        fileSize: 2048000,
        fileType: "docx",
        content: "This is sample content from document 2...",
        summary: "Document 2 summary",
        relevanceScore: 0.87,
      },
    ];

    return {
      success: true,
      files: mockFiles,
      error: null,
    };
  } catch (error) {
    console.error("Vector search error:", error);
    return {
      success: false,
      files: [],
      error: String(error),
    };
  }
};

// Process question answering mode
const processQuestionAnswering = async (
  request: ProcessingRequest,
  fileSearchResult: any,
  startTime: number
): Promise<ProcessingResponse> => {
  console.log("❓ Processing as question answering");

  const client = createOpenRouterClient(MODELS.GPT4O_MINI);

  // Use chunk data directly for question answering
  const chunkContext = fileSearchResult.files
    .map((file: any, index: number) => {
      const summary = file.summary ? `\nSummary: ${file.summary}` : "";
      const relevanceScore = file.relevanceScore
        ? `\nRelevance Score: ${file.relevanceScore}`
        : "";

      return `Document ${index + 1}: ${file.fileName}${relevanceScore}\nContent: ${file.content || "No content available"}${summary}\n---\n`;
    })
    .join("\n");

  const qaPrompt = `Based on the following document chunks, answer the user's question.

Document Chunks:
${chunkContext}

User Question: ${request.userPrompt}

Provide a comprehensive answer based on the available document content. If the answer cannot be found in the provided chunks, say so clearly.`;

  const response = await client.invoke([
    {
      role: "system",
      content:
        "You are a helpful assistant that answers questions based on document content.",
    },
    {
      role: "user",
      content: qaPrompt,
    },
  ]);

  const processingTime = Date.now() - startTime;

  // Map processed files
  const processedFiles: ProcessedFileInfo[] = fileSearchResult.files.map(
    (file: any, index: number) => ({
      fileId: file.fileId,
      fileName: file.fileName,
      originalName: file.originalName,
      fileSize: file.fileSize,
      downloadUrl: "",
      fileType: file.fileType,
      jobId: file.fileId,
      totalChunks: 1,
      processedChunks: 1,
      isOneDriveFile: false,
      oneDriveId: null,
    })
  );

  // Save query to database
  let queryId: string | null = null;
  try {
    const savedQuery = await prisma.documentQuery.create({
      data: {
        userQuery: request.userPrompt,
        aiResponse: response.content,
        searchQuery: request.searchQuery,
        success: true,
        confidence: 0.9,
        processingTime,
        totalSteps: 2,
        completedSteps: 2,
        toolsUsed: ["file_processing_tool"],
        filesProcessed: processedFiles as any,
      },
    });
    queryId = savedQuery.id;
    console.log(
      `💾 Question answering response saved to database with ID: ${queryId}`
    );
  } catch (dbError) {
    console.error(
      "❌ Failed to save question answering response to database:",
      dbError
    );
  }

  return {
    success: true,
    result: response.content,
    processedFiles,
    confidence: 0.9,
    operationChain: [{ operation: "qa" as const, confidence: 0.9 }],
    totalSteps: 2,
    completedSteps: 2,
    queryId: queryId as string,
    responseMode: "question_answering",
  };
};

// Process action performance mode
const processActionPerformance = async (
  request: ProcessingRequest,
  fileSearchResult: any,
  startTime: number
): Promise<ProcessingResponse> => {
  console.log("⚡ Processing as action performance");

  const client = createOpenRouterClient(MODELS.GROK_4_LATEST);

  // Prepare context for the agent
  const fileContext = fileSearchResult.files
    .map((file: any, index: number) => {
      return `File ${index + 1}: ${file.fileName}\nContent: ${file.content || "No content available"}\n---\n`;
    })
    .join("\n");

  const agentPrompt = `You are a file editing assistant. You can edit files based on user instructions.

Available files:
${fileSearchResult.files.map((f: any, i: number) => `- ${f.fileName} (ID: ${f.fileId})`).join("\n")}

User Request: ${request.userPrompt}

Please perform the requested action on the appropriate files. If you need to edit files, provide the complete edited content. After editing, provide a summary of what was changed.`;

  const response = await client.invoke([
    {
      role: "system",
      content:
        "You are a file editing assistant. You can edit files based on user instructions. When editing files, provide the complete edited content and a summary of changes.",
    },
    {
      role: "user",
      content: agentPrompt,
    },
  ]);

  const processingTime = Date.now() - startTime;

  // Map processed files
  const processedFiles: ProcessedFileInfo[] = fileSearchResult.files.map(
    (file: any, index: number) => ({
      fileId: file.fileId,
      fileName: file.fileName,
      originalName: file.originalName,
      fileSize: file.fileSize,
      downloadUrl: "",
      fileType: file.fileType,
      jobId: file.fileId,
      totalChunks: 1,
      processedChunks: 1,
      isOneDriveFile: false,
      oneDriveId: null,
    })
  );

  // Save query to database
  let queryId: string | null = null;
  try {
    const savedQuery = await prisma.documentQuery.create({
      data: {
        userQuery: request.userPrompt,
        aiResponse: response.content,
        searchQuery: request.searchQuery,
        success: true,
        confidence: 0.9,
        processingTime,
        totalSteps: 3,
        completedSteps: 3,
        toolsUsed: ["file_processing_tool", "file_editing_tool"],
        filesProcessed: processedFiles as any,
      },
    });
    queryId = savedQuery.id;
    console.log(
      `💾 Action performance response saved to database with ID: ${queryId}`
    );
  } catch (dbError) {
    console.error(
      "❌ Failed to save action performance response to database:",
      dbError
    );
  }

  return {
    success: true,
    result: response.content,
    processedFiles,
    confidence: 0.9,
    operationChain: [
      { operation: "action_performance" as const, confidence: 0.9 },
    ],
    totalSteps: 3,
    completedSteps: 3,
    queryId: queryId as string,
    responseMode: "action_performance",
  };
};

// Main document processing function
const processDocuments = async (
  request: ProcessingRequest
): Promise<ProcessingResponse> => {
  const startTime = Date.now();

  try {
    console.log("🚀 Starting document processing");

    // Step 1: Detect response mode
    const responseMode = await detectResponseMode(request.userPrompt);

    // Step 2: Find relevant files
    const fileSearchResult = await searchRelevantFiles(
      request.searchQuery || request.userPrompt
    );

    if (
      !fileSearchResult.success ||
      !fileSearchResult.files ||
      fileSearchResult.files.length === 0
    ) {
      throw new Error("No relevant files found for the query");
    }

    // Step 3: Process based on response mode
    if (responseMode === "question_answering") {
      return await processQuestionAnswering(
        request,
        fileSearchResult,
        startTime
      );
    } else {
      return await processActionPerformance(
        request,
        fileSearchResult,
        startTime
      );
    }
  } catch (error) {
    console.error("❌ Document processing failed:", error);

    // Save failed query to database
    const processingTime = Date.now() - startTime;
    let queryId: string | null = null;
    try {
      const savedQuery = await prisma.documentQuery.create({
        data: {
          userQuery: request.userPrompt,
          aiResponse: "",
          searchQuery: request.searchQuery,
          success: false,
          error: String(error),
          processingTime,
          totalSteps: 1,
          completedSteps: 0,
          toolsUsed: [],
        },
      });
      queryId = savedQuery.id;
    } catch (dbError) {
      console.error("❌ Failed to save error to database:", dbError);
    }

    return {
      success: false,
      error: `Processing failed: ${error}`,
      queryId: queryId as string,
    };
  }
};

// POST handler for REST API
export const POST = async (
  request: NextRequest
): Promise<NextResponse<ProcessingResponse>> => {
  try {
    const body: ProcessingRequest = await request.json();
    const { userPrompt, searchQuery, fileContent, fileName, skipVectorSearch } =
      body;

    if (!userPrompt) {
      return NextResponse.json(
        {
          success: false,
          error: "User prompt is required",
        },
        { status: 400 }
      );
    }

    // Handle free tier with direct file content (no vector search)
    if (skipVectorSearch && fileContent) {
      console.log("🆓 Processing free tier request with direct file content");

      try {
        const client = createOpenRouterClient(MODELS.GPT4O_MINI);

        const systemPrompt = `You are a professional legal AI assistant. Analyze the provided document and answer the user's question accurately and comprehensively.

Document Content:
${fileContent.substring(0, 30000)} 

${fileContent.length > 30000 ? "\n[Note: Content truncated for processing. This is a free tier analysis.]" : ""}

Provide a detailed analysis in markdown format with:
- Clear headings and sections
- Bullet points for key findings
- Bold text for important terms
- Organized structure`;

        const response = await client.invoke([
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ]);

        return NextResponse.json({
          success: true,
          result: response.content,
          responseMode: "question_answering",
          processedFiles: [
            {
              fileId: "free-tier-upload",
              fileName: fileName || "Uploaded Document",
              originalName: fileName || "Uploaded Document",
              fileSize: fileContent.length,
            },
          ],
        });
      } catch (error) {
        console.error("Free tier processing error:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to analyze document. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    // Regular processing with vector search for paid tier
    const result = await processDocuments({ userPrompt, searchQuery });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during document processing",
      },
      { status: 500 }
    );
  }
};
