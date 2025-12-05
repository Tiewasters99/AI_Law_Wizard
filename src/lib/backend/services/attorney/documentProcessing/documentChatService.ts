// Service for document processing chat functionality

import { openRouterService } from "../../openRouterService";
import {
  createChatSession,
  findChatSessionById,
  updateChatSession,
} from "../../../repositories/attorney/chatSessionRepository";
import {
  createChatMessage,
  findMessagesBySessionId,
} from "../../../repositories/attorney/chatMessageRepository";

/**
 * Process chat message with context
 */
export async function processChatMessage(
  message: string,
  context?: any,
  sessionId?: string
): Promise<{ response: string; sessionId: string }> {
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

  // Get existing messages if session exists
  let existingMessages: any[] = [];
  if (sessionId) {
    const messages = await findMessagesBySessionId(sessionId);
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
  const response = await openRouterService.chat({
    model: "openai/gpt-4o-mini",
    messages,
    max_tokens: 2000,
    temperature: 0.3,
  });

  const aiResponse = response.choices[0]?.message?.content || "";

  // Create or update session
  let finalSessionId = sessionId;
  if (!finalSessionId) {
    const session = await createChatSession({ metadata: context });
    finalSessionId = session.id;
  }

  // Add messages to session
  await createChatMessage({
    sessionId: finalSessionId,
    role: "user",
    content: message,
    metadata: { timestamp: new Date().toISOString() },
  });

  await createChatMessage({
    sessionId: finalSessionId,
    role: "assistant",
    content: aiResponse,
    metadata: { timestamp: new Date().toISOString() },
  });

  // Update session timestamp
  await updateChatSession(finalSessionId, {});

  return {
    response: aiResponse,
    sessionId: finalSessionId,
  };
}

/**
 * Get chat session with messages
 */
export async function getChatSession(sessionId: string) {
  const session = await findChatSessionById(sessionId);
  if (!session) {
    return null;
  }

  const messages = await findMessagesBySessionId(sessionId);

  return {
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
  };
}
