/**
 * Court Configuration for PACER Docket Integration
 * 
 * Defines court-specific settings, URLs, and parsing patterns
 * for different federal court CM/ECF systems.
 */

export interface CourtConfig {
  code: string
  name: string
  baseUrl: string
  docketEndpoint: string
  timeout: number
  selectors: {
    caseInfo: {
      title: string
      judge: string
      filingDate: string
      status: string
    }
    docketEntries: {
      container: string
      entryNumber: string
      date: string
      description: string
      filedBy: string
    }
    documents: {
      container: string
      link: string
      description: string
      cost: string
      pages: string
    }
  }
  feeCalculation: {
    docketPageRate: number
    documentPageRate: number
    minimumFee: number
  }
}

/**
 * Supported court configurations with dynamic URL generation
 */
const SUPPORTED_COURTS = {
  nysd: {
    code: 'nysd',
    name: 'Southern District of New York',
    subdomain: 'nysd',
    docketEndpoint: '/cgi-bin/DktRpt.pl',
    timeout: 45000,
    selectors: {
      caseInfo: {
        title: 'td:contains("Case Title:") + td, .caseTitle',
        judge: 'td:contains("Assigned Judge:") + td, .assignedJudge',
        filingDate: 'td:contains("Date Filed:") + td, .filingDate',
        status: 'td:contains("Case Status:") + td, .caseStatus'
      },
      docketEntries: {
        container: 'tr.docketEntry, tr[class*="docket"], .docketTable tr',
        entryNumber: 'td:first-child, .entryNumber',
        date: 'td:nth-child(2), .entryDate',
        description: 'td:nth-child(3), .entryDescription',
        filedBy: 'td:nth-child(4), .filedBy'
      },
      documents: {
        container: 'a[href*="doc1"], .documentLink',
        link: 'a[href*="doc1"]',
        description: 'a[href*="doc1"]',
        cost: 'text()',
        pages: 'text()'
      }
    },
    feeCalculation: {
      docketPageRate: 0.10,  // $0.10 per page for docket reports
      documentPageRate: 0.10, // $0.10 per page for documents
      minimumFee: 0.00
    }
  },
  // Add more courts here as needed
  // nyed: {
  //   code: 'nyed',
  //   name: 'Eastern District of New York',
  //   subdomain: 'nyed',
  //   docketEndpoint: '/cgi-bin/DktRpt.pl',
  //   timeout: 45000,
  //   // ... other configurations
  // }
} as const

/**
 * Generate court configuration dynamically
 */
function generateCourtConfig(courtCode: string): CourtConfig {
  const court = SUPPORTED_COURTS[courtCode.toLowerCase() as keyof typeof SUPPORTED_COURTS]
  
  if (!court) {
    throw new Error(`Court configuration not found for: ${courtCode}`)
  }

  return {
    code: court.code,
    name: court.name,
    baseUrl: `https://ecf.${court.subdomain}.uscourts.gov`,
    docketEndpoint: court.docketEndpoint,
    timeout: court.timeout,
    selectors: court.selectors,
    feeCalculation: court.feeCalculation
  }
}

/**
 * NYSD (Southern District of New York) Configuration
 * @deprecated Use generateCourtConfig('nysd') instead
 */
export const NYSD_CONFIG: CourtConfig = generateCourtConfig('nysd')

/**
 * Get court configuration by code
 */
export function getCourtConfig(courtCode: string): CourtConfig {
  return generateCourtConfig(courtCode)
}

/**
 * Get list of all supported court codes
 */
export function getSupportedCourts(): string[] {
  return Object.keys(SUPPORTED_COURTS)
}

/**
 * Check if a court code is supported
 */
export function isCourtSupported(courtCode: string): boolean {
  return courtCode.toLowerCase() in SUPPORTED_COURTS
}

/**
 * Validate case number format for specific court
 */
export function validateCaseNumber(caseNumber: string, courtCode: string): boolean {
  if (!isCourtSupported(courtCode)) {
    return false
  }

  switch (courtCode.toLowerCase()) {
    case 'nysd':
      // NYSD case numbers: 1:24-cv-12345, 1:24-bk-12345, etc.
      return /^\d+:\d{2}-(cv|bk|cr|mc)-\d+$/i.test(caseNumber)
    default:
      // Generic validation for other courts
      return /^\d+:\d{2}-[a-z]{2}-\d+$/i.test(caseNumber)
  }
}

/**
 * Get court display name
 */
export function getCourtDisplayName(courtCode: string): string {
  const config = getCourtConfig(courtCode)
  return config.name
}
