// Controller for attorney wallet API endpoints

import { NextRequest } from "next/server";
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
import {
  getWallet,
  consumeTokens,
} from "../../../services/attorney/wallet/walletService";
import { successResponse, errorResponse } from "../../../utils/response";
import { validateRequired, validateRange } from "../../../utils/validation";

/**
 * Handle GET request - Get wallet
 */
export async function handleGetWallet(userId: string): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);
    const wallet = await getWallet(userId);
    return successResponse({ wallet });
  } catch (error) {
    return errorResponse(error, "Failed to fetch wallet");
  }
}

/**
 * Handle POST request - Consume tokens
 */
export async function handleConsumeTokens(
  request: NextRequest,
  userId: string
): Promise<Response> {
  try {
    await verifyAttorneyAccess(userId);

    const body = await request.json();
    const { action, amount, description } = body;

    if (action !== "consume") {
      return errorResponse(
        new Error("Invalid action"),
        "Only 'consume' action is supported"
      );
    }

    validateRequired(amount, "Amount");
    validateRange(amount, 1, 1000000, "Amount");

    const wallet = await consumeTokens(userId, amount, description);

    return successResponse({
      wallet,
      success: true,
    });
  } catch (error) {
    return errorResponse(error, "Failed to process transaction");
  }
}

