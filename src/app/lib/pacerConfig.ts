/**
 * PACER API Configuration
 * 
 * Official PACER API endpoints from documentation (May 2025)
 * Based on: PACER Authentication API User Guide v3 and PCL API User Guide (Nov 2024)
 */

export const PACER_CONFIG = {
  // Base URLs - Official from PACER documentation
  production: {
    // Authentication domain
    authDomain: 'pacer.login.uscourts.gov',
    // PCL (PACER Case Locator) domain
    pclDomain: 'pcl.uscourts.gov',
    // Account registration
    registrationUrl: 'https://pacer.uscourts.gov',
  },

  // QA/Testing URLs - For testing with non-billable test data
  qa: {
    authDomain: 'qa-login.uscourts.gov',
    pclDomain: 'qa-pcl.uscourts.gov',
    registrationUrl: 'https://qa-pacer.uscourts.gov',
  },

  // Official API Endpoints from documentation
  endpoints: {
    // Authentication Service (from PACER Authentication API doc)
    auth: '/services/cso-auth',          // POST - Authenticate and get token
    logout: '/services/cso-logout',      // POST - Invalidate session token
    
    // PCL API - Immediate Searches (returns pages of 54 results)
    casesFind: '/cases/find',            // POST - Search for cases (page by page)
    partiesFind: '/parties/find',        // POST - Search for parties (page by page)
    
    // PCL API - Batch Searches (returns up to 108,000 results)
    casesDownload: '/cases/download',    // POST - Start batch case search
    partiesDownload: '/parties/download', // POST - Start batch party search
    casesReports: '/cases/reports',      // GET - List all case batch jobs
    partiesReports: '/parties/reports',  // GET - List all party batch jobs
    caseDownloadStatus: '/cases/download/status/{reportId}',   // GET - Check batch job status
    partyDownloadStatus: '/parties/download/status/{reportId}', // GET - Check batch job status
    caseDownloadResults: '/cases/download/{reportId}',  // GET - Download batch results
    partyDownloadResults: '/parties/download/{reportId}', // GET - Download batch results
    deleteReport: '/cases/reports/{reportId}',  // DELETE - Remove batch job
    
    // Note: Docket reports and document downloads are accessed through individual court CM/ECF systems
    // Each court has its own docket and document retrieval system
  },

  // Timeouts (in milliseconds)
  timeouts: {
    authentication: 15000, // 15 seconds
    search: 30000,         // 30 seconds
    docket: 45000,         // 45 seconds
    document: 60000,       // 60 seconds
    default: 30000,        // 30 seconds
  },

  // Retry Configuration
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,    // 1 second
    maxDelay: 5000,        // 5 seconds
    backoffFactor: 2,
  },

  // Fee Structure (in USD)
  fees: {
    perPage: 0.10,
    documentCap: 3.00,
    quarterlyExemption: 30.00, // Quarterly exemption amount
  },

  // Session Configuration
  session: {
    defaultDuration: 3600000, // 1 hour in milliseconds
    warningThreshold: 300000, // 5 minutes before expiry
  },

  // Request Headers
  headers: {
    userAgent: 'AI-Wizard-Docket-Genie/1.0',
    accept: 'application/json',
    contentType: 'application/json',
  },

  // Error Codes
  errorCodes: {
    INVALID_CREDENTIALS: 'AUTH_001',
    SESSION_EXPIRED: 'AUTH_002',
    INSUFFICIENT_PRIVILEGES: 'AUTH_003',
    CASE_NOT_FOUND: 'CASE_001',
    DOCUMENT_RESTRICTED: 'DOC_001',
    DOCUMENT_SEALED: 'DOC_002',
    RATE_LIMIT_EXCEEDED: 'RATE_001',
    NETWORK_ERROR: 'NET_001',
  },
}

/**
 * Get the appropriate endpoint URL
 */
export function getPacerEndpoint(
  endpoint: keyof typeof PACER_CONFIG.endpoints,
  params?: Record<string, string>
): string {
  let url = PACER_CONFIG.endpoints[endpoint]

  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value))
    })
  }

  return url
}

/**
 * Calculate estimated fee for a PACER query
 */
export function calculatePacerFee(pages: number): number {
  const totalFee = pages * PACER_CONFIG.fees.perPage
  return Math.min(totalFee, PACER_CONFIG.fees.documentCap)
}

/**
 * Check if session is about to expire
 */
export function isSessionExpiringSoon(expiresAt: Date): boolean {
  const now = new Date()
  const timeRemaining = expiresAt.getTime() - now.getTime()
  return timeRemaining <= PACER_CONFIG.session.warningThreshold
}

/**
 * Format PACER error message
 */
export function formatPacerError(error: any): string {
  if (error.code) {
    return `PACER Error (${error.code}): ${error.message}`
  }
  if (error.status) {
    return `PACER API Error: ${error.status} - ${error.message || 'Unknown error'}`
  }
  return error.message || 'An unknown error occurred'
}

