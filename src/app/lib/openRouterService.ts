import OpenAI from 'openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

// OpenRouter configuration
const openRouterClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Model mapping for different chat types
export const MODEL_MAPPING = {
  'apprentice': 'openai/gpt-4o-mini',
  'wizard': 'deepseek/deepseek-chat-v3.1:free',
  'grand-wizard': 'google/gemini-2.5-flash-lite-preview-09-2025',
  'general': 'deepseek/deepseek-r1:free'
} as const;

export type ChatType = keyof typeof MODEL_MAPPING;

export interface OpenRouterResponse {
  content: string;
  modelUsed: string;
  tokenCount?: number;
  finishReason?: string;
}

export class OpenRouterService {
  /**
   * Send a message using OpenRouter with the appropriate model for the chat type
   */
  static async sendMessage(
    messages: (HumanMessage | AIMessage | SystemMessage)[],
    chatType: ChatType = 'general'
  ): Promise<OpenRouterResponse> {
    try {
      const model = MODEL_MAPPING[chatType];
      
      if (!model) {
        throw new Error(`No model configured for chat type: ${chatType}`);
      }

      // Convert LangChain messages to OpenAI format
      const openAIMessages = messages.map(msg => {
        const content = typeof msg.content === 'string' ? msg.content : String(msg.content);
        
        if (msg instanceof HumanMessage) {
          return { role: 'user' as const, content };
        } else if (msg instanceof AIMessage) {
          return { role: 'assistant' as const, content };
        } else if (msg instanceof SystemMessage) {
          return { role: 'system' as const, content };
        }
        return { role: 'user' as const, content };
      });

      const response = await openRouterClient.chat.completions.create({
        model,
        messages: openAIMessages,
        max_tokens: 4000,
        temperature: 0.3,
        stream: false
      });

      const choice = response.choices[0];
      if (!choice || !choice.message) {
        throw new Error('No response from OpenRouter');
      }

      return {
        content: choice.message.content || '',
        modelUsed: model,
        tokenCount: response.usage?.total_tokens,
        finishReason: choice.finish_reason
      };

    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available models from OpenRouter
   */
  static async getAvailableModels(): Promise<any[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return [];
    }
  }

  /**
   * Estimate token count for a message
   */
  static estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Get cost estimate for a request (approximate)
   */
  static getCostEstimate(inputTokens: number, outputTokens: number, chatType: ChatType): number {
    // Approximate costs per 1K tokens (these are estimates, actual costs may vary)
    const costs = {
      'apprentice': { input: 0.00015, output: 0.0006 }, // GPT-4o Mini
      'wizard': { input: 0.0005, output: 0.0015 }, // Grok-2
      'grand-wizard': { input: 0.00075, output: 0.003 }, // Gemini 2.0 Flash
      'general': { input: 0.0005, output: 0.0015 } // Grok-2
    };

    const cost = costs[chatType];
    const inputCost = (inputTokens / 1000) * cost.input;
    const outputCost = (outputTokens / 1000) * cost.output;
    
    return inputCost + outputCost;
  }
}
