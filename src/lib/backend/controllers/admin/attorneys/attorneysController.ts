// Controller for admin attorneys API endpoints

import { NextRequest } from "next/server";
import {
  requireAdminAuth,
  getClientIP,
  getUserAgent,
} from "../../../utils/adminAuth";
import {
  listAttorneys,
  getAttorney,
  updateAttorneyDetails,
  deleteAttorneyById,
} from "../../../services/admin/attorneys/attorneysService";
import { createAdminActivityLog } from "../../../repositories/admin/adminActivityRepository";
import { AdminAction } from "@/types/admin";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET attorneys list request
 */
export async function handleListAttorneys(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || undefined;
    const sortBy = searchParams.get("sortBy") as
      | "name"
      | "email"
      | "firmName"
      | "specialty"
      | "createdAt"
      | "tokenBalance"
      | "totalSpent"
      | "purchaseCount"
      | undefined;
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const result = await listAttorneys({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch attorneys");
  }
}

/**
 * Handle GET attorney by ID request
 */
export async function handleGetAttorney(request: NextRequest, id: string) {
  try {
    await requireAdminAuth(request);
    const attorney = await getAttorney(id);
    return successResponse({ attorney });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch attorney");
  }
}

/**
 * Handle PUT update attorney request
 */
export async function handleUpdateAttorney(request: NextRequest, id: string) {
  try {
    const admin = await requireAdminAuth(request);
    const body = await request.json();

    const attorney = await updateAttorneyDetails(id, body);

    // Log admin action
    await createAdminActivityLog({
      adminId: admin.id,
      action: "USER_UPDATED" as AdminAction,
      targetType: "User",
      targetId: id,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      details: { role: "ATTORNEY", updatedFields: Object.keys(body) },
    });

    return successResponse({ attorney });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to update attorney");
  }
}

/**
 * Handle DELETE attorney request (soft delete)
 */
export async function handleDeleteAttorney(request: NextRequest, id: string) {
  try {
    const admin = await requireAdminAuth(request);

    await deleteAttorneyById(id);

    // Log admin action
    await createAdminActivityLog({
      adminId: admin.id,
      action: "USER_DELETED" as AdminAction,
      targetType: "User",
      targetId: id,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      details: { role: "ATTORNEY" },
    });

    return successResponse({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to delete attorney");
  }
}
