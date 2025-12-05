"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  tokenCost?: number;
  disabled?: boolean;
}

export function QueryInput({
  onSubmit,
  isLoading = false,
  tokenCost = 5,
  disabled = false,
}: QueryInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading || disabled) return;

    onSubmit(query.trim());
    setQuery("");
  };

  return (
    <Card className="sticky bottom-0 z-10 border-t">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask a question about your documents..."
                className="min-h-[60px] max-h-[120px] resize-none text-base"
                disabled={isLoading || disabled}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isLoading || !query.trim() || disabled}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
              <Badge variant="outline" className="text-xs text-center">
                {tokenCost} tokens
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Cmd/Ctrl + Enter to send
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
