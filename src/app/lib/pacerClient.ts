/**
 * PACER API Client Library - PRODUCTION VERSION
 * 
 * Handles communication with PACER (Public Access to Court Electronic Records) API
 * for authentication, case search, docket retrieval, and document downloads.
 * 
 * @see https://pacer.uscourts.gov
 */

import type {
  PacerCredentials,
  PacerAuthResponse,
  PacerSearchQuery,
  PacerSearchResults,
} from '@/types/pacer'

/**
 * PACER API Client - Production Implementation
 */
export class PacerApiClient {
  private baseUrl: string
  private timeout: number
  private loginUrl: string
  private caseLocatorUrl: string
  private mockMode: boolean

  constructor() {
    // PACER Official URLs from documentation
    // QA: qa-login.uscourts.gov, qa-pcl.uscourts.gov
    // Production: pacer.login.uscourts.gov, pcl.uscourts.gov
    const authDomain = process.env.PACER_AUTH_DOMAIN || 'pacer.login.uscourts.gov'
    const pclDomain = process.env.PACER_PCL_DOMAIN || 'pcl.uscourts.gov'
    
    // Official authentication endpoint: /services/cso-auth
    this.loginUrl = `https://${authDomain}/services/cso-auth`
    
    // Official PCL API endpoint: /pcl-public-api/rest
    this.caseLocatorUrl = `https://${pclDomain}/pcl-public-api/rest`
    
    this.baseUrl = `https://${authDomain}`
    this.timeout = parseInt(process.env.PACER_TIMEOUT_MS || '30000', 10)
    
    // Enable mock mode if PACER_MOCK_MODE is set to 'true'
    this.mockMode = process.env.PACER_MOCK_MODE === 'true'
    
    if (this.mockMode) {
      console.log('[PACER] 🧪 Running in MOCK MODE - Using simulated data')
      console.log('[PACER] To use real PACER API:')
      console.log('[PACER]   1. Register at https://pacer.uscourts.gov')
      console.log('[PACER]   2. For QA testing: https://qa-pacer.uscourts.gov')
      console.log('[PACER]   3. Set PACER_MOCK_MODE=false in .env')
      console.log('[PACER]   4. Endpoint: https://pacer.login.uscourts.gov/services/cso-auth')
    } else {
      console.log('[PACER] Using official PACER endpoints:')
      console.log(`[PACER]   Auth: ${this.loginUrl}`)
      console.log(`[PACER]   PCL: ${this.caseLocatorUrl}`)
    }
  }

