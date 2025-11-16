// Controller for admin user management (creation)

import { NextRequest } from "next/server";
import {
  requireAdminAuth,
  getClientIP,
  getUserAgent,
} from "../../../utils/adminAuth";
import { createUserAsAdmin } from "../../../services/admin/users/usersService";
import { createAdminActivityLog } from "../../../repositories/admin/adminActivityRepository";
import { AdminAction } from "@/types/admin";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle POST create user request
 */
export async function handleCreateUser(request: NextRequest) {
  try {
    const admin = await requireAdminAuth(request);
    const body = await request.json();

    const user = await createUserAsAdmin(body);

    // Log admin action
    await createAdminActivityLog({
      adminId: admin.id,
      action: "USER_CREATED" as AdminAction,
      targetType: "User",
      targetId: user.id,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      details: {
        email: user.email,
        role: user.role,
      },
    });

    return successResponse({ user }, 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to create user");
  }
}


