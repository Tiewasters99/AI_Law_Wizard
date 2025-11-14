"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Pin,
  PinOff,
  ExternalLink,
  FileText,
  Calendar,
  Info,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CaseDetailsView } from "./CaseDetailsView";
import { DocketDisplay } from "./DocketDisplay";
import { useDocketFetcher } from "@/hooks/useDocketFetcher";
import type { CaseDetails, DocketReportResponse } from "@/types/pacer";

interface ActiveCasePanelProps {
  isOpen: boolean;
  onClose: () => void;
  caseDetails: CaseDetails | null;
  docket: DocketReportResponse | null;
  loading: boolean;
  onDownloadDocument: (documentId: string) => void;
  sessionToken?: string;
}

export function ActiveCasePanel({
  isOpen,
  onClose,
  caseDetails,
  docket,
  loading,
  onDownloadDocument,
  sessionToken,
}: ActiveCasePanelProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "docket">("details");
  const [showFeeEstimate, setShowFeeEstimate] = useState(false);

  // Use docket fetcher hook
  const {
    docketData,
    feeEstimate,
    loading: docketLoading,
    error: docketError,
    estimateFee,
    fetchDocket,
    clearData,
    clearError,
  } = useDocketFetcher();

  const handleFetchDocket = useCallback(async () => {
    if (!caseDetails || !sessionToken) return;

    try {
      // First estimate fees
      await estimateFee(
        sessionToken,
        caseDetails.caseNumber,
        caseDetails.court
      );
      setShowFeeEstimate(true);
    } catch (error) {
      console.error("Failed to estimate fees:", error);
    }
  }, [caseDetails, sessionToken, estimateFee]);

  // Auto-fetch docket when case details are available and session token is provided
  useEffect(() => {
    if (caseDetails && sessionToken && !docketData && !docketLoading) {
      handleFetchDocket();
    }
  }, [caseDetails, sessionToken, docketData, docketLoading, handleFetchDocket]);

  const handleConfirmFee = async () => {
    if (!caseDetails || !sessionToken) return;

    try {
      await fetchDocket(
        sessionToken,
        caseDetails.caseNumber,
        caseDetails.court
      );
      setShowFeeEstimate(false);
    } catch (error) {
      console.error("Failed to fetch docket:", error);
    }
  };

  const handleCancelFee = () => {
    setShowFeeEstimate(false);
    clearData();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={isPinned ? undefined : onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={e => e.stopPropagation()}
          className="absolute right-0 top-0 bottom-0 w-full sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%] bg-background shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold mb-1 truncate">
                  {caseDetails?.caseTitle ||
                    docket?.caseInfo.caseTitle ||
                    "Case Details"}
                </h2>
                <p className="text-sm text-primary-foreground/80 font-mono">
                  {caseDetails?.caseNumber || docket?.caseInfo.caseNumber}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPinned(!isPinned)}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  title={isPinned ? "Unpin panel" : "Pin panel"}
                >
                  {isPinned ? (
                    <PinOff className="w-4 h-4" />
                  ) : (
                    <Pin className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {(caseDetails?.status || docket?.caseInfo.status) && (
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    (caseDetails?.status || docket?.caseInfo.status) === "Open"
                      ? "bg-chart-1/20 text-chart-1"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {caseDetails?.status || docket?.caseInfo.status}
                </span>
              )}
              {caseDetails?.caseLink && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(caseDetails.caseLink, "_blank")}
                  className="text-primary-foreground hover:bg-primary-foreground/20 ml-auto"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">CM/ECF</span>
                </Button>
              )}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading case information...</p>
              </div>
            ) : !caseDetails && !docket ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Case Selected
                  </h3>
                  <p className="text-muted-foreground">
                    Select a case from search results to view details and
                    docket.
                  </p>
                </div>
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={v => setActiveTab(v as "details" | "docket")}
                className="h-full flex flex-col"
              >
                <div className="border-b border-border px-4 pt-2 flex-shrink-0 bg-background sticky top-0 z-10">
                  <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger
                      value="details"
                      className="flex items-center gap-2"
                    >
                      <Info className="w-4 h-4" />
                      <span>Details</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="docket"
                      className="flex items-center gap-2"
                      disabled={!docket}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Docket</span>
                      {!docket && <span className="text-xs">(N/A)</span>}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="details" className="mt-0 p-4">
                    {caseDetails ? (
                      <CaseDetailsView caseDetails={caseDetails} />
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No case details available
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="docket" className="mt-0 p-4">
                    {docketData ? (
                      <DocketDisplay
                        docket={docketData}
                        onDownloadDocument={onDownloadDocument}
                      />
                    ) : docketLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground">
                          Loading docket report...
                        </p>
                      </div>
                    ) : docketError ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                        <AlertCircle className="w-12 h-12 text-destructive" />
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Error Loading Docket
                          </h3>
                          <p className="text-muted-foreground mb-4">{docketError}</p>
                          <Button onClick={handleFetchDocket} variant="outline">
                            Try Again
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="mb-4">No docket data available</p>
                        {sessionToken && (
                          <Button
                            onClick={handleFetchDocket}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Load Docket Report
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>

          {/* Panel Footer */}
          <div className="border-t border-border p-3 bg-muted/50 text-xs text-muted-foreground text-center flex-shrink-0">
            {isPinned ? (
              <span>
                📌 Panel is pinned. Click outside won&apos;t close it.
              </span>
            ) : (
              <span>Click outside or press X to close</span>
            )}
          </div>
        </motion.div>

        {/* Fee Estimation Dialog */}
        <AnimatePresence>
          {showFeeEstimate && feeEstimate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      PACER Fee Estimate
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Review estimated costs before proceeding
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Case:</span>
                    <span className="font-mono text-sm font-semibold">
                      {feeEstimate.caseNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Court:</span>
                    <span className="text-sm font-semibold">
                      {feeEstimate.court.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Estimated Pages:
                    </span>
                    <span className="text-sm font-semibold">
                      {feeEstimate.breakdown.docketPages}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">
                        Estimated Fee:
                      </span>
                      <span className="text-xl font-bold text-primary">
                        ${feeEstimate.estimatedFee.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-chart-3/10 border border-chart-3/30 rounded-lg p-3 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-chart-3 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-chart-3">
                      <p className="font-semibold mb-1">Important:</p>
                      <p>
                        This is an estimate. Actual fees may vary based on the
                        number of pages in the docket report. You will be
                        charged the actual amount when the report is generated.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCancelFee}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmFee}
                    className="flex-1"
                    disabled={docketLoading}
                  >
                    {docketLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Proceed (${feeEstimate.estimatedFee.toFixed(2)})
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
