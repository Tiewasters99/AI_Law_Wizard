// Standardized response helpers for API endpoints

import { NextResponse } from "next/server";
import { AppError, RateLimitError } from "./errors";

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  options?: { headers?: HeadersInit }
): NextResponse {
  return NextResponse.json(data, { status, headers: options?.headers });
}

/**
 * Create an error response from an AppError or generic error
 */
export function errorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): NextResponse {
  if (error instanceof AppError) {
    const body: any = {
      error: error.message,
      code: error.code,
    };

    // Include additional properties for specific error types
    if (error instanceof RateLimitError && error.resetTime) {
      body.resetTime = error.resetTime;
    }

    return NextResponse.json(body, { status: error.statusCode });
  }

  // Handle unknown errors
  console.error("Unhandled error:", error);
  return NextResponse.json(
    {
      error: defaultMessage,
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  message: string,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code: code || "VALIDATION_ERROR",
    },
    { status: 400 }
  );
}

/**
 * Create an authentication error response
 */
export function authenticationErrorResponse(
  message: string = "Authentication required"
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code: "AUTHENTICATION_ERROR",
    },
    { status: 401 }
  );
}

/**
 * Create a not found error response
 */
export function notFoundErrorResponse(
  resource: string = "Resource"
): NextResponse {
  return NextResponse.json(
    {
      error: `${resource} not found`,
      code: "NOT_FOUND",
    },
    { status: 404 }
  );
}

