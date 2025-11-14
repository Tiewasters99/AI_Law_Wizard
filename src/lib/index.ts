/**
 * AI Law Wizard Library
 *
 * Organized by:
 * - backend: Server-side utilities (API routes, database, auth, services)
 * - frontend: Client-side utilities (UI components, state management, utils)
 *
 * This structure ensures clear separation between server-side and client-side code,
 * making it easier to maintain and preventing accidental server-side code from being
 * bundled in client-side builds.
 */

// Backend exports - Server-side utilities
export * from "./backend";

// Frontend exports - Client-side utilities
export * from "./frontend";
