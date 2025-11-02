// Pinecone configuration for vector storage

import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINE_CONE_API_KEY ?? "",
});

// Get the index based on environment
const indexName =
  process.env.ENV === "LOCAL" ? "local-testing" : "ai-wizard-open-ai";

export const pineconeIndex = pinecone.index(indexName);

export { pinecone };
