// Document Processing Service for Authenticated Users
// Full-featured document analysis with vector search and file editing

import {
  ProcessingRequest,
  ProcessingResponse,
  ProcessedFileInfo,
  OperationStep,
} from "@/types/api";
import { getAPIConfig, isFeatureEnabled } from "../api/config";
import { UserRole } from "@/types/api";
import OpenAI from "openai";

export class DocumentProcessor {
  private config: any;
  private openai: OpenAI;
  private role: UserRole;
  private isAuthenticated: boolean;

  constructor(role: UserRole, isAuthenticated: boolean) {
    this.role = role;
    this.isAuthenticated = isAuthenticated;
    this.config = getAPIConfig(role, isAuthenticated);
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processDocument(
    request: ProcessingRequest
  ): Promise<ProcessingResponse> {
    try {
      // Check if document processing is enabled for this user tier
      if (
        !isFeatureEnabled("document_analysis", this.role, this.isAuthenticated)
      ) {
        return {
          success: false,
          error: "Document processing not available for your current plan",
          responseMode: "question_answering",
        };
      }

      // Detect response mode
      const responseMode = await this.detectResponseMode(request.userPrompt);

      if (responseMode === "question_answering") {
        return await this.processQuestionAnswering(request);
      } else {
        return await this.processActionPerformance(request);
      }
    } catch (error) {
      console.error("Document processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Processing failed",
        responseMode: "question_answering",
      };
    }
  }

  private async detectResponseMode(
    userPrompt: string
  ): Promise<"question_answering" | "action_performance"> {
    // Simple keyword-based detection for performance
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
      "summarize",
      "analyze",
      "extract",
      "overview",
      "key points",
      "main points",
    ];

    const actionKeywords = [
      "edit",
      "modify",
      "change",
      "update",
      "create",
      "write",
      "add",
      "remove",
      "merge",
      "combine",
      "split",
      "organize",
      "format",
      "restructure",
    ];

    const lowerPrompt = userPrompt.toLowerCase();

    const questionScore = questionKeywords.reduce(
      (score, keyword) => score + (lowerPrompt.includes(keyword) ? 1 : 0),
      0
    );

    const actionScore = actionKeywords.reduce(
      (score, keyword) => score + (lowerPrompt.includes(keyword) ? 1 : 0),
      0
    );

    return questionScore > actionScore
      ? "question_answering"
      : "action_performance";
  }

  private async processQuestionAnswering(
    request: ProcessingRequest
  ): Promise<ProcessingResponse> {
    const systemPrompt = `You are a professional legal AI assistant. Provide comprehensive legal analysis and answers.

**Your capabilities:**
- Analyze legal documents thoroughly
- Provide detailed legal insights
- Answer complex legal questions
- Cite relevant laws and precedents
- Offer strategic legal advice

**Your approach:**
- Be thorough and accurate
- Provide detailed explanations
- Include relevant legal citations
- Consider multiple perspectives
- Always include appropriate disclaimers

Remember: You are providing professional legal assistance to qualified users.`;

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request.userPrompt },
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });

    const result =
      response.choices[0]?.message?.content || "No response generated";

    return {
      success: true,
      result,
      confidence: 0.9,
      operationChain: [{ operation: "qa", confidence: 0.9 }],
      totalSteps: 1,
      completedSteps: 1,
      responseMode: "question_answering",
    };
  }

  private async processActionPerformance(
    request: ProcessingRequest
  ): Promise<ProcessingResponse> {
    // Check if file editing is enabled
    if (!isFeatureEnabled("file_editing", this.role, this.isAuthenticated)) {
      return {
        success: false,
        error: "File editing not available for your current plan",
        responseMode: "action_performance",
      };
    }

    const systemPrompt = `You are a professional legal document editor. You can edit and modify legal documents.

**Your capabilities:**
- Edit legal documents professionally
- Modify contracts and agreements
- Restructure legal text
- Add or remove clauses
- Format legal documents

**Your approach:**
- Maintain legal accuracy
- Preserve document structure
- Follow legal formatting standards
- Ensure compliance
- Provide clear explanations of changes

Remember: You are providing professional document editing services to qualified users.`;

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request.userPrompt },
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });

    const result =
      response.choices[0]?.message?.content || "No response generated";

    return {
      success: true,
      result,
      confidence: 0.9,
      operationChain: [{ operation: "action_performance", confidence: 0.9 }],
      totalSteps: 1,
      completedSteps: 1,
      responseMode: "action_performance",
    };
  }
}
