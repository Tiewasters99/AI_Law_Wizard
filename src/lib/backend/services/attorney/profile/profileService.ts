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
    profileComplete: true, // Will be set based on actual logic
    specialty: lawyerProfile?.specialty || "",
    barLicense: lawyerProfile?.barLicense || "",
    bio: lawyerProfile?.bio || "",
    yearsOfExperience: lawyerProfile?.yearsOfExperience || 0,
    firmName: lawyerProfile?.firmName || "",
    verified: lawyerProfile?.verified || false,
    phone: (user.profileData as any)?.phone || "",
    address: (user.profileData as any)?.address || "",
    website: (user.profileData as any)?.website || "",
  };
}

/**
 * Update attorney profile
 */
export async function updateAttorneyProfile(
  userId: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    website?: string;
    specialty?: string;
    barLicense?: string;
    bio?: string;
    yearsOfExperience?: number;
    firmName?: string;
  }
) {
  // Validate required fields
  if (!data.name || !data.email) {
    throw new ValidationError("Name and email are required");
  }

  // Validate email format
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

  // Update user and profile in a transaction
  const result = await prisma.$transaction(async tx => {
    // Update basic user data
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        profileData: {
          phone: data.phone || "",
          address: data.address || "",
          website: data.website || "",
        },
        profileComplete: true,
      },
    });

    // Update or create lawyer profile
    const lawyerProfile = await upsertLawyerProfile(userId, {
      specialty: data.specialty,
      barLicense: data.barLicense,
      bio: data.bio,
      yearsOfExperience: data.yearsOfExperience,
      firmName: data.firmName,
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
    bio: result.lawyerProfile.bio,
    yearsOfExperience: result.lawyerProfile.yearsOfExperience,
    firmName: result.lawyerProfile.firmName,
    verified: result.lawyerProfile.verified,
    phone: (result.user.profileData as any)?.phone || "",
    address: (result.user.profileData as any)?.address || "",
    website: (result.user.profileData as any)?.website || "",
  };
}
