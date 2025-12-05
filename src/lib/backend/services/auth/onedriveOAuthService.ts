// Service for OneDrive OAuth callback handling

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface OAuthCallbackParams {
  code: string | null;
  error: string | null;
  errorDescription: string | null;
}

export interface OAuthResult {
  redirectUrl: string;
  cookies?: {
    name: string;
    value: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
      maxAge: number;
    };
  }[];
}

/**
 * Handle OAuth callback and exchange code for tokens
 */
export async function handleOneDriveOAuthCallback(
  params: OAuthCallbackParams,
  state?: string | null
): Promise<OAuthResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Determine redirect URL based on state (role)
  const isClient = state === "client";
  const successUrl = isClient
    ? `${baseUrl}/client/integrations?success=true`
    : `${baseUrl}/attorney/integrations?success=true`;
  const errorUrl = isClient
    ? `${baseUrl}/client/integrations?error=`
    : `${baseUrl}/attorney/integrations?error=`;

  // Handle OAuth errors
  if (params.error) {
    const errorMessage = params.errorDescription || params.error;
    return {
      redirectUrl: `${errorUrl}${encodeURIComponent(errorMessage)}`,
    };
  }

  // Handle missing authorization code
  if (!params.code) {
    return {
      redirectUrl: `${errorUrl}${encodeURIComponent("No authorization code received")}`,
    };
  }

  // Validate configuration
  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const redirectUri =
    process.env.NEXT_PUBLIC_REDIRECT_URI ||
    `${baseUrl}/api/auth/onedrive/callback`;

  if (!clientId || !clientSecret) {
    return {
      redirectUrl: `${errorUrl}${encodeURIComponent("Azure configuration missing")}`,
    };
  }

  // Exchange authorization code for access token
  const tokenEndpoint =
    "https://login.microsoftonline.com/common/oauth2/v2.0/token";

  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: params.code,
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
        code: params.code ? "present" : "missing",
      });
      return {
        redirectUrl: `${errorUrl}${encodeURIComponent(`Token exchange failed: ${response.status} - ${error}`)}`,
      };
    }

    const tokenData: TokenResponse = await response.json();

    // Prepare cookies to set
    const cookies = [
      {
        name: "microsoft_access_token",
        value: tokenData.access_token,
        options: {
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          maxAge: tokenData.expires_in,
        },
      },
    ];

    if (tokenData.refresh_token) {
      cookies.push({
        name: "microsoft_refresh_token",
        value: tokenData.refresh_token,
        options: {
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          maxAge: 30 * 24 * 60 * 60, // 30 days
        },
      });
    }

    cookies.push({
      name: "microsoft_token_expiry",
      value: (Date.now() + tokenData.expires_in * 1000).toString(),
      options: {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: tokenData.expires_in,
      },
    });

    return {
      redirectUrl: successUrl,
      cookies,
    };
  } catch (error) {
    console.error("OAuth callback error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";
    return {
      redirectUrl: `${errorUrl}${encodeURIComponent(errorMessage)}`,
    };
  }
}
