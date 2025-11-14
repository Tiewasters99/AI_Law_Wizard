// LangChain-style service for client legal research with scratchpad reasoning
// Uses OpenRouter service with LangChain message format for structured reasoning

import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { openRouterService } from "../openRouterService";

/**
 * Convert LangChain messages to OpenRouter format
 */
function convertToOpenRouterMessages(messages: BaseMessage[]): Array<{
  role: "system" | "user" | "assistant";
  content: string;
}> {
  return messages.map(msg => {
    // Convert content to string - handle both string and complex content types
    const content = typeof msg.content === "string" 
      ? msg.content 
      : String(msg.content);
    
    if (msg instanceof SystemMessage) {
      return { role: "system" as const, content };
    } else if (msg instanceof HumanMessage) {
      return { role: "user" as const, content };
    } else if (msg instanceof AIMessage) {
      return { role: "assistant" as const, content };
    }
    return { role: "user" as const, content };
  });
}

// Base system prompt for legal research
const BASE_SYSTEM_PROMPT = `You are a legal research assistant for clients. Provide helpful legal research and guidance.

**Your capabilities:**
- Explain legal concepts clearly
- Provide general research guidance
- Answer basic legal questions
- Help understand legal documents
- Suggest where to find more information
- Always recommend professional legal consultation

**Your approach:**
- Be clear and easy to understand
- Use plain language, not legal jargon
- Provide practical guidance
- Always include disclaimers
- Encourage professional consultation
- Be concise and to the point - avoid unnecessary verbosity

**Response Format:**
- Use markdown formatting for clear structure
- Use headers to organize information
- Include bullet points for key information
- Use simple language and clear explanations
- Include relevant legal disclaimers
- End with recommendations for professional consultation
- Keep responses concise and focused on the user's question

Remember: You are providing general legal research assistance to clients. Always recommend professional legal consultation for specific legal matters.`;

// Reasoning system prompt with scratchpad instructions
const REASONING_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

**Reasoning Mode:**
When reasoning mode is enabled, show your thinking process step-by-step before providing the final answer. Structure it as:

## Understanding the Question
[Analyze what the user is asking]

## Key Legal Concepts
[Identify relevant legal principles and concepts]

## Analysis Approach
[Explain how you'll approach answering this question]

## Final Answer
[Provide the comprehensive answer]

Use markdown formatting with clear sections.`;

/**
 * Build messages array for legal research with scratchpad reasoning
 */
function buildResearchMessages(
  query: string,
  history: BaseMessage[],
  showReasoning: boolean
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const systemPrompt = showReasoning ? REASONING_SYSTEM_PROMPT : BASE_SYSTEM_PROMPT;
  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...history,
    new HumanMessage(query),
  ];

  return convertToOpenRouterMessages(messages);
}

/**
 * Convert chat history to LangChain messages
 */
export function convertHistoryToLangChainMessages(
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>
): BaseMessage[] {
  return history.map(msg => {
    if (msg.role === "system") {
      return new SystemMessage(msg.content);
    } else if (msg.role === "user") {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });
}

/**
 * Invoke legal research with LangChain-style message handling and scratchpad reasoning
 */
export async function invokeLegalResearchChain(
  query: string,
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  model: string,
  maxTokens: number,
  showReasoning: boolean = false
): Promise<string> {
  try {
    // Convert history to LangChain messages
    const langChainHistory = convertHistoryToLangChainMessages(history);
    
    // Build messages with system prompt and reasoning instructions
    const messages = buildResearchMessages(query, langChainHistory, showReasoning);

    // Use OpenRouter service with LangChain-structured messages
    const response = await openRouterService.chat({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.3,
    });

    const result = response.choices[0]?.message?.content || "";

    if (!result || result.trim() === "") {
      throw new Error("Empty response from AI model");
    }

    return result.trim();
  } catch (error) {
    console.error("Legal research chain invocation error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to get response from AI model");
  }
}

/**
 * Stream legal research with LangChain-style message handling and scratchpad reasoning
 */
export async function* streamLegalResearchChain(
  query: string,
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  model: string,
  maxTokens: number,
  showReasoning: boolean = false
): AsyncGenerator<string, string, unknown> {
  try {
    // Convert history to LangChain messages
    const langChainHistory = convertHistoryToLangChainMessages(history);
    
    // Build messages with system prompt and reasoning instructions
    const messages = buildResearchMessages(query, langChainHistory, showReasoning);

    // Use OpenRouter streaming service with LangChain-structured messages
    let fullContent = "";
    for await (const chunk of openRouterService.streamChat({
      model,
      messages,
      max_tokens: maxTokens,
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
    console.error("Legal research chain streaming error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to get streaming response from AI model");
  }
}

