import { OneDriveFileInfo, OneDriveDownloadResponse } from "@/types/onedrive";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface GraphError {
  error: {
    code: string;
    message: string;
    innerError?: {
      code: string;
      message: string;
    };
  };
}

export class OneDriveService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private cookies: any) {
    this.loadTokensFromCookies();
  }

  private loadTokensFromCookies() {
    try {
      const accessToken = this.cookies.get("microsoft_access_token")?.value;
      const refreshToken = this.cookies.get("microsoft_refresh_token")?.value;
      const expiry = this.cookies.get("microsoft_token_expiry")?.value;

      if (accessToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken || null;
        this.tokenExpiry = expiry ? parseInt(expiry) : 0;
      }
    } catch (error) {
      console.error("Failed to load tokens from cookies:", error);
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Try to refresh token if we have one
    if (this.refreshToken) {
      try {
        await this.refreshAccessToken();
        return this.accessToken!;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        throw new Error("Authentication expired. Please sign in again.");
      }
    }

    throw new Error(
      "No valid access token available. Please authenticate with Microsoft."
    );
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Azure configuration missing");
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
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        scope:
          "https://graph.microsoft.com/Files.ReadWrite.All https://graph.microsoft.com/User.Read",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${error}`);
    }

    const tokenData: TokenResponse = await response.json();

    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token || this.refreshToken;
    this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `https://graph.microsoft.com/v1.0${endpoint}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      let errorMessage = `Graph API error: ${response.status}`;

      try {
        const errorData: GraphError = await response.json();
        errorMessage = errorData.error.message;
        if (errorData.error.innerError) {
          errorMessage += ` (${errorData.error.innerError.message})`;
        }
      } catch {
        errorMessage += ` ${response.statusText}`;
      }

      // Handle specific error cases
      if (response.status === 401) {
        try {
          await this.refreshAccessToken();
          return this.makeRequest(endpoint, options);
        } catch (_refreshError) {
          throw new Error("Authentication expired. Please sign in again.");
        }
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async makeFileRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `File request failed: ${response.status} ${response.statusText}`
      );
    }

    return response;
  }

  async listFiles(
    folderId: string = "root",
    options: {
      pageSize?: number;
      search?: string;
      orderBy?: string;
    } = {}
  ): Promise<{
    success: boolean;
    files?: OneDriveFileInfo[];
    total?: number;
    error?: string;
  }> {
    try {
      let endpoint = "";

      if (options.search) {
        endpoint = `/me/drive/root/search(q='${encodeURIComponent(options.search)}')`;
      } else if (folderId === "root") {
        endpoint = "/me/drive/root/children";
      } else {
        endpoint = `/me/drive/items/${folderId}/children`;
      }

      const params = new URLSearchParams({
        $top: (options.pageSize || 100).toString(),
        $select:
          "id,name,size,file,folder,lastModifiedDateTime,createdDateTime,@microsoft.graph.downloadUrl",
        $orderby:
          options.orderBy === "name"
            ? "name"
            : options.orderBy === "size"
              ? "size desc"
              : "lastModifiedDateTime desc",
      });

      const data = await this.makeRequest(`${endpoint}?${params.toString()}`);
      const files = data.value.map(this.convertGraphFileToFileInfo);

      return { success: true, files, total: files.length };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list files",
      };
    }
  }

  async downloadFile(fileId: string): Promise<OneDriveDownloadResponse> {
    try {
      // Get file metadata first
      const fileMetadata = await this.makeRequest(
        `/me/drive/items/${fileId}?$select=id,name,size,file,folder,@microsoft.graph.downloadUrl`
      );

      if (fileMetadata.folder) {
        return { success: false, error: "Cannot download a folder" };
      }

      // Check file size limit (50MB for embedding processing)
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (fileMetadata.size > maxFileSize) {
        return {
          success: false,
          error: `File "${fileMetadata.name}" is too large (${(fileMetadata.size / 1024 / 1024).toFixed(2)}MB). Maximum file size for processing is 50MB.`,
        };
      }

      // Try to download using the direct content endpoint
      try {
        const contentEndpoint = `/me/drive/items/${fileId}/content`;
        const contentResponse = await this.makeFileRequest(
          `https://graph.microsoft.com/v1.0${contentEndpoint}`
        );

        if (contentResponse.ok) {
          const fileBuffer = await contentResponse.arrayBuffer();
          const base64Content = Buffer.from(fileBuffer).toString("base64");

          return {
            success: true,
            file: {
              id: fileMetadata.id,
              name: fileMetadata.name,
              size: fileMetadata.size,
              type: fileMetadata.file.mimeType,
              content: base64Content,
              downloadUrl: `https://graph.microsoft.com/v1.0${contentEndpoint}`,
            },
          };
        }
      } catch (contentError) {
        console.log("Direct content access failed:", contentError);
      }

      // Fallback: Try using the download URL if available
      const downloadUrl = fileMetadata["@microsoft.graph.downloadUrl"];
      if (downloadUrl) {
        try {
          const fileBuffer = await this.makeFileRequest(downloadUrl).then(r =>
            r.arrayBuffer()
          );
          const base64Content = Buffer.from(fileBuffer).toString("base64");

          return {
            success: true,
            file: {
              id: fileMetadata.id,
              name: fileMetadata.name,
              size: fileMetadata.size,
              type: fileMetadata.file.mimeType,
              content: base64Content,
              downloadUrl: downloadUrl,
            },
          };
        } catch (downloadError) {
          console.log("Download URL method failed:", downloadError);
        }
      }

      return {
        success: false,
        error: `Unable to download file "${fileMetadata.name}". Please check file permissions and try again.`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to download file",
      };
    }
  }

  private convertGraphFileToFileInfo(graphFile: any): OneDriveFileInfo {
    return {
      id: graphFile.id,
      name: graphFile.name,
      size: graphFile.size || 0,
      type: graphFile.file?.mimeType || "folder",
      isFolder: graphFile.folder !== undefined,
      downloadUrl: graphFile["@microsoft.graph.downloadUrl"],
      lastModified: graphFile.lastModifiedDateTime,
      created: graphFile.createdDateTime,
      childCount: graphFile.folder?.childCount || 0,
    };
  }
}
