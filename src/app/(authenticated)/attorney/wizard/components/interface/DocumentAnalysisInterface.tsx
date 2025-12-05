"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/toast";
import { useDocumentProcessingStore } from "@/stores/documentProcessingStore";
import { useUIStore } from "@/stores/uiStore";

// Components
import { AnalysisHeader } from "./AnalysisHeader";
import { TabNavigation } from "./TabNavigation";
import { AnalysisInput } from "../input/AnalysisInput";
import { ProcessingIndicator } from "../processing/ProcessingIndicator";
import { ResultDisplay } from "../results/ResultDisplay";
import { ErrorDisplay } from "../results/ErrorDisplay";
import { ProcessedFilesList } from "../results/ProcessedFilesList";
import { ChatSection } from "../chat/ChatSection";

// Utils
import { createDocumentAnalysisSession } from "../../utils/sessionUtils";
import { animationVariants } from "../../utils/constants";

interface DocumentAnalysisInterfaceProps {
  onComplete?: (result: string, generatedFile: string) => void;
  onBeforeStart?: () => Promise<boolean> | boolean;
  model?: string;
}

export const DocumentAnalysisInterface: React.FC<
  DocumentAnalysisInterfaceProps
> = ({ onComplete, onBeforeStart, model }) => {
  // Zustand stores
  const {
    isProcessing,
    finalResult,
    processedFiles,
    error,
    confidence,
    processingTime,
    currentStep,
    totalSteps,
    chatSessionId,
    documentSessionId,
    startProcessing,
    clearState,
    resetError,
    setSessionIds,
  } = useDocumentProcessingStore();

  const { activeTab, showChatMode, setActiveTab, toggleChatMode } =
    useUIStore();

  // Local state
  const [userPrompt, setUserPrompt] = useState("");

  // Create document analysis session
  const handleCreateSession = useCallback(async () => {
    if (!userPrompt || !finalResult) return;

    const sessionId = await createDocumentAnalysisSession({
      userPrompt,
      processedFiles,
      analysisResult: finalResult,
    });

    if (sessionId) {
      setSessionIds(sessionId, sessionId);
      toast.success("Chat Session Ready - You can now ask follow-up questions");
    } else {
      toast.error("Failed to create chat session");
    }
  }, [userPrompt, finalResult, processedFiles, setSessionIds]);

  // Handle processing completion
  useEffect(() => {
    if (!isProcessing && finalResult && !error) {
      toast.success(
        `Analysis Complete - Successfully processed ${processedFiles.length || 0} relevant documents`
      );

      // Auto-create session for chat
      if (!documentSessionId && userPrompt && finalResult) {
        handleCreateSession();
      }

      onComplete?.(finalResult, finalResult);
    }
  }, [
    isProcessing,
    finalResult,
    error,
    processedFiles.length,
    documentSessionId,
    handleCreateSession,
    onComplete,
    userPrompt,
  ]);

  // Handle error display
  useEffect(() => {
    if (error) {
      const shouldShowToast =
        !error.includes("Connection") &&
        !error.includes("fetch") &&
        !error.includes("Invalid request");

      if (shouldShowToast) {
        let errorTitle = "Analysis Failed";
        let errorDescription = error;

        if (error.includes("No relevant documents found")) {
          errorTitle = "No Documents Found";
          errorDescription =
            "No relevant documents found. Try rephrasing or upload more documents.";
        } else if (error.includes("Processing timeout")) {
          errorTitle = "Processing Timeout";
          errorDescription =
            "Analysis took too long. Please try with a simpler request.";
        }

        toast.error(`${errorTitle} - ${errorDescription}`);
      }
    }
  }, [error]);

  // Start analysis
  const handleStartAnalysis = useCallback(async () => {
    if (isProcessing) return;

    if (!userPrompt.trim()) {
      toast.error("Please describe what you would like to analyze");
      return;
    }

    // Check token requirements
    if (onBeforeStart) {
      try {
        const canProceed = await onBeforeStart();
        if (!canProceed) return;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to validate requirements"
        );
        return;
      }
    }

    // Clear previous state
    clearState();

    toast.info("Starting Analysis - Processing your request...");

    // Start processing
    await startProcessing({
      userPrompt: userPrompt.trim(),
      ...(model && { model }),
    });
  }, [
    isProcessing,
    userPrompt,
    model,
    onBeforeStart,
    clearState,
    startProcessing,
  ]);

  // Handle new analysis
  const handleNewAnalysis = useCallback(() => {
    setUserPrompt("");
    clearState();
    setSessionIds(null, null);
  }, [clearState, setSessionIds]);

  // Handle continue chat
  const handleContinueChat = useCallback(async () => {
    if (!chatSessionId) {
      await handleCreateSession();
    }
    toggleChatMode();
  }, [chatSessionId, handleCreateSession, toggleChatMode]);

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "analysis":
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Analysis Input */}
            {!finalResult && !isProcessing && (
              <AnalysisInput
                userPrompt={userPrompt}
                onPromptChange={setUserPrompt}
                onSubmit={handleStartAnalysis}
                isProcessing={isProcessing}
              />
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <ProcessingIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
                message="Analyzing documents and generating insights"
              />
            )}

            {/* Error Display */}
            {error && !isProcessing && (
              <ErrorDisplay
                error={error}
                onRetry={handleStartAnalysis}
                onDismiss={resetError}
              />
            )}

            {/* Result Display */}
            {finalResult && !isProcessing && !error && (
              <>
                <ResultDisplay
                  result={finalResult}
                  confidence={confidence}
                  processingTime={processingTime}
                  onContinueChat={handleContinueChat}
                  onNewAnalysis={handleNewAnalysis}
                />

                {/* Chat Section */}
                <ChatSection
                  show={showChatMode}
                  onClose={toggleChatMode}
                  sessionId={chatSessionId}
                  processedFiles={processedFiles}
                  onSessionCreate={(id: string) =>
                    setSessionIds(documentSessionId, id)
                  }
                />

                {/* Processed Files */}
                {processedFiles.length > 0 && (
                  <ProcessedFilesList
                    processedFiles={processedFiles}
                    title="Relevant Documents"
                  />
                )}
              </>
            )}
          </div>
        );

      case "files":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Files integration coming soon...</p>
            </div>
          </div>
        );

      case "history":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Query history coming soon...</p>
            </div>
          </div>
        );

      case "library":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Document library coming soon...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={animationVariants.page}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <AnalysisHeader model={model} />
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Tab Content - Full Width */}
        {renderTabContent()}
      </div>
    </motion.div>
  );
};
