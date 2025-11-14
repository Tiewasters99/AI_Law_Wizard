// Service for admin role pricing update and deletion

import {
  findRolePricingById,
  updateRolePricing as updateRolePricingRepo,
  deleteRolePricing as deleteRolePricingRepo,
} from "../../../repositories/admin/rolePricingRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";
import { createAdminActivityLog } from "../../../repositories/admin/adminActivityRepository";
import { AdminAction } from "@/types/admin";

/**
 * Update role pricing
 */
export async function updateRolePricing(
  id: string,
  priceInCents: number,
  adminId: string
) {
  if (priceInCents <= 0) {
    throw new ValidationError("Price must be a positive number");
  }

  const rolePricing = await findRolePricingById(id);
  if (!rolePricing) {
    throw new NotFoundError("Role pricing");
  }

  const updated = await updateRolePricingRepo(id, priceInCents);

  // Log the action
  await createAdminActivityLog({
    adminId,
    action: "ROLE_PRICING_UPDATED" as AdminAction,
    targetType: "RolePricing",
    targetId: id,
    details: {
      packageId: rolePricing.packageId,
      role: rolePricing.role,
      priceInCents,
    },
  });

  return updated;
}

/**
 * Delete role pricing
 */
export async function deleteRolePricing(id: string, adminId: string) {
  const rolePricing = await findRolePricingById(id);
  if (!rolePricing) {
    throw new NotFoundError("Role pricing");
  }

  await deleteRolePricingRepo(id);

  // Log the action
  await createAdminActivityLog({
    adminId,
    action: "ROLE_PRICING_UPDATED" as AdminAction,
    targetType: "RolePricing",
    targetId: id,
    details: {
      packageId: rolePricing.packageId,
      role: rolePricing.role,
      action: "deleted",
    },
  });
}

