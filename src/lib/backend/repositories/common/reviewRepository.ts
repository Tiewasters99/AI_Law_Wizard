// Repository for review database operations

import { prisma } from "../../prisma";

export interface CreateReviewData {
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

/**
 * Create a new review
 */
export async function createReview(data: CreateReviewData) {
  return await prisma.review.create({
    data: {
      projectId: data.projectId,
      reviewerId: data.reviewerId,
      revieweeId: data.revieweeId,
      rating: data.rating,
      comment: data.comment || null,
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Find review by ID
 */
export async function findReviewById(reviewId: string) {
  return await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Find reviews by project ID
 */
export async function findReviewsByProjectId(projectId: string) {
  return await prisma.review.findMany({
    where: { projectId },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Find reviews by reviewee ID (attorney or client)
 */
export async function findReviewsByRevieweeId(revieweeId: string) {
  return await prisma.review.findMany({
    where: { revieweeId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Check if reviewer has already reviewed the project
 */
export async function hasReviewedProject(
  projectId: string,
  reviewerId: string
): Promise<boolean> {
  const review = await prisma.review.findFirst({
    where: {
      projectId,
      reviewerId,
    },
    select: { id: true },
  });

  return !!review;
}

/**
 * Calculate average rating for a user
 */
export async function calculateAverageRating(revieweeId: string): Promise<number> {
  const result = await prisma.review.aggregate({
    where: { revieweeId },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  return result._avg.rating || 0;
}

