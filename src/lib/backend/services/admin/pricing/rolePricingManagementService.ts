// Service for admin role pricing update and deletion

import {
  findRolePricingById,
  findRolePricingByPackageAndRole,
  createRolePricing as createRolePricingRepo,
  updateRolePricing as updateRolePricingRepo,
  deleteRolePricing as deleteRolePricingRepo,
} from "../../../repositories/admin/rolePricingRepository";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../../utils/errors";
import { createAdminActivityLog } from "../../../repositories/admin/adminActivityRepository";
import { AdminAction } from "@/types/admin";
import { findPackageById } from "../../../repositories/pricing/tokenPackageRepository";

/**
 * Create role pricing
 */
export async function createRolePricing(
  packageId: string,
  role: "ATTORNEY" | "CUSTOMER",
  priceInCents: number,
  adminId: string,
  isActive: boolean = true
) {
  if (priceInCents <= 0) {
    throw new ValidationError("Price must be a positive number");
  }

  // Verify package exists
  const packageData = await findPackageById(packageId);
  if (!packageData) {
    throw new NotFoundError("Package");
  }

  // Check if role pricing already exists for this package and role
  const existing = await findRolePricingByPackageAndRole(packageId, role);
  if (existing) {
    throw new ConflictError(
      `Role pricing for ${role} already exists for this package`
    );
  }

  const created = await createRolePricingRepo(
    packageId,
    role,
    priceInCents,
    isActive
  );

  // Log the action
  await createAdminActivityLog({
    adminId,
    action: "ROLE_PRICING_CREATED" as AdminAction,
    targetType: "RolePricing",
    targetId: created.id,
    details: {
      packageId,
      role,
      priceInCents,
    },
  });

  return created;
}

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
