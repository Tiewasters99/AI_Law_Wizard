// Repository for role and profile database operations

import { prisma } from "../../prisma";

export interface AttorneyProfileData {
  barLicense: string;
  specialty?: string;
  yearsOfExperience?: number;
  bio?: string;
  location?: string;
}

export interface ClientProfileData {
  companyName?: string;
  industry?: string;
  location?: string;
  phone?: string;
}

/**
 * Check if user has profile for a specific role
 */
export async function getUserRoleProfile(
  userId: string,
  role: "CUSTOMER" | "ATTORNEY"
) {
  if (role === "ATTORNEY") {
    return await prisma.lawyerProfile.findUnique({
      where: { userId },
    });
  } else {
    return await prisma.customerProfile.findUnique({
      where: { userId },
    });
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: "CUSTOMER" | "ATTORNEY"
) {
  return await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: { id: true, role: true, email: true },
  });
}

/**
 * Create attorney profile
 */
export async function createAttorneyProfile(
  userId: string,
  data: AttorneyProfileData
) {
  return await prisma.lawyerProfile.create({
    data: {
      userId,
      barLicense: data.barLicense,
      specialty: data.specialty,
      yearsOfExperience: data.yearsOfExperience,
      bio: data.bio,
      location: data.location,
    },
  });
}

/**
 * Create client profile
 */
export async function createClientProfile(
  userId: string,
  data: ClientProfileData
) {
  return await prisma.customerProfile.create({
    data: {
      userId,
      companyName: data.companyName,
      industry: data.industry,
      address: data.location,
      phone: data.phone,
    },
  });
}

/**
 * Find user by ID with profiles
 */
export async function findUserWithProfiles(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      lawyerProfile: true,
      customerProfile: true,
    },
  });
}







