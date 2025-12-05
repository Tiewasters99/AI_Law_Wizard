// Repository for proposal database operations

import { prisma } from "../../prisma";

export interface CreateProposalData {
  consultationRequestId: string;
  attorneyId: string;
  clientId: string;
  proposedFee: number;
  proposedTimeline: string;
  description: string;
  terms?: string;
}

/**
 * Create a new proposal
 */
export async function createProposal(data: CreateProposalData) {
  return await prisma.proposal.create({
    data: {
      consultationRequestId: data.consultationRequestId,
      attorneyId: data.attorneyId,
      clientId: data.clientId,
      proposedFee: data.proposedFee,
      proposedTimeline: data.proposedTimeline,
      description: data.description,
      terms: data.terms || null,
      status: "DRAFT",
    },
    include: {
      consultationRequest: {
        select: {
          id: true,
          caseType: true,
          status: true,
        },
      },
      attorney: {
        select: {
          id: true,
          name: true,
          image: true,
          lawyerProfile: {
            select: {
              firmName: true,
              practiceAreas: true,
              rating: true,
            },
          },
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Find proposal by ID
 */
export async function findProposalById(proposalId: string) {
  return await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      consultationRequest: {
        select: {
          id: true,
          caseType: true,
          description: true,
          urgency: true,
          status: true,
        },
      },
      attorney: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          lawyerProfile: {
            select: {
              firmName: true,
              practiceAreas: true,
              rating: true,
              yearsOfExperience: true,
              bio: true,
            },
          },
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Find proposals by attorney ID
 */
export async function findProposalsByAttorneyId(
  attorneyId: string,
  status?: string
) {
  const where: any = { attorneyId };
  if (status && status !== "all") {
    where.status = status;
  }

  return await prisma.proposal.findMany({
    where,
    include: {
      consultationRequest: {
        select: {
          id: true,
          caseType: true,
          status: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          customerProfile: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Find proposals by client ID
 */
export async function findProposalsByClientId(
  clientId: string,
  status?: string
) {
  const where: any = { clientId };
  if (status && status !== "all") {
    where.status = status;
  }

  return await prisma.proposal.findMany({
    where,
    include: {
      consultationRequest: {
        select: {
          id: true,
          caseType: true,
          status: true,
        },
      },
      attorney: {
        select: {
          id: true,
          name: true,
          image: true,
          lawyerProfile: {
            select: {
              firmName: true,
              practiceAreas: true,
              rating: true,
              yearsOfExperience: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Find proposals by consultation request ID
 */
export async function findProposalsByConsultationRequestId(
  consultationRequestId: string
) {
  return await prisma.proposal.findMany({
    where: { consultationRequestId },
    include: {
      attorney: {
        select: {
          id: true,
          name: true,
          image: true,
          lawyerProfile: {
            select: {
              firmName: true,
              practiceAreas: true,
              rating: true,
              yearsOfExperience: true,
              bio: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Update proposal status
 */
export async function updateProposalStatus(
  proposalId: string,
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"
) {
  return await prisma.proposal.update({
    where: { id: proposalId },
    data: { status },
    include: {
      consultationRequest: true,
      attorney: {
        select: {
          id: true,
          name: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Update proposal
 */
export async function updateProposal(
  proposalId: string,
  data: {
    proposedFee?: number;
    proposedTimeline?: string;
    description?: string;
    terms?: string;
    status?: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  }
) {
  return await prisma.proposal.update({
    where: { id: proposalId },
    data,
    include: {
      consultationRequest: {
        select: {
          id: true,
          caseType: true,
          status: true,
        },
      },
      attorney: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Delete proposal (withdraw)
 */
export async function deleteProposal(proposalId: string) {
  return await prisma.proposal.delete({
    where: { id: proposalId },
  });
}

/**
 * Check if attorney owns the proposal
 */
export async function isProposalOwner(
  proposalId: string,
  attorneyId: string
): Promise<boolean> {
  const proposal = await prisma.proposal.findFirst({
    where: {
      id: proposalId,
      attorneyId,
    },
    select: { id: true },
  });

  return !!proposal;
}

