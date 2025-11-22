// Attorney Project Reviews API Route

import { NextRequest } from "next/server";
import {
  handleCreateReview,
  handleGetProjectReviews,
} from "@/lib/backend/controllers/common/reviews/reviewController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleCreateReview(request, id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await handleGetProjectReviews(request, id);
}