  /**
   * Authenticate with PACER using credentials
   */
  async authenticate(credentials: PacerCredentials): Promise<PacerAuthResponse> {
    try {
      console.log('[PACER] Authenticating user:', credentials.username)

      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required')
      }

      // MOCK MODE: Return simulated authentication
      if (this.mockMode) {
        console.log('[PACER] 🧪 Mock authentication successful')
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        
        return {
          success: true,
          sessionToken: `mock-session-${Date.now()}`,
          userInfo: {
            username: credentials.username,
            accountId: `PACER-MOCK-${Date.now()}`,
            accountName: credentials.username,
          },
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
          message: '🧪 Mock Mode: Using simulated PACER data. Contact PACER support for real API access.',
        }
      }

      // REAL MODE: Call actual PACER API
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      // Official PACER API request format from documentation
      // Fields: loginId (required), password (required), clientCode (optional), otpCode (optional for MFA), redactFlag (required for filers)
      const requestBody: Record<string, string> = {
        loginId: credentials.username,  // API uses 'loginId' not 'username'
        password: credentials.password,
      }

      // Add optional fields if provided
      if (credentials.clientCode) {
        requestBody.clientCode = credentials.clientCode
      }
      
      if (credentials.otpCode) {
        requestBody.otpCode = credentials.otpCode
      }
      
      // Add redactFlag - required for filers (attorneys who file documents)
      // Set to "1" to acknowledge redaction rules per Fed. R. App. P. 25(a)(5), Fed. R. Civ. P. 5.2, etc.
      if (credentials.redactFlag) {
        requestBody.redactFlag = credentials.redactFlag
      }

      const response = await fetch(this.loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Provide helpful error message for 404
        if (response.status === 404) {
          throw new Error(
            'PACER API endpoint not found (404). ' +
            'This usually means:\n' +
            '1. PACER requires special API access registration\n' +
            '2. The endpoint URL may be different\n' +
            '3. Contact PACER support: 800-676-6856 or pacer@psc.uscourts.gov\n\n' +
            'To continue development, enable mock mode by setting PACER_MOCK_MODE=true in your .env file.'
          )
        }
        
        throw new Error(
          errorData.message || 
          `Authentication failed: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      // Check for PACER API errors even with 200 status
      // PACER returns loginResult: "0" for success, non-zero for errors
      if (data.loginResult && data.loginResult !== "0") {
        // Specific error for redaction flag requirement
        if (data.errorDescription && data.errorDescription.includes('redact')) {
          throw new Error(
            'Redaction acknowledgment required. ' +
            'You must acknowledge that you will comply with federal redaction rules. ' +
            'Please check the "I acknowledge redaction rules" checkbox and try again.\n\n' +
            'Redaction Rules: You must redact Social Security numbers, taxpayer IDs, dates of birth, ' +
            'names of minor children, financial account numbers, and home addresses in criminal cases.'
          )
        }
        
        // Specific error for MFA/OTP requirement
        if (data.errorDescription && data.errorDescription.includes('one-time passcode')) {
          throw new Error(
            'Invalid username, password, or one-time passcode. ' +
            'If your account uses Multi-Factor Authentication (MFA), please enter the 6-digit code from your authenticator app.'
          )
        }
        
        // Return the actual error description from PACER
        throw new Error(data.errorDescription || 'Authentication failed')
      }

      console.log('[PACER] Authentication successful')

      // PACER returns a session token and expiration
      const authResponse: PacerAuthResponse = {
        success: true,
        sessionToken: data.nextGenCSO || data.sessionToken || data.token,
        userInfo: {
          username: credentials.username,
          accountId: data.accountId || data.userId || `PACER-${Date.now()}`,
          accountName: data.accountName || credentials.username,
        },
        expiresAt: data.expiresAt || new Date(Date.now() + 3600000).toISOString(), // 1 hour default
      }

      return authResponse

    } catch (error) {
      console.error('[PACER] Authentication error:', error)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Authentication request timed out. Please try again.')
      }
      
      throw this.handleError(error)
    }
  }

  /**
   * Search for cases using PACER Case Locator
   * Official PCL API Documentation: /pcl-public-api/rest/cases/find
   */
  async searchCases(
    query: PacerSearchQuery,
    sessionToken: string
  ): Promise<PacerSearchResults> {
    try {
      console.log('[PACER] Searching cases with query:', query)

      this.validateSession(sessionToken)

      // MOCK MODE: Return simulated results
      if (this.mockMode) {
        console.log('[PACER] 🧪 Mock search returning simulated results')
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
        
        return {
          cases: [
            {
              caseNumber: '1:2023cv12345',
              caseTitle: 'Sample Case v. Example Defendant',
              court: 'nysd',
              courtName: 'Southern District of New York',
              filingDate: '2023-06-15',
              caseType: 'cv',
              status: 'Open',
              judge: 'Hon. Sample Judge',
              nature: 'Contract Dispute',
              jurisdiction: 'Federal Question',
            },
          ],
          totalCount: 1,
          page: query.page || 0,
          pageSize: 54,
          totalPages: 1,
          estimatedFee: 0.10,
        }
      }

      // Build PCL API request body according to official documentation
      // PCL API uses specific field names: caseNumberFull, caseTitle, courtId, dateFiledFrom, dateFiledTo, etc.
      const searchBody: Record<string, any> = {}

      // Case number search (format: o:yy-tp-nnnnn)
      if (query.caseNumber) {
        searchBody.caseNumberFull = query.caseNumber
      }

      // Case title search
      if (query.caseTitle) {
        searchBody.caseTitle = query.caseTitle
      }

      // Court ID search (e.g., 'nysd', 'cacd')
      if (query.court) {
        searchBody.courtId = [query.court] // PCL expects array of court IDs
      }

      // Filing date range
      if (query.filingDateFrom) {
        searchBody.dateFiledFrom = query.filingDateFrom // Format: yyyy-MM-dd
      }
      if (query.filingDateTo) {
        searchBody.dateFiledTo = query.filingDateTo // Format: yyyy-MM-dd
      }

      // Case type (e.g., 'cv', 'cr', 'bk')
      if (query.caseType) {
        searchBody.caseType = [query.caseType] // PCL expects array
      }

      // Nature of suit
      if (query.nature) {
        searchBody.natureOfSuit = [query.nature] // PCL expects array
      }

      // Party name search - requires separate party search API
      // If party name is provided, we need to use /parties/find endpoint instead
      if (query.partyName) {
        // For party searches, use different endpoint
        return this.searchByParty(query, sessionToken)
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      // Calculate page number (PCL uses 0-based indexing)
      const page = (query.page || 1) - 1 // Convert from 1-based to 0-based

      // Official PACER PCL API endpoint for case search
      // POST /pcl-public-api/rest/cases/find?page={pageNumber}
      const response = await fetch(
        `${this.caseLocatorUrl}/cases/find?page=${page}`,
        {
          method: 'POST', // PCL API requires POST, not GET
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-NEXT-GEN-CSO': sessionToken, // PCL uses X-NEXT-GEN-CSO, not Authorization Bearer
          },
          body: JSON.stringify(searchBody),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        if (response.status === 406) {
          throw new Error('Invalid search parameters. Please check your search criteria.')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || 
          `Search failed: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      console.log(`[PACER] Found ${data.pageInfo?.totalElements || 0} cases`)

      // Check for updated session token in response headers
      const newToken = response.headers.get('X-NEXT-GEN-CSO')
      if (newToken) {
        console.log('[PACER] Session token updated')
      }

      // Transform PACER PCL response to our format
      // PCL returns: { receipt, pageInfo, content: [...cases] }
      // Capture ALL available fields from PCL response
      const results: PacerSearchResults = {
        cases: (data.content || []).map((c: any) => ({
          // Core identifiers
          caseNumber: c.caseNumberFull,
          caseTitle: c.caseTitle,
          court: c.courtId,
          courtName: this.getCourtName(c.courtId),
          
          // Case details
          caseId: c.caseId,
          caseYear: c.caseYear,
          caseOffice: c.caseOffice,
          caseType: c.caseType,
          filingDate: c.dateFiled,
          
          // Status and dates
          status: c.effectiveDateClosed ? 'Closed' : 'Open',
          effectiveDateClosed: c.effectiveDateClosed,
          dateDismissed: c.dateDismissed,
          dateTermed: c.dateTermed,
          dateDischarged: c.dateDischarged,
          dateReopened: c.dateReopened,
          
          // Classification
          jurisdiction: c.jurisdictionType,
          nature: c.natureOfSuit,
          
          // Judicial assignment
          judge: c.judge,
          magistrateJudge: c.magistrateJudge,
          
          // Bankruptcy-specific
          bankruptcyChapter: c.bankruptcyChapter,
          dispositionMethod: c.dispositionMethod,
          jointDispositionMethod: c.jointDispositionMethod,
          jointBankruptcyFlag: c.jointBankruptcyFlag,
          
          // Civil case-specific
          civilStatInitiated: c.civilStatInitiated,
          civilStatDisposition: c.civilStatDisposition,
          civilStatTerminated: c.civilStatTerminated,
          civilCtoNumber: c.civilCtoNumber,
          civilTransferee: c.civilTransferee,
          civilDateInitiate: c.civilDateInitiate,
          civilDateDisposition: c.civilDateDisposition,
          civilDateTerminated: c.civilDateTerminated,
          
          // MDL (Multi-District Litigation)
          mdlCourtId: c.mdlCourtId,
          mdlExtension: c.mdlExtension,
          mdlTransfereeDistrict: c.mdlTransfereeDistrict,
          mdlLitType: c.mdlLitType,
          mdlStatus: c.mdlStatus,
          mdlTransferee: c.mdlTransferee,
          mdlJudgeLastName: c.mdlJudgeLastName,
          mdlDateReceived: c.mdlDateReceived,
          mdlDateOrdered: c.mdlDateOrdered,
          jpmlNumber: c.jpmlNumber,
          
          // CRITICAL: Direct link to court's CM/ECF system
          // This is where attorneys can access full docket and documents
          caseLink: c.caseLink,
        })),
        totalCount: data.pageInfo?.totalElements || 0,
        page: (data.pageInfo?.number || 0) + 1, // Convert back to 1-based
        pageSize: data.pageInfo?.size || 54, // PCL default page size is 54
        totalPages: data.pageInfo?.totalPages || 0,
        estimatedFee: data.receipt?.searchFee ? parseFloat(data.receipt.searchFee) : 0.10,
      }

      return results

    } catch (error) {
      console.error('[PACER] Search error:', error)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Search request timed out. Please try again.')
      }
      
      throw this.handleError(error)
    }
  }

