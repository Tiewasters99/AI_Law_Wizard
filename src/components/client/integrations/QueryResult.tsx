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
import { Copy, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { toast } from "sonner";
import type { QuerySource } from "@/types/api";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface QueryResultProps {
  query: string;
  result: string;
  timestamp: Date;
  tokensUsed?: number;
  sources?: QuerySource[];
  documentName?: string;
}

export function QueryResult({
  query,
  result,
  timestamp,
  tokensUsed = 5,
  sources = [],
  documentName,
}: QueryResultProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
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
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Query Section */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-muted-foreground mb-1">
                Question
              </p>
              <p className="text-base text-foreground">{query}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTimestamp(timestamp)}</span>
              {tokensUsed && (
                <Badge variant="outline" className="text-xs">
                  {tokensUsed} tokens
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Response Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">
              Answer
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="text-foreground">
            <MarkdownRenderer content={result} />
          </div>
        </div>

        {/* Sources Section */}
        {sources && sources.length > 0 && (
          <div className="space-y-2 pt-2">
            <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto font-semibold text-sm"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Sources ({sources.length})
                  </span>
                  {isSourcesOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {sources.map((source, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg space-y-2 border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
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
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {source.text}
                      </p>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Document Name (if single document query) */}
        {documentName && !sources?.length && (
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              {documentName}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

