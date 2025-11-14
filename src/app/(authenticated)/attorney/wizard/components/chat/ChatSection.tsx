"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

interface ProcessedFileInfo {
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

interface ChatSectionProps {
  show: boolean;
  onClose: () => void;
  sessionId: string | null;
  processedFiles: ProcessedFileInfo[];
  onSessionCreate?: (sessionId: string) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  show,
  onClose,
  sessionId,
  processedFiles,
  onSessionCreate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/attorney/document-processing/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: sessionId || undefined,
          context: {
            processedFiles,
            analysisResult: "Previous analysis result",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.sessionId && !sessionId && onSessionCreate) {
        onSessionCreate(data.sessionId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl bg-background border shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b bg-accent/50"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">
                  Ask follow-up questions
                </span>
              </div>
              {sessionId && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Brain className="w-3 h-3 text-primary" />
                  <span>Context maintained from original analysis</span>
                  {processedFiles.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs py-0 px-1.5"
                    >
                      {processedFiles.length}{" "}
                      {processedFiles.length === 1 ? "document" : "documents"}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">
                  Start a conversation to ask follow-up questions...
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a follow-up question..."
                rows={2}
                className="flex-1 resize-none rounded-lg"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="rounded-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
