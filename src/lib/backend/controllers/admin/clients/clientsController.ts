// Controller for admin clients API endpoints

import { NextRequest } from "next/server";
import {
  requireAdminAuth,
  getClientIP,
  getUserAgent,
} from "../../../utils/adminAuth";
import {
  listClients,
  getClient,
  updateClientDetails,
  deleteClientById,
} from "../../../services/admin/clients/clientsService";
import { createAdminActivityLog } from "../../../repositories/admin/adminActivityRepository";
import { AdminAction } from "@/types/admin";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle GET clients list request
 */
export async function handleListClients(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || undefined;
    const sortBy = searchParams.get("sortBy") as
      | "name"
      | "email"
      | "company"
      | "createdAt"
      | "tokenBalance"
      | "totalSpent"
      | "purchaseCount"
      | undefined;
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const result = await listClients({
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
    return errorResponse(error, "Failed to fetch clients");
  }
}

/**
 * Handle GET client by ID request
 */
export async function handleGetClient(request: NextRequest, id: string) {
  try {
    await requireAdminAuth(request);
    const client = await getClient(id);
    return successResponse({ client });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to fetch client");
  }
}

/**
 * Handle PUT update client request
 */
export async function handleUpdateClient(request: NextRequest, id: string) {
  try {
    const admin = await requireAdminAuth(request);
    const body = await request.json();

    const client = await updateClientDetails(id, body);

    // Log admin action
    await createAdminActivityLog({
      adminId: admin.id,
      action: "USER_UPDATED" as AdminAction,
      targetType: "User",
      targetId: id,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      details: { role: "CUSTOMER", updatedFields: Object.keys(body) },
    });

    return successResponse({ client });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to update client");
  }
}

/**
 * Handle DELETE client request (soft delete)
 */
export async function handleDeleteClient(request: NextRequest, id: string) {
  try {
    const admin = await requireAdminAuth(request);

    await deleteClientById(id);

    // Log admin action
    await createAdminActivityLog({
      adminId: admin.id,
      action: "USER_DELETED" as AdminAction,
      targetType: "User",
      targetId: id,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      details: { role: "CUSTOMER" },
    });

    return successResponse({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to delete client");
  }
}
