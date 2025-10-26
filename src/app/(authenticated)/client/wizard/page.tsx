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
  Zap,
  Clock,
  CheckCircle,
  Crown,
  Sparkles,
  Brain,
  Shield,
  FileText,
  Gavel,
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

// Token Guard Component (inline)
function TokenGuard({
  children,
  requiredTokens,
  feature,
  description,
}: {
  children: React.ReactNode;
  requiredTokens: number;
  feature: string;
  description: string;
}) {
  return <>{children}</>;
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

const WIZARD_TOKEN_REQUIREMENT = 100;
const WIZARD_TOKEN_COST = 2;

export default function WizardPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [tokenUsage, setTokenUsage] = useState({ used: 0, limit: 0 });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consultationType, setConsultationType] =
    useState<string>("comprehensive");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const consultationTypes = [
    {
      value: "comprehensive",
      label: "Comprehensive Analysis",
      icon: Brain,
      description: "Deep legal analysis with multiple perspectives",
    },
    {
      value: "strategy",
      label: "Legal Strategy",
      icon: Shield,
      description: "Strategic legal planning and risk assessment",
    },
    {
      value: "research",
      label: "Advanced Research",
      icon: Sparkles,
      description: "In-depth legal research with citations",
    },
    {
      value: "drafting",
      label: "Document Drafting",
      icon: FileText,
      description: "Help with legal document creation",
    },
    {
      value: "litigation",
      label: "Litigation Support",
      icon: Gavel,
      description: "Court case preparation and strategy",
    },
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
    const existingSessionId = localStorage.getItem("wizardChatSessionId");
    const existingMessages = localStorage.getItem("wizardChatMessages");

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

    // Listen for chat updates
    const handleChatUpdate = () => {
      const updatedMessages = localStorage.getItem("wizardChatMessages");
      if (updatedMessages) {
        try {
          const parsedMessages = JSON.parse(updatedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error("Error parsing updated messages:", error);
        }
      }
    };

    window.addEventListener("wizard-chat-update", handleChatUpdate);
    return () =>
      window.removeEventListener("wizard-chat-update", handleChatUpdate);
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
          tier: "wizard", // Premium tier
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      let markdownContent = "";
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        // Handle streaming response
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
                        "wizardChatSessionId",
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
          localStorage.setItem("wizardChatSessionId", responseData.sessionId);
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
        updatedMessages.push({
          id: (Date.now() + 1).toString(),
          content: markdownContent,
          role: "assistant",
          timestamp: new Date(),
        });
      }
      localStorage.setItem(
        "wizardChatMessages",
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem("wizardChatMessages");
    localStorage.removeItem("wizardChatSessionId");
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
            isUser
              ? "bg-primary text-white"
              : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
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
    <TokenGuard
      requiredTokens={WIZARD_TOKEN_REQUIREMENT}
      feature="Wizard Chat"
      description="Premium AI legal assistant with enhanced capabilities"
    >
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Wizard Chat
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Enhanced AI Legal Assistant • 2 tokens per message
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
                  title={type.description}
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Premium Legal Consultation
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get enhanced AI-powered legal guidance with comprehensive
                  analysis, strategic planning, and advanced research
                  capabilities.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Analyze this complex legal issue",
                    "Create a legal strategy for my case",
                    "Research recent case law on this topic",
                    "Draft a legal document for me",
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
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your advanced legal question..."
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
              <span>2 tokens per message</span>
            </div>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentUsage={tokenUsage.used}
          limit={tokenUsage.limit}
          feature="wizard"
        />
      </div>
    </TokenGuard>
  );
}
