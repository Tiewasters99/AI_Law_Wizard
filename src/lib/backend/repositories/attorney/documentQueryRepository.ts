// Repository for document query database operations

import { prisma } from "../../prisma";

export interface DocumentQuery {
  id: string;
  userQuery: string;
  aiResponse: string;
  searchQuery: string | null;
  success: boolean;
  error: string | null;
  confidence: number | null;
  processingTime: number | null;
  totalSteps: number;
  completedSteps: number;
  toolsUsed: string[];
  filesProcessed: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentQueryData {
  userQuery: string;
  aiResponse: string;
  searchQuery?: string | null;
  success?: boolean;
  confidence?: number;
  processingTime?: number;
  totalSteps?: number;
  completedSteps?: number;
  toolsUsed?: string[];
  filesProcessed?: any;
  userId?: string | null;
  documentSessionId?: string | null;
  followUpQuestion?: boolean;
  parentQueryId?: string | null;
  conversationContext?: any;
}

export interface DocumentQueryWhere {
  userId?: string;
  OR?: Array<{
    userQuery?: { contains: string; mode: "insensitive" };
    aiResponse?: { contains: string; mode: "insensitive" };
  }>;
}

/**
 * Create a new document query
 */
export async function createDocumentQuery(
  data: CreateDocumentQueryData
): Promise<DocumentQuery> {
  return await prisma.documentQuery.create({
    data: {
      userQuery: data.userQuery,
      aiResponse: data.aiResponse,
      searchQuery: data.searchQuery,
      success: data.success ?? true,
      confidence: data.confidence,
      processingTime: data.processingTime,
      totalSteps: data.totalSteps ?? 1,
      completedSteps: data.completedSteps ?? 1,
      toolsUsed: data.toolsUsed ?? [],
      filesProcessed: data.filesProcessed,
      userId: data.userId,
      documentSessionId: data.documentSessionId || null,
      followUpQuestion: data.followUpQuestion || false,
      parentQueryId: data.parentQueryId || null,
      conversationContext: data.conversationContext || null,
    },
  });
}

/**
 * Find document queries with pagination and filtering
 */
export async function findDocumentQueries(
  where: DocumentQueryWhere,
  skip: number,
  take: number
): Promise<{ queries: DocumentQuery[]; total: number }> {
  const [queries, total] = await Promise.all([
    prisma.documentQuery.findMany({
      where,
      select: {
        id: true,
        userQuery: true,
        aiResponse: true,
        searchQuery: true,
        success: true,
        error: true,
        confidence: true,
        processingTime: true,
        totalSteps: true,
        completedSteps: true,
        toolsUsed: true,
        filesProcessed: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.documentQuery.count({ where }),
  ]);

  return { queries, total };
}

/**
 * Find document queries by user ID with optional search
 */
export async function findDocumentQueriesByUserId(
  userId: string,
  search?: string
): Promise<DocumentQuery[]> {
  const where: DocumentQueryWhere = {
    userId,
  };

  if (search) {
    where.OR = [
      { userQuery: { contains: search, mode: "insensitive" } },
      { aiResponse: { contains: search, mode: "insensitive" } },
    ];
  }

  const result = await findDocumentQueries(where, 0, 1000);
  return result.queries;
}

