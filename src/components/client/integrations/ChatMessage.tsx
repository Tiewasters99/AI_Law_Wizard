"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import type { QuerySource } from "@/types/api";
import { MessageRole } from "@prisma/client";
import { QueryResult } from "./QueryResult";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface ChatMessageProps {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  sources?: QuerySource[];
}

export function ChatMessage({
  id,
  role,
  content,
  timestamp,
  sources,
}: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast.success("Response copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const isUser = role === MessageRole.USER;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "order-2" : "order-1"}`}
      >
        <Card className={isUser ? "bg-primary text-primary-foreground" : ""}>
          <CardContent className="p-3 sm:p-4 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              {isUser ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
              <span className="text-xs font-semibold">
                {isUser ? "You" : "Assistant"}
              </span>
              <span className="text-xs opacity-70 ml-auto">
                {formatTimestamp(timestamp)}
              </span>
            </div>

            {/* Content */}
            {isUser ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-primary-foreground">
                  {content}
                </p>
              </div>
            ) : (
              <div className="text-foreground">
                <MarkdownRenderer content={content} />
              </div>
            )}

            {/* Actions and Sources (only for assistant messages) */}
            {!isUser && (
              <>
                {sources && sources.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Collapsible
                      open={isSourcesOpen}
                      onOpenChange={setIsSourcesOpen}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between p-0 h-auto font-semibold text-xs"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            Sources ({sources.length})
                          </span>
                          {isSourcesOpen ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 pt-2">
                        {sources.map((source, index) => (
                          <div
                            key={index}
                            className="p-2 bg-muted rounded-lg space-y-1 border border-border"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs font-semibold text-foreground">
                                  {source.fileName}
                                </span>
                              </div>
                              {source.score > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-primary/10 text-primary"
                                >
                                  {(source.score * 100).toFixed(0)}% match
                                </Badge>
                              )}
                            </div>
                            {source.text && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {source.text}
                              </p>
                            )}
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {isCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
