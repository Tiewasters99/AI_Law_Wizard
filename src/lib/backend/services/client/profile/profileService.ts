// Service for client profile functionality

import { prisma } from "../../../prisma";
import { aggregateTokenTransactions } from "../../../repositories/attorney/tokenTransactionRepository";
import { NotFoundError } from "../../../utils/errors";

/**
 * Get client profile with statistics
 */
export async function getClientProfile(clientId: string) {
  const user = await prisma.user.findUnique({
    where: { id: clientId },
    include: {
      wallet: true,
      tokenTransactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          clientConsultationRequests: true,
          clientConversations: true,
          chatSessions: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Calculate token statistics
  const totalPurchased = await aggregateTokenTransactions(clientId, "PURCHASE");
  const totalConsumed = await aggregateTokenTransactions(
    clientId,
    "CONSUMPTION"
  );

  const tokensUsed = Math.abs(totalConsumed || 0);
  const tokensRemaining = user.wallet?.balance || 0;

  // Format profile data
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company,
    industry: user.industry,
    location: user.location,
    bio: user.bio,
    avatar: user.image,
    joinDate: user.createdAt,
    lastActive: user.updatedAt,
    preferences: {
      notifications: true, // These would come from a preferences table
      emailUpdates: true,
      smsUpdates: false,
    },
    statistics: {
      totalQueries: user._count.chatSessions,
      totalDocuments: user._count.chatSessions, // Assuming each chat session involves documents
      totalConsultations: user._count.clientConsultationRequests,
      tokensUsed,
      tokensRemaining,
    },
  };
}

/**
 * Update client profile
 */
export async function updateClientProfile(
  clientId: string,
  data: {
    name?: string;
    phone?: string;
    company?: string;
    industry?: string;
    location?: string;
    bio?: string;
  }
) {
  const updatedUser = await prisma.user.update({
    where: { id: clientId },
    data: {
      name: data.name,
      phone: data.phone,
      company: data.company,
      industry: data.industry,
      location: data.location,
      bio: data.bio,
    },
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    company: updatedUser.company,
    industry: updatedUser.industry,
    location: updatedUser.location,
    bio: updatedUser.bio,
  };
}
