// API Types for Document Processing System

export interface ProcessingRequest {
  userPrompt: string;
  searchQuery?: string;
  fileContent?: string; // For free tier direct file analysis
  fileName?: string; // File name when using direct content
  skipVectorSearch?: boolean; // Flag to skip vector search for free tier
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
