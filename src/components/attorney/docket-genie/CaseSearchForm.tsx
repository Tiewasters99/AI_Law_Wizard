"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Hash,
  User,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { PacerSearchQuery } from "@/types/pacer";
import { PACER_COURTS } from "@/types/pacer";
import { motion, AnimatePresence } from "framer-motion";

interface CaseSearchFormProps {
  onSearch: (query: PacerSearchQuery) => void;
  loading: boolean;
}

export function CaseSearchForm({ onSearch, loading }: CaseSearchFormProps) {
  const [searchParams, setSearchParams] = useState<PacerSearchQuery>({
    caseNumber: "",
    caseTitle: "",
    partyName: "",
    attorneyName: "",
    court: "",
    filingDateFrom: "",
    filingDateTo: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setValidationError("");

      // Validate required fields
      const hasRequiredField = !!(
        searchParams.caseNumber?.trim() ||
        searchParams.caseTitle?.trim() ||
        searchParams.partyName?.trim() ||
        searchParams.attorneyName?.trim()
      );

      if (!hasRequiredField) {
        const errorMsg = "Please enter at least one search criteria";
        setValidationError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Filter out empty values
      const filteredParams: PacerSearchQuery = {};
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          filteredParams[key as keyof PacerSearchQuery] = value;
        }
      });

      onSearch(filteredParams);
    },
    [searchParams, onSearch]
  );

  const handleClear = useCallback(() => {
    setSearchParams({
      caseNumber: "",
      caseTitle: "",
      partyName: "",
      attorneyName: "",
      court: "",
      filingDateFrom: "",
      filingDateTo: "",
    });
    setValidationError("");
  }, []);

  const handlePreset = useCallback(
    (type: "caseNumber" | "party" | "attorney") => {
      handleClear();
      // Just focus on the respective field
      setTimeout(() => {
        const fieldId =
          type === "caseNumber"
            ? "caseNumber"
            : type === "party"
              ? "partyName"
              : "attorneyName";
        document.getElementById(fieldId)?.focus();
      }, 100);
    },
    [handleClear]
  );

  const handleInputChange = useCallback(
    (field: keyof PacerSearchQuery, value: string) => {
      setSearchParams(prev => ({
        ...prev,
        [field]: value,
      }));
      if (validationError) setValidationError("");
    },
    [validationError]
  );

  const handleAdvancedToggle = useCallback(() => {
    setShowAdvanced(prev => !prev);
  }, []);

  const hasRequiredField = !!(
    searchParams.caseNumber?.trim() ||
    searchParams.caseTitle?.trim() ||
    searchParams.partyName?.trim() ||
    searchParams.attorneyName?.trim()
  );

  const hasAnyField = Object.values(searchParams).some(
    val => val && val.trim() !== ""
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-4">
        {/* Header with presets */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Search Cases</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick Presets */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePreset("caseNumber")}
                className="text-xs"
              >
                <Hash className="w-3 h-3 mr-1" />
                By Case #
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePreset("party")}
                className="text-xs"
              >
                <User className="w-3 h-3 mr-1" />
                By Party
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePreset("attorney")}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                By Attorney
              </Button>
            </div>
            {hasAnyField && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={loading}
                className="text-xs"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-destructive"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-destructive">{validationError}</p>
          </div>
        )}

        {/* Primary Search Fields - 3 Column Compact Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Case Number */}
          <div>
            <Label
              htmlFor="caseNumber"
              className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"
            >
              <Hash className="w-3 h-3" />
              Case Number
            </Label>
            <Input
              id="caseNumber"
              type="text"
              value={searchParams.caseNumber || ""}
              onChange={e => handleInputChange("caseNumber", e.target.value)}
              placeholder="e.g., 1:23-cv-12345"
              disabled={loading}
              className="h-9 text-sm"
            />
          </div>

          {/* Party Name */}
          <div>
            <Label
              htmlFor="partyName"
              className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              Party Name
            </Label>
            <Input
              id="partyName"
              type="text"
              value={searchParams.partyName || ""}
              onChange={e => handleInputChange("partyName", e.target.value)}
              placeholder="Enter party name"
              disabled={loading}
              className="h-9 text-sm"
            />
          </div>

          {/* Attorney Name */}
          <div>
            <Label
              htmlFor="attorneyName"
              className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Attorney Name
            </Label>
            <Input
              id="attorneyName"
              type="text"
              value={searchParams.attorneyName || ""}
              onChange={e => handleInputChange("attorneyName", e.target.value)}
              placeholder="Enter attorney"
              disabled={loading}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Case Title - Full Width */}
        <div className="mb-4">
          <Label
            htmlFor="caseTitle"
            className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            Case Title
          </Label>
          <Input
            id="caseTitle"
            type="text"
            value={searchParams.caseTitle || ""}
            onChange={e => handleInputChange("caseTitle", e.target.value)}
            placeholder="e.g., Smith v. Jones"
            disabled={loading}
            className="h-9 text-sm"
          />
        </div>

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          onClick={handleAdvancedToggle}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium mb-3 transition-colors"
        >
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Advanced Filters {!showAdvanced && "(Court & Date Range)"}
        </button>

        {/* Advanced Filters - Collapsible */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border pt-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Court */}
                  <div className="md:col-span-3">
                    <Label
                      htmlFor="court"
                      className="text-xs font-semibold text-muted-foreground mb-1"
                    >
                      Court (Optional)
                    </Label>
                    <select
                      id="court"
                      value={searchParams.court || ""}
                      onChange={e => handleInputChange("court", e.target.value)}
                      disabled={loading}
                      className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    >
                      <option value="">All Courts</option>
                      {PACER_COURTS.map(court => (
                        <option key={court.code} value={court.code}>
                          {court.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filing Date From */}
                  <div>
                    <Label
                      htmlFor="filingDateFrom"
                      className="text-xs font-semibold text-muted-foreground mb-1"
                    >
                      Filing From
                    </Label>
                    <Input
                      id="filingDateFrom"
                      type="date"
                      value={searchParams.filingDateFrom}
                      onChange={e =>
                        handleInputChange("filingDateFrom", e.target.value)
                      }
                      disabled={loading}
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* Filing Date To */}
                  <div>
                    <Label
                      htmlFor="filingDateTo"
                      className="text-xs font-semibold text-muted-foreground mb-1"
                    >
                      Filing To
                    </Label>
                    <Input
                      id="filingDateTo"
                      type="date"
                      value={searchParams.filingDateTo}
                      onChange={e =>
                        handleInputChange("filingDateTo", e.target.value)
                      }
                      disabled={loading}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            className="flex-1 h-10 font-semibold"
            disabled={loading || !hasRequiredField}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Searching PACER...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Cases
              </>
            )}
          </Button>

          {/* Search hint */}
          {!hasRequiredField && !loading && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Enter at least one field above
            </span>
          )}
        </div>

        {/* Info Footer */}
        <p className="text-xs text-muted-foreground text-center mt-3 pt-3 border-t border-border">
          Results limited to 50 cases. Standard PACER fees apply ($0.10 per
          page).
        </p>
      </form>
    </motion.div>
  );
}
