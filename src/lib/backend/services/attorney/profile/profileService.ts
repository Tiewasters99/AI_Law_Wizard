// Service for attorney profile functionality

import { findUserByIdWithWallet } from "../../../repositories/common/userRepository";
import {
  findLawyerProfileByUserId,
  upsertLawyerProfile,
  type UpdateLawyerProfileData,
} from "../../../repositories/attorney/lawyerProfileRepository";
import { prisma } from "../../../prisma";
import { NotFoundError, ValidationError } from "../../../utils/errors";

/**
 * Get attorney profile
 */
export async function getAttorneyProfile(userId: string) {
  // Get full user with image field
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  const lawyerProfile = await findLawyerProfileByUserId(userId);

  // Format response data
  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    image: user.image || "",
    role: "ATTORNEY" as const,
    profileComplete: user.profileComplete || false,
    specialty: lawyerProfile?.specialty || "",
    barLicense: lawyerProfile?.barLicense || "",
    bio: lawyerProfile?.bio || "",
    yearsOfExperience: lawyerProfile?.yearsOfExperience || 0,
    firmName: lawyerProfile?.firmName || "",
    verified: lawyerProfile?.verified || false,
    phone: (user.profileData as any)?.phone || "",
    address: (user.profileData as any)?.address || "",
    location:
      lawyerProfile?.location || (user.profileData as any)?.location || "",
    website: (user.profileData as any)?.website || "",
    barNumber: lawyerProfile?.barNumber || "",
  };
}

/**
 * Update attorney profile
 */
export async function updateAttorneyProfile(
  userId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    specialty?: string;
    barLicense?: string;
    bio?: string;
    yearsOfExperience?: number;
    firmName?: string;
    location?: string;
    barNumber?: string;
  }
) {
  // Validate mandatory fields for onboarding
  if (!data.specialty || data.specialty.trim() === "") {
    throw new ValidationError("Specialty is required");
  }

  if (!data.barLicense || data.barLicense.trim() === "") {
    throw new ValidationError("Bar License is required");
  }

  if (data.yearsOfExperience === undefined || data.yearsOfExperience === null) {
    throw new ValidationError("Years of Experience is required");
  }

  if (
    typeof data.yearsOfExperience === "number" &&
    data.yearsOfExperience <= 0
  ) {
    throw new ValidationError("Years of Experience must be a positive number");
  }

  // Validate email format if provided
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError("Invalid email format");
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw new ValidationError("Email is already taken");
    }
  }

  // Get current user data to preserve existing values if not provided
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    throw new NotFoundError("User");
  }

  // Update user and profile in a transaction
  const result = await prisma.$transaction(async tx => {
    // Update basic user data (only update provided fields)
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        profileData: {
          ...((currentUser.profileData as any) || {}),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.website !== undefined && { website: data.website }),
        },
        // Set profileComplete to true only when all mandatory fields are present
        profileComplete: true,
      },
    });

    // Update or create lawyer profile
    const lawyerProfile = await upsertLawyerProfile(userId, {
      specialty: data.specialty!,
      barLicense: data.barLicense!,
      yearsOfExperience: data.yearsOfExperience!,
      ...(data.bio && { bio: data.bio }),
      ...(data.firmName && { firmName: data.firmName }),
      ...(data.barNumber && { barNumber: data.barNumber }),
      ...(data.location && { location: data.location }),
    });

    return { user: updatedUser, lawyerProfile };
  });

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    image: result.user.image,
    role: result.user.role,
    profileComplete: result.user.profileComplete,
    specialty: result.lawyerProfile.specialty,
    barLicense: result.lawyerProfile.barLicense,
    barNumber: result.lawyerProfile.barNumber || "",
    bio: result.lawyerProfile.bio,
    yearsOfExperience: result.lawyerProfile.yearsOfExperience,
    firmName: result.lawyerProfile.firmName,
    verified: result.lawyerProfile.verified,
    phone: (result.user.profileData as any)?.phone || "",
    address: (result.user.profileData as any)?.address || "",
    location:
      result.lawyerProfile.location ||
      (result.user.profileData as any)?.location ||
      "",
    website: (result.user.profileData as any)?.website || "",
  };
}
