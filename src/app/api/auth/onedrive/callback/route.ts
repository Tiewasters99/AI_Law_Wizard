import { NextRequest, NextResponse } from "next/server";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/attorney/integrations?error=${encodeURIComponent(errorDescription || error)}`
      );
    }

    // Handle missing authorization code
    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/attorney/integrations?error=${encodeURIComponent("No authorization code received")}`
      );
    }

    // Exchange authorization code for access token
    const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const redirectUri =
      process.env.NEXT_PUBLIC_REDIRECT_URI ||
      "http://localhost:3000/api/auth/onedrive/callback";

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/attorney/integrations?error=${encodeURIComponent("Azure configuration missing")}`
      );
    }

    const tokenEndpoint =
      "https://login.microsoftonline.com/common/oauth2/v2.0/token";

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        scope:
          "https://graph.microsoft.com/Files.ReadWrite.All https://graph.microsoft.com/User.Read",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Token exchange failed:", {
        status: response.status,
        statusText: response.statusText,
        error: error,
        clientId: clientId ? "configured" : "missing",
        clientSecret: clientSecret ? "configured" : "missing",
        redirectUri: redirectUri,
        code: code ? "present" : "missing",
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/attorney/integrations?error=${encodeURIComponent(`Token exchange failed: ${response.status} - ${error}`)}`
      );
    }

    const tokenData: TokenResponse = await response.json();

    // Create a response that sets the tokens in cookies
    const redirectResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/attorney/integrations?success=true`
    );

    // Set tokens in secure cookies
    redirectResponse.cookies.set(
      "microsoft_access_token",
      tokenData.access_token,
      {
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokenData.expires_in,
      }
    );

    if (tokenData.refresh_token) {
      redirectResponse.cookies.set(
        "microsoft_refresh_token",
        tokenData.refresh_token,
        {
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60, // 30 days
        }
      );
    }

    redirectResponse.cookies.set(
      "microsoft_token_expiry",
      (Date.now() + tokenData.expires_in * 1000).toString(),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokenData.expires_in,
      }
    );

    return redirectResponse;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/attorney/integrations?error=${encodeURIComponent(error instanceof Error ? error.message : "Authentication failed")}`
    );
  }
}
