// Centralized OpenRouter Service for all model access
// Handles all AI model interactions across the application

export interface OpenRouterRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamingResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.baseUrl = "https://openrouter.ai/api/v1";

    if (!this.apiKey) {
      throw new Error("OpenRouter API key is required");
    }
  }

  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "AI Law Wizard",
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          max_tokens: request.max_tokens || 1000,
          temperature: request.temperature || 0.3,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();

      // Validate response structure
      if (
        !data.choices ||
        !Array.isArray(data.choices) ||
        data.choices.length === 0
      ) {
        throw new Error("Invalid response structure from OpenRouter API");
      }

      const choice = data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error("No content received from the AI model");
      }

      return data;
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw error;
    }
  }

  async *streamChat(
    request: OpenRouterRequest
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "AI Law Wizard",
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          max_tokens: request.max_tokens || 1000,
          temperature: request.temperature || 0.3,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") return;

              try {
                const parsed = JSON.parse(data);
                yield parsed;
              } catch (parseError) {
                console.warn("Failed to parse streaming data:", parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("OpenRouter streaming error:", error);
      throw error;
    }
  }

  // Helper method to get model based on user tier
  getModelForTier(tier: "demo" | "basic" | "premium" | "enterprise"): string {
    switch (tier) {
      case "demo":
        return "openai/gpt-4o-mini";
      case "basic":
        return "openai/gpt-4o-mini";
      case "premium":
        return "openai/gpt-4o";
      case "enterprise":
        return "openai/gpt-4o";
      default:
        return "openai/gpt-4o-mini";
    }
  }

  // Helper method to get max tokens based on user tier
  getMaxTokensForTier(
    tier: "demo" | "basic" | "premium" | "enterprise"
  ): number {
    switch (tier) {
      case "demo":
        return 2000;
      case "basic":
        return 2000;
      case "premium":
        return 4000;
      case "enterprise":
        return 8000;
      default:
        return 1000;
    }
  }

  // Generate embeddings using OpenRouter
  async generateEmbedding(text: string): Promise<number[]> {
    return (await this.generateEmbeddings([text]))[0];
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // Validate inputs
      if (!texts || texts.length === 0) {
        throw new Error("No texts provided for embedding");
      }

      // Batch size limit (OpenRouter supports up to 100 items)
      const BATCH_SIZE = 100;
      const results: number[][] = [];

      // Process in batches
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);

        const response = await fetch(`${this.baseUrl}/embeddings`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "AI Law Wizard",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: batch.length === 1 ? batch[0] : batch,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `OpenRouter embedding error: ${response.status} - ${errorData.error?.message || "Unknown error"}`
          );
        }

        const data = await response.json();

        // Validate response structure
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error("Invalid embedding response structure");
        }

        // Extract embeddings from response
        const embeddings = data.data.map((item: any) => item.embedding);
        results.push(...embeddings);

        // Small delay between batches to respect rate limits
        if (i + BATCH_SIZE < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return results;
    } catch (error) {
      console.error("OpenRouter embedding error:", error);
      throw error;
    }
  }
}

// Singleton instance
export const openRouterService = new OpenRouterService();
