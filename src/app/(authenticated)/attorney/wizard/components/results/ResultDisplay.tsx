"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  MessageSquare,
  Copy,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { toast } from "@/components/ui/toast";

interface ResultDisplayProps {
  result: string;
  confidence: number;
  processingTime: number;
  onContinueChat: () => void;
  onNewAnalysis: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  confidence,
  processingTime,
  onContinueChat,
  onNewAnalysis,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Result copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${new Date().getTime()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Analysis result downloaded");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border shadow-lg">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Analysis Complete
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-muted/60 text-muted-foreground font-medium"
              >
                Confidence: {Math.round(confidence * 100)}%
              </Badge>
              <Badge
                variant="secondary"
                className="bg-muted/60 text-muted-foreground font-medium"
              >
                {processingTime.toFixed(1)}s
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-6 rounded-xl bg-muted/30 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onContinueChat}
              className="flex-1 sm:flex-none rounded-xl font-semibold"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Continue Chat
            </Button>
            <Button onClick={handleCopy} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={onNewAnalysis} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
