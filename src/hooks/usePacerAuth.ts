import { useState, useCallback, useEffect } from "react";
import type {
  PacerCredentials,
  PacerAuthResponse,
  PacerSession,
} from "@/types/pacer";

interface UsePacerAuthReturn {
  isAuthenticated: boolean;
  sessionToken: string | null;
  userInfo: PacerAuthResponse["userInfo"] | null;
  expiresAt: Date | null;
  loading: boolean;
  error: string | null;
  login: (credentials: PacerCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => boolean;
}

/**
 * Custom hook for managing PACER authentication
 */
export function usePacerAuth(): UsePacerAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<
    PacerAuthResponse["userInfo"] | null
  >(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log state changes
  useEffect(() => {
    console.log("[usePacerAuth] State changed:", {
      isAuthenticated,
      hasSessionToken: !!sessionToken,
      sessionTokenPreview: sessionToken?.substring(0, 20) + "...",
      hasUserInfo: !!userInfo,
      username: userInfo?.username,
      expiresAt: expiresAt?.toISOString(),
    });
  }, [isAuthenticated, sessionToken, userInfo, expiresAt]);

  /**
   * Login to PACER
   */
  const login = useCallback(
    async (credentials: PacerCredentials): Promise<boolean> => {
      console.log("[usePacerAuth] Login attempt with credentials:", {
        username: credentials.username,
      });

      setLoading(true);
      setError(null);

      try {
        console.log("[usePacerAuth] Calling /api/attorney/pacer/auth...");

        const response = await fetch("/api/attorney/pacer/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        console.log(
          "[usePacerAuth] Auth API response status:",
          response.status
        );

        const data = await response.json();
        console.log("[usePacerAuth] Auth API response data:", data);

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Authentication failed");
        }

        // Validate response has required fields
        if (!data.sessionToken) {
          console.error("[usePacerAuth] ERROR: No sessionToken in response!");
          throw new Error(
            "Invalid authentication response - missing session token"
          );
        }

        console.log("[usePacerAuth] ✅ Setting authentication state...");
        console.log(
          "[usePacerAuth] Session token:",
          data.sessionToken?.substring(0, 20) + "..."
        );

        // Set authentication state
        setSessionToken(data.sessionToken);
        setUserInfo(data.userInfo);
        setExpiresAt(new Date(data.expiresAt));
        setIsAuthenticated(true);
        setError(null);

        console.log("[usePacerAuth] ✅ Authentication successful!");
        console.log(
          "[usePacerAuth] State updated - isAuthenticated: true, sessionToken set"
        );

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Authentication failed";
        console.error("[usePacerAuth] ❌ Authentication failed:", errorMessage);
        setError(errorMessage);
        setIsAuthenticated(false);
        setSessionToken(null);
        setUserInfo(null);
        setExpiresAt(null);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Logout from PACER
   */
  const logout = useCallback(async (): Promise<void> => {
    if (sessionToken) {
      try {
        await fetch("/api/attorney/pacer/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionToken }),
        });
      } catch (err) {
        console.error("Logout error:", err);
      }
    }

    // Clear state
    setIsAuthenticated(false);
    setSessionToken(null);
    setUserInfo(null);
    setExpiresAt(null);
    setError(null);
  }, [sessionToken]);

  /**
   * Check if session is still valid
   */
  const checkSession = useCallback((): boolean => {
    if (!isAuthenticated || !expiresAt) {
      return false;
    }

    const now = new Date();
    if (now >= expiresAt) {
      // Session expired
      setIsAuthenticated(false);
      setSessionToken(null);
      setUserInfo(null);
      setExpiresAt(null);
      setError("Session expired. Please login again.");
      return false;
    }

    return true;
  }, [isAuthenticated, expiresAt]);

  return {
    isAuthenticated,
    sessionToken,
    userInfo,
    expiresAt,
    loading,
    error,
    login,
    logout,
    checkSession,
  };
}
