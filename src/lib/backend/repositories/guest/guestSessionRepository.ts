// In-memory session storage for guest legal research conversations

interface Message {
  role: "user" | "assistant";
  content: string;
}

type SessionMessages = Message[];

// In-memory storage: Map<sessionId, messages>
const sessionStorage = new Map<string, SessionMessages>();

// Maximum messages to keep per session (keep last 10 messages for performance)
const MAX_MESSAGES_PER_SESSION = 10;

/**
 * Get conversation history for a session
 */
export function getHistory(sessionId: string): Message[] {
  return sessionStorage.get(sessionId) || [];
}

/**
 * Save a message to session history
 */
export function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): void {
  if (!sessionId) {
    return;
  }

  const messages = sessionStorage.get(sessionId) || [];
  messages.push({ role, content });

  // Keep only the last N messages for performance
  if (messages.length > MAX_MESSAGES_PER_SESSION) {
    const keepMessages = messages.slice(-MAX_MESSAGES_PER_SESSION);
    sessionStorage.set(sessionId, keepMessages);
  } else {
    sessionStorage.set(sessionId, messages);
  }
}

/**
 * Clear a session
 */
export function clearSession(sessionId: string): void {
  sessionStorage.delete(sessionId);
}

/**
 * Generate a new session ID
 */
export function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if session exists
 */
export function sessionExists(sessionId: string): boolean {
  return sessionStorage.has(sessionId);
}
