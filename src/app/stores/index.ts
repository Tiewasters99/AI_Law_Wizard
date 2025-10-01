// Export all stores for easier imports
export { useDocumentProcessingStore } from './documentProcessingStore'
export { useQueryHistoryStore } from './queryHistoryStore'
export { useUIStore } from './uiStore'

// Re-export types
export type {
  ProgressEvent,
  ProgressEventType,
  OperationStep,
  ProcessedFileInfo
} from './documentProcessingStore'

export type {
  DocumentQuery,
  QueryHistoryStats,
  QueryHistoryPagination
} from './queryHistoryStore'

