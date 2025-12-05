// Service for project management functionality

import {
  createProject,
  findProjectById,
  findProjectsByClientId,
  findProjectsByAttorneyId,
  updateProjectStatus,
  updateProject,
  hasProjectAccess,
} from "../../../repositories/common/projectRepository";
import {
  createMilestone,
  findMilestonesByProjectId,
  findMilestoneById,
  updateMilestoneStatus,
  markMilestoneCompleted,
  approveMilestone,
  updateMilestone,
  isMilestoneInProject,
} from "../../../repositories/common/milestoneRepository";
import { findProposalById } from "../../../repositories/attorney/proposalRepository";
import { createNotification } from "../../../repositories/attorney/notificationRepository";
import { NotFoundError, ValidationError, AuthorizationError } from "../../../utils/errors";
import { prisma } from "../../../prisma";

export interface CreateProjectData {
  proposalId: string;
  title: string;
  description: string;
  contractUrl?: string;
}

export interface CreateMilestoneData {
  title: string;
  description: string;
  amount: number;
  dueDate?: Date;
}

/**
 * Create project from accepted proposal
 */
export async function createProjectFromProposal(
  proposalId: string,
  clientId: string,
  clientName: string,
  data: CreateProjectData
) {
  // Verify proposal exists and is accepted
  const proposal = await findProposalById(proposalId);

  if (!proposal) {
    throw new NotFoundError("Proposal not found");
  }

  if (proposal.status !== "ACCEPTED") {
    throw new ValidationError("Proposal must be accepted to create a project");
  }

  if (proposal.clientId !== clientId) {
    throw new AuthorizationError("Access denied");
  }

  // Check if project already exists for this proposal
  const existingProject = await prisma.project.findUnique({
    where: { proposalId },
    select: { id: true },
  });

  if (existingProject) {
    throw new ValidationError("Project already exists for this proposal");
  }

  // Get consultation request
  const consultationRequest = await prisma.consultationRequest.findUnique({
    where: { id: proposal.consultationRequestId },
    select: { id: true },
  });

  if (!consultationRequest) {
    throw new NotFoundError("Consultation request not found");
  }

  // Create project
  const project = await createProject({
    consultationRequestId: consultationRequest.id,
    proposalId: proposal.id,
    clientId: proposal.clientId,
    attorneyId: proposal.attorneyId,
    title: data.title,
    description: data.description,
    totalAmount: proposal.proposedFee,
    contractUrl: data.contractUrl,
  });

  // Update consultation request status to IN_PROGRESS
  await prisma.consultationRequest.update({
    where: { id: consultationRequest.id },
    data: { status: "IN_PROGRESS" },
  });

  // Link conversation to project if it exists
  const conversation = await prisma.conversation.findUnique({
    where: { consultationRequestId: consultationRequest.id },
    select: { id: true },
  });

  if (conversation) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { projectId: project.id },
    });
  }

  // Create notification for attorney
  await createNotification({
    userId: proposal.attorneyId,
    type: "PROJECT_COMPLETED", // Using existing type, will add new type later
    title: "Project Created",
    message: `${clientName} has created a project from your accepted proposal`,
    relatedId: project.id,
  });

  return project;
}

/**
 * Get project by ID (with access check)
 */
export async function getProject(projectId: string, userId: string) {
  const hasAccess = await hasProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new AuthorizationError("Access denied");
  }

  const project = await findProjectById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return project;
}

/**
 * List projects for client
 */
export async function listClientProjects(clientId: string, status?: string) {
  return await findProjectsByClientId(clientId, status);
}

/**
 * List projects for attorney
 */
export async function listAttorneyProjects(attorneyId: string, status?: string) {
  return await findProjectsByAttorneyId(attorneyId, status);
}

/**
 * Update project status
 */
export async function updateProjectStatusService(
  projectId: string,
  userId: string,
  status: "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DISPUTED"
) {
  const hasAccess = await hasProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new AuthorizationError("Access denied");
  }

  const project = await findProjectById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // Only allow client or attorney to update status
  // Completed status can only be set by client or attorney
  // Cancelled can be set by either party
  if (status === "COMPLETED" && project.status !== "IN_PROGRESS") {
    throw new ValidationError("Project must be in progress to be completed");
  }

  const updatedProject = await updateProjectStatus(projectId, status);

  // Create notification for the other party
  const otherPartyId = userId === project.clientId ? project.attorneyId : project.clientId;
  await createNotification({
    userId: otherPartyId,
    type: "PROJECT_COMPLETED",
    title: "Project Status Updated",
    message: `Project status has been updated to ${status}`,
    relatedId: projectId,
  });

  return updatedProject;
}

/**
 * Create milestone
 */
export async function createProjectMilestone(
  projectId: string,
  userId: string,
  data: CreateMilestoneData
) {
  const project = await findProjectById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // Only attorney can create milestones
  if (project.attorneyId !== userId) {
    throw new AuthorizationError("Only attorney can create milestones");
  }

  // Validate milestone data
  if (!data.title || data.title.trim().length === 0) {
    throw new ValidationError("Milestone title is required");
  }

  if (!data.description || data.description.trim().length === 0) {
    throw new ValidationError("Milestone description is required");
  }

  if (!data.amount || data.amount <= 0) {
    throw new ValidationError("Milestone amount must be greater than 0");
  }

  // Check total milestone amounts don't exceed project total
  const existingMilestones = await findMilestonesByProjectId(projectId);
  const totalMilestoneAmount = existingMilestones.reduce((sum, m) => sum + m.amount, 0);
  
  if (totalMilestoneAmount + data.amount > project.totalAmount) {
    throw new ValidationError("Total milestone amounts cannot exceed project total amount");
  }

  const milestone = await createMilestone({
    projectId,
    title: data.title,
    description: data.description,
    amount: data.amount,
    dueDate: data.dueDate,
  });

  // Create notification for client
  await createNotification({
    userId: project.clientId,
    type: "MILESTONE_COMPLETED", // Using existing type
    title: "New Milestone Created",
    message: `A new milestone has been added to your project`,
    relatedId: milestone.id,
  });

  return milestone;
}

/**
 * Get milestones for project
 */
export async function getProjectMilestones(projectId: string, userId: string) {
  const hasAccess = await hasProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new AuthorizationError("Access denied");
  }

  return await findMilestonesByProjectId(projectId);
}

/**
 * Update milestone
 */
export async function updateProjectMilestone(
  milestoneId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    amount?: number;
    dueDate?: Date | null;
  }
) {
  const milestone = await findMilestoneById(milestoneId);
  if (!milestone) {
    throw new NotFoundError("Milestone not found");
  }

  const project = await findProjectById(milestone.projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // Only attorney can update milestones (unless approved)
  if (project.attorneyId !== userId && milestone.status !== "APPROVED") {
    throw new AuthorizationError("Access denied");
  }

  if (milestone.status === "APPROVED") {
    throw new ValidationError("Cannot update an approved milestone");
  }

  // If updating amount, check total doesn't exceed project total
  if (data.amount !== undefined) {
    const existingMilestones = await findMilestonesByProjectId(milestone.projectId);
    const totalMilestoneAmount = existingMilestones
      .filter(m => m.id !== milestoneId)
      .reduce((sum, m) => sum + m.amount, 0);
    
    if (totalMilestoneAmount + data.amount > project.totalAmount) {
      throw new ValidationError("Total milestone amounts cannot exceed project total amount");
    }
  }

  return await updateMilestone(milestoneId, data);
}

