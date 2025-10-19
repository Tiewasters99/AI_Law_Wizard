/**
 * PACER Docket Fetcher Service
 * 
 * Handles fetching and parsing docket reports from federal court CM/ECF systems.
 * Currently supports NYSD (Southern District of New York) with plans for additional courts.
 */

import * as cheerio from 'cheerio'
import type { DocketReportResponse, DocketEntry, PacerDocument } from '@/types/pacer'
import { getCourtConfig, validateCaseNumber } from './courtConfig'
import {
  PacerAuthenticationError,
  PacerNetworkError,
  PacerParsingError,
  PacerFeeError,
  PacerCaseNotFoundError,
  PacerTimeoutError
} from './pacerErrors'

export class PacerDocketFetcher {
  private sessionToken: string
  private userAgent: string = 'AI-Wizard/1.0 (Legal Research Tool)'

  constructor(sessionToken: string) {
    this.sessionToken = sessionToken
  }

  /**
   * Fetch docket report for any supported court
   */
  async fetchDocketReport(caseNumber: string, court: string): Promise<DocketReportResponse> {
    try {
      // Validate case number format
      if (!validateCaseNumber(caseNumber, court)) {
        throw new Error(`Invalid case number format for ${court}: ${caseNumber}`)
      }

      // Route to court-specific fetcher
      switch (court.toLowerCase()) {
        case 'nysd':
          return this.fetchNYSDDocket(caseNumber)
        default:
          throw new Error(`Court ${court} not yet supported`)
      }
    } catch (error) {
      console.error('[PACER Docket] Fetch error:', error)
      throw error
    }
  }

  /**
   * Estimate docket fees without fetching full report
   */
  async estimateDocketFee(caseNumber: string, court: string): Promise<number> {
    try {
      // For now, provide a basic estimation based on case age and type
      // This could be enhanced with a lightweight request to get page counts
      const caseYear = this.extractCaseYear(caseNumber)
      const currentYear = new Date().getFullYear()
      const caseAge = currentYear - caseYear
      
      // Estimate based on case age (older cases typically have more entries)
      const estimatedEntries = Math.max(10, caseAge * 5)
      const estimatedPages = Math.ceil(estimatedEntries / 20) // ~20 entries per page
      
      const config = getCourtConfig(court)
      return Math.max(config.feeCalculation.minimumFee, estimatedPages * config.feeCalculation.docketPageRate)
    } catch (error) {
      console.error('[PACER Docket] Fee estimation error:', error)
      throw new PacerFeeError(`Failed to estimate fees: ${error.message}`, court, caseNumber)
    }
  }

  /**
   * Fetch NYSD docket report
   */
  private async fetchNYSDDocket(caseNumber: string): Promise<DocketReportResponse> {
    const config = getCourtConfig('nysd')
    
    try {
      console.log('[NYSD] Fetching docket for case:', caseNumber)
      
      // Step 1: Navigate to NYSD case query page
      const queryUrl = `${config.baseUrl}${config.docketEndpoint}`
      const queryResponse = await this.makeRequest(queryUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      // Step 2: Submit case number search
      const searchParams = new URLSearchParams({
        'case_num': caseNumber,
        'case_type': 'all',
        'case_status': 'all'
      })

      const searchResponse = await this.makeRequest(queryUrl, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: searchParams.toString()
      })

      // Step 3: Parse the docket report HTML
      return this.parseNYSDDocket(searchResponse, caseNumber)

    } catch (error) {
      console.error('[NYSD] Docket fetch error:', error)
      
      if (error instanceof PacerError) {
        throw error
      }
      
      throw new PacerNetworkError(`Failed to fetch NYSD docket: ${error.message}`, 'nysd', caseNumber)
    }
  }

  /**
   * Parse NYSD docket report HTML
   */
  private parseNYSDDocket(html: string, caseNumber: string): DocketReportResponse {
    try {
      const $ = cheerio.load(html)
      
      // Check for error messages
      if (this.hasErrorPage($)) {
        throw new PacerCaseNotFoundError('Case not found in NYSD system', 'nysd', caseNumber)
      }
      
      // Extract case information
      const caseInfo = this.extractNYSDCaseInfo($)
      
      // Extract docket entries
      const docketEntries = this.extractNYSDDocketEntries($)
      
      // Calculate fees
      const estimatedFee = this.calculateNYSDFees($)
      
      return {
        caseInfo: {
          caseNumber,
          caseTitle: caseInfo.title,
          court: 'nysd',
          courtName: 'Southern District of New York',
          judge: caseInfo.judge,
          filingDate: caseInfo.filingDate,
          status: caseInfo.status
        },
        docketEntries,
        totalEntries: docketEntries.length,
        estimatedFee,
        generatedAt: new Date().toISOString()
      }
    } catch (error) {
      if (error instanceof PacerError) {
        throw error
      }
      throw new PacerParsingError(`Failed to parse NYSD docket: ${error.message}`, 'nysd', caseNumber)
    }
  }

  /**
   * Extract case information from NYSD HTML
   */
  private extractNYSDCaseInfo($: cheerio.CheerioAPI): any {
    const config = getCourtConfig('nysd')
    
    return {
      title: this.extractText($, config.selectors.caseInfo.title) || 'Unknown Case Title',
      judge: this.extractText($, config.selectors.caseInfo.judge) || 'Unknown Judge',
      filingDate: this.extractText($, config.selectors.caseInfo.filingDate) || new Date().toISOString().split('T')[0],
      status: this.extractText($, config.selectors.caseInfo.status) || 'Unknown Status'
    }
  }

