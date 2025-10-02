import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { prisma } from "../../lib/prisma";
import { searchRelevant } from './retrival';
import { OpenRouterService, ChatType } from './openRouterService';

export interface ChatContext {
  sessionId: string;
  userId?: string;
  systemPrompt?: string;
  chatType?: 'general' | 'apprentice' | 'wizard' | 'grand-wizard';
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  metadata?: any;
  tokenCount?: number;
  modelUsed?: string;
  createdAt: Date;
}

export class ChatService {
  // Configuration constants for chat history management
  private static readonly MAX_CONTEXT_MESSAGES = 20; // Maximum messages to include in context
  private static readonly MAX_CONTEXT_TOKENS = 8000; // Approximate token limit for context
  private static readonly SUMMARY_THRESHOLD = 50; // Messages after which to create summary
  private static readonly SLIDING_WINDOW_SIZE = 10; // Recent messages to always include

  /**
   * Create a new chat session
   */
  static async createSession(
    userId?: string,
    title?: string,
    chatType: ChatContext['chatType'] = 'general'
  ): Promise<string> {
    const session = await prisma.chatSession.create({
      data: {
        title: title || this.generateSessionTitle(chatType),
        userId,
        metadata: {
          chatType,
          systemPrompt: this.getSystemPrompt(chatType),
          createdAt: new Date().toISOString(),
          summary: null, // Will store conversation summary
          lastSummarizedAt: null
        }
      }
    });
    
    return session.id;
  }

