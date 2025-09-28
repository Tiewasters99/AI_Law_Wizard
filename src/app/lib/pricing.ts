// Apprentice tier is completely free - no pricing tiers needed
// Wizard and Grand Wizard have separate token-based pricing on their own pages

// Apprentice tier is completely free - no usage tracking needed
export const APPRENTICE_FREE = true

// Apprentice tier is completely free - no subscription checks needed
export function canUserChat(): boolean {
  // Apprentice users can always chat (completely free)
  return true
}
