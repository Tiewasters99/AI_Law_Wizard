import { Session } from "next-auth";
import { Admin, AdminAction } from "@/types/admin";

export function isAdmin(session: Session | null): boolean {
  return !!(session?.isAdmin && session?.adminId);
}

export function requireAdmin(session: Session | null): void {
  if (!isAdmin(session)) {
    throw new Error("Admin privileges required");
  }
}

export function canPerformAction(admin: Admin, action: AdminAction): boolean {
  // Super admins can perform all actions
  if (admin.isSuperAdmin) {
    return true;
  }

  // Regular admins have restrictions
  const restrictedActions: AdminAction[] = [
    "USER_DELETED",
    "PACKAGE_DELETED",
    "ROLE_PRICING_CREATED",
    "ROLE_PRICING_UPDATED",
  ];

  return !restrictedActions.includes(action);
}

export function getAdminPermissions(admin: Admin) {
  return {
    canManageUsers: true,
    canManageFeatures: true,
    canManagePricing: admin.isSuperAdmin,
    canViewLogs: true,
    canDeleteUsers: admin.isSuperAdmin,
    canDeletePackages: admin.isSuperAdmin,
    canAdjustTokens: true,
    canResetPasswords: true,
  };
}
