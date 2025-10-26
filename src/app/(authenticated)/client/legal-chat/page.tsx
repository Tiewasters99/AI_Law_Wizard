"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { TokenTracker } from "@/lib/frontend/tokenTracker";
import { colors } from "@/lib/frontend/designSystem";
import {
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  Crown,
  Zap,
  FileText,
  Gavel,
  Shield,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Message type definition
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// Upgrade Modal Component (inline)
function UpgradeModal({
  isOpen,
  onClose,
  currentUsage,
  limit,
  feature,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUsage: number;
  limit: number;
  feature: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md">
        <h3 className="text-lg font-semibold mb-2">Token Limit Reached</h3>
        <p className="text-gray-600 mb-4">
          You've used {currentUsage} of {limit} tokens. Purchase more tokens to
          continue using {feature}.
        </p>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

export default function LegalChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [tokenUsage, setTokenUsage] = useState({ used: 0, limit: 0 });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<string>("general");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const consultationTypes = [
    { value: "general", label: "General Legal Question", icon: MessageSquare },
    { value: "contract", label: "Contract Review", icon: FileText },
    { value: "litigation", label: "Litigation Support", icon: Gavel },
    { value: "compliance", label: "Compliance Issue", icon: Shield },
    { value: "business", label: "Business Law", icon: Briefcase },
  ];

  useEffect(() => {
    // Load token usage
    const userId = session?.user?.id;
    if (userId) {
      const used = TokenTracker.getTokenUsage(userId);
      const limit = TokenTracker.getLimit(userId);
      setTokenUsage({ used, limit });
    }

    // Load existing session and messages
    const existingSessionId = localStorage.getItem("legalChatSessionId");
    const existingMessages = localStorage.getItem("legalChatMessages");

    if (existingSessionId) {
      setSessionId(existingSessionId);
    }

    if (existingMessages) {
      try {
        const parsedMessages = JSON.parse(existingMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing stored messages:", error);
      }
    }

    // Listen for chat updates from other pages
    const handleChatUpdate = () => {
      const updatedMessages = localStorage.getItem("legalChatMessages");
      if (updatedMessages) {
        try {
          const parsedMessages = JSON.parse(updatedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error("Error parsing updated messages:", error);
        }
      }
    };

    window.addEventListener("chat-update", handleChatUpdate);
    return () => window.removeEventListener("chat-update", handleChatUpdate);
  }, [session?.user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userId = session?.user?.id;
    if (!userId) return;

    // Check token limit
    const hasExceeded = TokenTracker.hasExceededLimit(userId);
    if (hasExceeded) {
      const usage = TokenTracker.getUsageSummary(userId);
      setTokenUsage({ used: usage.used, limit: usage.limit });
      setShowUpgradeModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/legal-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIssue: inputValue.trim(),
          sessionId: sessionId,
          consultationType: consultationType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        // Handle streaming response
        let markdownContent = "";
        let responseStructure: string[] = [];

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
                  const data = JSON.parse(line.slice(6));

                  if (data.type === "metadata") {
                    responseStructure = data.responseStructure;
                  } else if (data.type === "content") {
                    markdownContent += data.content;
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: markdownContent }
                          : msg
                      )
                    );
                  } else if (data.type === "done") {
                    if (data.sessionId) {
                      setSessionId(data.sessionId);
                      localStorage.setItem(
                        "legalChatSessionId",
                        data.sessionId
                      );
                    }

                    if (data.tokensUsed) {
                      TokenTracker.addTokenUsage(data.tokensUsed, userId);
                      const updatedUsage = TokenTracker.getUsageSummary(userId);
                      setTokenUsage({
                        used: updatedUsage.used,
                        limit: updatedUsage.limit,
                      });
                    }
                  } else if (data.type === "error") {
                    throw new Error(data.error);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      } else {
        // Fallback to JSON response
        const responseData = await response.json();

        if (responseData.error) {
          throw new Error(
            responseData.error || "The backend function call failed."
          );
        }

        if (!responseData.success || !responseData.content) {
          throw new Error("No content received from the AI.");
        }

        const markdownContent = responseData.content;

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: markdownContent,
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (responseData.sessionId) {
          setSessionId(responseData.sessionId);
          localStorage.setItem("legalChatSessionId", responseData.sessionId);
        }

        if (responseData.tokensUsed) {
          TokenTracker.addTokenUsage(responseData.tokensUsed, userId);
          const updatedUsage = TokenTracker.getUsageSummary(userId);
          setTokenUsage({ used: updatedUsage.used, limit: updatedUsage.limit });
        }
      }

      // Update localStorage with all messages
      const updatedMessages = [...messages, userMessage];
      if (contentType?.includes("text/event-stream")) {
        // The markdownContent is already updated in the messages state
        // No need to add it again here
      }
      localStorage.setItem(
        "legalChatMessages",
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setError((error as Error).message);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${
          (error as Error).message
        }\n\nPlease try again or contact support if the issue persists.`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, session?.user?.id, sessionId, consultationType, messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem("legalChatMessages");
    localStorage.removeItem("legalChatSessionId");
  };

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp);
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
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div
          className={`flex-1 max-w-3xl ${isUser ? "text-right" : "text-left"}`}
        >
          <div
            className={`inline-block p-4 rounded-2xl ${
              isUser
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 shadow-sm"
            }`}
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
          <div
            className={`text-xs text-gray-500 mt-1 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Legal Chat
              </h1>
              <p className="text-sm text-gray-500">
                Free AI Legal Assistant • 1 token per message
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {tokenUsage.limit - tokenUsage.used} credits remaining
              </div>
              <div className="text-xs text-gray-500">
                {tokenUsage.used} / {tokenUsage.limit} used
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="text-gray-600"
            >
              Clear Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Consultation Type Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Type:
          </span>
          {consultationTypes.map(type => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant={
                  consultationType === type.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => setConsultationType(type.value)}
                className="whitespace-nowrap"
              >
                <Icon className="w-4 h-4 mr-1" />
                {type.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start Your Legal Consultation
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Ask any legal question and get instant AI-powered guidance. Each
                message costs 1 token.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Review my contract",
                  "Explain my rights",
                  "Help with legal research",
                  "Analyze this case",
                ].map(suggestion => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>{messages.map(renderMessage)}</AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInputValue(e.target.value)
              }
              onKeyPress={handleKeyPress}
              placeholder="Ask your legal question..."
              className="flex-1 min-h-[44px] max-h-32 resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>1 token per message</span>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={tokenUsage.used}
        limit={tokenUsage.limit}
        feature="legal-chat"
      />
    </div>
  );
}
