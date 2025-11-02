// Service for checking feature status (public)

import { findFeatureByName } from "../../../repositories/admin/featureRepository";

/**
 * Check if feature is enabled for a role
 */
export async function checkFeatureStatus(
  featureName: string,
  role: "ATTORNEY" | "CUSTOMER"
) {
  if (!["ATTORNEY", "CUSTOMER"].includes(role)) {
    return { enabled: false };
  }

  const feature = await findFeatureByName(featureName);

  if (!feature) {
    return { enabled: false };
  }

  // Check global enabled state
  if (!feature.isGlobal || !feature.isEnabled) {
    return { enabled: false };
  }

  // Check role-specific enabled state
  const roleSpecific = feature.roleSpecific.find(fr => fr.role === role);
  const enabled = roleSpecific ? roleSpecific.isEnabled : true;

  return { enabled };
}

