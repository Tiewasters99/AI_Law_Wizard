import { consumeTokens } from './stripe'

/**
 * Consume tokens for a specific feature
 * @param feature - The feature being used
 * @param tokens - Number of tokens to consume
 * @param description - Description of the usage
 */
export async function consumeTokensForFeature(
  feature: 'wizard' | 'grand-wizard' | 'document-analysis',
  tokens: number,
  description?: string
) {
  try {
    const result = await consumeTokens(tokens, description || `${feature} usage`)
    return { success: true, result }
  } catch (error) {
    console.error(`Failed to consume tokens for ${feature}:`, error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Token costs for different operations
 */
export const TOKEN_COSTS = {
  WIZARD_CHAT: 1,           // 1 token per wizard chat message
  GRAND_WIZARD_CHAT: 2,     // 2 tokens per grand wizard chat message
  DOCUMENT_ANALYSIS: 3,     // 3 tokens per document analysis
  FILE_PROCESSING: 2,       // 2 tokens per file processing operation
} as const

/**
 * Check if user has enough tokens for an operation
 * @param currentTokens - User's current token balance
 * @param operation - The operation they want to perform
 */
export function hasEnoughTokensForOperation(
  currentTokens: number,
  operation: keyof typeof TOKEN_COSTS
): boolean {
  return currentTokens >= TOKEN_COSTS[operation]
}

/**
 * Get remaining tokens after an operation
 * @param currentTokens - User's current token balance
 * @param operation - The operation they want to perform
 */
export function getRemainingTokensAfterOperation(
  currentTokens: number,
  operation: keyof typeof TOKEN_COSTS
): number {
  return Math.max(0, currentTokens - TOKEN_COSTS[operation])
}
