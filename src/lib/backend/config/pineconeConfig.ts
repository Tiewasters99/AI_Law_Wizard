// Pinecone configuration for vector storage

import { Pinecone } from "@pinecone-database/pinecone";
import { generateUserNamespace } from "../utils/pineconeNamespace";

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINE_CONE_API_KEY ?? "",
});

// Get the index based on environment
const indexName =
  process.env.ENV === "LOCAL" ? "local-testing" : "ai-wizard-open-ai";

export const pineconeIndex = pinecone.index(indexName);

/**
 * Get user-specific namespace for Pinecone operations
 *
 * @param userId - User ID from database
 * @param email - User email (can be null)
 * @returns Namespace string for Pinecone
 */
export function getUserNamespace(userId: string, email: string | null): string {
  return generateUserNamespace(userId, email);
}

export { pinecone };
