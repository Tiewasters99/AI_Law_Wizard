// Repository for project database operations

import { prisma } from "../../prisma";

export interface CreateProjectData {
  consultationRequestId: string;
  proposalId: string;
  clientId: string;
  attorneyId: string;
  title: string;
  description: string;
  totalAmount: number;
  contractUrl?: string;
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectData) {
  return await prisma.project.create({
    data: {
      consultationRequestId: data.consultationRequestId,
      proposalId: data.proposalId,
      clientId: data.clientId,
      attorneyId: data.attorneyId,
      title: data.title,
      description: data.description,
      totalAmount: data.totalAmount,
      contractUrl: data.contractUrl || null,
      status: "ACTIVE",
    },
    include: {
      consultationRequest: {
        select: {
          id: true,
          caseType: true,
        },
      },
      proposal: {
        select: {
          id: true,
          proposedFee: true,
          proposedTimeline: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      attorney: {
        select: {
          id: true,
          name: true,
          email: true,
          lawyerProfile: {
            select: {
              firmName: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Find project by ID
 */
export async function findProjectById(projectId: string) {
  return await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      consultationRequest: {
        select: {
          id: true,
          caseType: true,
          description: true,
        },
      },
      proposal: {
        select: {
          id: true,
          proposedFee: true,
          proposedTimeline: true,
          description: true,
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
      attorney: {
        select: {
          id: true,
          name: true,
          email: true,
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
      milestones: {
        orderBy: {
          createdAt: "asc",
        },
      },
      reviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Find projects by client ID
 */
export async function findProjectsByClientId(
  clientId: string,
  status?: string
) {
  const where: any = { clientId };
  if (status && status !== "all") {
    where.status = status;
  }

  return await prisma.project.findMany({
    where,
    include: {
      attorney: {
        select: {
          id: true,
          name: true,
          image: true,
          lawyerProfile: {
            select: {
              firmName: true,
            },
          },
        },
      },
      milestones: {
        select: {
          id: true,
          title: true,
          status: true,
          amount: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          milestones: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Find projects by attorney ID
 */
export async function findProjectsByAttorneyId(
  attorneyId: string,
  status?: string
) {
  const where: any = { attorneyId };
  if (status && status !== "all") {
    where.status = status;
  }

  return await prisma.project.findMany({
    where,
    include: {
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
      milestones: {
        select: {
          id: true,
          title: true,
          status: true,
          amount: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          milestones: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DISPUTED"
) {
  return await prisma.project.update({
    where: { id: projectId },
    data: { status },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      attorney: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  data: {
    title?: string;
    description?: string;
    status?: "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DISPUTED";
    endDate?: Date | null;
    contractUrl?: string | null;
  }
) {
  return await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      attorney: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Check if user has access to project
 */
export async function hasProjectAccess(
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ clientId: userId }, { attorneyId: userId }],
    },
    select: { id: true },
  });

  return !!project;
}

