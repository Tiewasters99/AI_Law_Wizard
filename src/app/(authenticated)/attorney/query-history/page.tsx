"use client";

import { useState, useEffect, useCallback } from "react";
import {
  History,
  Loader2,
  Search,
  Filter,
  FileText,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Query {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
  processingTime?: number;
  fileCount?: number;
}

export default function QueryHistoryPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  const fetchQueries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/attorney/query-history");
      const data = await response.json();

      if (response.ok) {
        setQueries(data.queries || []);
      }
    } catch (err) {
      console.error("Error fetching queries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const filteredQueries = queries.filter(query =>
    query.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: queries.length,
    thisWeek: queries.filter(q => {
      const date = new Date(q.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length,
    avgTime:
      queries.reduce((acc, q) => acc + (q.processingTime || 0), 0) /
        queries.length || 0,
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center">
          <History className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Query History</h1>
          <p className="text-slate-600 mt-1">
            View and manage your document analysis queries
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-slate-500">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Filter className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.avgTime)}s
            </div>
            <p className="text-xs text-slate-500">Processing time</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search queries..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Queries List */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-slate-600">Loading queries...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredQueries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <History className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-slate-600">No queries found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map(query => (
            <Card
              key={query.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedQuery(query)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {query.prompt}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4">
                      <span>
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                      {query.processingTime && (
                        <span>• {Math.round(query.processingTime)}s</span>
                      )}
                      {query.fileCount && (
                        <Badge variant="outline" className="text-xs">
                          {query.fileCount} files
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {query.response}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedQuery && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedQuery(null)}
        >
          <Card
            className="max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Query Details</CardTitle>
                <CardDescription>
                  {new Date(selectedQuery.createdAt).toLocaleString()}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuery(null)}
              >
                Close
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Prompt:</h4>
                <p className="text-sm bg-slate-50 p-3 rounded-lg">
                  {selectedQuery.prompt}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Response:</h4>
                <p className="text-sm whitespace-pre-wrap bg-blue-50 p-3 rounded-lg">
                  {selectedQuery.response}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
