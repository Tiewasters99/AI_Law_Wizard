"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, Crown } from "lucide-react";

interface AnalysisHeaderProps {
  model?: string;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ model }) => {
  const isAdvanced = model?.includes("gemini-2.5-pro");
  const title = isAdvanced ? "Advanced AI Document Analysis" : "AI Document Analysis";
  const description = isAdvanced 
    ? "Premium legal document processing powered by Gemini 2.5 Pro"
    : "Advanced legal document processing powered by AI";
  const Icon = isAdvanced ? Crown : Brain;
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
        <div
          className="relative w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, #e6ebf1, #ffffff)",
            boxShadow:
              "6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)",
          }}
        >
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {title}
          </h1>
          <Sparkles className="w-5 h-5 text-yellow-500" />
        </div>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>
    </motion.div>
  );
};
