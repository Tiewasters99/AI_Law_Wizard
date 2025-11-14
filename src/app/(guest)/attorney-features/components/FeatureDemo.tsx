"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { colors } from "@/lib/frontend/designSystem";
import {
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Shield,
  ArrowRight,
} from "lucide-react";

interface FeatureDemoProps {
  feature: {
    id: string;
    name: string;
    description: string;
    category: "core" | "advanced" | "premium" | "integration";
  };
  onClose: () => void;
}

export function FeatureDemo({ feature, onClose }: FeatureDemoProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");

  const handleDemo = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let apiEndpoint = "";
      let requestBody: any = {};

      // Determine API endpoint based on feature
      switch (feature.id) {
        case "document-analysis":
          apiEndpoint = "/api/demo/document-analysis";
          requestBody = {
            userIssue:
              userInput || "Analyze this contract for potential legal issues",
            fileContent: "Sample contract content for demo purposes...",
            fileName: "sample-contract.pdf",
          };
          break;
        case "legal-research":
          apiEndpoint = "/api/demo/legal-research";
          requestBody = {
            query:
              userInput || "What are the key elements of a valid contract?",
            jurisdiction: "United States",
            caseType: "Contract Law",
          };
          break;
        default:
          apiEndpoint = "/api/demo/document-analysis";
          requestBody = {
            userIssue: userInput || "Provide legal analysis",
            fileContent: "Sample content for demo...",
            fileName: "sample-document.pdf",
          };
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || "Demo failed");
      }
    } catch (err) {
      console.error("Demo error:", err);
      setError("Demo failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDemoPlaceholder = () => {
    switch (feature.id) {
      case "document-analysis":
        return "Describe the legal document you want to analyze...";
      case "legal-research":
        return "Enter your legal research question...";
      default:
        return "Enter your legal question or request...";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{
            background:
              "linear-gradient(to right, rgba(239, 246, 255, 0.9), rgba(219, 234, 254, 0.8))",
            borderColor: "rgba(226, 232, 240, 0.5)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary shadow-sm text-primary-foreground">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  {feature.name} - Demo
                </h2>
                <p className="text-sm" style={{ color: colors.secondary[600] }}>
                  {feature.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Demo Notice */}
          <Card
            className="border-amber-200 bg-amber-50"
            style={{ borderColor: "rgba(217, 119, 6, 0.3)" }}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">
                    Demo Mode
                  </h3>
                  <p className="text-sm text-amber-700">
                    This is a limited demo version. For full functionality with
                    advanced AI capabilities, vector search, and professional
                    features, please upgrade to a professional account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                {feature.id === "legal-research"
                  ? "Research Query"
                  : "Legal Question"}
              </label>
              <Textarea
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder={getDemoPlaceholder()}
                className="min-h-[100px]"
                style={{
                  borderColor: "rgba(226, 232, 240, 0.8)",
                  backgroundColor: "rgba(248, 250, 252, 0.8)",
                }}
              />
            </div>

            <Button
              onClick={handleDemo}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Demo...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Demo
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          {(result || error) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {error ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">Demo Error</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-700">Demo Result</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: error
                      ? "rgba(254, 242, 242, 0.8)"
                      : "rgba(240, 253, 244, 0.8)",
                    border: `1px solid ${error ? "rgba(252, 165, 165, 0.5)" : "rgba(187, 247, 208, 0.5)"}`,
                  }}
                >
                  <pre
                    className="whitespace-pre-wrap text-sm"
                    style={{ color: colors.text }}
                  >
                    {error || result}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upgrade CTA */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Unlock Full Professional Features
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: colors.secondary[600] }}
              >
                Get access to advanced AI capabilities, vector search, file
                editing, and comprehensive legal analysis tools.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Upgrade to Professional
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
