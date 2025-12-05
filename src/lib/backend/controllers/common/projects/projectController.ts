// Controller for project API endpoints (shared by client and attorney)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  createProjectFromProposal,
  getProject,
  listClientProjects,
  listAttorneyProjects,
  updateProjectStatusService,
  createProjectMilestone,
  getProjectMilestones,
  updateProjectMilestone,
} from "../../../services/common/projects/projectService";
import {
  completeMilestone,
  approveMilestoneAndTransferTokens,
  getProjectTokenTransactions,
} from "../../../services/common/projects/tokenPaymentService";
import { successResponse, errorResponse } from "../../../utils/response";
import {
  validateRequired,
  validateNonEmptyString,
} from "../../../utils/validation";
import { prisma } from "../../../prisma";

/**
 * Handle POST request - Create project from proposal (client)
 */
export async function handleCreateProject(
  request: NextRequest
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    await verifyClientAccess(session.user.id);

    const body = await request.json();
    const { proposalId, title, description, contractUrl } = body;

    validateRequired(proposalId, "Proposal ID");
    validateRequired(title, "Title");
    validateRequired(description, "Description");
    validateNonEmptyString(title, "Title");
    validateNonEmptyString(description, "Description");

    // Get client name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const clientName = user?.name || "a client";

    const project = await createProjectFromProposal(
      proposalId,
      session.user.id,
      clientName,
      {
        proposalId,
        title,
        description,
        contractUrl,
      }
    );

    return successResponse({
      success: true,
      project,
      message: "Project created successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to create project");
  }
}

/**
 * Handle GET request - List projects (client)
 */
export async function handleListClientProjects(
  request: NextRequest
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    await verifyClientAccess(session.user.id);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const projects = await listClientProjects(
      session.user.id,
      status || undefined
    );

    return successResponse({
      success: true,
      projects,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch projects");
  }
}

/**
 * Handle GET request - List projects (attorney)
 */
export async function handleListAttorneyProjects(
  request: NextRequest
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    await verifyAttorneyAccess(session.user.id);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const projects = await listAttorneyProjects(
      session.user.id,
      status || undefined
    );

    return successResponse({
      success: true,
      projects,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch projects");
  }
}

/**
 * Handle GET request - Get project by ID
 */
export async function handleGetProject(
  request: NextRequest,
  projectId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    // Verify user is client or attorney
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role === "CUSTOMER") {
      await verifyClientAccess(session.user.id);
    } else if (user?.role === "ATTORNEY") {
      await verifyAttorneyAccess(session.user.id);
    } else {
      return errorResponse(new Error("Forbidden"), "Access denied");
    }

    const project = await getProject(projectId, session.user.id);

    return successResponse({
      success: true,
      project,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch project");
  }
}

/**
 * Handle PATCH request - Update project status
 */
export async function handleUpdateProjectStatus(
  request: NextRequest,
  projectId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    // Verify user is client or attorney
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role === "CUSTOMER") {
      await verifyClientAccess(session.user.id);
    } else if (user?.role === "ATTORNEY") {
      await verifyAttorneyAccess(session.user.id);
    } else {
      return errorResponse(new Error("Forbidden"), "Access denied");
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse(new Error("Status is required"), "Validation error");
    }

    const validStatuses = [
      "ACTIVE",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "DISPUTED",
    ];
    if (!validStatuses.includes(status)) {
      return errorResponse(new Error("Invalid status"), "Validation error");
    }

    const project = await updateProjectStatusService(
      projectId,
      session.user.id,
      status as any
    );

    return successResponse({
      success: true,
      project,
      message: "Project status updated successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to update project status");
  }
}

/**
 * Handle POST request - Create milestone (attorney)
 */
export async function handleCreateMilestone(
  request: NextRequest,
  projectId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    await verifyAttorneyAccess(session.user.id);

    const body = await request.json();
    const { title, description, amount, dueDate } = body;

    validateRequired(title, "Title");
    validateRequired(description, "Description");
    validateRequired(amount, "Amount");
    validateNonEmptyString(title, "Title");
    validateNonEmptyString(description, "Description");

    if (typeof amount !== "number" || amount <= 0) {
      return errorResponse(
        new Error("Amount must be a positive number"),
        "Validation error"
      );
    }

    const milestone = await createProjectMilestone(projectId, session.user.id, {
      title,
      description,
      amount,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return successResponse({
      success: true,
      milestone,
      message: "Milestone created successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to create milestone");
  }
}

/**
 * Handle GET request - Get milestones for project
 */
export async function handleGetMilestones(
  request: NextRequest,
  projectId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    // Verify user is client or attorney
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role === "CUSTOMER") {
      await verifyClientAccess(session.user.id);
    } else if (user?.role === "ATTORNEY") {
      await verifyAttorneyAccess(session.user.id);
    } else {
      return errorResponse(new Error("Forbidden"), "Access denied");
    }

    const milestones = await getProjectMilestones(projectId, session.user.id);

    return successResponse({
      success: true,
      milestones,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch milestones");
  }
}

/**
 * Handle PATCH request - Update milestone
 */
export async function handleUpdateMilestone(
  request: NextRequest,
  projectId: string,
  milestoneId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    await verifyAttorneyAccess(session.user.id);

    const body = await request.json();
    const { title, description, amount, dueDate } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const milestone = await updateProjectMilestone(
      milestoneId,
      session.user.id,
      updateData
    );

    return successResponse({
      success: true,
      milestone,
      message: "Milestone updated successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to update milestone");
  }
}

/**
 * Handle POST request - Complete milestone (attorney)
 */
export async function handleCompleteMilestone(
  request: NextRequest,
  projectId: string,
  milestoneId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    await verifyAttorneyAccess(session.user.id);

    // Get attorney name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const attorneyName = user?.name || "an attorney";

    const milestone = await completeMilestone(
      milestoneId,
      session.user.id,
      attorneyName
    );

    return successResponse({
      success: true,
      milestone,
      message: "Milestone marked as completed",
    });
  } catch (error) {
    return errorResponse(error, "Failed to complete milestone");
  }
}

/**
 * Handle POST request - Approve milestone and transfer tokens (client)
 */
export async function handleApproveMilestone(
  request: NextRequest,
  projectId: string,
  milestoneId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    await verifyClientAccess(session.user.id);

    // Get client name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const clientName = user?.name || "a client";

    const result = await approveMilestoneAndTransferTokens(
      milestoneId,
      session.user.id,
      clientName
    );

    return successResponse({
      success: true,
      milestone: result.milestone,
      fromBalance: result.fromBalance,
      toBalance: result.toBalance,
      message: "Milestone approved and tokens transferred",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Insufficient")) {
      // Return 402 Payment Required for insufficient tokens
      return NextResponse.json(
        {
          error: "Insufficient token balance",
          code: "INSUFFICIENT_TOKENS",
        },
        { status: 402 }
      );
    }
    return errorResponse(error, "Failed to approve milestone");
  }
}

/**
 * Handle GET request - Get token transactions for project
 */
export async function handleGetProjectTokenTransactions(
  request: NextRequest,
  projectId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    // Verify user is client or attorney
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role === "CUSTOMER") {
      await verifyClientAccess(session.user.id);
    } else if (user?.role === "ATTORNEY") {
      await verifyAttorneyAccess(session.user.id);
    } else {
      return errorResponse(new Error("Forbidden"), "Access denied");
    }

    const transactions = await getProjectTokenTransactions(
      projectId,
      session.user.id
    );

    return successResponse({
      success: true,
      transactions,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch token transactions");
  }
}
