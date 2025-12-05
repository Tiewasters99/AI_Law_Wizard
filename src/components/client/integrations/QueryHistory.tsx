"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, X, Clock, FileText } from "lucide-react";
import { QueryResult } from "./QueryResult";
import type { QuerySource } from "@/types/api";

interface QueryHistoryItem {
  id: string;
  query: string;
  result: string;
  timestamp: Date;
  tokensUsed: number;
  documentId?: string;
  documentName?: string;
  sources?: QuerySource[];
}

interface QueryHistoryProps {
  queries: QueryHistoryItem[];
  onQueryClick?: (query: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function QueryHistory({
  queries,
  onQueryClick,
  onDelete,
  isLoading = false,
}: QueryHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredQueries = queries.filter(
    q =>
      q.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.result.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const groupedQueries = filteredQueries.reduce(
    (acc, query) => {
      const date = new Date(query.timestamp);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);

      let group = "Older";
      if (date >= today) {
        group = "Today";
      } else if (date >= yesterday) {
        group = "Yesterday";
      } else if (date >= thisWeek) {
        group = "This Week";
      }

      if (!acc[group]) acc[group] = [];
      acc[group].push(query);
      return acc;
    },
    {} as Record<string, QueryHistoryItem[]>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Query History</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search history..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4 pb-4">
          {isLoading && queries.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Loading history...
                </p>
              </div>
            </div>
          ) : filteredQueries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No queries match your search"
                  : "No queries yet"}
              </p>
              {!searchQuery && (
                <p className="text-xs text-muted-foreground mt-1">
                  Start asking questions to see your history
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedQueries).map(([group, groupQueries]) => (
                <div key={group} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {group}
                    </h3>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-3">
                    {groupQueries.map(query => (
                      <div key={query.id} className="relative group">
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setExpandedId(
                              expandedId === query.id ? null : query.id
                            );
                            onQueryClick?.(query.query);
                          }}
                        >
                          <div className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground line-clamp-2">
                                  {query.query}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {formatRelativeTime(query.timestamp)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {query.tokensUsed} tokens
                                  </Badge>
                                  {query.sources &&
                                    query.sources.length > 0 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {query.sources.length} sources
                                      </Badge>
                                    )}
                                </div>
                              </div>
                              {onDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                                  onClick={e => {
                                    e.stopPropagation();
                                    onDelete(query.id);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        {expandedId === query.id && (
                          <div className="mt-3">
                            <QueryResult
                              query={query.query}
                              result={query.result}
                              timestamp={query.timestamp}
                              tokensUsed={query.tokensUsed}
                              sources={query.sources}
                              documentName={query.documentName}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
