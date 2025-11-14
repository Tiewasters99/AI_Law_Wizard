// Repository for consultation request database operations

import { prisma } from "../../prisma";

export interface ConsultationRequestWithConversation {
  clientId: string;
  status: string;
  id: string;
  caseType: string;
  urgency: string;
  createdAt: Date;
  conversation: {
    id: string;
    unreadByAttorney: number;
  } | null;
}

/**
 * Find consultation requests by attorney ID
 */
export async function findConsultationRequestsByAttorneyId(
  attorneyId: string
): Promise<ConsultationRequestWithConversation[]> {
  return await prisma.consultationRequest.findMany({
    where: {
      attorneyId,
    },
    select: {
      clientId: true,
      status: true,
      id: true,
      caseType: true,
      urgency: true,
      createdAt: true,
      conversation: {
        select: {
          id: true,
          unreadByAttorney: true,
        },
      },
    },
  });
}

/**
 * Find consultation requests by client ID
 */
export async function findConsultationRequestsByClientId(
  clientId: string,
  status?: string
) {
  const where: any = { clientId };
  if (status && status !== "all") {
    where.status = status;
  }

  return await prisma.consultationRequest.findMany({
    where,
    include: {
      attorney: {
        select: {
          id: true,
          name: true,
          image: true,
          lawyerProfile: {
            select: {
              practiceAreas: true,
              firmName: true,
            },
          },
        },
      },
      conversation: {
        select: {
          id: true,
          lastMessageAt: true,
          unreadByClient: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Find consultation request by ID for client
 */
export async function findConsultationRequestByIdForClient(
  requestId: string,
  clientId: string
) {
  return await prisma.consultationRequest.findFirst({
    where: {
      id: requestId,
      clientId,
    },
    include: {
      attorney: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          lawyerProfile: {
            select: {
              bio: true,
              practiceAreas: true,
              firmName: true,
              yearsOfExperience: true,
              location: true,
              hourlyRate: true,
            },
          },
        },
      },
      conversation: {
        select: {
          id: true,
          lastMessageAt: true,
          unreadByClient: true,
          unreadByAttorney: true,
        },
      },
    },
  });
}

/**
 * Update consultation request status
 */
export async function updateConsultationRequestStatus(
  requestId: string,
  status: string
) {
  return await prisma.consultationRequest.update({
    where: { id: requestId },
    data: {
      status: status as
        | "PENDING"
        | "ACCEPTED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED",
    },
    include: {
      attorney: {
        select: {
          id: true,
          name: true,
          image: true,
          lawyerProfile: {
            select: {
              practiceAreas: true,
              firmName: true,
            },
          },
        },
      },
      conversation: {
        select: {
          id: true,
          lastMessageAt: true,
          unreadByClient: true,
        },
      },
    },
  });
}

/**
 * Create consultation request (transaction-based)
 */
export async function createConsultationRequest(data: {
  clientId: string;
  attorneyId: string;
  caseType: string;
  urgency: string;
  description: string;
  documents?: string[];
}) {
  return await prisma.consultationRequest.create({
    data: {
      clientId: data.clientId,
      attorneyId: data.attorneyId,
      caseType: data.caseType,
      urgency: data.urgency.toUpperCase() as
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "URGENT",
      description: data.description.trim(),
      documents: data.documents || [],
      status: "PENDING",
    },
  });
}

/**
 * Count pending consultation requests for client
 * Excludes requests that have been viewed by the client
 */
export async function countPendingConsultationRequestsForClient(
  clientId: string
): Promise<number> {
  return await prisma.consultationRequest.count({
    where: {
      clientId,
      status: "PENDING",
      viewedByClient: false,
    },
  });
}

/**
 * Mark consultation request as viewed by client
 */
export async function markConsultationRequestAsViewedByClient(
  requestId: string,
  clientId: string
) {
  return await prisma.consultationRequest.updateMany({
    where: {
      id: requestId,
      clientId, // Ensure the request belongs to this client
    },
    data: {
      viewedByClient: true,
    },
  });
}
