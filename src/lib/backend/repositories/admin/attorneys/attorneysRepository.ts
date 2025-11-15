// Repository for admin attorneys database operations

import { prisma } from "../../../prisma";
import type { Prisma } from "@prisma/client";

export interface AttorneyListItem {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  specialty: string | null;
  firmName: string | null;
  location: string | null;
  createdAt: Date;
  tokenBalance: number;
  purchaseCount: number;
  totalSpent: number;
}

type SortField =
  | "name"
  | "email"
  | "firmName"
  | "specialty"
  | "createdAt"
  | "tokenBalance"
  | "totalSpent"
  | "purchaseCount";
type SortOrder = "asc" | "desc";

/**
 * Get sort orderBy for Prisma
 */
function getOrderBy(
  sortBy?: SortField,
  sortOrder: SortOrder = "desc"
): Prisma.UserOrderByWithRelationInput {
  if (!sortBy) {
    return { createdAt: "desc" };
  }

  const order: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

  switch (sortBy) {
    case "name":
      return { name: order };
    case "email":
      return { email: order };
    case "createdAt":
      return { createdAt: order };
    case "firmName":
    case "specialty":
      // These are in lawyerProfile, will handle in application layer
      return { createdAt: order };
    case "tokenBalance":
    case "totalSpent":
    case "purchaseCount":
      // These require aggregation, will handle in application layer
      return { createdAt: order };
    default:
      return { createdAt: "desc" };
  }
}

/**
 * Get all attorneys with pagination, search, and sorting
 */
export async function findAllAttorneys(
  page: number = 1,
  limit: number = 20,
  search?: string,
  sortBy?: SortField,
  sortOrder: SortOrder = "desc"
): Promise<{ attorneys: AttorneyListItem[]; total: number }> {
  const skip = (page - 1) * limit;

  const where: any = {
    role: "ATTORNEY",
    deletedAt: null, // Exclude soft-deleted users
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      {
        lawyerProfile: { firmName: { contains: search, mode: "insensitive" } },
      },
      {
        lawyerProfile: { specialty: { contains: search, mode: "insensitive" } },
      },
    ];
  }

  const orderBy = getOrderBy(sortBy, sortOrder);

  const [attorneys, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        wallet: {
          select: {
            balance: true,
          },
        },
        purchases: {
          where: {
            status: "COMPLETED",
          },
          select: {
            amountPaid: true,
          },
        },
        lawyerProfile: {
          select: {
            specialty: true,
            firmName: true,
            location: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const formattedAttorneys: AttorneyListItem[] = attorneys.map(attorney => ({
    id: attorney.id,
    name: attorney.name,
    email: attorney.email,
    phone: attorney.phone,
    company: attorney.company,
    specialty: attorney.lawyerProfile?.specialty || null,
    firmName: attorney.lawyerProfile?.firmName || null,
    location: attorney.lawyerProfile?.location || attorney.location || null,
    createdAt: attorney.createdAt,
    tokenBalance: attorney.wallet?.balance || 0,
    purchaseCount: attorney.purchases.length,
    totalSpent: attorney.purchases.reduce((sum, p) => sum + p.amountPaid, 0),
  }));

  // Sort by computed fields or nested fields if needed
  if (
    sortBy === "tokenBalance" ||
    sortBy === "totalSpent" ||
    sortBy === "purchaseCount" ||
    sortBy === "firmName" ||
    sortBy === "specialty"
  ) {
    formattedAttorneys.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "tokenBalance") {
        comparison = a.tokenBalance - b.tokenBalance;
      } else if (sortBy === "totalSpent") {
        comparison = a.totalSpent - b.totalSpent;
      } else if (sortBy === "purchaseCount") {
        comparison = a.purchaseCount - b.purchaseCount;
      } else if (sortBy === "firmName") {
        const aFirm = a.firmName || "";
        const bFirm = b.firmName || "";
        comparison = aFirm.localeCompare(bFirm);
      } else if (sortBy === "specialty") {
        const aSpecialty = a.specialty || "";
        const bSpecialty = b.specialty || "";
        comparison = aSpecialty.localeCompare(bSpecialty);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  return { attorneys: formattedAttorneys, total };
}

/**
 * Get attorney by ID
 */
export async function findAttorneyById(
  id: string
): Promise<AttorneyListItem | null> {
  const attorney = await prisma.user.findFirst({
    where: {
      id,
      role: "ATTORNEY",
      deletedAt: null,
    },
    include: {
      wallet: {
        select: {
          balance: true,
        },
      },
      purchases: {
        where: {
          status: "COMPLETED",
        },
        select: {
          amountPaid: true,
        },
      },
      lawyerProfile: true,
    },
  });

  if (!attorney) return null;

  return {
    id: attorney.id,
    name: attorney.name,
    email: attorney.email,
    phone: attorney.phone,
    company: attorney.company,
    specialty: attorney.lawyerProfile?.specialty || null,
    firmName: attorney.lawyerProfile?.firmName || null,
    location: attorney.lawyerProfile?.location || attorney.location || null,
    createdAt: attorney.createdAt,
    tokenBalance: attorney.wallet?.balance || 0,
    purchaseCount: attorney.purchases.length,
    totalSpent: attorney.purchases.reduce((sum, p) => sum + p.amountPaid, 0),
  };
}

/**
 * Update attorney
 */
export async function updateAttorney(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    location?: string;
    bio?: string;
  }
) {
  return await prisma.user.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      wallet: true,
      lawyerProfile: true,
    },
  });
}

/**
 * Update lawyer profile
 */
export async function updateLawyerProfile(
  userId: string,
  data: {
    specialty?: string;
    firmName?: string;
    barLicense?: string;
    barNumber?: string;
    yearsOfExperience?: number;
    location?: string;
    hourlyRate?: number;
    practiceAreas?: string[];
    bio?: string;
  }
) {
  return await prisma.lawyerProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}

/**
 * Soft delete attorney
 */
export async function deleteAttorney(id: string) {
  return await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
