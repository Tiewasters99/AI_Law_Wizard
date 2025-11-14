// Service for admin features listing

import { findAllFeatures } from "../../../repositories/admin/featureRepository";

/**
 * List features with optional role filtering
 */
export async function listFeatures(role?: "ATTORNEY" | "CUSTOMER" | null) {
  const features = await findAllFeatures();

  // Filter by role if specified
  if (role) {
    return features.filter(feature =>
      feature.roleSpecific.some(fr => fr.role === role)
    );
  }

  return features;
}

