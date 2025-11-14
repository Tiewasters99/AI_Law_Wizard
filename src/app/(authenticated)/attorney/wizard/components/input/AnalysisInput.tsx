"use client";

import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AnalysisInputProps {
  userPrompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const AnalysisInput: React.FC<AnalysisInputProps> = ({
  userPrompt,
  onPromptChange,
  onSubmit,
  isProcessing,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && !isProcessing) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-foreground">AI Document Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What would you like to analyze?
            </label>
            <Textarea
              value={userPrompt}
              onChange={e => onPromptChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe what you want to analyze or ask a question about your documents..."
              rows={4}
              className="text-base resize-none p-4"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">Press Ctrl+Enter to submit</p>
          </div>

          <Button
            onClick={onSubmit}
            disabled={isProcessing || !userPrompt.trim()}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-3" />
                Start Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
