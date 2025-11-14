import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface DocumentQuery {
  id: string;
  userQuery: string;
  aiResponse: string;
  searchQuery?: string;
  success: boolean;
  error?: string;
  confidence?: number;
  processingTime?: number;
  totalSteps: number;
  completedSteps: number;
  toolsUsed: string[];
  filesProcessed?: any;
  userId?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueryHistoryStats {
  total: number;
  successful: number;
  failed: number;
  today: number;
  successRate: number;
  averageProcessingTime: number;
}

export interface QueryHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface QueryHistoryState {
  // Data state
  queries: DocumentQuery[];
  pagination: QueryHistoryPagination | null;
  lastQuery: DocumentQuery | null;
  statistics: QueryHistoryStats | null;
  mostUsedTools: Array<{ tool: string; count: number }>;
  selectedQuery: DocumentQuery | null;

  // UI state
  loading: boolean;
  error: string | null;

  // Actions
  fetchQueries: (
    page?: number,
    limit?: number,
    search?: string,
    successOnly?: boolean
  ) => Promise<void>;
  fetchRecentQueries: (limit?: number) => Promise<void>;
  fetchQuery: (id: string) => Promise<DocumentQuery | null>;
  deleteQuery: (id: string) => Promise<boolean>;
  setSelectedQuery: (query: DocumentQuery | null) => void;
  clearQueries: () => void;
  resetError: () => void;
}

export const useQueryHistoryStore = create<QueryHistoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      queries: [],
      pagination: null,
      lastQuery: null,
      statistics: null,
      mostUsedTools: [],
      selectedQuery: null,
      loading: false,
      error: null,

      // Fetch query history with pagination and filters
      fetchQueries: async (
        page = 1,
        limit = 10,
        search = "",
        successOnly = false
      ) => {
        set({ loading: true, error: null });

        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search,
            successOnly: successOnly.toString(),
          });

          const response = await fetch(`/api/document-history?${params}`);
          const data = await response.json();

          if (data.success && data.data) {
            set({
              queries: data.data.queries,
              pagination: data.data.pagination,
              loading: false,
            });
          } else {
            set({
              error: data.error || "Failed to fetch queries",
              loading: false,
            });
          }
        } catch (err) {
          set({
            error: "Network error while fetching queries",
            loading: false,
          });
          console.error("Error fetching queries:", err);
        }
      },

      // Fetch recent queries and statistics
      fetchRecentQueries: async (limit = 5) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(
            `/api/document-history/recent?limit=${limit}`
          );
          const data = await response.json();

          if (data.success && data.data) {
            set({
              queries: data.data.recentQueries,
              lastQuery: data.data.lastQuery || null,
              statistics: data.data.statistics,
              mostUsedTools: data.data.mostUsedTools,
              loading: false,
            });
          } else {
            set({
              error: data.error || "Failed to fetch recent queries",
              loading: false,
            });
          }
        } catch (err) {
          set({
            error: "Network error while fetching recent queries",
            loading: false,
          });
          console.error("Error fetching recent queries:", err);
        }
      },

      // Fetch a single query by ID
      fetchQuery: async (id: string) => {
        try {
          const response = await fetch(`/api/document-history/${id}`);
          const data = await response.json();

          if (data.success) {
            return data.data;
          } else {
            set({ error: data.error || "Failed to fetch query" });
            return null;
          }
        } catch (err) {
          set({ error: "Network error while fetching query" });
          console.error("Error fetching query:", err);
          return null;
        }
      },

      // Delete a query
      deleteQuery: async (id: string) => {
        try {
          const response = await fetch(`/api/document-history/${id}`, {
            method: "DELETE",
          });
          const data = await response.json();

          if (data.success) {
            // Remove from local state
            set(state => ({
              queries: state.queries.filter(q => q.id !== id),
            }));
            return true;
          } else {
            set({ error: data.error || "Failed to delete query" });
            return false;
          }
        } catch (err) {
          set({ error: "Network error while deleting query" });
          console.error("Error deleting query:", err);
          return false;
        }
      },

      // Set selected query
      setSelectedQuery: query => {
        set({ selectedQuery: query });
      },

      // Clear all queries from local state
      clearQueries: () => {
        set({
          queries: [],
          pagination: null,
          lastQuery: null,
          statistics: null,
          mostUsedTools: [],
          selectedQuery: null,
        });
      },

      // Reset error
      resetError: () => {
        set({ error: null });
      },
    }),
    { name: "QueryHistoryStore" }
  )
);



