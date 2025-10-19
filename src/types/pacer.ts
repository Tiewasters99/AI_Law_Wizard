// PACER API Type Definitions

/**
 * PACER Login Credentials
 */
export interface PacerCredentials {
  username: string
  password: string
  clientCode?: string
  otpCode?: string // One-time passcode for MFA accounts
  redactFlag?: string // Required for filers: "1" to acknowledge redaction rules
}

/**
 * PACER Authentication Response
 */
export interface PacerAuthResponse {
  success: boolean
  sessionToken: string
  userInfo: {
    username: string
    accountId: string
    accountName?: string
  }
  expiresAt: string
  message?: string
}

/**
 * PACER Court Information
 */
export interface PacerCourt {
  code: string
  name: string
  type: 'district' | 'bankruptcy' | 'appellate'
  region?: string
}

/**
 * PACER Case Information (from PCL API)
 * All fields directly from PCL case search response
 */
export interface PacerCase {
  // Core case identifiers
  caseNumber: string // Formatted: caseNumberFull from PCL
  caseTitle: string
  court: string // courtId from PCL
  courtName?: string
  
  // Case details
  caseId?: number // Internal PACER case ID
  caseYear?: number
  caseOffice?: string
  caseType?: string
  filingDate: string // dateFiled from PCL
  
  // Status and dates
  status?: string
  effectiveDateClosed?: string
  dateDismissed?: string
  dateTermed?: string
  dateDischarged?: string
  dateReopened?: string
  
  // Classification
  jurisdiction?: string // jurisdictionType from PCL
  nature: string // natureOfSuit code
  
  // Judicial assignment
  judge?: string
  magistrateJudge?: string
  
  // Bankruptcy-specific
  bankruptcyChapter?: string
  dispositionMethod?: string
  jointDispositionMethod?: string
  jointBankruptcyFlag?: string
  
  // Civil case-specific
  civilStatInitiated?: string
  civilStatDisposition?: string
  civilStatTerminated?: string
  civilCtoNumber?: string
  civilTransferee?: string
  civilDateInitiate?: string
  civilDateDisposition?: string
  civilDateTerminated?: string
  
  // MDL (Multi-District Litigation) specific
  mdlCourtId?: string
  mdlExtension?: string
  mdlTransfereeDistrict?: string
  mdlLitType?: string
  mdlStatus?: string
  mdlTransferee?: string
  mdlJudgeLastName?: string
  mdlDateReceived?: string
  mdlDateOrdered?: string
  jpmlNumber?: number
  
  // Important: Direct link to case in court's CM/ECF system
  caseLink?: string // URL to access full docket and documents
}

/**
 * PACER Party Information
 */
export interface PacerParty {
  name: string
  type: 'plaintiff' | 'defendant' | 'intervenor' | 'amicus' | 'other'
  role?: string
  representation?: string
  address?: string
}

/**
 * PACER Attorney Information
 */
export interface PacerAttorney {
  name: string
  barNumber?: string
  firm?: string
  address?: string
  phone?: string
  email?: string
  representedParty?: string
}

/**
 * PACER Document Information
 */
export interface PacerDocument {
  documentId: string
  documentNumber: string
  attachmentNumber?: number
  description: string
  fileSize?: number
  pages?: number
  filingDate: string
  availability: 'available' | 'restricted' | 'sealed'
  cost?: number
}

/**
 * PACER Docket Entry
 */
export interface DocketEntry {
  entryNumber: number
  date: string
  filed: string
  description: string
  docketText: string
  documents?: PacerDocument[]
  filedBy?: string
  pageCount?: number
}

/**
 * Comprehensive Case Details (from PCL API)
 * This is essentially the same as PacerCase but kept as separate type for clarity
 * 
 * Note: PCL API provides ALL case information in the search results
 * There is no separate "details" endpoint - the search IS the details
 */
export interface CaseDetails extends PacerCase {
  // All fields inherited from PacerCase
  // This interface exists for backward compatibility
  // In reality, PCL case search provides complete case information
}

/**
 * Case Statistics
 */
