// Service for token payment functionality (MVP)

import {
  findMilestoneById,
  markMilestoneCompleted,
  approveMilestone,
  isMilestoneInProject,
} from "../../../repositories/common/milestoneRepository";
import { findProjectById, hasProjectAccess } from "../../../repositories/common/projectRepository";
import { transferTokens } from "../../../tokenService";
import { createNotification } from "../../../repositories/attorney/notificationRepository";
import { NotFoundError, ValidationError, AuthorizationError } from "../../../utils/errors";
import { prisma } from "../../../prisma";

/**
 * Mark milestone as completed (attorney action)
 */
export async function completeMilestone(
  milestoneId: string,
  attorneyId: string,
  attorneyName: string
) {
  const milestone = await findMilestoneById(milestoneId);
  if (!milestone) {
    throw new NotFoundError("Milestone not found");
  }

  const project = await findProjectById(milestone.projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // Verify attorney owns the project
  if (project.attorneyId !== attorneyId) {
    throw new AuthorizationError("Access denied");
  }

  // Check milestone status
  if (milestone.status !== "PENDING" && milestone.status !== "IN_PROGRESS") {
    throw new ValidationError("Milestone cannot be completed in current status");
  }

  // Mark milestone as completed
  const completedMilestone = await markMilestoneCompleted(milestoneId);

  // Create notification for client
  await createNotification({
    userId: project.clientId,
    type: "MILESTONE_COMPLETED",
    title: "Milestone Completed",
    message: `${attorneyName} has marked a milestone as completed`,
    relatedId: milestoneId,
  });

  return completedMilestone;
}

/**
 * Approve milestone and transfer tokens (client action)
 */
export async function approveMilestoneAndTransferTokens(
  milestoneId: string,
  clientId: string,
  clientName: string
) {
  const milestone = await findMilestoneById(milestoneId);
  if (!milestone) {
    throw new NotFoundError("Milestone not found");
  }

  const project = await findProjectById(milestone.projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // Verify client owns the project
  if (project.clientId !== clientId) {
    throw new AuthorizationError("Access denied");
  }

  // Check milestone status
  if (milestone.status !== "COMPLETED") {
    throw new ValidationError("Milestone must be completed before approval");
  }

  // Transfer tokens from client to attorney
  const transferResult = await transferTokens(
    clientId,
    project.attorneyId,
    milestone.amount,
    `Milestone payment: ${milestone.title}`,
    project.id,
    milestoneId
  );

  if (!transferResult.success) {
    throw new ValidationError(
      transferResult.error || "Failed to transfer tokens"
    );
  }

  // Approve milestone
  const approvedMilestone = await approveMilestone(milestoneId);

  // Create notification for attorney
  await createNotification({
    userId: project.attorneyId,
    type: "MILESTONE_APPROVED",
    title: "Milestone Approved",
    message: `${clientName} has approved milestone and ${milestone.amount} tokens have been transferred`,
    relatedId: milestoneId,
  });

  return {
    milestone: approvedMilestone,
    fromBalance: transferResult.fromBalance,
    toBalance: transferResult.toBalance,
  };
}

/**
 * Get token transactions for a project
 */
export async function getProjectTokenTransactions(
  projectId: string,
  userId: string
) {
  const hasAccess = await hasProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new AuthorizationError("Access denied");
  }

  const transactions = await prisma.tokenTransaction.findMany({
    where: {
      projectId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return transactions;
}

