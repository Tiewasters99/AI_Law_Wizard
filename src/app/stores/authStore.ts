import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export type UserRole = 'LAWYER' | 'CUSTOMER';

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
  isLawyer: boolean;
  isCustomer: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileComplete: boolean;
  
  // Actions
  setAuthUser: (user: User | null) => void;
  clearAuthUser: () => void;
  
  // Auth Actions
  signInWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  // Role Management
  updateUserRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  completeProfile: (profileData: any) => Promise<{ success: boolean; error?: string }>;
  
  // Utility Actions
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLawyer: false,
      isCustomer: false,
      isAuthenticated: false,
      isLoading: true, // Initial loading state
      profileComplete: false,

      // Basic setters
      setAuthUser: (user) => set({ 
        user, 
        isLawyer: user?.role === 'LAWYER', 
        isCustomer: user?.role === 'CUSTOMER',
        isAuthenticated: !!user,
        profileComplete: user?.profileComplete || false,
        isLoading: false,
      }),
      clearAuthUser: () => set({ 
        user: null, 
        isLawyer: false, 
        isCustomer: false, 
        isAuthenticated: false, 
        profileComplete: false,
        isLoading: false,
      }),

      // Authentication actions

      signInWithCredentials: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = await signIn('credentials', {
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
          return { success: false, error: 'Sign in failed' };
        } catch (error) {
          console.error('Credentials sign-in error:', error);
          set({ isLoading: false });
          return { success: false, error: 'An unexpected error occurred' };
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await signOut({ redirect: false });
          get().clearAuthUser();
        } catch (error) {
          console.error('Sign out error:', error);
          set({ isLoading: false });
        }
      },

      // Role management
      updateUserRole: async (role) => {
        try {
          const response = await fetch('/api/auth/update-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
          });

          if (!response.ok) {
            const error = await response.text();
            return { success: false, error };
          }

          // Update local state immediately - this is our source of truth
          set((state) => ({
            user: state.user ? { ...state.user, role, profileComplete: true } : null,
            profileComplete: true,
            isLawyer: role === 'LAWYER',
            isCustomer: role === 'CUSTOMER',
          }));
          
          return { success: true };
        } catch (error) {
          console.error('Role update error:', error);
          return { success: false, error: 'Failed to update role' };
        }
      },

      completeProfile: async (profileData) => {
        try {
          const response = await fetch('/api/auth/complete-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
          });

          if (!response.ok) {
            const error = await response.text();
            return { success: false, error };
          }

          // Update local state
          set((state) => ({
            profileComplete: true,
            user: state.user ? { ...state.user, profileComplete: true } : null,
          }));

          return { success: true };
        } catch (error) {
          console.error('Profile completion error:', error);
          return { success: false, error: 'Failed to complete profile' };
        }
      },

      // Utility actions
      checkAuthStatus: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/session');
          if (response.ok) {
            const session = await response.json();
            if (session.user) {
              get().setAuthUser({
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                role: session.user.role as UserRole,
                profileComplete: session.user.profileComplete,
              });
            } else {
              get().clearAuthUser();
            }
          }
        } catch (error) {
          console.error('Auth status check error:', error);
          get().clearAuthUser();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isLawyer: state.isLawyer,
        isCustomer: state.isCustomer,
        isAuthenticated: state.isAuthenticated,
        profileComplete: state.profileComplete,
      }),
    }
  )
);

// Hook for easier access to auth state
// Custom hook to sync NextAuth session with Zustand store
export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const { 
    user, 
    isLawyer, 
    isCustomer, 
    isAuthenticated, 
    profileComplete, 
    isLoading, 
    setAuthUser, 
    clearAuthUser, 
    checkAuthStatus, 
    signInWithCredentials, 
    signOut, 
    updateUserRole, 
    completeProfile 
  } = useAuthStore();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setAuthUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role as 'LAWYER' | 'CUSTOMER',
        profileComplete: session.user.profileComplete,
      });
    } else if (status === 'unauthenticated') {
      clearAuthUser();
    }
  }, [session, status, setAuthUser, clearAuthUser]);

  return { 
    user, 
    isLawyer, 
    isCustomer, 
    isAuthenticated, 
    profileComplete, 
    isLoading, 
    status, 
    checkAuthStatus, 
    signInWithCredentials, 
    signOut, 
    updateUserRole, 
    completeProfile, 
    update 
  };
};