export interface CaseStatistics {
  totalDocketEntries: number
  totalDocuments: number
  totalParties: number
  totalAttorneys: number
  lastActivity?: string
  estimatedDuration?: string
}

/**
 * PACER Search Query Parameters
 */
export interface PacerSearchQuery {
  caseNumber?: string
  caseTitle?: string
  partyName?: string
  attorneyName?: string
  court?: string
  filingDateFrom?: string
  filingDateTo?: string
  caseType?: string
  nature?: string
  page?: number
  limit?: number
}

/**
 * PACER Search Results
 */
export interface PacerSearchResults {
  cases: PacerCase[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  estimatedFee?: number
}

/**
 * Docket Report Response
 */
export interface DocketReportResponse {
  caseInfo: {
    caseNumber: string
    caseTitle: string
    court: string
    courtName?: string
    judge?: string
    filingDate: string
    status?: string
  }
  docketEntries: DocketEntry[]
  totalEntries: number
  estimatedFee: number
  generatedAt: string
}

/**
 * PACER Session Information
 */
export interface PacerSession {
  token: string
  username: string
  expiresAt: Date
  isValid: boolean
}

/**
 * PACER Fee Information
 */
export interface PacerFee {
  action: string
  estimatedCost: number
  pages?: number
  description: string
}

/**
 * PACER Error Response
 */
export interface PacerError {
  error: string
  code?: string
  message: string
  details?: string
}

/**
 * Document Download Request
 */
export interface DocumentDownloadRequest {
  sessionToken: string
  documentId: string
  caseNumber: string
  court: string
}

/**
 * Document Download Response
 */
export interface DocumentDownloadResponse {
  success: boolean
  documentId: string
  fileName: string
  fileSize: number
  pages: number
  cost: number
  downloadUrl?: string
  content?: Buffer
  error?: string
}

/**
 * Docket Fee Estimate
 */
export interface DocketFeeEstimate {
  caseNumber: string
  court: string
  estimatedPages: number
  estimatedFee: number
  breakdown: {
    docketPages: number
    documentPages: number
  }
  confidence: 'low' | 'medium' | 'high'
  generatedAt: string
}

/**
 * Available Courts List
 */
export const PACER_COURTS: PacerCourt[] = [
  // District Courts
  { code: 'dcd', name: 'District of Columbia', type: 'district' },
  { code: 'nysd', name: 'Southern District of New York', type: 'district' },
  { code: 'nynd', name: 'Northern District of New York', type: 'district' },
  { code: 'nyed', name: 'Eastern District of New York', type: 'district' },
  { code: 'nywd', name: 'Western District of New York', type: 'district' },
  { code: 'cacd', name: 'Central District of California', type: 'district' },
  { code: 'cand', name: 'Northern District of California', type: 'district' },
  { code: 'caed', name: 'Eastern District of California', type: 'district' },
  { code: 'casd', name: 'Southern District of California', type: 'district' },
  { code: 'txnd', name: 'Northern District of Texas', type: 'district' },
  { code: 'txsd', name: 'Southern District of Texas', type: 'district' },
  { code: 'txed', name: 'Eastern District of Texas', type: 'district' },
  { code: 'txwd', name: 'Western District of Texas', type: 'district' },
  { code: 'flsd', name: 'Southern District of Florida', type: 'district' },
  { code: 'flmd', name: 'Middle District of Florida', type: 'district' },
  { code: 'flnd', name: 'Northern District of Florida', type: 'district' },
  
  // Bankruptcy Courts
  { code: 'dcb', name: 'District of Columbia Bankruptcy', type: 'bankruptcy' },
  { code: 'nysb', name: 'Southern District of New York Bankruptcy', type: 'bankruptcy' },
  { code: 'cacb', name: 'Central District of California Bankruptcy', type: 'bankruptcy' },
  
  // Appellate Courts
  { code: 'ca1', name: 'First Circuit Court of Appeals', type: 'appellate' },
  { code: 'ca2', name: 'Second Circuit Court of Appeals', type: 'appellate' },
  { code: 'ca3', name: 'Third Circuit Court of Appeals', type: 'appellate' },
  { code: 'ca9', name: 'Ninth Circuit Court of Appeals', type: 'appellate' },
]

