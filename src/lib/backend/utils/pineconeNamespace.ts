// Utility functions for generating and managing Pinecone namespaces

/**
 * Sanitize email to create a safe identifier
 * Converts email to lowercase and replaces special characters
 */
function sanitizeEmail(email: string): string {
  if (!email) return "";

  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "-") // Replace special chars with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a user-specific namespace for Pinecone
 * Format: user-{userId}-{emailIdentifier}
 *
 * @param userId - User ID from database
 * @param email - User email (can be null)
 * @returns Namespace string for Pinecone
 */
export function generateUserNamespace(
  userId: string,
  email: string | null
): string {
  if (!userId) {
    throw new Error("UserId is required to generate namespace");
  }

  // Sanitize email if provided
  let emailIdentifier = "noemail";
  if (email) {
    emailIdentifier = sanitizeEmail(email);
    // If sanitization results in empty string, use fallback
    if (!emailIdentifier) {
      emailIdentifier = "noemail";
    }
  }

  // Combine userId and email identifier
  // Format: user-{userId}-{emailIdentifier}
  const namespace = `user-${userId}-${emailIdentifier}`;

  // Validate namespace length (Pinecone has limits)
  // Pinecone namespace max length is typically 255 characters
  if (namespace.length > 255) {
    // Truncate email identifier if needed
    const maxEmailLength = 255 - userId.length - 6; // 6 for "user--"
    const truncatedEmail = emailIdentifier.substring(0, maxEmailLength);
    return `user-${userId}-${truncatedEmail}`;
  }

  return namespace;
}

/**
 * Validate namespace format
 *
 * @param namespace - Namespace string to validate
 * @returns true if valid, false otherwise
 */
export function validateNamespace(namespace: string): boolean {
  if (!namespace || typeof namespace !== "string") {
    return false;
  }

  // Check format: should start with "user-"
  if (!namespace.startsWith("user-")) {
    return false;
  }

  // Check length (Pinecone limit)
  if (namespace.length > 255) {
    return false;
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  const validPattern = /^[a-z0-9_-]+$/i;
  if (!validPattern.test(namespace)) {
    return false;
  }

  return true;
}

/**
 * Extract userId from namespace
 *
 * @param namespace - Namespace string
 * @returns userId if found, null otherwise
 */
export function extractUserIdFromNamespace(namespace: string): string | null {
  if (!validateNamespace(namespace)) {
    return null;
  }

  // Format: user-{userId}-{emailIdentifier}
  const parts = namespace.split("-");
  if (parts.length >= 3 && parts[0] === "user") {
    return parts[1];
  }

  return null;
}
