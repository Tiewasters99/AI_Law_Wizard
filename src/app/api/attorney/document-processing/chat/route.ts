import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: {
    processedFiles: any[];
    analysisResult: string;
  };
}

interface ChatResponse {
  success: boolean;
  response?: string;
  sessionId?: string;
  error?: string;
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
        "X-Title": "AI Law Wizard Document Analysis Chat",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.3,
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

// Create a new chat session
const createChatSession = async (context?: any): Promise<string> => {
  try {
    const session = await prisma.chatSession.create({
      data: {
        metadata: context || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return session.id;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw new Error("Failed to create chat session");
  }
};

// Get existing chat session
const getChatSession = async (sessionId: string) => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    return session;
  } catch (error) {
    console.error("Error getting chat session:", error);
    return null;
  }
};

// Update chat session with new message
const updateChatSession = async (sessionId: string, message: any) => {
  try {
    // Create a new chat message
    await prisma.chatMessage.create({
      data: {
        sessionId: sessionId,
        role: message.role,
        content: message.content,
        metadata: {
          timestamp: message.timestamp,
        },
      },
    });

    // Update session timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating chat session:", error);
    throw new Error("Failed to update chat session");
  }
};

// Process chat message with context
const processChatMessage = async (
  message: string,
  context?: any,
  sessionId?: string
): Promise<{ response: string; sessionId: string }> => {
  const client = createOpenRouterClient("openai/gpt-4o-mini");

  // Build context-aware system prompt
  let systemPrompt =
    "You are a helpful legal AI assistant. You can answer questions about legal documents and provide analysis based on the context provided.";

  if (context?.processedFiles && context.processedFiles.length > 0) {
    systemPrompt += `\n\nYou have access to the following processed documents:\n`;
    context.processedFiles.forEach((file: any, index: number) => {
      systemPrompt += `${index + 1}. ${file.fileName} (${file.fileType})\n`;
    });
  }

  if (context?.analysisResult) {
    systemPrompt += `\n\nPrevious analysis result:\n${context.analysisResult}\n`;
  }

  systemPrompt += `\n\nPlease provide helpful, accurate responses based on the available context. If you need more information, ask clarifying questions.`;

  // Get existing messages if session exists
  let existingMessages: any[] = [];
  if (sessionId) {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
    existingMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // Build message history
  const messages = [
    { role: "system", content: systemPrompt },
    ...existingMessages,
    { role: "user", content: message },
  ];

  // Get AI response
  const response = await client.invoke(messages);

  // Create or update session
  let finalSessionId = sessionId;
  if (!finalSessionId) {
    finalSessionId = await createChatSession(context);
  }

  // Add messages to session
  const userMessage = {
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };
  const assistantMessage = {
    role: "assistant",
    content: response.content,
    timestamp: new Date().toISOString(),
  };

  await updateChatSession(finalSessionId, userMessage);
  await updateChatSession(finalSessionId, assistantMessage);

  return {
    response: response.content,
    sessionId: finalSessionId,
  };
};

export const POST = async (
  request: NextRequest
): Promise<NextResponse<ChatResponse>> => {
  try {
    const body: ChatRequest = await request.json();
    const { message, sessionId, context } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
        },
        { status: 400 }
      );
    }

    // Process the chat message
    const result = await processChatMessage(message, context, sessionId);

    return NextResponse.json({
      success: true,
      response: result.response,
      sessionId: result.sessionId,
    });
  } catch (error) {
    console.error("❌ Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during chat processing",
      },
      { status: 500 }
    );
  }
};

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID is required",
        },
        { status: 400 }
      );
    }

    const session = await getChatSession(sessionId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Session not found",
        },
        { status: 404 }
      );
    }

    // Get messages for this session
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp:
            (msg.metadata as any)?.timestamp || msg.createdAt.toISOString(),
        })),
        context: session.metadata,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Get chat session error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};
