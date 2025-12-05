// API Types for Document Processing System

export interface ProcessingRequest {
  userPrompt: string;
  searchQuery?: string;
  fileContent?: string; // For free tier direct file analysis
  fileName?: string; // File name when using direct content
  skipVectorSearch?: boolean; // Flag to skip vector search for free tier
  documentId?: string; // Specific document ID to query
  queryAllDocuments?: boolean; // Flag to query all documents vs specific document
  sessionId?: string; // Document analysis session ID for conversation continuity
  isNewConversation?: boolean; // Flag to start a new conversation session
  model?: string; // Optional model to use for processing (e.g., "openai/gpt-4o-mini")
}

export interface ProcessingResponse {
  success: boolean;
  result?: string;
  error?: string;
  processedFiles?: ProcessedFileInfo[];
  confidence?: number;
  operationChain?: OperationStep[];
  totalSteps?: number;
  completedSteps?: number;
  queryId?: string; // ID of saved query in database
  responseMode?: "question_answering" | "action_performance";
  editedFiles?: EditedFileInfo[];
  sources?: QuerySource[]; // Source citations for RAG queries
  processingQueued?: boolean; // Indicates if document was queued for processing
  documentStatus?: string; // Status of the document (processing, completed, etc.)
  sessionId?: string; // Document analysis session ID
}

export interface EditedFileInfo {
  fileId: string;
  fileName: string;
  originalContent: string;
  editedContent: string;
  changes: string[];
}

export interface ProcessedFileInfo {
  fileId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  downloadUrl?: string;
  fileType?: string;
  jobId?: string;
  totalChunks?: number;
  processedChunks?: number;
  isOneDriveFile?: boolean;
  oneDriveId?: string | null;
}

export interface OperationStep {
  operation: "summary" | "analysis" | "qa" | "action_performance";
  confidence?: number;
}

export interface QuerySource {
  fileId: string;
  fileName: string;
  chunkIndex: number;
  text: string;
  score: number;
}

// Demo API Response (Limited functionality for guests)
export interface DemoProcessingResponse {
  success: boolean;
  result?: string;
  error?: string;
  isDemo: true;
  limitations: string[];
  upgradeMessage: string;
}

// User Role Types
export type UserRole = "GUEST" | "ATTORNEY" | "CLIENT" | "ADMIN";
export type ProcessingTier = "demo" | "basic" | "premium" | "enterprise";

// API Configuration
export interface APIConfig {
  maxTokens: number;
  temperature: number;
  model: string;
  timeout: number;
  features: string[];
}

// Rate Limiting
export interface RateLimit {
  requests: number;
  window: number; // in seconds
  remaining: number;
  resetTime: number;
}
