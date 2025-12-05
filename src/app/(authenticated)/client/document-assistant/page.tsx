"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  MessageSquarePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QueryInput } from "@/components/client/integrations/QueryInput";
import { ChatInterface } from "@/components/client/integrations/ChatInterface";
import { toast } from "sonner";
import type { QuerySource } from "@/types/api";
import { MessageRole } from "@prisma/client";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
  url: string;
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  sources?: QuerySource[];
}

// Token cost will be fetched from database

// Insufficient Credits Modal Component (inline)
function InsufficientCreditsModal({
  isOpen,
  onClose,
  onPurchase,
  balance,
  required,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  balance: number;
  required: number;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border p-4 sm:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">
          Insufficient Credits
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          You need {required} credits to use this feature, but you only have{" "}
          {balance} credits remaining. Purchase more credits to continue.
        </p>
        <div className="flex gap-3">
          <Button onClick={onPurchase} className="flex-1">
            Purchase Credits
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentAssistantPage() {
  const [tokenCost, setTokenCost] = useState(5); // Default fallback
  const { data: session } = useSession();
  const router = useRouter();
  const {
    balance,
    loading: balanceLoading,
    refetch: refetchBalance,
  } = useTokenBalance();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] =
    useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch files from API
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/client/files?limit=100");
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await response.json();
      if (data.success) {
        const filesData = (data.files || []).map((file: any) => ({
          id: file.id,
          name: file.originalName,
          type: file.fileName.split(".").pop() || "application/octet-stream",
          size: file.size,
          uploadedAt: new Date(file.uploadedAt),
          status:
            file.status === "COMPLETED" ? "ready" : file.status.toLowerCase(),
          url: file.path,
          isOneDriveFile: file.isOneDriveFile,
          oneDriveId: file.oneDriveId,
        }));
        setDocuments(filesData);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch token cost from database
  useEffect(() => {
    const fetchTokenCost = async () => {
      try {
        const response = await fetch(
          "/api/pricing/feature-pricing?feature=document-assistant&role=CUSTOMER"
        );
        if (response.ok) {
          const data = await response.json();
          if (data.pricing?.tokens) {
            setTokenCost(data.pricing.tokens);
          }
        }
      } catch (error) {
        console.error("Failed to fetch token cost:", error);
        // Keep default fallback
      }
    };
    fetchTokenCost();
  }, []);

  // Load session messages
  const loadSessionMessages = useCallback(async (sid: string) => {
    try {
      const response = await fetch(
        `/api/client/document-sessions/${sid}/messages`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      if (data.success && data.messages) {
        const chatMessages: ChatMessage[] = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          sources: msg.sources || undefined,
        }));
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, []);

  // Load active session on page load
  const loadActiveSession = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsLoadingSession(true);
    try {
      const response = await fetch("/api/client/document-sessions?active=true");
      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }
      const data = await response.json();
      if (data.success && data.session) {
        setSessionId(data.session.id);
        // Load messages for this session
        await loadSessionMessages(data.session.id);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }, [session?.user?.id, loadSessionMessages]);

  // Create new session
  const handleNewChat = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const response = await fetch("/api/client/document-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Document Assistant Chat" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      if (data.success && data.session) {
        setSessionId(data.session.id);
        setMessages([]);
        toast.success("New conversation started");
      }
    } catch (error) {
      console.error("Error creating new session:", error);
      toast.error("Failed to start new conversation");
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    // Load active session when user is available
    if (session?.user?.id) {
      loadActiveSession();
    }
  }, [session?.user?.id, loadActiveSession]);

  const readyDocuments = useMemo(
    () => documents.filter(d => d.status === "ready"),
    [documents]
  );

  const hasDocuments = useMemo(
    () => readyDocuments.length > 0,
    [readyDocuments]
  );

  const handlePurchaseCredits = useCallback(() => {
    router.push("/client/tokens");
  }, [router]);

  const handleDocumentQuery = useCallback(
    async (query: string) => {
      const userId = session?.user?.id;
      if (!userId) return;

      // Check if user has sufficient balance
      if (balance < tokenCost) {
        setShowInsufficientCreditsModal(true);
        return;
      }

      // Check if we have an active session
      if (!sessionId) {
        // Create session first
        try {
          const response = await fetch("/api/client/document-sessions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (data.success && data.session) {
            setSessionId(data.session.id);
          }
        } catch (error) {
          console.error("Error creating session:", error);
        }
      }

      setIsQueryLoading(true);
      setError(null);

      // Add user message to chat immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: MessageRole.USER,
        content: query,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      try {
        // Build request body - query all documents by default
        const requestBody: any = {
          userPrompt: query,
          queryAllDocuments: true,
          sessionId: sessionId || undefined,
          isNewConversation: false,
        };

        const response = await fetch("/api/client/document-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || data.message || "Failed to query document"
          );
        }

        // Handle processing queued
        if (data.processingQueued || data.documentStatus === "processing") {
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            role: MessageRole.ASSISTANT,
            content: `Document is being processed. Please wait for it to finish processing and try again. Status: ${data.documentStatus || "processing"}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsQueryLoading(false);
          return;
        }

        // Update session ID if provided
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }

        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          id: data.queryId || `assistant-${Date.now()}`,
          role: MessageRole.ASSISTANT,
          content: data.result || "No response generated",
          timestamp: new Date(),
          sources: data.sources || [],
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Refetch balance to update sidebar (tokens consumed in backend)
        refetchBalance();

        setSuccess("Query completed successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.error("Error querying document:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to query document. Please try again.";

        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: MessageRole.ASSISTANT,
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);

        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsQueryLoading(false);
      }
    },
    [session?.user?.id, balance, sessionId, refetchBalance, tokenCost]
  );

  if (isLoading || isLoadingSession || balanceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Document Assistant
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                  Ask questions about your uploaded documents with AI
                </p>
              </div>
              <Button
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 w-full">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm sm:text-base text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm sm:text-base">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6">
        {!hasDocuments ? (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center py-8">
            <Card className="w-full max-w-2xl">
              <CardContent className="p-8 sm:p-12 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-muted rounded-full">
                    <FileText className="w-12 h-12 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    No Documents Found
                  </h2>
                  <p className="text-muted-foreground">
                    Upload documents to start querying them with AI.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/client/integrations")}
                  className="min-w-[200px]"
                  size="lg"
                >
                  Go to My Documents
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Chat Interface */
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-hidden mb-4">
              <ChatInterface messages={messages} isLoading={isQueryLoading} />
            </div>
            <QueryInput
              onSubmit={handleDocumentQuery}
              isLoading={isQueryLoading}
              tokenCost={tokenCost}
              disabled={!hasDocuments}
            />
          </div>
        )}
      </div>

      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        onPurchase={handlePurchaseCredits}
        balance={balance}
        required={tokenCost}
      />
    </div>
  );
}
