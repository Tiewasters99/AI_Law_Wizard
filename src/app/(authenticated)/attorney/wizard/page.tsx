"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Loader2,
  AlertCircle,
  FileText,
  Upload,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function WizardPage() {
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "files" | "history">(
    "search"
  );

  const handleStartAnalysis = useCallback(async () => {
    if (!userPrompt.trim()) {
      setError("Please describe what you would like to analyze");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/attorney/document-processing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: userPrompt.trim(),
          searchQuery: userPrompt.trim(),
          selectedFiles: selectedFiles,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process documents");
      }

      setResult(data.result || data.analysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsProcessing(false);
    }
  }, [userPrompt, selectedFiles]);

  const handleNewAnalysis = useCallback(() => {
    setUserPrompt("");
    setSelectedFiles([]);
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Document Analysis
          </h1>
          <p className="text-slate-600 mt-1">
            Analyze legal documents with AI assistance
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "search"
              ? "text-blue-700 border-b-2 border-blue-700"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Search & Analyze
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "files"
              ? "text-blue-700 border-b-2 border-blue-700"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "history"
              ? "text-blue-700 border-b-2 border-blue-700"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Query History
        </button>
      </div>

      {/* Main Content */}
      {activeTab === "search" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-4">
            {!result && !isProcessing && (
              <Card>
                <CardHeader>
                  <CardTitle>What would you like to analyze?</CardTitle>
                  <CardDescription>
                    Describe your document analysis request in detail
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={userPrompt}
                    onChange={e => setUserPrompt(e.target.value)}
                    placeholder="e.g., Find all clauses related to termination in the employment contract..."
                    className="min-h-[150px] resize-none"
                    disabled={isProcessing}
                  />

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">
                        Selected Files:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-3 h-3" />
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleStartAnalysis}
                    disabled={isProcessing || !userPrompt.trim()}
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Processing State */}
            {isProcessing && !result && (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <div className="text-center">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        Analyzing Documents
                      </h3>
                      <p className="text-sm text-slate-600">
                        This may take a moment...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Result Display */}
            {result && !isProcessing && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Analysis Result</CardTitle>
                    <CardDescription>
                      Document analysis complete
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewAnalysis}
                  >
                    New Analysis
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-slate-700">
                      {result}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>Be specific about what you&apos;re looking for</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>Select relevant files from OneDrive</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Brain className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>Ask follow-up questions after analysis</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Example Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Find all termination clauses",
                  "Summarize payment terms",
                  "Identify risk factors",
                  "Extract key dates",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setUserPrompt(prompt)}
                    className="text-left w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm text-slate-700"
                  >
                    {prompt}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === "files" && (
        <Card>
          <CardHeader>
            <CardTitle>OneDrive Integration</CardTitle>
            <CardDescription>
              Connect to your OneDrive to access documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Upload className="w-16 h-16 text-slate-400" />
              <p className="text-slate-600">OneDrive integration coming soon</p>
              <Button variant="outline">Connect OneDrive</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>Query History</CardTitle>
            <CardDescription>
              View your previous document analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-slate-600">No query history yet</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
