// Service for attorney query history functionality

import { findDocumentQueriesByUserId } from "../../../repositories/attorney/documentQueryRepository";

/**
 * Get query history for an attorney
 */
export async function getQueryHistory(userId: string, search?: string) {
  return await findDocumentQueriesByUserId(userId, search);
}
