// Repository for milestone database operations

import { prisma } from "../../prisma";

export interface CreateMilestoneData {
  projectId: string;
  title: string;
  description: string;
  amount: number;
  dueDate?: Date;
}

/**
 * Create a new milestone
 */
export async function createMilestone(data: CreateMilestoneData) {
  return await prisma.milestone.create({
    data: {
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate || null,
      status: "PENDING",
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          clientId: true,
          attorneyId: true,
        },
      },
    },
  });
}

/**
 * Find milestone by ID
 */
export async function findMilestoneById(milestoneId: string) {
  return await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
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
      },
    },
  });
}

/**
 * Find milestones by project ID
 */
export async function findMilestonesByProjectId(projectId: string) {
  return await prisma.milestone.findMany({
    where: { projectId },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Update milestone status
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "APPROVED" | "DISPUTED"
) {
  return await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status },
    include: {
      project: {
        select: {
          id: true,
          clientId: true,
          attorneyId: true,
        },
      },
    },
  });
}

/**
 * Mark milestone as completed
 */
export async function markMilestoneCompleted(milestoneId: string) {
  return await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: "COMPLETED",
      completedDate: new Date(),
    },
    include: {
      project: {
        select: {
          id: true,
          clientId: true,
          attorneyId: true,
          totalAmount: true,
        },
      },
    },
  });
}

/**
 * Approve milestone
 */
export async function approveMilestone(milestoneId: string) {
  return await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: "APPROVED",
      approvedDate: new Date(),
    },
    include: {
      project: {
        select: {
          id: true,
          clientId: true,
          attorneyId: true,
          totalAmount: true,
        },
      },
    },
  });
}

/**
 * Update milestone
 */
export async function updateMilestone(
  milestoneId: string,
  data: {
    title?: string;
    description?: string;
    amount?: number;
    dueDate?: Date | null;
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "APPROVED" | "DISPUTED";
  }
) {
  return await prisma.milestone.update({
    where: { id: milestoneId },
    data,
    include: {
      project: {
        select: {
          id: true,
          clientId: true,
          attorneyId: true,
        },
      },
    },
  });
}

/**
 * Delete milestone
 */
export async function deleteMilestone(milestoneId: string) {
  return await prisma.milestone.delete({
    where: { id: milestoneId },
  });
}

/**
 * Check if milestone belongs to project
 */
export async function isMilestoneInProject(
  milestoneId: string,
  projectId: string
): Promise<boolean> {
  const milestone = await prisma.milestone.findFirst({
    where: {
      id: milestoneId,
      projectId,
    },
    select: { id: true },
  });

  return !!milestone;
}

