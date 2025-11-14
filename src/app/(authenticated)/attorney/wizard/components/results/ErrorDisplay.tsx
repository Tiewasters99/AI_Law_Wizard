"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="border-0"
        style={{
          background: "linear-gradient(145deg, #fce4e4, #ffffff)",
          boxShadow:
            "8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)",
          borderRadius: "20px",
        }}
      >
        <CardContent className="py-6 px-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-red-900">
                Analysis Failed
              </h3>
              <p className="text-sm text-red-700">{error}</p>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={onRetry}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  style={{
                    boxShadow:
                      "4px 4px 8px rgba(163, 177, 198, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button
                  onClick={onDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-red-700 hover:text-red-900"
                >
                  <X className="w-4 h-4 mr-2" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
