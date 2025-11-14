// Service for OneDrive authentication

export interface OneDriveAuthUrlResponse {
  success: boolean;
  authUrl: string;
}

/**
 * Generate OneDrive authentication URL
 */
export function generateOneDriveAuthUrl(): OneDriveAuthUrlResponse {
  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
  const redirectUri =
    process.env.NEXT_PUBLIC_REDIRECT_URI ||
    "http://localhost:3000/api/auth/onedrive/callback";
  const scope =
    "https://graph.microsoft.com/Files.ReadWrite.All https://graph.microsoft.com/User.Read";

  if (!clientId) {
    throw new Error("Azure Client ID not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scope,
    response_mode: "query",
  });

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;

  return {
    success: true,
    authUrl,
  };
}

