// Utility functions for querying Pinecone with namespace support

import { pineconeIndex } from "../config/pineconeConfig";

export interface QueryResult {
  id: string;
  score: number;
  metadata: {
    fileId?: string;
    chunkIndex?: number;
    text?: string;
    [key: string]: any;
  };
}

export interface QueryOptions {
  topK?: number;
  includeMetadata?: boolean;
  filter?: Record<string, any>;
  fileFilter?: string; // Filter results by fileId
}

/**
 * Query Pinecone namespace with a vector
 *
 * @param namespace - User-specific namespace
 * @param queryVector - Vector to search for
 * @param options - Query options (topK, includeMetadata, filter)
 * @returns Array of query results
 */
export async function queryPineconeNamespace(
  namespace: string,
  queryVector: number[],
  options: QueryOptions = {}
): Promise<QueryResult[]> {
  const { topK = 10, includeMetadata = true, filter, fileFilter } = options;

  try {
    // Build filter object - combine existing filter with file filter if provided
    let combinedFilter = filter;
    if (fileFilter) {
      combinedFilter = {
        ...(filter || {}),
        fileId: { $eq: fileFilter },
      };
    }

    const queryResponse = await pineconeIndex.namespace(namespace).query({
      vector: queryVector,
      topK,
      includeMetadata,
      ...(combinedFilter && { filter: combinedFilter }),
    });

    // If fileFilter is provided, also filter results client-side for safety
    let results = (queryResponse.matches || []).map(match => ({
      id: match.id,
      score: match.score || 0,
      metadata: (match.metadata || {}) as QueryResult["metadata"],
    }));

    // Client-side filtering as backup
    if (fileFilter) {
      results = results.filter(result => result.metadata.fileId === fileFilter);
    }

    return results;
  } catch (error) {
    console.error(`Error querying Pinecone namespace ${namespace}:`, error);
    throw error;
  }
}

/**
 * Query multiple namespaces (for admin or cross-user searches)
 * Note: This should be used carefully and only when necessary
 *
 * @param namespaces - Array of namespaces to query
 * @param queryVector - Vector to search for
 * @param options - Query options
 * @returns Combined results from all namespaces
 */
export async function queryMultipleNamespaces(
  namespaces: string[],
  queryVector: number[],
  options: QueryOptions = {}
): Promise<QueryResult[]> {
  const results = await Promise.all(
    namespaces.map(namespace =>
      queryPineconeNamespace(namespace, queryVector, options).catch(error => {
        console.error(`Error querying namespace ${namespace}:`, error);
        return [];
      })
    )
  );

  // Combine and sort by score
  const combined = results.flat();
  return combined.sort((a, b) => b.score - a.score);
}

/**
 * Format query results with source information for API responses
 */
export function formatQueryResultsForSources(
  results: QueryResult[],
  fileNameMap?: Map<string, string>
): Array<{
  fileId: string;
  fileName: string;
  chunkIndex: number;
  text: string;
  score: number;
}> {
  return results.map(result => {
    const fileId = result.metadata.fileId || "";
    let fileName = "Unknown";

    if (fileNameMap && fileNameMap.has(fileId)) {
      fileName = fileNameMap.get(fileId)!;
    } else if (fileId) {
      // Fallback to extracting from fileId path
      fileName = fileId.split("/").pop() || fileId;
    }

    return {
      fileId,
      fileName,
      chunkIndex: result.metadata.chunkIndex ?? -1,
      text: result.metadata.text || "",
      score: result.score,
    };
  });
}
