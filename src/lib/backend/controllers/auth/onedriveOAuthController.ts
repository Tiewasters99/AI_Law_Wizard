// Controller for OneDrive OAuth callback

import { NextRequest, NextResponse } from "next/server";
import { handleOneDriveOAuthCallback } from "@/lib/backend/services/auth/onedriveOAuthService";

/**
 * Handle GET OneDrive OAuth callback request
 */
export async function handleOneDriveCallback(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const result = await handleOneDriveOAuthCallback({
    code,
    error,
    errorDescription,
  });

  // Create redirect response
  const redirectResponse = NextResponse.redirect(result.redirectUrl);

  // Set cookies if provided
  if (result.cookies) {
    result.cookies.forEach((cookie: {
      name: string;
      value: string;
      options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "lax" | "strict" | "none";
        maxAge: number;
      };
    }) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options);
    });
  }

  return redirectResponse;
}

