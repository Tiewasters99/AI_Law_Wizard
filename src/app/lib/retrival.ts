import { pineIndex, openapi } from "./pineConfig";

type Hit = { id: string; score: number; values?: number[]; metadata: any };

export async function searchRelevant(
  query: string,
  topK = 8
): Promise<Hit[]> {
  try {
    // Embed the query using OpenAI embeddings
    const queryEmbedding = await openapi.embedQuery(query);
    
    // Query the Pinecone index with the vector
    const res = await pineIndex.query({
      topK,
      includeMetadata: true,
      vector: queryEmbedding
    });

    return (res.matches || []) as Hit[];
  } catch (error) {
    console.error('Error searching vector database:', error);
    return [];
  }
}

export function expandWithNeighbors(
  hits: Hit[],
  fetchChunk: (fileId: string, chunkIndex: number) => Promise<string | null>,
  window = 1
) {
  const plan: Record<string, { indices: number[]; parts: string[] }> = {};
  for (const h of hits) {
    const { fileId, chunkIndex } = h.metadata || {};
    if (fileId == null || chunkIndex == null) continue;
    if (!plan[fileId]) plan[fileId] = { indices: [], parts: [] };
    for (let d = -window; d <= window; d++) {
      const idx = chunkIndex + d;
      if (!plan[fileId].indices.includes(idx) && idx >= 0) plan[fileId].indices.push(idx);
    }
  }
  const jobs = Object.entries(plan).map(async ([fileId, v]) => {
    v.indices.sort((a, b) => a - b);
    v.parts = [];
    for (const i of v.indices) {
      const t = await fetchChunk(fileId, i);
      if (t != null) v.parts.push(`[[CHUNK ${i}]]\n${t}`);
    }
    return [fileId, v] as const;
  });
  return Promise.all(jobs);
}
