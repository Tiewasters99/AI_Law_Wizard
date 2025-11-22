// Controller for review API endpoints

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  createProjectReview,
  getProjectReviews,
  getUserReviews,
  getReviewById,
} from "../../../services/common/reviews/reviewService";
import { successResponse, errorResponse } from "../../../utils/response";
import {
  validateRequired,
} from "../../../utils/validation";
import { prisma } from "../../../prisma";

/**
 * Handle POST request - Create review
 */
export async function handleCreateReview(
  request: NextRequest,
  projectId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
    }

    // Verify user is client or attorney
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true },
    });

    if (user?.role === "CUSTOMER") {
      await verifyClientAccess(session.user.id);
    } else if (user?.role === "ATTORNEY") {
      await verifyAttorneyAccess(session.user.id);
    } else {
      return errorResponse(new Error("Forbidden"), "Access denied");
    }

    const body = await request.json();
    const { rating, comment } = body;

    validateRequired(rating, "Rating");

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return errorResponse(
        new Error("Rating must be between 1 and 5"),
        "Validation error"
      );
    }

    const reviewerName = user.name || "a user";

    const review = await createProjectReview(
      projectId,
      session.user.id,
      reviewerName,
      {
        projectId,
        rating,
        comment,
      }
    );

    return successResponse({
      success: true,
      review,
      message: "Review created successfully",
    });
  } catch (error) {
    return errorResponse(error, "Failed to create review");
  }
}

/**
 * Handle GET request - Get reviews for project
 */
export async function handleGetProjectReviews(
  request: NextRequest,
  projectId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
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

    const reviews = await getProjectReviews(projectId, session.user.id);

    return successResponse({
      success: true,
      reviews,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch reviews");
  }
}

/**
 * Handle GET request - Get reviews for user
 */
export async function handleGetUserReviews(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
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

    // Users can only view their own reviews
    if (session.user.id !== userId) {
      return errorResponse(new Error("Forbidden"), "Access denied");
    }

    const reviews = await getUserReviews(userId);

    return successResponse({
      success: true,
      reviews,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch reviews");
  }
}

/**
 * Handle GET request - Get review by ID
 */
export async function handleGetReview(
  request: NextRequest,
  reviewId: string
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new Error("Unauthorized"), "Authentication required");
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

    const review = await getReviewById(reviewId, session.user.id);

    return successResponse({
      success: true,
      review,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch review");
  }
}

