"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  MessageSquare,
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChatSessionCard,
  ChatSession,
} from "@/components/client/ChatSessionCard";

export default function ChatHistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );

  // Fetch chat sessions from API
  const fetchSessions = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/client/chat/sessions?limit=100");

      // Check if response is ok
      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `Failed to fetch chat sessions (${response.status})`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;

            // Handle authentication errors
            if (response.status === 401 || response.status === 403) {
              errorMessage = "You are not authorized. Please log in again.";
            }
          }
        } catch (parseError) {
          // If we can't parse the error, use the default message
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Validate response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Invalid response format from server");
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response structure from server");
      }

      // Handle error responses
      if (data.error) {
        const errorMessage =
          data.error || "An error occurred while fetching chat sessions";
        throw new Error(errorMessage);
      }

      // Handle success responses - API returns { success: true, sessions: [...] }
      if (data.success && Array.isArray(data.sessions)) {
        // Fetch message counts for each session and determine chat type
        const sessionsWithCounts = await Promise.all(
          data.sessions.map(async (sessionItem: ChatSession) => {
            try {
              const messagesResponse = await fetch(
                `/api/client/chat/sessions/${sessionItem.id}/messages`
              );

              if (messagesResponse.ok) {
                const messagesContentType =
                  messagesResponse.headers.get("content-type");
                if (!messagesContentType?.includes("application/json")) {
                  console.warn(
                    `Invalid content type for messages response for session ${sessionItem.id}`
                  );
                  return {
                    ...sessionItem,
                    messageCount: 0,
                    lastMessage: "",
                    chatType: "wizard" as const,
                  };
                }

                const messagesData = await messagesResponse.json();

                // Validate messages response structure
                if (!messagesData || typeof messagesData !== "object") {
                  console.warn(
                    `Invalid messages response structure for session ${sessionItem.id}`
                  );
                  return {
                    ...sessionItem,
                    messageCount: 0,
                    lastMessage: "",
                    chatType: "wizard" as const,
                  };
                }

                // Handle error in messages response
                if (messagesData.error) {
                  console.warn(
                    `Error fetching messages for session ${sessionItem.id}:`,
                    messagesData.error
                  );
                  return {
                    ...sessionItem,
                    messageCount: 0,
                    lastMessage: "",
                    chatType: "wizard" as const,
                  };
                }

                // API returns { success: true, messages: [...], session: {...} }
                const messages = Array.isArray(messagesData.messages)
                  ? messagesData.messages
                  : Array.isArray(messagesData.data?.messages)
                    ? messagesData.data.messages
                    : [];

                const lastMessage =
                  messages.length > 0
                    ? messages[messages.length - 1]?.content || ""
                    : "";

                // Determine chat type based on model used (grand-wizard uses gemini)
                const chatType = messages.some((msg: any) =>
                  msg.modelUsed?.includes("gemini")
                )
                  ? ("grand-wizard" as const)
                  : ("wizard" as const);

                return {
                  ...sessionItem,
                  messageCount: messages.length,
                  lastMessage: lastMessage.substring(0, 150),
                  chatType,
                };
              } else {
                // Log non-ok responses for debugging
                console.warn(
                  `Failed to fetch messages for session ${sessionItem.id}: ${messagesResponse.status}`
                );
                return {
                  ...sessionItem,
                  messageCount: 0,
                  lastMessage: "",
                  chatType: "wizard" as const,
                };
              }
            } catch (msgError) {
              // Log the error but don't fail the entire operation
              console.error(
                `Error fetching messages for session ${sessionItem.id}:`,
                msgError
              );
              return {
                ...sessionItem,
                messageCount: 0,
                lastMessage: "",
                chatType: "wizard" as const,
              };
            }
          })
        );

        setSessions(sessionsWithCounts);
        setFilteredSessions(sessionsWithCounts);
      } else if (
        data.success &&
        (!data.sessions || !Array.isArray(data.sessions))
      ) {
        // Success but no sessions or invalid sessions array
        setSessions([]);
        setFilteredSessions([]);
      } else {
        // Unexpected response structure
        console.error("Unexpected response structure:", data);
        throw new Error("Unexpected response format from server");
      }
    } catch (err) {
      console.error("Error fetching chat sessions:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load chat history. Please try again.";
      setError(errorMessage);
      setSessions([]);
      setFilteredSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Filter sessions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sessions.filter(
      session =>
        session.title?.toLowerCase().includes(query) ||
        session.lastMessage?.toLowerCase().includes(query)
    );
    setFilteredSessions(filtered);
  }, [searchQuery, sessions]);

  const handleDelete = async (sessionId: string) => {
    if (!session?.user?.id) return;

    setDeletingSessionId(sessionId);

    try {
      const response = await fetch(`/api/client/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });

      // Check if response is ok
      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `Failed to delete session (${response.status})`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;

            // Handle specific error codes
            if (response.status === 401 || response.status === 403) {
              errorMessage = "You are not authorized to delete this session.";
            } else if (response.status === 404) {
              errorMessage =
                "Session not found. It may have already been deleted.";
            }
          }
        } catch (parseError) {
          console.error("Failed to parse delete error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Validate response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        // Some DELETE endpoints might return 204 No Content, which is also valid
        if (response.status === 204) {
          // Remove from local state on successful deletion
          setSessions(prev => prev.filter(s => s.id !== sessionId));
          setFilteredSessions(prev => prev.filter(s => s.id !== sessionId));
          setDeletingSessionId(null);
          return;
        }
        throw new Error("Invalid response format from server");
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response structure from server");
      }

      // Handle error responses
      if (data.error) {
        const errorMessage =
          data.error || "An error occurred while deleting the session";
        throw new Error(errorMessage);
      }

      // Handle success responses - API returns { success: true, ... } or just { success: true }
      if (data.success !== false) {
        // Remove from local state on successful deletion
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        setFilteredSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        throw new Error(data.error || "Failed to delete session");
      }
    } catch (err) {
      console.error("Error deleting session:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete chat session. Please try again.";

      // Show error to user - could be improved with a toast notification
      alert(errorMessage);
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleNewChat = () => {
    router.push("/client/wizard");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Chat History
              </h1>
              <p className="text-sm text-muted-foreground">
                View and manage your chat sessions
              </p>
            </div>
          </div>

          <Button onClick={handleNewChat} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search chat sessions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading chat history...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? "No matching sessions" : "No chat history"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                {searchQuery
                  ? "Try adjusting your search query to find chat sessions."
                  : "Start a new conversation to see your chat history here."}
              </p>
              {!searchQuery && (
                <Button onClick={handleNewChat}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              )}
            </div>
          )}

          {/* Sessions List */}
          {!isLoading && !error && filteredSessions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">
                  {filteredSessions.length} session
                  {filteredSessions.length !== 1 ? "s" : ""}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              <AnimatePresence mode="popLayout">
                {filteredSessions.map(session => (
                  <ChatSessionCard
                    key={session.id}
                    session={session}
                    onDelete={handleDelete}
                    isDeleting={deletingSessionId === session.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
