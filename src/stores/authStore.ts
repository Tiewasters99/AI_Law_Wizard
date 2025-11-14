import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { TokenTracker } from "../lib/frontend/tokenTracker";

export type UserRole = "ATTORNEY" | "CUSTOMER" | "ADMIN";

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole | null | undefined): string {
  if (!role) return "User";
  if (role === "ATTORNEY") return "Attorney";
  if (role === "ADMIN") return "Admin";
  return "Client";
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
  profileComplete: boolean;
}

export interface AuthState {
  // State
  user: User | null;
  isAttorney: boolean;
  isCustomer: boolean;
  isClient: boolean; // Alias for isCustomer
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileComplete: boolean;

  // Actions
  setAuthUser: (user: User | null) => void;
  clearAuthUser: () => void;

  // Auth Actions
  signInWithCredentials: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Role Management
  updateUserRole: (
    role: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  completeProfile: (
    profileData: any
  ) => Promise<{ success: boolean; error?: string }>;

  // Navigation
  redirectAfterRoleSelection: (role: UserRole) => void;

  // Role Helpers
  getRoleDisplayName: () => string;
  hasRole: (role: UserRole) => boolean;
  checkRoleAccess: (allowedRoles: UserRole[]) => boolean;

  // Token Tracking
  getTokenUsage: () => number;
  hasTokensRemaining: () => boolean;
  trackTokenUsage: (count: number) => void;
  getTokenLimit: () => number;
  getTokenSummary: () => {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    isExceeded: boolean;
  };

  // Utility Actions
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAttorney: false,
      isCustomer: false,
      isClient: false,
      isAdmin: false,
      isAuthenticated: false,
      isLoading: true,
      profileComplete: false,

      // Basic setters
      setAuthUser: user => {
        set({
          user,
          isAttorney: user?.role === "ATTORNEY",
          isCustomer: user?.role === "CUSTOMER",
          isClient: user?.role === "CUSTOMER",
          isAdmin: user?.role === "ADMIN",
          isAuthenticated: !!user,
          profileComplete: user?.profileComplete || false,
          isLoading: false,
        });
      },
      clearAuthUser: () =>
        set({
          user: null,
          isAttorney: false,
          isCustomer: false,
          isClient: false,
          isAdmin: false,
          isAuthenticated: false,
          profileComplete: false,
          isLoading: false,
        }),

      // Authentication actions
      signInWithCredentials: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            set({ isLoading: false });
            return { success: false, error: result.error };
          }

          if (result?.ok) {
            await get().checkAuthStatus();
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: "Sign in failed" };
        } catch (error) {
          console.error("Credentials sign-in error:", error);
          set({ isLoading: false });
          return { success: false, error: "An unexpected error occurred" };
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await signOut({ redirect: false });
          get().clearAuthUser();
        } catch (error) {
          console.error("Sign out error:", error);
          set({ isLoading: false });
        }
      },

      // Role management
      updateUserRole: async role => {
        try {
          const response = await fetch("/api/auth/update-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
          });

          if (!response.ok) {
            const error = await response.text();
            return { success: false, error };
          }

          // Update local state immediately
          set(state => ({
            user: state.user
              ? { ...state.user, role, profileComplete: true }
              : null,
            profileComplete: true,
            isAttorney: role === "ATTORNEY",
            isCustomer: role === "CUSTOMER",
            isClient: role === "CUSTOMER",
            isAdmin: role === "ADMIN",
          }));

          return { success: true };
        } catch (error) {
          console.error("Role update error:", error);
          return { success: false, error: "Failed to update role" };
        }
      },

      // Navigation
      redirectAfterRoleSelection: role => {
        window.location.href = "/";
      },

      // Role Helpers
      getRoleDisplayName: () => {
        const state = get();
        return getRoleDisplayName(state.user?.role);
      },

      hasRole: role => {
        const state = get();
        return state.user?.role === role;
      },

      checkRoleAccess: allowedRoles => {
        const state = get();
        if (!state.user?.role) return false;
        return allowedRoles.includes(state.user.role);
      },

      // Token Tracking Methods
      getTokenUsage: () => {
        const state = get();
        return TokenTracker.getTokenUsage(state.user?.id);
      },

      hasTokensRemaining: () => {
        const state = get();
        return !TokenTracker.hasExceededLimit(state.user?.id);
      },

      trackTokenUsage: count => {
        const state = get();
        TokenTracker.addTokenUsage(count, state.user?.id);
      },

      getTokenLimit: () => {
        const state = get();
        return TokenTracker.getLimit(state.user?.id);
      },

      getTokenSummary: () => {
        const state = get();
        return TokenTracker.getUsageSummary(state.user?.id);
      },

      completeProfile: async profileData => {
        try {
          const response = await fetch("/api/auth/complete-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
          });

          if (!response.ok) {
            const error = await response.text();
            return { success: false, error };
          }

          // Update local state
          set(state => ({
            profileComplete: true,
            user: state.user ? { ...state.user, profileComplete: true } : null,
          }));

          return { success: true };
        } catch (error) {
          console.error("Profile completion error:", error);
          return { success: false, error: "Failed to complete profile" };
        }
      },

      // Utility actions
      checkAuthStatus: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch("/api/auth/session");
          if (response.ok) {
            const session = await response.json();
            if (session.user) {
              get().setAuthUser({
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                role: session.user.role,
                profileComplete: session.user.profileComplete,
              });
            } else {
              get().clearAuthUser();
            }
          }
        } catch (error) {
          console.error("Auth status check error:", error);
          get().clearAuthUser();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: state => ({
        user: state.user,
        isAttorney: state.isAttorney,
        isCustomer: state.isCustomer,
        isClient: state.isClient,
        isAdmin: state.isAdmin,
        isAuthenticated: state.isAuthenticated,
        profileComplete: state.profileComplete,
      }),
    }
  )
);

// Hook for easier access to auth state
export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const {
    user,
    isAttorney,
    isCustomer,
    isClient,
    isAdmin,
    isAuthenticated,
    profileComplete,
    isLoading,
    setAuthUser,
    clearAuthUser,
    checkAuthStatus,
    signInWithCredentials,
    signOut,
    updateUserRole,
    completeProfile,
    redirectAfterRoleSelection,
    getRoleDisplayName,
    hasRole,
    checkRoleAccess,
    getTokenUsage,
    hasTokensRemaining,
    trackTokenUsage,
    getTokenLimit,
    getTokenSummary,
  } = useAuthStore();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setAuthUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
        profileComplete: session.user.profileComplete,
      });
    } else if (status === "unauthenticated") {
      clearAuthUser();
    }
  }, [session, status, setAuthUser, clearAuthUser]);

  return {
    user,
    isAttorney,
    isCustomer,
    isClient,
    isAdmin,
    isAuthenticated,
    profileComplete,
    isLoading,
    status,
    checkAuthStatus,
    signInWithCredentials,
    signOut,
    updateUserRole,
    completeProfile,
    redirectAfterRoleSelection,
    getRoleDisplayName,
    hasRole,
    checkRoleAccess,
    getTokenUsage,
    hasTokensRemaining,
    trackTokenUsage,
    getTokenLimit,
    getTokenSummary,
    update,
  };
};
