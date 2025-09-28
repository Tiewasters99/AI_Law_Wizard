/**
 * Chat Management Utilities
 * 
 * This file provides utility functions for monitoring and managing
 * chat history in your AI-Wizard application.
 */

import { prisma } from "../../lib/prisma";

export interface ChatStats {
  totalSessions: number;
  sessionsNeedingSummary: number;
  sessionsWithSummaries: number;
  totalMessages: number;
  archivedMessages: number;
  averageMessagesPerSession: number;
  oldestUnsummarizedSession?: {
    id: string;
    messageCount: number;
    lastActivity: Date;
  };
}

export interface SessionManagementInfo {
  sessionId: string;
  messageCount: number;
  hasSummary: boolean;
  lastSummarizedAt?: Date;
  archivedMessageCount: number;
  lastActivity: Date;
  needsManagement: boolean;
}

export class ChatManagementUtils {
  /**
   * Get comprehensive chat statistics
   */
  static async getChatStats(): Promise<ChatStats> {
    try {
      // Get total sessions
      const totalSessions = await prisma.chatSession.count({
        where: { isActive: true }
      });

      // Get sessions with summaries
      const sessionsWithSummaries = await prisma.chatSession.count({
        where: {
          isActive: true,
          metadata: {
            not: {
              path: ['summary'],
              equals: null
            }
          }
        }
      });

      // Get total messages
      const totalMessages = await prisma.chatMessage.count();

      // Get archived messages
      const archivedMessages = await prisma.chatMessage.count({
        where: {
          metadata: {
            path: ['archived'],
            equals: true
          }
        }
      });

      // Get sessions needing summary (more than 50 messages, no recent summary)
      const sessionsNeedingSummary = await prisma.chatSession.count({
        where: {
          isActive: true,
          messages: {
            some: {}
          },
          OR: [
            {
              metadata: {
                path: ['lastSummarizedAt'],
                equals: null as any
              }
            },
            {
              metadata: {
                path: ['lastSummarizedAt'],
                lt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
              }
            }
          ]
        }
      });

      // Find oldest unsummarized session
      const oldestUnsummarized = await prisma.chatSession.findFirst({
        where: {
          isActive: true,
          OR: [
            {
              metadata: {
                path: ['lastSummarizedAt'],
                equals: null as any
              }
            },
            {
              metadata: {
                path: ['lastSummarizedAt'],
                lt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
              }
            }
          ]
        },
        orderBy: { updatedAt: 'asc' }
      });

      return {
        totalSessions,
        sessionsNeedingSummary,
        sessionsWithSummaries,
        totalMessages,
        archivedMessages,
        averageMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0,
        oldestUnsummarizedSession: oldestUnsummarized ? {
          id: oldestUnsummarized.id,
          messageCount: await prisma.chatMessage.count({ where: { sessionId: oldestUnsummarized.id } }),
          lastActivity: oldestUnsummarized.updatedAt
        } : undefined
      };
    } catch (error) {
      console.error('Error getting chat stats:', error);
      throw error;
    }
  }

