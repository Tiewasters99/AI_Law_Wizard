/**
 * PACER Error Handling Utilities
 * 
 * Custom error classes for PACER integration with user-friendly messages
 * and proper error categorization for debugging and user feedback.
 */

/**
 * Base PACER Error Class
 */
export class PacerError extends Error {
  public readonly code: string
  public readonly court?: string
  public readonly caseNumber?: string
  public readonly sessionToken?: string

  constructor(
    message: string,
    code: string,
    court?: string,
    caseNumber?: string,
    sessionToken?: string
  ) {
    super(message)
    this.name = 'PacerError'
    this.code = code
    this.court = court
    this.caseNumber = caseNumber
    this.sessionToken = sessionToken
  }
}

/**
 * PACER Authentication Error
 * Invalid or expired session token
 */
export class PacerAuthenticationError extends PacerError {
  constructor(message: string = 'PACER session expired or invalid', sessionToken?: string) {
    super(message, 'PACER_AUTH_ERROR', undefined, undefined, sessionToken)
    this.name = 'PacerAuthenticationError'
  }
}

/**
 * PACER Network Error
 * Court system unavailable or network issues
 */
export class PacerNetworkError extends PacerError {
  constructor(
    message: string = 'Court system unavailable',
    court?: string,
    caseNumber?: string
  ) {
    super(message, 'PACER_NETWORK_ERROR', court, caseNumber)
    this.name = 'PacerNetworkError'
  }
}

/**
 * PACER Parsing Error
 * Failed to parse HTML response from court system
 */
export class PacerParsingError extends PacerError {
  constructor(
    message: string = 'Failed to parse court response',
    court?: string,
    caseNumber?: string
  ) {
    super(message, 'PACER_PARSING_ERROR', court, caseNumber)
    this.name = 'PacerParsingError'
  }
}

/**
 * PACER Fee Error
 * Issues with fee calculation or billing
 */
export class PacerFeeError extends PacerError {
  constructor(
    message: string = 'Fee calculation error',
    court?: string,
    caseNumber?: string
  ) {
    super(message, 'PACER_FEE_ERROR', court, caseNumber)
    this.name = 'PacerFeeError'
  }
}

/**
 * PACER Case Not Found Error
 * Case number doesn't exist in the court system
 */
export class PacerCaseNotFoundError extends PacerError {
  constructor(
    message: string = 'Case not found',
    court?: string,
    caseNumber?: string
  ) {
    super(message, 'PACER_CASE_NOT_FOUND', court, caseNumber)
    this.name = 'PacerCaseNotFoundError'
  }
}

/**
 * PACER Rate Limit Error
 * Too many requests to court system
 */
export class PacerRateLimitError extends PacerError {
  constructor(
    message: string = 'Too many requests to court system',
    court?: string
  ) {
    super(message, 'PACER_RATE_LIMIT', court)
    this.name = 'PacerRateLimitError'
  }
}

/**
 * PACER Timeout Error
 * Request timed out waiting for court system response
 */
export class PacerTimeoutError extends PacerError {
  constructor(
    message: string = 'Request timed out',
    court?: string,
    caseNumber?: string
  ) {
    super(message, 'PACER_TIMEOUT', court, caseNumber)
    this.name = 'PacerTimeoutError'
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof PacerAuthenticationError) {
    return 'Your PACER session has expired. Please log in again to continue.'
  }
  
  if (error instanceof PacerNetworkError) {
    return 'The court system is temporarily unavailable. Please try again in a few minutes.'
  }
  
  if (error instanceof PacerParsingError) {
    return 'Unable to process the court response. The court system may have changed its format.'
  }
  
  if (error instanceof PacerFeeError) {
    return 'Unable to calculate fees for this case. Please contact support if this continues.'
  }
  
  if (error instanceof PacerCaseNotFoundError) {
    return 'Case not found. Please verify the case number and court are correct.'
  }
  
  if (error instanceof PacerRateLimitError) {
    return 'Too many requests. Please wait a moment before trying again.'
  }
  
  if (error instanceof PacerTimeoutError) {
    return 'Request timed out. The court system may be slow. Please try again.'
  }
  
  if (error instanceof PacerError) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again or contact support.'
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof PacerNetworkError) return true
  if (error instanceof PacerTimeoutError) return true
  if (error instanceof PacerRateLimitError) return true
  
  return false
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(error: Error, attempt: number): number {
  if (error instanceof PacerRateLimitError) {
    // Exponential backoff for rate limits
    return Math.min(1000 * Math.pow(2, attempt), 30000) // Max 30 seconds
  }
  
  if (error instanceof PacerTimeoutError) {
    // Linear backoff for timeouts
    return Math.min(2000 * attempt, 10000) // Max 10 seconds
  }
  
  if (error instanceof PacerNetworkError) {
    // Short delay for network issues
    return Math.min(1000 * attempt, 5000) // Max 5 seconds
  }
  
  return 1000 // Default 1 second
}
