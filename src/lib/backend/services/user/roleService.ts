// Service for role switching and profile creation

import {
  getUserRoleProfile,
  updateUserRole,
  createAttorneyProfile,
  createClientProfile,
  findUserWithProfiles,
  AttorneyProfileData,
  ClientProfileData,
} from "../../repositories/user/roleRepository";
import { findUserById } from "../../repositories/common/userRepository";
import { prisma } from "../../prisma";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors";

export interface RoleSwitchEligibility {
  canSwitch: boolean;
  hasProfile: boolean;
  requiresProfile: boolean;
}

/**
 * Check if user can switch to target role and what's needed
 */
export async function checkRoleSwitchEligibility(
  userId: string,
  targetRole: "CUSTOMER" | "ATTORNEY"
): Promise<RoleSwitchEligibility> {
  // Verify user exists
  const user = await findUserById(userId);
  if (!user) {
    throw new NotFoundError("User");
  }

  // Check if user already has this role
  const userWithProfiles = await findUserWithProfiles(userId);
  if (!userWithProfiles) {
    throw new NotFoundError("User");
  }

  if (userWithProfiles.role === targetRole) {
    throw new ConflictError("User already has this role");
  }

  // Check if profile exists for target role
  const profile = await getUserRoleProfile(userId, targetRole);

  return {
    canSwitch: true,
    hasProfile: !!profile,
    requiresProfile: !profile,
  };
}

/**
 * Switch user role with optional profile creation
 */
export async function switchUserRole(
  userId: string,
  newRole: "CUSTOMER" | "ATTORNEY",
  profileData?: AttorneyProfileData | ClientProfileData
) {
  // Verify user exists and get role
  const user = await findUserWithProfiles(userId);
  if (!user) {
    throw new NotFoundError("User");
  }

  // Check if user already has this role
  if (user.role === newRole) {
    throw new ConflictError("User already has this role");
  }

  // Check if user already has profile for target role
  const existingProfile = await getUserRoleProfile(userId, newRole);

  if (!existingProfile && !profileData) {
    throw new ValidationError("Profile data required for role switch");
  }

  // Create profile if doesn't exist
  if (!existingProfile && profileData) {
    if (newRole === "ATTORNEY") {
      // Validate required fields for attorney
      const attorneyData = profileData as AttorneyProfileData;
      if (!attorneyData.barLicense) {
        throw new ValidationError("Bar license is required for attorney role");
      }
      await createAttorneyProfile(userId, attorneyData);
    } else {
      await createClientProfile(userId, profileData as ClientProfileData);
    }
  }

  // Update user role
  const updated = await updateUserRole(userId, newRole);

  // Update profileComplete status
  await prisma.user.update({
    where: { id: userId },
    data: { profileComplete: true },
  });

  return updated;
}

/**
 * Create profile and set role (for role-selection page)
 */
export async function createRoleProfile(
  userId: string,
  role: "CUSTOMER" | "ATTORNEY",
  profileData: AttorneyProfileData | ClientProfileData
) {
  // Verify user exists and get full user data with profiles
  const user = await findUserWithProfiles(userId);
  if (!user) {
    throw new NotFoundError("User");
  }

  // Check if user already has a role set - this endpoint is only for users without a role
  if (user.role !== null && user.role !== undefined) {
    throw new ConflictError(
      "User already has a role set. Cannot create profile through this endpoint."
    );
  }

  // Check if user already has a profile for this role
  const existingProfile = await getUserRoleProfile(userId, role);
  if (existingProfile) {
    throw new ConflictError("Profile already exists for this role");
  }

  // Validate and create profile based on role
  if (role === "ATTORNEY") {
    const attorneyData = profileData as AttorneyProfileData;
    if (!attorneyData.barLicense) {
      throw new ValidationError("Bar license is required for attorney role");
    }
    await createAttorneyProfile(userId, attorneyData);
  } else {
    await createClientProfile(userId, profileData as ClientProfileData);
  }

  // Update user role and mark profile as complete
  await updateUserRole(userId, role);
  await prisma.user.update({
    where: { id: userId },
    data: { profileComplete: true },
  });

  // Return updated user with profile
  const userWithProfiles = await findUserWithProfiles(userId);
  if (!userWithProfiles) {
    throw new NotFoundError("User");
  }

  return {
    role: userWithProfiles.role,
    profile:
      role === "ATTORNEY"
        ? userWithProfiles.lawyerProfile
        : userWithProfiles.customerProfile,
  };
}



