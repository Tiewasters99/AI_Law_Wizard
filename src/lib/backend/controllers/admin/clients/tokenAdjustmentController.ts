// Controller for admin client token adjustments

import { NextRequest } from "next/server";
import {
  requireAdminAuth,
  getClientIP,
  getUserAgent,
} from "../../../utils/adminAuth";
import { adjustClientTokenBalance } from "../../../services/admin/clients/tokenAdjustmentService";
import { createAdminActivityLog } from "../../../repositories/admin/adminActivityRepository";
import { AdminAction } from "@/types/admin";
import { successResponse, errorResponse } from "../../../utils/response";
import { AppError } from "../../../utils/errors";

/**
 * Handle PATCH client token adjustment request
 */
export async function handleAdjustClientTokens(
  request: NextRequest,
  userId: string
) {
  try {
    const admin = await requireAdminAuth(request);
    const body = await request.json();

    const { amount, reason } = body;

    if (typeof amount !== "number") {
      return errorResponse(
        new AppError("Amount must be a number", 400, "VALIDATION_ERROR")
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return errorResponse(
        new AppError("Reason is required", 400, "VALIDATION_ERROR")
      );
    }

    const result = await adjustClientTokenBalance(
      userId,
      amount,
      reason,
      admin.id
    );

    // Log admin action
    await createAdminActivityLog({
      adminId: admin.id,
      action: "TOKEN_ADJUSTMENT" as AdminAction,
      targetType: "User",
      targetId: userId,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      details: {
        role: "CUSTOMER",
        adjustment: amount,
        previousBalance: result.previousBalance,
        newBalance: result.newBalance,
        reason,
      },
    });

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "Failed to adjust client tokens");
  }
}
