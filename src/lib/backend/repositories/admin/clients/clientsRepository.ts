// Repository for admin clients database operations

import { prisma } from "../../../prisma";

export interface ClientListItem {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  industry: string | null;
  createdAt: Date;
  tokenBalance: number;
  purchaseCount: number;
  totalSpent: number;
}

type SortField = "name" | "email" | "company" | "createdAt" | "tokenBalance" | "totalSpent" | "purchaseCount";
type SortOrder = "asc" | "desc";

/**
 * Get sort orderBy for Prisma
 */
function getOrderBy(sortBy?: SortField, sortOrder: SortOrder = "desc") {
  if (!sortBy) {
    return { createdAt: "desc" as const };
  }

  const order = sortOrder === "asc" ? "asc" : "desc";

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
      return { createdAt: "desc" as const };
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

  const formattedClients: ClientListItem[] = clients.map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    industry: client.industry,
    createdAt: client.createdAt,
    tokenBalance: client.wallet?.balance || 0,
    purchaseCount: client.purchases.length,
    totalSpent: client.purchases.reduce(
      (sum, p) => sum + p.amountPaid,
      0
    ),
  }));

  // Sort by computed fields if needed (tokenBalance, totalSpent, purchaseCount)
  if (sortBy === "tokenBalance" || sortBy === "totalSpent" || sortBy === "purchaseCount") {
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
export async function findClientById(id: string): Promise<ClientListItem | null> {
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
    createdAt: client.createdAt,
    tokenBalance: client.wallet?.balance || 0,
    purchaseCount: client.purchases.length,
    totalSpent: client.purchases.reduce((sum, p) => sum + p.amountPaid, 0),
  };
}

/**
 * Update client
 */
export async function updateClient(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    industry?: string;
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