  /**
   * Extract docket entries from NYSD HTML
   */
  private extractNYSDDocketEntries($: cheerio.CheerioAPI): DocketEntry[] {
    const config = getCourtConfig('nysd')
    const entries: DocketEntry[] = []
    
    $(config.selectors.docketEntries.container).each((index, element) => {
      const $row = $(element)
      
      const entryNumber = this.extractNumber($row, config.selectors.docketEntries.entryNumber)
      const date = this.extractText($row, config.selectors.docketEntries.date)
      const description = this.extractText($row, config.selectors.docketEntries.description)
      const filedBy = this.extractText($row, config.selectors.docketEntries.filedBy)
      
      if (entryNumber && date && description) {
        // Extract documents from the row
        const documents = this.extractNYSDDocuments($row)
        
        entries.push({
          entryNumber,
          date,
          filed: date,
          description,
          docketText: description,
          filedBy: filedBy || undefined,
          documents
        })
      }
    })
    
    return entries
  }

  /**
   * Extract documents from NYSD docket entry
   */
  private extractNYSDDocuments($row: cheerio.CheerioAPI): PacerDocument[] {
    const config = getCourtConfig('nysd')
    const documents: PacerDocument[] = []
    
    $row.find(config.selectors.documents.container).each((index, link) => {
      const $link = $(link)
      const href = $link.attr('href')
      const text = $link.text().trim()
      
      if (href && text) {
        // Extract document ID from href
        const docIdMatch = href.match(/doc1=(\d+)/)
        const docId = docIdMatch ? docIdMatch[1] : `doc-${index}`
        
        // Extract cost from text (e.g., "Document 1 (5 pages) - $0.50")
        const costMatch = text.match(/\$(\d+\.\d+)/)
        const cost = costMatch ? parseFloat(costMatch[1]) : 0
        
        // Extract page count
        const pageMatch = text.match(/\((\d+)\s+pages?\)/)
        const pages = pageMatch ? parseInt(pageMatch[1]) : 1
        
        documents.push({
          documentId: docId,
          documentNumber: (index + 1).toString(),
          description: text,
          pages,
          cost,
          availability: 'available',
          filingDate: new Date().toISOString().split('T')[0]
        })
      }
    })
    
    return documents
  }

  /**
   * Calculate NYSD fees based on pages accessed
   */
  private calculateNYSDFees($: cheerio.CheerioAPI): number {
    const config = getCourtConfig('nysd')
    let totalFee = config.feeCalculation.minimumFee
    
    // Calculate docket report pages (estimate based on entries)
    const entryCount = $('tr.docketEntry, tr[class*="docket"]').length
    const docketPages = Math.ceil(entryCount / 20) // ~20 entries per page
    totalFee += docketPages * config.feeCalculation.docketPageRate
    
    // Calculate document fees
    $('a[href*="doc1"]').each((index, link) => {
      const $link = $(link)
      const text = $link.text()
      
      // Extract page count from link text
      const pageMatch = text.match(/\((\d+)\s+pages?\)/)
      if (pageMatch) {
        const pages = parseInt(pageMatch[1])
        totalFee += pages * config.feeCalculation.documentPageRate
      }
    })
    
    return Math.round(totalFee * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Check if HTML contains error page
   */
  private hasErrorPage($: cheerio.CheerioAPI): boolean {
    // Look for common error indicators
    const errorTexts = [
      'case not found',
      'no cases found',
      'invalid case number',
      'case does not exist'
    ]
    
    const pageText = $('body').text().toLowerCase()
    return errorTexts.some(errorText => pageText.includes(errorText))
  }

  /**
   * Extract text from element using selector
   */
  private extractText($: cheerio.CheerioAPI, selector: string): string | null {
    const element = $(selector).first()
    return element.length > 0 ? element.text().trim() : null
  }

  /**
   * Extract number from element using selector
   */
  private extractNumber($: cheerio.CheerioAPI, selector: string): number | null {
    const text = this.extractText($, selector)
    if (!text) return null
    
    const number = parseInt(text.replace(/\D/g, ''))
    return isNaN(number) ? null : number
  }

  /**
   * Extract case year from case number
   */
  private extractCaseYear(caseNumber: string): number {
    const match = caseNumber.match(/:(\d{2})-/)
    if (match) {
      const year = parseInt(match[1])
      return year > 50 ? 1900 + year : 2000 + year
    }
    return new Date().getFullYear()
  }

  /**
   * Make authenticated request to court system
   */
  private async makeRequest(url: string, options: RequestInit): Promise<string> {
    const config = getCourtConfig('nysd')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Cookie': `nextGenCSO=${this.sessionToken}`,
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new PacerAuthenticationError('Session expired or invalid')
        }
        throw new PacerNetworkError(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.text()
      
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof PacerError) {
        throw error
      }
      
      if (error.name === 'AbortError') {
        throw new PacerTimeoutError('Request timed out - court system may be slow')
      }
      
      throw new PacerNetworkError(`Request failed: ${error.message}`)
    }
  }

  /**
   * Get standard headers for requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Cookie': `nextGenCSO=${this.sessionToken}`,
      'User-Agent': this.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  }
}
