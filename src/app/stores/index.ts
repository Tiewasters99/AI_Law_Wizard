// Export all stores for easier imports
export { useDocumentProcessingStore } from './documentProcessingStore'
export { useQueryHistoryStore } from './queryHistoryStore'
export { useUIStore } from './uiStore'
export { useAuthStore, useAuth } from './authStore'

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

export type {
  UserRole,
  PrismaRole,
  User,
  AuthState
} from './authStore'

export { normalizeRole, getRoleDisplayName, ROLE_MAPPING } from './authStore'