  /**
   * Search for parties using PACER Case Locator
   * Official PCL API Documentation: /pcl-public-api/rest/parties/find
   */
  private async searchByParty(
    query: PacerSearchQuery,
    sessionToken: string
  ): Promise<PacerSearchResults> {
    try {
      console.log('[PACER] Searching by party name:', query.partyName)

      // Build party search request body
      const searchBody: Record<string, any> = {
        lastName: query.partyName, // PCL uses lastName for party search
      }

      // Add court case constraints if provided
      if (query.court || query.filingDateFrom || query.filingDateTo || query.caseType) {
        searchBody.courtCase = {}
        
        if (query.court) {
          searchBody.courtCase.courtId = [query.court]
        }
        if (query.filingDateFrom) {
          searchBody.courtCase.dateFiledFrom = query.filingDateFrom
        }
        if (query.filingDateTo) {
          searchBody.courtCase.dateFiledTo = query.filingDateTo
        }
        if (query.caseType) {
          searchBody.courtCase.caseType = [query.caseType]
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const page = (query.page || 1) - 1 // Convert to 0-based

      const response = await fetch(
        `${this.caseLocatorUrl}/parties/find?page=${page}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-NEXT-GEN-CSO': sessionToken,
          },
          body: JSON.stringify(searchBody),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Party search failed: ${response.status}`)
      }

      const data = await response.json()

      // Transform party search results to case format
      // Party search returns party info + nested courtCase object with full case details
      const results: PacerSearchResults = {
        cases: (data.content || []).map((party: any) => {
          // Party searches include full case details in nested courtCase object
          const courtCase = party.courtCase || party
          
          return {
            // Core identifiers
            caseNumber: courtCase.caseNumberFull || party.caseNumberFull,
            caseTitle: courtCase.caseTitle || party.caseTitle,
            court: courtCase.courtId || party.courtId,
            courtName: this.getCourtName(courtCase.courtId || party.courtId),
            
            // Case details
            caseId: courtCase.caseId || party.caseId,
            caseYear: courtCase.caseYear || party.caseYear,
            caseOffice: courtCase.caseOffice || party.caseOffice,
            caseType: courtCase.caseType || party.caseType,
            filingDate: courtCase.dateFiled || party.dateFiled,
            
            // Status and dates
            status: (courtCase.effectiveDateClosed || party.effectiveDateClosed) ? 'Closed' : 'Open',
            effectiveDateClosed: courtCase.effectiveDateClosed || party.effectiveDateClosed,
            dateDismissed: courtCase.dateDismissed || party.dateDismissed,
            dateTermed: courtCase.dateTermed || party.dateTermed,
            dateDischarged: courtCase.dateDischarged || party.dateDischarged,
            dateReopened: courtCase.dateReopened || party.dateReopened,
            
            // Classification
            jurisdiction: courtCase.jurisdictionType || party.jurisdictionType,
            nature: courtCase.natureOfSuit || party.natureOfSuit,
            
            // Judicial assignment
            judge: courtCase.judge || party.judge,
            magistrateJudge: courtCase.magistrateJudge || party.magistrateJudge,
            
            // Bankruptcy-specific
            bankruptcyChapter: courtCase.bankruptcyChapter || party.bankruptcyChapter,
            dispositionMethod: courtCase.dispositionMethod || party.dispositionMethod,
            jointDispositionMethod: courtCase.jointDispositionMethod || party.jointDispositionMethod,
            jointBankruptcyFlag: courtCase.jointBankruptcyFlag || party.jointBankruptcyFlag,
            
            // Civil case-specific
            civilStatInitiated: courtCase.civilStatInitiated,
            civilStatDisposition: courtCase.civilStatDisposition,
            civilStatTerminated: courtCase.civilStatTerminated,
            civilCtoNumber: courtCase.civilCtoNumber,
            civilTransferee: courtCase.civilTransferee,
            civilDateInitiate: courtCase.civilDateInitiate,
            civilDateDisposition: courtCase.civilDateDisposition,
            civilDateTerminated: courtCase.civilDateTerminated,
            
            // MDL
            mdlCourtId: courtCase.mdlCourtId,
            mdlExtension: courtCase.mdlExtension,
            mdlTransfereeDistrict: courtCase.mdlTransfereeDistrict,
            mdlLitType: courtCase.mdlLitType,
            mdlStatus: courtCase.mdlStatus,
            mdlTransferee: courtCase.mdlTransferee,
            mdlJudgeLastName: courtCase.mdlJudgeLastName,
            mdlDateReceived: courtCase.mdlDateReceived,
            mdlDateOrdered: courtCase.mdlDateOrdered,
            jpmlNumber: courtCase.jpmlNumber,
            
            // Critical: Link to CM/ECF
            caseLink: courtCase.caseLink || party.caseLink,
          }
        }),
        totalCount: data.pageInfo?.totalElements || 0,
        page: (data.pageInfo?.number || 0) + 1,
        pageSize: data.pageInfo?.size || 54,
        totalPages: data.pageInfo?.totalPages || 0,
        estimatedFee: data.receipt?.searchFee ? parseFloat(data.receipt.searchFee) : 0.10,
      }

      return results

    } catch (error) {
      console.error('[PACER] Party search error:', error)
      throw error
    }
  }




  /**
   * Validate session token
   */
  validateSession(token: string): boolean {
    if (!token || token.trim() === '') {
      throw new Error('Invalid session token. Please login again.')
    }
    return true
  }

  /**
   * Logout and invalidate PACER session
   * Official PACER Authentication API Documentation: /services/cso-logout
   */
  async logout(sessionToken: string): Promise<void> {
    try {
      console.log('[PACER] Logging out')

      if (!sessionToken) {
        return
      }

      // MOCK MODE: Just log and return
      if (this.mockMode) {
        console.log('[PACER] 🧪 Mock logout successful')
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for logout

      // Official PACER logout endpoint
      // POST /services/cso-logout with body { "nextGenCSO": "<token>" }
      const logoutUrl = this.loginUrl.replace('/cso-auth', '/cso-logout')
      
      const response = await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          nextGenCSO: sessionToken,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        
        // PACER returns loginResult: "0" for successful logout
        if (data.loginResult === "0") {
          console.log('[PACER] Logged out successfully')
        } else {
          console.warn('[PACER] Logout response:', data.errorDescription || 'Unknown result')
        }
      } else {
        console.warn('[PACER] Logout failed with status:', response.status)
      }

    } catch (error) {
      // Don't throw on logout errors, just log them
      // The session will eventually expire anyway
      console.warn('[PACER] Logout error (non-critical):', error)
    }
  }

  // ============ Helper Methods ============

  /**
   * Get human-readable court name from court code
   */
  private getCourtName(courtCode: string): string {
    const courtMap: Record<string, string> = {
      'dcd': 'District of Columbia',
      'nysd': 'Southern District of New York',
      'nynd': 'Northern District of New York',
      'nyed': 'Eastern District of New York',
      'nywd': 'Western District of New York',
      'cacd': 'Central District of California',
      'cand': 'Northern District of California',
      'caed': 'Eastern District of California',
      'casd': 'Southern District of California',
      'txnd': 'Northern District of Texas',
      'txsd': 'Southern District of Texas',
      'txed': 'Eastern District of Texas',
      'txwd': 'Western District of Texas',
      'flsd': 'Southern District of Florida',
      'flmd': 'Middle District of Florida',
      'flnd': 'Northern District of Florida',
    }

    return courtMap[courtCode.toLowerCase()] || courtCode.toUpperCase()
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      // Check for common network errors
      if (error.message.includes('fetch')) {
        return new Error('Network error. Please check your connection and try again.')
      }
      if (error.message.includes('CORS')) {
        return new Error('PACER API access error. Please contact support.')
      }
      return error
    }
    
    return new Error('An unexpected error occurred. Please try again.')
  }
}

// Export singleton instance
export const pacerClient = new PacerApiClient()
