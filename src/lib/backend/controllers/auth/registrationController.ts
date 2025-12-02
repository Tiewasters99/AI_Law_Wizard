// Controller for user registration

import { NextRequest } from "next/server";
import { registerUser } from "@/lib/backend/services/auth/registrationService";
import { successResponse, errorResponse } from "@/lib/backend/utils/response";
import { AppError } from "@/lib/backend/utils/errors";

/**
 * Handle POST registration request
 */
export async function handleRegister(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    const user = await registerUser({
      email,
      password,
      name,
      ...(role && { role }), // Only include role if provided
    });

    return successResponse(
      {
        success: true,
        message: "User registered successfully",
        user,
      },
      201
    );
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(error, "An error occurred during registration");
  }
}
