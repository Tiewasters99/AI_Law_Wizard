// Repository for lawyer profile database operations

import { prisma } from "../../prisma";

export interface LawyerProfile {
  id: string;
  userId: string;
  specialty: string | null;
  barLicense: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  firmName: string | null;
  verified: boolean;
}

export interface UpdateLawyerProfileData {
  specialty?: string;
  barLicense?: string;
  bio?: string;
  yearsOfExperience?: number;
  firmName?: string;
}

/**
 * Find lawyer profile by user ID
 */
export async function findLawyerProfileByUserId(
  userId: string
): Promise<LawyerProfile | null> {
  return await prisma.lawyerProfile.findUnique({
    where: { userId },
  });
}

/**
 * Upsert lawyer profile
 */
export async function upsertLawyerProfile(
  userId: string,
  data: UpdateLawyerProfileData
): Promise<LawyerProfile> {
  return await prisma.lawyerProfile.upsert({
    where: { userId },
    update: {
      specialty: data.specialty ?? undefined,
      barLicense: data.barLicense ?? undefined,
      bio: data.bio ?? undefined,
      yearsOfExperience: data.yearsOfExperience
        ? parseInt(String(data.yearsOfExperience))
        : undefined,
      firmName: data.firmName ?? undefined,
    },
    create: {
      userId,
      specialty: data.specialty ?? "",
      barLicense: data.barLicense ?? "",
      bio: data.bio ?? "",
      yearsOfExperience: data.yearsOfExperience
        ? parseInt(String(data.yearsOfExperience))
        : 0,
      firmName: data.firmName ?? "",
    },
  });
}

/**
 * Find attorneys with their profiles (for client directory)
 */
export async function findAttorneysWithProfiles() {
  return await prisma.user.findMany({
    where: {
      role: "ATTORNEY",
      profileComplete: true,
    },
    include: {
      lawyerProfile: true,
    },
  });
}
