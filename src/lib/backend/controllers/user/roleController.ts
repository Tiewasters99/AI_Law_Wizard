// Controller for role switching and profile creation

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import {
  checkRoleSwitchEligibility,
  switchUserRole,
  createRoleProfile,
} from "../../services/user/roleService";
import { findUserWithProfiles } from "../../repositories/user/roleRepository";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthenticationError, ValidationError, ConflictError } from "../../utils/errors";

/**
 * Handle check role switch eligibility request
 */
export async function handleCheckRoleSwitch(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new AuthenticationError("Unauthorized"));
    }

    // 2. Authorization (any authenticated user can check eligibility)
    // No role check needed

    // 3. Input Validation - get targetRole from query params
    const { searchParams } = new URL(request.url);
    const targetRole = searchParams.get("targetRole");
    if (!targetRole || !["CUSTOMER", "ATTORNEY"].includes(targetRole)) {
      return errorResponse(
        new ValidationError("Valid target role is required")
      );
    }

    // 4. Service Call
    const eligibility = await checkRoleSwitchEligibility(
      session.user.id,
      targetRole as "CUSTOMER" | "ATTORNEY"
    );

    // 5. Success Response
    return successResponse(eligibility);
  } catch (error) {
    // 6. Error Handling
    return errorResponse(error, "Failed to check role switch eligibility");
  }
}

/**
 * Handle switch role request
 */
export async function handleSwitchRole(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new AuthenticationError("Unauthorized"));
    }

    // 2. Authorization (any authenticated user can switch their own role)
    // No role check needed

    // 3. Input Validation
    const body = await request.json();
    if (!body.role || !["CUSTOMER", "ATTORNEY"].includes(body.role)) {
      return errorResponse(new ValidationError("Valid role is required"));
    }

    // 4. Service Call
    const updated = await switchUserRole(
      session.user.id,
      body.role,
      body.profileData
    );

    // 5. Success Response
    return successResponse({ role: updated.role });
  } catch (error) {
    // 6. Error Handling
    return errorResponse(error, "Failed to switch role");
  }
}

/**
 * Handle create profile and set role request (for role-selection page)
 */
export async function handleCreateProfile(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new AuthenticationError("Unauthorized"));
    }

    // 2. Authorization - Check if user already has a role set
    // This endpoint is only for users without a role (role-selection page)
    const user = await findUserWithProfiles(session.user.id);
    if (!user) {
      return errorResponse(new AuthenticationError("User not found"));
    }

    // Prevent users with existing roles from using this endpoint
    if (user.role !== null && user.role !== undefined) {
      return errorResponse(
        new ConflictError(
          "User already has a role set. Cannot create profile through this endpoint."
        )
      );
    }

    // 3. Input Validation
    const body = await request.json();
    if (!body.role || !["CUSTOMER", "ATTORNEY"].includes(body.role)) {
      return errorResponse(new ValidationError("Valid role is required"));
    }

    if (!body.profileData) {
      return errorResponse(new ValidationError("Profile data is required"));
    }

    // 4. Service Call
    const result = await createRoleProfile(
      session.user.id,
      body.role,
      body.profileData
    );

    // 5. Success Response
    return successResponse({ role: result.role, profile: result.profile });
  } catch (error) {
    // 6. Error Handling
    return errorResponse(error, "Failed to create profile");
  }
}



