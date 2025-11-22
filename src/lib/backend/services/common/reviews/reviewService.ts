// Service for review functionality

import {
  createReview,
  findReviewById,
  findReviewsByProjectId,
  findReviewsByRevieweeId,
  hasReviewedProject,
  calculateAverageRating,
} from "../../../repositories/common/reviewRepository";
import { findProjectById, hasProjectAccess } from "../../../repositories/common/projectRepository";
import { NotFoundError, ValidationError, AuthorizationError } from "../../../utils/errors";
import { prisma } from "../../../prisma";

export interface CreateReviewData {
  projectId: string;
  rating: number;
  comment?: string;
}

/**
 * Create a review for a completed project
 */
export async function createProjectReview(
  projectId: string,
  reviewerId: string,
  reviewerName: string,
  data: CreateReviewData
) {
  const project = await findProjectById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // Verify reviewer has access to project
  const hasAccess = await hasProjectAccess(projectId, reviewerId);
  if (!hasAccess) {
    throw new AuthorizationError("Access denied");
  }

  // Verify project is completed
  if (project.status !== "COMPLETED") {
    throw new ValidationError("Can only review completed projects");
  }

  // Determine reviewee (the other party)
  const revieweeId = reviewerId === project.clientId ? project.attorneyId : project.clientId;

  // Check if reviewer has already reviewed
  const alreadyReviewed = await hasReviewedProject(projectId, reviewerId);
  if (alreadyReviewed) {
    throw new ValidationError("You have already reviewed this project");
  }

  // Validate rating
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    throw new ValidationError("Rating must be between 1 and 5");
  }

  // Create review
  const review = await createReview({
    projectId,
    reviewerId,
    revieweeId,
    rating: data.rating,
    comment: data.comment,
  });

  // Update attorney rating if reviewing attorney
  if (revieweeId === project.attorneyId) {
    const newRating = await calculateAverageRating(revieweeId);
    await prisma.lawyerProfile.update({
      where: { userId: revieweeId },
      data: { rating: newRating },
    });
  }

  // Create notification for reviewee
  await prisma.notification.create({
    data: {
      userId: revieweeId,
      type: "PROJECT_COMPLETED", // Using existing type
      title: "New Review Received",
      message: `${reviewerName} has left a review for your project`,
      relatedId: review.id,
    },
  });

  return review;
}

/**
 * Get reviews for a project
 */
export async function getProjectReviews(projectId: string, userId: string) {
  const hasAccess = await hasProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new AuthorizationError("Access denied");
  }

  return await findReviewsByProjectId(projectId);
}

/**
 * Get reviews for a user (attorney or client)
 */
export async function getUserReviews(userId: string) {
  return await findReviewsByRevieweeId(userId);
}

/**
 * Get review by ID
 */
export async function getReviewById(reviewId: string, userId: string) {
  const review = await findReviewById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  // Verify user has access to the project
  const hasAccess = await hasProjectAccess(review.projectId, userId);
  if (!hasAccess) {
    throw new AuthorizationError("Access denied");
  }

  return review;
}

