"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import {
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Zap,
  Crown,
  Plus,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Message type definition
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  reasoning?: string;
}

// Token Guard Component (inline)
function TokenGuard({
  children,
  requiredTokens,
  feature,
  description,
  balance,
  onPurchase,
}: {
  children: React.ReactNode;
  requiredTokens: number;
  feature: string;
  description: string;
  balance: number;
  onPurchase: () => void;
}) {
  if (balance < requiredTokens) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Insufficient Credits
          </h2>
          <p className="text-muted-foreground">
            You need {requiredTokens} credits to use {feature}, but you only
            have {balance} credits remaining.
          </p>
          <Button onClick={onPurchase} className="w-full">
            Purchase Credits
          </Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

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

export default function WizardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tokenCost, setTokenCost] = useState(2); // Default fallback
  const {
    balance,
    loading: balanceLoading,
    refetch: refetchBalance,
  } = useTokenBalance();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] =
    useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [openReasoning, setOpenReasoning] = useState<Record<string, boolean>>(
    {}
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch token cost from database
  useEffect(() => {
    const fetchTokenCost = async () => {
      try {
        const response = await fetch(
          "/api/pricing/feature-pricing?feature=wizard&role=CUSTOMER"
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

  // Hydrate from localStorage when no sessionId is present (handoff from dashboard)
  useEffect(() => {
    // If a sessionId exists, we rely on DB-backed loading instead
    if (searchParams.get("sessionId")) return;
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("legalChatMessages")
          : null;
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<{
        id: string;
        content: string;
        role: "user" | "assistant";
        timestamp: string | Date;
      }>;
      const mapped: Message[] = parsed.map(m => ({
        id: m.id,
        content: m.content,
        role: m.role,
        timestamp: new Date(m.timestamp as any),
      }));
      setMessages(mapped);
    } catch {
      // Ignore malformed localStorage content
    }
  }, [searchParams]);

  // Live update messages during streaming started from dashboard via custom event
  useEffect(() => {
    const handler = () => {
      try {
        const raw =
          typeof window !== "undefined"
            ? localStorage.getItem("legalChatMessages")
            : null;
        if (!raw) return;
        const parsed = JSON.parse(raw) as Array<{
          id: string;
          content: string;
          role: "user" | "assistant";
          timestamp: string | Date;
        }>;
        const mapped: Message[] = parsed.map(m => ({
          id: m.id,
          content: m.content,
          role: m.role,
          timestamp: new Date(m.timestamp as any),
        }));
        setMessages(mapped);
      } catch {
        // Ignore malformed updates
      }
    };
    window.addEventListener("chat-update", handler);
    return () => {
      window.removeEventListener("chat-update", handler);
    };
  }, []);

  // Load session from database when sessionId query param is present
  useEffect(() => {
    const loadSessionFromDatabase = async (sessionIdParam: string) => {
      if (!session?.user?.id) return;

      setIsLoadingSession(true);
      setError(null);

      try {
        // Fetch session details
        const sessionResponse = await fetch(
          `/api/client/chat/sessions/${sessionIdParam}`
        );

        if (!sessionResponse.ok) {
          let errorMessage = `Failed to load session (${sessionResponse.status})`;
          try {
            const contentType = sessionResponse.headers.get("content-type");
            if (contentType?.includes("application/json")) {
              const errorData = await sessionResponse.json();
              errorMessage =
                errorData.error || errorData.message || errorMessage;
            }
          } catch {
            // Use default error message
          }
          throw new Error(errorMessage);
        }

        const sessionData = await sessionResponse.json();

        // Validate response structure
        if (!sessionData || typeof sessionData !== "object") {
          throw new Error("Invalid response structure from server");
        }

        // Handle error responses
        if (sessionData.error) {
          throw new Error(sessionData.error || "Failed to load session");
        }

        // API returns { success: true, session: {...} } - check both structures for compatibility
        const loadedSession = sessionData.session || sessionData.data?.session;
        if (sessionData.success && loadedSession) {
          // Verify session belongs to user
          if (loadedSession.userId !== session.user.id) {
            throw new Error("Unauthorized access to session");
          }
          setSessionId(loadedSession.id);
        } else {
          throw new Error("Session not found in response");
        }

        // Fetch messages
        const messagesResponse = await fetch(
          `/api/client/chat/sessions/${sessionIdParam}/messages`
        );

        if (!messagesResponse.ok) {
          let errorMessage = `Failed to load messages (${messagesResponse.status})`;
          try {
            const contentType = messagesResponse.headers.get("content-type");
            if (contentType?.includes("application/json")) {
              const errorData = await messagesResponse.json();
              errorMessage =
                errorData.error || errorData.message || errorMessage;
            }
          } catch {
            // Use default error message
          }
          throw new Error(errorMessage);
        }

        const messagesData = await messagesResponse.json();

        // Validate response structure
        if (!messagesData || typeof messagesData !== "object") {
          throw new Error("Invalid messages response structure from server");
        }

        // Handle error responses
        if (messagesData.error) {
          throw new Error(messagesData.error || "Failed to load messages");
        }

        // API returns { success: true, messages: [...], session: {...} } - check both structures for compatibility
        const messages = messagesData.messages || messagesData.data?.messages;
        if (messagesData.success && Array.isArray(messages)) {
          const loadedMessages = messages.map((msg: any) => {
            const role = msg.role.toLowerCase() as "user" | "assistant";
            if (role === "assistant") {
              const { reasoning, finalAnswer } = splitReasoningFromContent(
                msg.content || ""
              );
              return {
                id: msg.id,
                content: finalAnswer,
                role,
                timestamp: new Date(msg.createdAt),
                reasoning,
              } as Message;
            }
            return {
              id: msg.id,
              content: msg.content,
              role,
              timestamp: new Date(msg.createdAt),
            } as Message;
          });
          setMessages(loadedMessages);
        } else {
          console.warn(
            "No messages found in response, starting with empty messages"
          );
          setMessages([]);
        }
      } catch (err) {
        console.error("Error loading session:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load session. Please try again.";
        setError(errorMessage);
      } finally {
        setIsLoadingSession(false);
      }
    };

    // Check for sessionId in query params
    const sessionIdParam = searchParams.get("sessionId");
    if (sessionIdParam && session?.user?.id) {
      loadSessionFromDatabase(sessionIdParam);
    }
  }, [session?.user?.id, searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePurchaseCredits = useCallback(() => {
    router.push("/client/tokens");
  }, [router]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userId = session?.user?.id;
    if (!userId) return;

    // Check if user has sufficient balance
    if (balance < tokenCost) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/client/legal-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: currentInput,
          stream: true,
          model: "openai/gpt-4o-mini",
          sessionId: sessionId || undefined,
          showReasoning: showReasoning,
          newChat: !sessionId,
        }),
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage} - ${errorText}`;
            }
          }
        } catch (parseError) {
          errorMessage = `API Error: ${response.status} - ${response.statusText || "Unknown error"}`;
        }

        if (response.status === 404) {
          errorMessage =
            "The requested service is not available. Please contact support.";
        } else if (response.status === 401 || response.status === 403) {
          errorMessage =
            "You are not authorized to use this service. Please log in again.";
        } else if (response.status === 429) {
          errorMessage =
            "Too many requests. Please wait a moment and try again.";
        } else if (response.status >= 500) {
          errorMessage =
            "Server error. Please try again later or contact support.";
        }

        throw new Error(errorMessage);
      }

      // Handle streaming response
      let markdownContent = "";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === "content") {
                    markdownContent += data.content;
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: markdownContent }
                          : msg
                      )
                    );
                  } else if (data.type === "done") {
                    // Capture sessionId from done event
                    if (data.sessionId) {
                      setSessionId(data.sessionId);
                      // Update URL to include sessionId for better UX
                      window.history.replaceState(
                        {},
                        "",
                        `/client/wizard?sessionId=${data.sessionId}`
                      );
                    }

                    // Parse reasoning vs final answer on completion
                    setMessages(prev =>
                      prev.map(msg => {
                        if (msg.id !== assistantMessage.id) return msg;
                        const { reasoning, finalAnswer } =
                          splitReasoningFromContent(msg.content || "");
                        return {
                          ...msg,
                          content: finalAnswer,
                          reasoning,
                        };
                      })
                    );

                    // Refetch balance to update sidebar (tokens consumed in backend)
                    refetchBalance();
                  } else if (data.type === "error") {
                    throw new Error(data.error);
                  }
                } catch (parseError) {
                  // Skip invalid JSON lines
                  continue;
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError((error as Error).message);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${(error as Error).message}\n\nPlease try again or contact support if the issue persists.`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputValue,
    session?.user?.id,
    sessionId,
    showReasoning,
    isLoading,
    balance,
    tokenCost,
    refetchBalance,
  ]);

  // Split reasoning (thinking) from final answer based on headings from the prompt
  function splitReasoningFromContent(markdown: string): {
    reasoning?: string;
    finalAnswer: string;
  } {
    if (!markdown) return { finalAnswer: "" };
    // Look for "## Final Answer" heading (case-insensitive, allow leading/trailing spaces)
    const finalAnswerRegex = /^##\s*Final\s+Answer\s*$/gim;
    const matches = [...markdown.matchAll(finalAnswerRegex)];
    if (matches.length > 0) {
      const match = matches[0];
      const startIndex = match.index ?? -1;
      if (startIndex >= 0) {
        const before = markdown.slice(0, startIndex).trim();
        let after = markdown.slice(startIndex).trim();
        // Remove the "## Final Answer" heading itself from the displayed answer
        after = after.replace(/^##\s*Final\s+Answer\s*[\r\n]*/i, "");
        // Strip any disclaimer section
        const disclaimerMatch = /(^|\n)##\s*Disclaimer\s*$/im.exec(after);
        if (disclaimerMatch && typeof disclaimerMatch.index === "number") {
          after = after.slice(0, disclaimerMatch.index).trim();
        }
        return {
          reasoning: before.length > 0 ? before : undefined,
          finalAnswer: after.length > 0 ? after : markdown,
        };
      }
    }
    // Try a softer split if exact heading missing
    const softMarkers = [
      /^##\s*Conclusion\s*$/gim,
      /^##\s*Answer\s*$/gim,
      /^###\s*Final\s*$/gim,
    ];
    for (const rx of softMarkers) {
      const soft = [...markdown.matchAll(rx)];
      if (soft.length > 0) {
        const match = soft[0];
        const idx = match.index ?? -1;
        if (idx >= 0) {
          const before = markdown.slice(0, idx).trim();
          let after = markdown.slice(idx).trim();
          // Remove a possible heading label for the answer
          after = after.replace(
            /^#+\s*(Final\s*Answer|Answer|Conclusion)\s*[\r\n]*/i,
            ""
          );
          // Strip disclaimer section
          const disclaimerMatch = /(^|\n)##\s*Disclaimer\s*$/im.exec(after);
          if (disclaimerMatch && typeof disclaimerMatch.index === "number") {
            after = after.slice(0, disclaimerMatch.index).trim();
          }
          return {
            reasoning: before.length > 0 ? before : undefined,
            finalAnswer: after.length > 0 ? after : markdown,
          };
        }
      }
    }
    // Fallback: no split found
    // Also apply disclaimer stripping in fallback
    let cleaned = markdown;
    const disclaimerMatch = /(^|\n)##\s*Disclaimer\s*$/im.exec(cleaned);
    if (disclaimerMatch && typeof disclaimerMatch.index === "number") {
      cleaned = cleaned.slice(0, disclaimerMatch.index).trim();
    }
    // Remove a possible leading "Final Answer" heading label if present
    cleaned = cleaned.replace(/^##\s*Final\s+Answer\s*[\r\n]*/i, "");
    return { finalAnswer: cleaned };
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = async () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setInputValue("");
    // Navigate to clean URL without sessionId
    window.history.replaceState({}, "", "/client/wizard");
  };

  const formatTime = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";
    const Icon = isUser ? User : Bot;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 mb-6 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div
          className={`flex-1 max-w-[85%] sm:max-w-xs lg:max-w-3xl ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          <div
            className={`inline-block p-3 sm:p-4 rounded-xl ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border shadow-sm"
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                {message.content}
              </div>
            ) : (
              <>
                <MarkdownRenderer content={message.content} />
                {message.reasoning && (
                  <div className="mt-2">
                    <Collapsible
                      open={!!openReasoning[message.id]}
                      onOpenChange={open =>
                        setOpenReasoning(prev => ({
                          ...prev,
                          [message.id]: open,
                        }))
                      }
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          onClick={e => e.preventDefault()}
                          aria-expanded={!!openReasoning[message.id]}
                          aria-controls={`reasoning-${message.id}`}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between p-0 h-auto text-xs font-semibold text-foreground"
                        >
                          <span className="flex items-center gap-2">
                            <Brain className="w-3 h-3" />
                            {openReasoning[message.id]
                              ? "Hide reasoning"
                              : "Show reasoning"}
                          </span>
                          {openReasoning[message.id] ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 transition-all">
                        <div className="p-2 bg-muted rounded-lg border border-border">
                          <MarkdownRenderer content={message.reasoning} />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </>
            )}
          </div>
          <div
            className={`text-xs text-muted-foreground mt-1 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  };

  if (balanceLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TokenGuard
      requiredTokens={tokenCost}
      feature="Legal Chat"
      description="Premium AI legal assistant with enhanced capabilities"
      balance={balance}
      onPurchase={handlePurchaseCredits}
    >
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                    Legal Chat
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900 dark:to-blue-900 dark:text-purple-200 text-xs sm:text-sm"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enhanced AI Legal Assistant • 2 tokens per message
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={startNewChat}
                className="text-xs sm:text-sm h-9"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto">
            {isLoadingSession ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading chat session...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                  Premium Legal Consultation
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">
                  Get enhanced AI-powered legal guidance with comprehensive
                  analysis, strategic planning, and advanced research
                  capabilities.
                </p>
              </div>
            ) : (
              <AnimatePresence>{messages.map(renderMessage)}</AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="px-3 sm:px-4 lg:px-6 py-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Input */}
        <div className="bg-card border-t border-border px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 sm:gap-3 items-end">
              <div className="flex-1 flex flex-col gap-2">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your legal question..."
                  className="flex-1 min-h-[44px] max-h-32 resize-none text-sm sm:text-base"
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3 h-3" />
                    <Label
                      htmlFor="reasoning-toggle"
                      className="text-xs cursor-pointer"
                    >
                      Show Reasoning
                    </Label>
                    <Switch
                      id="reasoning-toggle"
                      checked={showReasoning}
                      onCheckedChange={setShowReasoning}
                      className="scale-75"
                    />
                  </div>
                  <span className="hidden sm:inline">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                  <span className="sm:hidden">Enter to send</span>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-3 sm:px-4 h-11 sm:h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-end mt-1 text-xs text-muted-foreground">
              <span>2 tokens per message</span>
            </div>
          </div>
        </div>

        <InsufficientCreditsModal
          isOpen={showInsufficientCreditsModal}
          onClose={() => setShowInsufficientCreditsModal(false)}
          onPurchase={handlePurchaseCredits}
          balance={balance}
          required={tokenCost}
        />
      </div>
    </TokenGuard>
  );
}
