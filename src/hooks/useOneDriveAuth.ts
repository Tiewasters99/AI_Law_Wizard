"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useOneDriveAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    if (typeof window === "undefined") return false;

    try {
      const accessToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("microsoft_access_token="))
        ?.split("=")[1];

      const tokenExpiry = document.cookie
        .split("; ")
        .find(row => row.startsWith("microsoft_token_expiry="))
        ?.split("=")[1];

      if (accessToken && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const isExpired = Date.now() >= expiryTime;
        return !isExpired;
      }
      return false;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return false;
    }
  }, []);

  // Sign in to OneDrive
  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/attorney/onedrive/auth-url");
      const data = await response.json();

      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || "Failed to get auth URL");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
      setIsLoading(false);
    }
  }, []);

  // Sign out from OneDrive
  const signOut = useCallback(async () => {
    try {
      // Clear cookies
      document.cookie =
        "microsoft_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "microsoft_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "microsoft_token_expiry=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      setIsAuthenticated(false);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const isAuth = checkAuthStatus();
    setIsAuthenticated(isAuth);
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    checkAuthStatus,
  };
}
