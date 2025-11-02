import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Progress Event Types
export enum ProgressEventType {
  CONNECTION = "connection",
  STARTED = "started",
  CLASSIFICATION = "classification",
  FILES_SEARCH = "files_search",
  FILES_FOUND = "files_found",
  CHAIN_DETECTED = "chain_detected",
  OPERATION_START = "operation_start",
  OPERATION_PROGRESS = "operation_progress",
  OPERATION_COMPLETE = "operation_complete",
  INTERMEDIATE_RESULT = "intermediate_result",
  FINAL_RESULT = "final_result",
  FINAL_SUMMARY = "final_summary",
  COMPLETE = "complete",
  ERROR = "error",
}

export interface ProgressEvent {
  id?: string;
  type: ProgressEventType;
  timestamp: string;
  message: string;
  step?: number;
  totalSteps?: number;
  operation?: string;
  confidence?: number;
  data?: any;
  error?: string;
}

export interface OperationStep {
  operation:
    | "summary"
    | "file_operation"
    | "qa"
    | "analysis"
    | "extraction"
    | "transformation";
  fileOperationType?: "merge" | "append";
  description?: string;
  confidence?: number;
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

interface ProcessingRequest {
  userPrompt: string;
  searchQuery?: string;
}

interface ProcessingState {
  // Processing state
  isProcessing: boolean;
  isConnected: boolean;
  events: ProgressEvent[];
  currentStep: number;
  totalSteps: number;
  operationChain: OperationStep[];
  intermediateResults: string[];
  finalResult: string | null;
  error: string | null;
  processedFiles: ProcessedFileInfo[];
  confidence: number;
  isChain: boolean;
  processingTime: number;

  // Session state
  documentSessionId: string | null;
  chatSessionId: string | null;

  // Actions
  startProcessing: (request: ProcessingRequest) => Promise<void>;
  stopProcessing: () => void;
  clearState: () => void;
  resetError: () => void;
  setSessionIds: (documentId: string | null, chatId: string | null) => void;
  addEvent: (event: ProgressEvent) => void;
  updateProcessingState: (updates: Partial<ProcessingState>) => void;
}

const initialProcessingState = {
  isProcessing: false,
  isConnected: false,
  events: [],
  currentStep: 0,
  totalSteps: 1,
  operationChain: [],
  intermediateResults: [],
  finalResult: null,
  error: null,
  processedFiles: [],
  confidence: 0,
  isChain: false,
  processingTime: 0,
  documentSessionId: null,
  chatSessionId: null,
};

export const useDocumentProcessingStore = create<ProcessingState>()(
  devtools(
    (set, get) => ({
      ...initialProcessingState,

      // Start processing document
      startProcessing: async (request: ProcessingRequest) => {
        const startTime = Date.now();

        // Validate input
        if (!request.userPrompt?.trim()) {
          set({ error: "User prompt is required" });
          return;
        }

        // Prevent multiple concurrent requests
        if (get().isProcessing) {
          console.warn("Processing already in progress");
          return;
        }

        // Reset state
        set({
          ...initialProcessingState,
          isProcessing: true,
          events: [
            {
              type: ProgressEventType.STARTED,
              timestamp: new Date().toISOString(),
              message: "Processing started",
            },
          ],
        });

        try {
          const response = await fetch("/api/attorney/document-processing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userPrompt: request.userPrompt.trim(),
              ...(request.searchQuery?.trim() && {
                searchQuery: request.searchQuery.trim(),
              }),
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.success && data.result) {
            // Map processed files
            const processedFiles: ProcessedFileInfo[] = (
              data.processedFiles || []
            ).map((file: any, index: number) => ({
              fileId: file.fileId || `file-${index}`,
              fileName: file.fileName || "Unknown",
              originalName: file.originalName || file.fileName || "Unknown",
              fileSize: file.fileSize || 0,
              downloadUrl: file.downloadUrl || "",
              fileType: file.fileType || "txt",
              jobId: file.jobId,
              totalChunks: file.totalChunks,
              processedChunks: file.processedChunks,
              isOneDriveFile: file.isOneDriveFile,
              oneDriveId: file.oneDriveId,
            }));

            const processingTime = (Date.now() - startTime) / 1000;

            set({
              isProcessing: false,
              finalResult: data.result,
              processedFiles,
              processingTime,
              confidence: data.confidence || 0,
              operationChain: data.operationChain || [],
              totalSteps: data.totalSteps || 1,
              currentStep: data.totalSteps || 1,
              isChain: (data.operationChain?.length || 0) > 1,
            });
          } else {
            throw new Error(data.error || "Processing failed");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          set({
            isProcessing: false,
            error: errorMessage,
          });
        }
      },

      // Stop processing
      stopProcessing: () => {
        set({
          isProcessing: false,
          isConnected: false,
        });
      },

      // Clear all state
      clearState: () => {
        set(initialProcessingState);
      },

      // Reset error only
      resetError: () => {
        set({ error: null });
      },

      // Set session IDs
      setSessionIds: (documentId, chatId) => {
        set({
          documentSessionId: documentId,
          chatSessionId: chatId,
        });
      },

      // Add event
      addEvent: event => {
        set(state => ({
          events: [...state.events, event],
        }));
      },

      // Update processing state
      updateProcessingState: updates => {
        set(state => ({
          ...state,
          ...updates,
        }));
      },
    }),
    { name: "DocumentProcessingStore" }
  )
);
