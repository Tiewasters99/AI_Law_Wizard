// Admin Feature Pricing by ID API Route
// Delegates to controller for handling

import { NextRequest } from "next/server";
import {
  handleGetFeaturePricingById,
  handleUpdateFeaturePricing,
  handleDeleteFeaturePricing,
} from "@/lib/backend/controllers/admin/pricing/featurePricingController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetFeaturePricingById(request, { params: { id } });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateFeaturePricing(request, { params: { id } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteFeaturePricing(request, { params: { id } });
}
