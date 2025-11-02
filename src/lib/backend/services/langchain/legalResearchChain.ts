// LangChain-style service for legal research with conversation memory
// Uses OpenRouter service (which already works) with LangChain message format for context

import { openRouterService } from "../openRouterService";

const SYSTEM_PROMPT = `You are a demo legal research assistant. Provide helpful but limited legal research information.

**Demo Limitations:**
- Provide general legal information only
- Focus on well-known legal concepts
- Do not provide specific case law citations
- Always recommend professional legal research

**Your approach:**
- Think step by step to understand the user's question and any context from previous messages
- Match the user's question style: answer simple questions simply, complex questions with detail
- If the user asks a simple question, give a brief, direct answer
- If the user asks for detailed research, provide more comprehensive information
- Use markdown formatting appropriately (not for simple questions)
- Keep responses concise and to the point
- Only expand with examples or details when the query warrants it

**Response Guidelines:**
- Simple question → Simple answer (1-2 sentences is fine)
- General question → Brief explanation (1-2 paragraphs max)
- Complex question → Detailed answer with structure
- No unnecessary formatting for simple answers
- Use markdown only when it adds clarity (lists, headers for longer answers)
- Always include a brief disclaimer

Remember: This is a demo version. For comprehensive legal research, users need to upgrade to a professional account.`;

/**
 * Convert conversation history to OpenRouter message format
 */
function buildMessages(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userQuery: string
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: SYSTEM_PROMPT }];

  // Add conversation history (limit to last 8 messages for performance)
  const recentHistory = history.slice(-8);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    });
  }

  // Add current user query
  messages.push({ role: "user", content: userQuery });

  return messages;
}

/**
 * Invoke legal research with conversation history
 * Uses OpenRouter service with LangChain-style message management for context
 */
export async function invokeLegalResearch(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userQuery: string
): Promise<string> {
  try {
    // Build messages array with context
    const messages = buildMessages(history, userQuery);

    // Use existing OpenRouter service (which already works correctly)
    const response = await openRouterService.chat({
      model: openRouterService.getModelForTier("demo"),
      messages: messages,
      max_tokens: openRouterService.getMaxTokensForTier("demo"),
      temperature: 0.3,
    });

    // Extract content
    const result = response.choices[0]?.message?.content || "";

    if (!result || result.trim() === "") {
      throw new Error("Empty response from AI model");
    }

    return result.trim();
  } catch (error) {
    console.error("Legal research invocation error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to get response from AI model");
  }
}

/**
 * Stream legal research with conversation history
 * Uses OpenRouter service streaming API
 */
export async function* streamLegalResearch(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userQuery: string
): AsyncGenerator<string, string, unknown> {
  try {
    // Build messages array with context
    const messages = buildMessages(history, userQuery);

    // Use OpenRouter streaming service
    let fullContent = "";
    for await (const chunk of openRouterService.streamChat({
      model: openRouterService.getModelForTier("demo"),
      messages: messages,
      max_tokens: openRouterService.getMaxTokensForTier("demo"),
      temperature: 0.3,
    })) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullContent += content;
        yield content;
      }
    }

    if (!fullContent || fullContent.trim() === "") {
      throw new Error("Empty response from AI model");
    }

    return fullContent.trim();
  } catch (error) {
    console.error("Legal research streaming error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to get streaming response from AI model");
  }
}