  /**
   * Get all chat history for a session (includes archived messages)
   */
  static async getAllSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    return messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'USER' | 'ASSISTANT' | 'SYSTEM',
      content: msg.content,
      metadata: msg.metadata,
      tokenCount: msg.tokenCount || undefined,
      modelUsed: msg.modelUsed || undefined,
      createdAt: msg.createdAt
    }));
  }

  /**
   * Get session details with messages
   */
  static async getSessionWithHistory(sessionId: string): Promise<{
    session: any;
    messages: ChatMessage[];
  }> {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const messages = await this.getAllSessionHistory(sessionId);

    return {
      session: {
        id: session.id,
        title: session.title,
        metadata: session.metadata,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      },
      messages
    };
  }

  /**
   * Get user's chat sessions
   */
  static async getUserSessions(userId: string, limit = 20): Promise<any[]> {
    const sessions = await prisma.chatSession.findMany({
      where: { 
        userId,
        isActive: true
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });

    return sessions.map(session => ({
      id: session.id,
      title: session.title,
      lastMessage: session.messages[0]?.content || '',
      lastActivity: session.messages[0]?.createdAt || session.updatedAt,
      messageCount: session._count.messages,
      metadata: session.metadata
    }));
  }

  /**
   * Send a message and get AI response with optimized context
   */
  static async sendMessage(
    sessionId: string,
    userMessage: string,
    userId?: string,
    chatType?: 'general' | 'apprentice' | 'wizard' | 'grand-wizard'
  ): Promise<{ response: string; tokenCount?: number }> {
    try {
      // Get session and chat history
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!session) {
        throw new Error('Chat session not found');
      }

      console.log(`Processing message for session ${sessionId} with ${session.messages.length} existing messages`);

      // Save user message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'USER',
          content: userMessage,
          metadata: {
            timestamp: new Date().toISOString()
          }
        }
      });

      // Get chat type and system prompt
      const currentChatType = chatType || (session.metadata as any)?.chatType || 'general';
      const systemPrompt = this.getSystemPrompt(currentChatType);

      // Manage conversation history based on size and relevance
      const managedHistory = await this.manageConversationHistory(sessionId, session.messages, userMessage);

      // Add current user message
      managedHistory.push(new HumanMessage(userMessage));

      // Create messages array with system prompt and managed context
      const messages = [
        new SystemMessage(systemPrompt),
        ...managedHistory
      ];

      // Check if we need to summarize conversation after this exchange
      const totalMessages = session.messages.length + 1; // +1 for current message
      const shouldSummarize = totalMessages > this.SUMMARY_THRESHOLD && 
                             !(session.metadata as any)?.lastSummarizedAt;

      // Get AI response using OpenRouter with appropriate model based on chat type
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your environment variables.');
      }

      const openRouterResponse = await OpenRouterService.sendMessage(messages, currentChatType as ChatType);
      const responseContent = openRouterResponse.content;
      const modelName = openRouterResponse.modelUsed;

      // Use actual token count from OpenRouter response or estimate
      const tokenCount = openRouterResponse.tokenCount || Math.ceil((userMessage.length + responseContent.length) / 4);

      // Save AI response
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'ASSISTANT',
          content: responseContent,
          metadata: {
            timestamp: new Date().toISOString(),
            modelUsed: modelName
          },
          tokenCount,
          modelUsed: modelName
        }
      });

      // Update session timestamp and handle summarization if needed
      const updateData: any = { updatedAt: new Date() };
      
      if (shouldSummarize) {
        // Trigger summarization in background (non-blocking)
        this.summarizeConversation(sessionId).catch(error => {
          console.error('Error summarizing conversation:', error);
        });
        updateData.metadata = {
          ...(session.metadata as any),
          lastSummarizedAt: new Date().toISOString()
        };
      }

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: updateData
      });

      return {
        response: responseContent,
        tokenCount
      };

    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Only save error message if session exists
      try {
        const sessionExists = await prisma.chatSession.findUnique({
          where: { id: sessionId },
          select: { id: true }
        });

        if (sessionExists) {
          await prisma.chatMessage.create({
            data: {
              sessionId,
              role: 'ASSISTANT',
              content: 'Sorry, I encountered an error while processing your message. Please try again.',
              metadata: {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              }
            }
          });
        }
      } catch (dbError) {
        console.error('Error saving error message to database:', dbError);
        // Don't throw this error as it's secondary to the main error
      }

      throw error;
    }
  }

  /**
   * Update session title based on first message
   */
  static async updateSessionTitle(sessionId: string, firstMessage: string): Promise<void> {
    const title = this.generateTitleFromMessage(firstMessage);
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title }
    });
  }

  /**
   * Delete a chat session
   */
  static async deleteSession(sessionId: string, userId?: string): Promise<void> {
    await prisma.chatSession.update({
      where: { 
        id: sessionId,
        ...(userId && { userId })
      },
      data: { isActive: false }
    });
  }

  /**
   * Get system prompt based on chat type
   */
  private static getSystemPrompt(chatType: ChatContext['chatType']): string {
    const basePrompt = "You are a helpful legal assistant. Provide clear, accurate legal information and advice. Always remind users to consult with qualified legal professionals for specific legal matters.";

    switch (chatType) {
      case 'apprentice':
        return `${basePrompt} You are in "Apprentice" mode - focus on basic legal concepts, simple explanations, and educational content. Keep responses beginner-friendly and easy to understand. Use clear language and provide examples when helpful.`;
      
      case 'wizard':
        return `${basePrompt} You are in "Legal Wizard" mode - provide detailed legal analysis, complex case explanations, and advanced legal strategies. This is an upgraded version of our AI Wizard technology for enhanced legal assistance.`;
      
      case 'grand-wizard':
        return `${basePrompt} You are in "Legal Grand Wizard" mode - provide expert-level legal consultation, comprehensive analysis, and sophisticated legal strategies. This is our most advanced AI Wizard technology for premium legal assistance.`;
      
      default:
        return basePrompt;
    }
  }

  /**
   * Generate session title based on chat type
   */
  private static generateSessionTitle(chatType: ChatContext['chatType']): string {
    const now = new Date().toLocaleDateString();
    switch (chatType) {
      case 'apprentice':
        return `Legal Apprentice - ${now}`;
      case 'wizard':
        return `Legal Wizard - ${now}`;
      case 'grand-wizard':
        return `Grand Wizard - ${now}`;
      default:
        return `New Chat - ${now}`;
    }
  }

  /**
   * Generate title from first message
   */
  private static generateTitleFromMessage(message: string): string {
    const words = message.trim().split(' ');
    if (words.length <= 6) {
      return message.trim();
    }
    return words.slice(0, 6).join(' ') + '...';
  }

  /**
   * Manage conversation history for LLM context
   * Implements multiple strategies: sliding window, summarization, and relevance-based selection
   */
  private static async manageConversationHistory(
    sessionId: string,
    messages: any[],
    currentMessage: string
  ): Promise<(HumanMessage | AIMessage | SystemMessage)[]> {
    const messageCount = messages.length;
    
    // Strategy 1: If conversation is small, return all messages
    if (messageCount <= this.MAX_CONTEXT_MESSAGES) {
      return this.convertToLangChainMessages(messages);
    }

    // Strategy 2: Get conversation summary if available
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { metadata: true }
    });

    const sessionMetadata = session?.metadata as any;
    const summary = sessionMetadata?.summary;
    const lastSummarizedAt = sessionMetadata?.lastSummarizedAt;

    // Strategy 3: Use sliding window + summary approach
    const recentMessages = messages.slice(-this.SLIDING_WINDOW_SIZE);
    const olderMessages = messages.slice(0, -this.SLIDING_WINDOW_SIZE);

    let managedHistory: (HumanMessage | AIMessage | SystemMessage)[] = [];

    // Add summary if available and not too old
    if (summary && lastSummarizedAt) {
      const summaryAge = Date.now() - new Date(lastSummarizedAt).getTime();
      const maxSummaryAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (summaryAge < maxSummaryAge) {
        managedHistory.push(new SystemMessage(`Previous conversation summary: ${summary}`));
      }
    }

    // Add some older messages if no recent summary (intelligent selection)
    if (!summary && olderMessages.length > 0) {
      const selectedOlderMessages = this.selectRelevantOlderMessages(
        olderMessages,
        currentMessage,
        this.MAX_CONTEXT_MESSAGES - this.SLIDING_WINDOW_SIZE
      );
      managedHistory.push(...this.convertToLangChainMessages(selectedOlderMessages));
    }

    // Always include recent messages
    managedHistory.push(...this.convertToLangChainMessages(recentMessages));

    // Strategy 4: Token-based truncation as final fallback
    return this.truncateByTokens(managedHistory);
  }

  /**
   * Convert database messages to LangChain message format
   */
  private static convertToLangChainMessages(messages: any[]): (HumanMessage | AIMessage | SystemMessage)[] {
    return messages.map(msg => {
      switch (msg.role) {
        case 'USER':
          return new HumanMessage(msg.content);
        case 'ASSISTANT':
          return new AIMessage(msg.content);
        case 'SYSTEM':
          return new SystemMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    });
  }

  /**
   * Select relevant older messages based on keyword matching and importance
   */
  private static selectRelevantOlderMessages(
    olderMessages: any[],
    currentMessage: string,
    maxCount: number
  ): any[] {
    if (olderMessages.length <= maxCount) {
      return olderMessages;
    }

    // Extract keywords from current message
    const currentKeywords = this.extractKeywords(currentMessage.toLowerCase());
    
    // Score messages based on relevance
    const scoredMessages = olderMessages.map(msg => ({
      ...msg,
      score: this.calculateRelevanceScore(msg.content, currentKeywords)
    }));

    // Sort by relevance score and take top messages
    return scoredMessages
      .sort((a, b) => b.score - a.score)
      .slice(0, maxCount)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // Maintain chronological order
  }

  /**
   * Extract keywords from text for relevance matching
   */
  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP libraries
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
    
    return text
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Calculate relevance score between message content and keywords
   */
  private static calculateRelevanceScore(content: string, keywords: string[]): number {
    const contentLower = content.toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      score += matches * (keyword.length > 6 ? 2 : 1); // Longer keywords get higher weight
    });
    
    return score;
  }

  /**
   * Truncate messages based on estimated token count
   */
  private static truncateByTokens(messages: (HumanMessage | AIMessage | SystemMessage)[]): (HumanMessage | AIMessage | SystemMessage)[] {
    let totalTokens = 0;
    const truncated: (HumanMessage | AIMessage | SystemMessage)[] = [];

    for (const message of messages) {
      const messageTokens = Math.ceil(message.content.length / 4); // Rough token estimation
      
      if (totalTokens + messageTokens > this.MAX_CONTEXT_TOKENS) {
        break;
      }
      
      truncated.push(message);
      totalTokens += messageTokens;
    }

    return truncated;
  }

  /**
   * Summarize conversation using AI model
   */
  private static async summarizeConversation(sessionId: string): Promise<void> {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        select: { role: true, content: true, createdAt: true }
      });

      if (messages.length < 10) {
        return; // Don't summarize short conversations
      }

      // Get the middle portion of conversation for summarization
      const middleStart = Math.floor(messages.length * 0.2);
      const middleEnd = Math.floor(messages.length * 0.8);
      const messagesToSummarize = messages.slice(middleStart, middleEnd);

      const conversationText = messagesToSummarize
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const summaryPrompt = `Please provide a concise summary of the following legal conversation, focusing on key topics, questions asked, and important legal advice given. Keep it under 200 words:\n\n${conversationText}`;

      // Use OpenRouter for summarization with apprentice model (cost-effective)
      const summaryMessages = [new HumanMessage(summaryPrompt)];
      const summaryResponse = await OpenRouterService.sendMessage(summaryMessages, 'apprentice');
      const summary = summaryResponse.content;

      // Update session with summary
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { metadata: true }
      });

      const updatedMetadata = {
        ...(session?.metadata as any),
        summary,
        lastSummarizedAt: new Date().toISOString()
      };

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { metadata: updatedMetadata }
      });

      console.log(`Successfully summarized conversation for session ${sessionId}`);
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      throw error;
    }
  }

  /**
   * Archive old messages to reduce database load
   */
  static async archiveOldMessages(sessionId: string, olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // For now, just mark old messages as archived (soft delete)
      // In a production system, you might move them to a separate archive table
      await prisma.chatMessage.updateMany({
        where: {
          sessionId,
          createdAt: { lt: cutoffDate }
        },
        data: {
          metadata: {
            archived: true,
            archivedAt: new Date().toISOString()
          }
        }
      });

      console.log(`Archived old messages for session ${sessionId}`);
    } catch (error) {
      console.error('Error archiving old messages:', error);
      throw error;
    }
  }

  /**
   * Get session history (excludes archived messages)
   */
  static async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { 
        sessionId,
        metadata: {
          path: ['archived'],
          not: true
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'USER' | 'ASSISTANT' | 'SYSTEM',
      content: msg.content,
      metadata: msg.metadata,
      tokenCount: msg.tokenCount || undefined,
      modelUsed: msg.modelUsed || undefined,
      createdAt: msg.createdAt
    }));
  }
}
