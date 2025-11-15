"use client";

import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { Loader2 } from "lucide-react";
import type { QuerySource } from "@/types/api";
import { MessageRole } from "@prisma/client";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  sources?: QuerySource[];
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function ChatInterface({
  messages,
  isLoading = false,
}: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full min-h-[400px] max-h-[600px]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Start a conversation by asking a question about your documents.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                id={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                sources={message.sources}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[85%] sm:max-w-[75%]">
                  <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Assistant is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
