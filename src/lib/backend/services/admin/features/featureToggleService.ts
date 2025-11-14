// Service for admin feature toggling

import {
  updateFeatureEnabled,
  upsertFeatureRole,
  findFeatureById,
} from "../../../repositories/admin/featureRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";
import { createAdminActivityLog } from "../../../repositories/admin/adminActivityRepository";
import { AdminAction } from "@/types/admin";

/**
 * Toggle feature globally and/or role-specifically
 */
export async function toggleFeature(
  featureId: string,
  isEnabled: boolean,
  role: "ATTORNEY" | "CUSTOMER" | undefined,
  adminId: string
) {
  // Verify feature exists
  const feature = await findFeatureById(featureId);
  if (!feature) {
    throw new NotFoundError("Feature");
  }

  // Update global feature state
  const updatedFeature = await updateFeatureEnabled(featureId, isEnabled);

  // If role is specified, update role-specific state
  if (role) {
    if (!["ATTORNEY", "CUSTOMER"].includes(role)) {
      throw new ValidationError("Invalid role");
    }
    await upsertFeatureRole(featureId, role, isEnabled);
  }

  // Log the action
  await createAdminActivityLog({
    adminId,
    action: "FEATURE_TOGGLED" as AdminAction,
    targetType: "Feature",
    targetId: featureId,
    details: {
      featureName: updatedFeature.name,
      isEnabled,
      role: role || "global",
    },
  });

  return updatedFeature;
}