  /**
   * Get sessions that need management
   */
  static async getSessionsNeedingManagement(limit = 50): Promise<SessionManagementInfo[]> {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: {
          isActive: true,
          AND: [
            {
              messages: {
                some: {}
              }
            },
            {
              OR: [
                {
                  metadata: {
                    path: ['lastSummarizedAt'],
                    equals: null as any
                  }
                },
                {
                  metadata: {
                    path: ['lastSummarizedAt'],
                    lt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                  }
                }
              ]
            }
          ]
        },
        orderBy: { updatedAt: 'desc' },
        take: limit
      });

      return Promise.all(sessions.map(async session => {
        const metadata = session.metadata as any;
        const messageCount = await prisma.chatMessage.count({ where: { sessionId: session.id } });
        const hasSummary = !!metadata?.summary;
        const lastSummarizedAt = metadata?.lastSummarizedAt ? new Date(metadata.lastSummarizedAt) : undefined;
        
        // Count archived messages
        const archivedMessageCount = await prisma.chatMessage.count({
          where: {
            sessionId: session.id,
            metadata: {
              path: ['archived'],
              equals: true
            }
          }
        });
        
        return {
          sessionId: session.id,
          messageCount,
          hasSummary,
          lastSummarizedAt,
          archivedMessageCount,
          lastActivity: session.updatedAt,
          needsManagement: (messageCount > 50 || (hasSummary && lastSummarizedAt && 
            Date.now() - lastSummarizedAt.getTime() > 24 * 60 * 60 * 1000)) ?? false
        };
      }));
    } catch (error) {
      console.error('Error getting sessions needing management:', error);
      throw error;
    }
  }

  /**
   * Force summarization for a specific session
   */
  static async forceSummarization(sessionId: string): Promise<void> {
    try {
      // This would call the ChatService.summarizeConversation method
      // For now, we'll just update the metadata to trigger summarization
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          metadata: {
            ...(await prisma.chatSession.findUnique({ where: { id: sessionId }, select: { metadata: true } }))?.metadata as any,
            lastSummarizedAt: null // Reset to trigger summarization
          }
        }
      });
      
      console.log(`Triggered summarization for session ${sessionId}`);
    } catch (error) {
      console.error('Error forcing summarization:', error);
      throw error;
    }
  }

  /**
   * Archive old messages for multiple sessions
   */
  static async archiveOldMessagesBulk(olderThanDays = 30, sessionIds?: string[]): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const whereClause: any = {
        createdAt: { lt: cutoffDate }
      };

      if (sessionIds) {
        whereClause.sessionId = { in: sessionIds };
      }

      const result = await prisma.chatMessage.updateMany({
        where: whereClause,
        data: {
          metadata: {
            archived: true,
            archivedAt: new Date().toISOString()
          }
        }
      });

      console.log(`Archived ${result.count} old messages`);
      return result.count;
    } catch (error) {
      console.error('Error archiving old messages:', error);
      throw error;
    }
  }

  /**
   * Clean up orphaned sessions (sessions with no messages)
   */
  static async cleanupOrphanedSessions(): Promise<number> {
    try {
      const result = await prisma.chatSession.updateMany({
        where: {
          isActive: true,
          messages: {
            none: {}
          }
        },
        data: {
          isActive: false
        }
      });

      console.log(`Cleaned up ${result.count} orphaned sessions`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up orphaned sessions:', error);
      throw error;
    }
  }

  /**
   * Get token usage estimate for a session
   */
  static async getSessionTokenEstimate(sessionId: string): Promise<{
    estimatedTokens: number;
    messageCount: number;
    averageTokensPerMessage: number;
  }> {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        select: { content: true }
      });

      const totalCharacters = messages.reduce((sum, msg) => sum + msg.content.length, 0);
      const estimatedTokens = Math.ceil(totalCharacters / 4);
      const messageCount = messages.length;
      const averageTokensPerMessage = messageCount > 0 ? Math.round(estimatedTokens / messageCount) : 0;

      return {
        estimatedTokens,
        messageCount,
        averageTokensPerMessage
      };
    } catch (error) {
      console.error('Error getting token estimate:', error);
      throw error;
    }
  }

  /**
   * Generate management report
   */
  static async generateManagementReport(): Promise<string> {
    try {
      const stats = await this.getChatStats();
      const sessionsNeedingManagement = await this.getSessionsNeedingManagement(10);

      const report = `
# Chat Management Report
Generated: ${new Date().toISOString()}

## Overall Statistics
- Total Active Sessions: ${stats.totalSessions}
- Sessions with Summaries: ${stats.sessionsWithSummaries}
- Sessions Needing Summary: ${stats.sessionsNeedingSummary}
- Total Messages: ${stats.totalMessages}
- Archived Messages: ${stats.archivedMessages}
- Average Messages per Session: ${stats.averageMessagesPerSession}

## Management Status
${stats.oldestUnsummarizedSession ? 
  `- Oldest Unsummarized Session: ${stats.oldestUnsummarizedSession.id} (${stats.oldestUnsummarizedSession.messageCount} messages, last activity: ${stats.oldestUnsummarizedSession.lastActivity.toISOString()})` :
  '- All sessions are properly summarized'
}

## Top Sessions Needing Management
${sessionsNeedingManagement.slice(0, 5).map(session => 
  `- ${session.sessionId}: ${session.messageCount} messages, last activity: ${session.lastActivity.toISOString()}`
).join('\n')}

## Recommendations
${stats.sessionsNeedingSummary > 0 ? 
  `- Consider running summarization for ${stats.sessionsNeedingSummary} sessions` :
  '- All sessions are properly configured'
}
${stats.archivedMessages < stats.totalMessages * 0.1 ? 
  '- Consider archiving old messages to reduce database load' :
  '- Archive management is well maintained'
}
      `.trim();

      return report;
    } catch (error) {
      console.error('Error generating management report:', error);
      throw error;
    }
  }
}
