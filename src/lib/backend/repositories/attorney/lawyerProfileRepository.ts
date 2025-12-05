// Repository for lawyer profile database operations

import { prisma } from "../../prisma";
import { LawyerProfile as PrismaLawyerProfile } from "@prisma/client";

export type LawyerProfile = PrismaLawyerProfile;

export interface UpdateLawyerProfileData {
  specialty?: string;
  barLicense?: string;
  barNumber?: string;
  bio?: string;
  yearsOfExperience?: number;
  firmName?: string;
  location?: string;
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
      barNumber: data.barNumber ?? undefined,
      bio: data.bio ?? undefined,
      yearsOfExperience: data.yearsOfExperience
        ? parseInt(String(data.yearsOfExperience))
        : undefined,
      firmName: data.firmName ?? undefined,
      location: data.location ?? undefined,
    },
    create: {
      userId,
      specialty: data.specialty ?? "",
      barLicense: data.barLicense ?? "",
      barNumber: data.barNumber ?? "",
      bio: data.bio ?? "",
      yearsOfExperience: data.yearsOfExperience
        ? parseInt(String(data.yearsOfExperience))
        : 0,
      firmName: data.firmName ?? "",
      location: data.location ?? "",
    },
  });
}

/**
 * Find attorneys with their profiles (for client directory)
 */
export async function findAttorneysWithProfiles(
  skip: number = 0,
  take: number = 20
) {
  const [attorneys, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "ATTORNEY",
        profileComplete: true,
      },
      include: {
        lawyerProfile: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({
      where: {
        role: "ATTORNEY",
        profileComplete: true,
      },
    }),
  ]);

  return {
    attorneys,
    total,
    hasMore: skip + take < total,
  };
}
