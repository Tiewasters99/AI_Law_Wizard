"use client";

import { useState, useCallback } from "react";
import { Crown, Sparkles, Loader2, Play, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GrandWizardPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/attorney/document-processing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: prompt }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result || "Analysis completed successfully");
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to process request");
      console.error("Error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [prompt]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Grand Wizard</h1>
          <p className="text-slate-600 mt-1">
            Advanced AI-powered document analysis
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <CardTitle>Analysis Input</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="Describe what you would like to analyze or ask about..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="min-h-[200px]"
                disabled={isProcessing}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleAnalyze}
                disabled={!prompt.trim() || isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <CardTitle>Analysis Results</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                <p className="text-slate-600">Analyzing documents...</p>
              </div>
            ) : result ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-700">
                  {result}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Results will appear here after analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
