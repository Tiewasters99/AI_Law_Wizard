// Repository for admin clients database operations

import { prisma } from "../../../prisma";
import type { Prisma } from "@prisma/client";

export interface ClientListItem {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  industry: string | null;
  location: string | null;
  bio: string | null;
  createdAt: Date;
  tokenBalance: number;
  purchaseCount: number;
  totalSpent: number;
  customerProfile?: {
    companyName: string | null;
    address: string | null;
    needs: string | null;
  } | null;
}

type SortField =
  | "name"
  | "email"
  | "company"
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
    case "company":
      return { company: order };
    case "createdAt":
      return { createdAt: order };
    case "tokenBalance":
      // Need to sort by wallet balance - this requires a different approach
      return { createdAt: order }; // Fallback, will handle in application layer if needed
    case "totalSpent":
    case "purchaseCount":
      // These require aggregation, will handle in application layer
      return { createdAt: order };
    default:
      return { createdAt: "desc" };
  }
}

/**
 * Get all clients with pagination, search, and sorting
 */
export async function findAllClients(
  page: number = 1,
  limit: number = 20,
  search?: string,
  sortBy?: SortField,
  sortOrder: SortOrder = "desc"
): Promise<{ clients: ClientListItem[]; total: number }> {
  const skip = (page - 1) * limit;

  const where: any = {
    role: "CUSTOMER",
    deletedAt: null, // Exclude soft-deleted users
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy = getOrderBy(sortBy, sortOrder);

  const [clients, total] = await Promise.all([
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
      },
    }),
    prisma.user.count({ where }),
  ]);

  const formattedClients: ClientListItem[] = clients.map(client => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    industry: client.industry,
    location: client.location,
    bio: client.bio,
    createdAt: client.createdAt,
    tokenBalance: client.wallet?.balance || 0,
    purchaseCount: client.purchases.length,
    totalSpent: client.purchases.reduce((sum, p) => sum + p.amountPaid, 0),
  }));

  // Sort by computed fields if needed (tokenBalance, totalSpent, purchaseCount)
  if (
    sortBy === "tokenBalance" ||
    sortBy === "totalSpent" ||
    sortBy === "purchaseCount"
  ) {
    formattedClients.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "tokenBalance") {
        comparison = a.tokenBalance - b.tokenBalance;
      } else if (sortBy === "totalSpent") {
        comparison = a.totalSpent - b.totalSpent;
      } else if (sortBy === "purchaseCount") {
        comparison = a.purchaseCount - b.purchaseCount;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  return { clients: formattedClients, total };
}

/**
 * Get client by ID
 */
export async function findClientById(
  id: string
): Promise<ClientListItem | null> {
  const client = await prisma.user.findFirst({
    where: {
      id,
      role: "CUSTOMER",
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
      customerProfile: true,
    },
  });

  if (!client) return null;

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    industry: client.industry,
    location: client.location,
    bio: client.bio,
    createdAt: client.createdAt,
    tokenBalance: client.wallet?.balance || 0,
    purchaseCount: client.purchases.length,
    totalSpent: client.purchases.reduce((sum, p) => sum + p.amountPaid, 0),
    customerProfile: client.customerProfile
      ? {
          companyName: client.customerProfile.companyName,
          address: client.customerProfile.address,
          needs: client.customerProfile.needs,
        }
      : null,
  };
}

/**
 * Update client
 */
export async function updateClient(
  id: string,
  data: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    industry?: string | null;
    location?: string | null;
    bio?: string | null;
  }
) {
  // Build update data object, only including fields that are explicitly provided
  const updateData: any = {
    updatedAt: new Date(),
  };

  // Only include fields that are in the data object (including null values)
  if ("name" in data) updateData.name = data.name;
  if ("email" in data) updateData.email = data.email;
  if ("phone" in data) updateData.phone = data.phone;
  if ("company" in data) updateData.company = data.company;
  if ("industry" in data) updateData.industry = data.industry;
  if ("location" in data) updateData.location = data.location;
  if ("bio" in data) updateData.bio = data.bio;

  return await prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      wallet: true,
      customerProfile: true,
    },
  });
}

/**
 * Update customer profile
 */
export async function updateCustomerProfile(
  userId: string,
  data: {
    companyName?: string;
    address?: string;
    phone?: string;
    industry?: string;
    needs?: string;
  }
) {
  return await prisma.customerProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}

/**
 * Soft delete client
 */
export async function deleteClient(id: string) {
  return await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
