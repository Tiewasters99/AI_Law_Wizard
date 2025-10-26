import { useState, useCallback } from "react";
import type {
  DocketReportResponse,
  DocketEntry,
  CaseDetails,
} from "@/types/pacer";

interface UseDocketDataReturn {
  caseDetails: CaseDetails | null;
  loading: boolean;
  error: string | null;
  setCaseDetailsDirectly: (details: CaseDetails) => void;
  clearCaseDetails: () => void;
}

/**
 * Custom hook for managing case details data
 *
 * Note: PCL API only provides case search and party search.
 * All case details (43+ fields) are included in search results.
 * This hook simply stores and manages the case data you already have.
 *
 * ⚠️ NO API CALLS = NO COSTS
 */
export function useDocketData(): UseDocketDataReturn {
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Set case details directly from search results
   *
   * ✅ NO API CALL - NO COST
   *
   * Use this to display case details from search results.
   * Since PCL search already returns ALL 43+ fields, there's no need
   * to make another API call just to view details.
   *
   * This saves $0.10 per details view!
   */
  const setCaseDetailsDirectly = useCallback((details: CaseDetails): void => {
    setCaseDetails(details);
    setError(null);
    console.log(
      "[DocketData] ✅ Case details set directly (no API call, $0 cost)"
    );
  }, []);

  /**
   * Clear case details data
   */
  const clearCaseDetails = useCallback(() => {
    setCaseDetails(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    caseDetails,
    loading,
    error,
    setCaseDetailsDirectly,
    clearCaseDetails,
  };
}
