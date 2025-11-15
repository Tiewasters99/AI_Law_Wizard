"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  Scale,
  Calendar,
  User,
  ExternalLink,
  Building,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import type { PacerCase } from "@/types/pacer";
import {
  getNatureOfSuitDescription,
  getCaseTypeDescription,
  getBankruptcyChapterDescription,
  formatCaseNumber,
} from "@/lib/backend/pacerCodes";

interface CaseSearchResultsProps {
  results: PacerCase[];
  totalCount: number;
  estimatedFee: number;
  onViewDocket: (caseInfo: { caseNumber: string; court: string }) => void;
  onViewDetails: (caseData: PacerCase) => void;
  loading?: boolean;
}

export function CaseSearchResults({
  results,
  totalCount,
  estimatedFee,
  onViewDocket,
  onViewDetails,
  loading = false,
}: CaseSearchResultsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleViewDetails = useCallback(
    (caseData: PacerCase) => {
      onViewDetails(caseData);
    },
    [onViewDetails]
  );

  const handleViewDocket = useCallback(
    (caseInfo: { caseNumber: string; court: string }) => {
      onViewDocket(caseInfo);
    },
    [onViewDocket]
  );

  const handleOpenLink = useCallback((url: string) => {
    window.open(url, "_blank");
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">
            Searching PACER database...
          </p>
          <p className="text-sm text-muted-foreground/70">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Scale className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              No Cases Found
            </h3>
            <p className="text-muted-foreground">
              No cases match your search criteria. Try adjusting your filters or
              search terms.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sticky Results Header */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm sticky top-20 z-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">
                Search Results
              </span>
            </div>
            <div className="h-6 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground font-bold">
                {totalCount}
              </strong>{" "}
              {totalCount === 1 ? "case" : "cases"} found
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              Estimated fee:{" "}
              <strong className="text-primary font-bold">
                ${estimatedFee.toFixed(2)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((caseItem, index) => (
          <motion.div
            key={`${caseItem.caseNumber}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground mb-2 leading-tight">
                    {caseItem.caseTitle}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          caseItem.caseNumber,
                          caseItem.caseNumber
                        )
                      }
                      className="flex items-center gap-1 text-sm text-primary font-mono font-semibold hover:text-primary/80 transition-colors"
                    >
                      {formatCaseNumber(caseItem.caseNumber)}
                      {copiedId === caseItem.caseNumber ? (
                        <Check className="w-3 h-3 text-chart-1" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    {caseItem.caseId && (
                      <span className="text-xs text-muted-foreground">
                        • ID: {caseItem.caseId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge - Bold & Prominent */}
                {caseItem.status && (
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                      caseItem.status === "Open"
                        ? "bg-chart-1/10 text-chart-1 border-2 border-chart-1/30"
                        : "bg-muted text-muted-foreground border-2 border-border"
                    }`}
                  >
                    {caseItem.status}
                  </span>
                )}
              </div>

              {/* Compact Metadata Grid - 4 items per row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {/* Court */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Scale className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                  <div className="min-w-0 truncate">
                    <span className="font-semibold">
                      {caseItem.courtName || caseItem.court?.toUpperCase()}
                    </span>
                    {caseItem.caseOffice && (
                      <div className="text-muted-foreground/70">
                        Office: {caseItem.caseOffice}
                      </div>
                    )}
                  </div>
                </div>

                {/* Filing Date */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-chart-4" />
                  <div>
                    <span className="font-semibold">
                      {new Date(caseItem.filingDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                    <div className="text-muted-foreground/70">Filed</div>
                  </div>
                </div>

                {/* Judge */}
                {caseItem.judge && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="w-3.5 h-3.5 flex-shrink-0 text-chart-3" />
                    <div className="min-w-0">
                      <span className="font-semibold truncate block">
                        {caseItem.judge}
                      </span>
                      <div className="text-muted-foreground/70">Judge</div>
                    </div>
                  </div>
                )}

                {/* Case Type */}
                {caseItem.caseType && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 text-chart-2" />
                    <div>
                      <span className="font-semibold">
                        {getCaseTypeDescription(caseItem.caseType)}
                      </span>
                      <div className="text-muted-foreground/70">Type</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Classification Tags - Color Coded */}
              <div className="flex flex-wrap gap-1.5">
                {caseItem.jurisdiction && (
                  <span className="text-xs px-2 py-1 bg-chart-4/10 text-chart-4 rounded-md border border-chart-4/30 font-semibold">
                    {caseItem.jurisdiction}
                  </span>
                )}
                {caseItem.nature && (
                  <span
                    className="text-xs px-2 py-1 bg-chart-3/10 text-chart-3 rounded-md border border-chart-3/30 font-semibold"
                    title={`Code: ${caseItem.nature}`}
                  >
                    {getNatureOfSuitDescription(caseItem.nature)}
                  </span>
                )}
                {caseItem.bankruptcyChapter && (
                  <span className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-md border border-destructive/30 font-semibold">
                    {getBankruptcyChapterDescription(
                      caseItem.bankruptcyChapter
                    )}
                  </span>
                )}
                {caseItem.mdlStatus && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-chart-2/10 text-chart-2 rounded-md border border-chart-2/30 font-semibold">
                    <Building className="w-3 h-3" />
                    MDL: {caseItem.mdlStatus}
                  </span>
                )}
              </div>

              {/* Hover Action Bar */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button
                  onClick={() => handleViewDetails(caseItem)}
                  size="sm"
                  className="flex-1 sm:flex-none font-semibold"
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Details
                </Button>

                {caseItem.caseLink && (
                  <Button
                    onClick={() => handleOpenLink(caseItem.caseLink || "")}
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none font-semibold border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    CM/ECF
                  </Button>
                )}

                <Button
                  onClick={() =>
                    copyToClipboard(
                      caseItem.caseLink || window.location.href,
                      `link-${caseItem.caseNumber}`
                    )
                  }
                  size="sm"
                  variant="ghost"
                  className="font-semibold"
                >
                  {copiedId === `link-${caseItem.caseNumber}` ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              {/* Closed Date if applicable */}
              {caseItem.effectiveDateClosed && (
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Closed:{" "}
                  {new Date(caseItem.effectiveDateClosed).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Results Footer */}
      <div className="bg-primary/5 border border-primary/30 rounded-xl p-4 text-center text-sm text-primary">
        <p>
          Showing <strong>{results.length}</strong> of{" "}
          <strong>{totalCount}</strong> results • Estimated cost:{" "}
          <strong>${estimatedFee.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}
