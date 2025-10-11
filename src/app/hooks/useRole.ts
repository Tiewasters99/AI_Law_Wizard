import { useAuthStore, UserRole, getRoleDisplayName } from '@/app/stores/authStore';

/**
 * Enhanced role management hook
 * Provides convenient access to role-specific functionality and access control
 */
export function useRole() {
  const { user, isAttorney, isCustomer } = useAuthStore();
  
  const role = user?.role;
  
  /**
   * Check if user has access based on allowed roles
   * @param requiredRoles - Array of roles that have access
   * @returns boolean indicating if user has access
   */
  const hasAccess = (requiredRoles: UserRole[]): boolean => {
    if (!role) return false;
    return requiredRoles.includes(role);
  };

  /**
   * Check if user has a specific role
   * @param targetRole - Role to check
   * @returns boolean indicating if user has the role
   */
  const isRole = (targetRole: UserRole): boolean => {
    return role === targetRole;
  };

  return {
    // Current role
    role,
    
    // Role checks
    isAttorney,
    isClient: isCustomer,
    isCustomer,
    
    // Display helpers
    displayName: getRoleDisplayName(role),
    
    // Access control
    hasAccess,
    isRole,
    
    // Provider-specific helpers for future OAuth providers
    canManageClients: isAttorney,
    canRequestServices: isCustomer,
    canAccessAttorneyFeatures: isAttorney,
    canAccessClientFeatures: isCustomer,
  };
}

