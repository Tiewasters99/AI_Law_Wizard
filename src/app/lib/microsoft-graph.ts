// Microsoft Graph API authentication and request helpers

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

interface GraphError {
  error: {
    code: string
    message: string
    innerError?: {
      code: string
      message: string
    }
  }
}

class MicrosoftGraphClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    // Check if we have stored tokens in cookies (client-side)
    if (typeof window !== 'undefined') {
      this.loadTokensFromCookies()
    }
  }

  private loadTokensFromCookies() {
    try {
      // Read tokens from cookies
      const accessToken = this.getCookie('microsoft_access_token')
      const refreshToken = this.getCookie('microsoft_refresh_token')
      const expiry = this.getCookie('microsoft_token_expiry')

      if (accessToken) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken || null
        this.tokenExpiry = expiry ? parseInt(expiry) : 0
      }
    } catch (error) {
      console.error('Failed to load tokens from cookies:', error)
    }
  }

  private saveTokensToCookies(accessToken: string, refreshToken?: string, expiresIn?: number) {
    try {
      const expiry = expiresIn ? Date.now() + (expiresIn * 1000) : this.tokenExpiry
      
      // Set cookies
      document.cookie = `microsoft_access_token=${accessToken}; path=/; max-age=${expiresIn || 3600}; SameSite=Lax`
      
      if (refreshToken) {
        document.cookie = `microsoft_refresh_token=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
      }
      
      document.cookie = `microsoft_token_expiry=${expiry}; path=/; max-age=${expiresIn || 3600}; SameSite=Lax`
    } catch (error) {
      console.error('Failed to save tokens to cookies:', error)
    }
  }

  private clearTokensFromCookies() {
    try {
      // Clear cookies by setting them to expire in the past
      document.cookie = 'microsoft_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'microsoft_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'microsoft_token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } catch (error) {
      console.error('Failed to clear tokens from cookies:', error)
    }
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  // Generate OAuth URL for user authentication
  generateAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
    const scope = 'https://graph.microsoft.com/Files.ReadWrite'
    
    if (!clientId) {
      throw new Error('Azure Client ID not configured. Please set NEXT_PUBLIC_AZURE_CLIENT_ID in your environment variables.')
    }

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scope,
      response_mode: 'query'
    })

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<void> {
    const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
    const clientSecret = process.env.AZURE_CLIENT_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'

    if (!clientId || !clientSecret) {
      throw new Error('Azure configuration missing. Please set NEXT_PUBLIC_AZURE_CLIENT_ID and AZURE_CLIENT_SECRET.')
    }

    const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/Files.ReadWrite'
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${response.status} ${error}`)
    }

    const tokenData: TokenResponse = await response.json()
    
    this.accessToken = tokenData.access_token
    this.refreshToken = tokenData.refresh_token
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000)

    // Save tokens to storage
    this.saveTokensToCookies(tokenData.access_token, tokenData.refresh_token, tokenData.expires_in)
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    // Try to refresh token if we have one
    if (this.refreshToken) {
      try {
        await this.refreshAccessToken()
        return this.accessToken!
      } catch (error) {
        console.error('Failed to refresh token:', error)
        // Clear invalid tokens
        this.clearTokensFromCookies()
        this.accessToken = null
        this.refreshToken = null
      }
    }

    throw new Error('No valid access token available. Please authenticate with Microsoft.')
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
    const clientSecret = process.env.AZURE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Azure configuration missing')
    }

    const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        scope: 'https://graph.microsoft.com/Files.ReadWrite'
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token refresh failed: ${response.status} ${error}`)
    }

    const tokenData: TokenResponse = await response.json()
    
    this.accessToken = tokenData.access_token
    this.refreshToken = tokenData.refresh_token || this.refreshToken
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000)

    // Save updated tokens to storage
    this.saveTokensToCookies(tokenData.access_token, tokenData.refresh_token, tokenData.expires_in)
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // Re-load tokens from cookies in case they were set by the OAuth callback
    this.loadTokensFromCookies()
    return !!(this.accessToken && Date.now() < this.tokenExpiry)
  }

  // Logout user
  logout(): void {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiry = 0
    this.clearTokensFromCookies()
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = `Graph API error: ${response.status}`
      
      try {
        const errorData: GraphError = await response.json()
        errorMessage = errorData.error.message
        if (errorData.error.innerError) {
          errorMessage += ` (${errorData.error.innerError.message})`
        }
      } catch {
        // If we can't parse the error, use the status text
        errorMessage += ` ${response.statusText}`
      }

      // Handle specific error cases
      if (response.status === 401) {
        // Token expired, try to refresh
        try {
          await this.refreshAccessToken()
          // Retry the request once
          return this.makeRequest(endpoint, options)
        } catch (refreshError) {
          // If refresh fails, clear tokens and throw auth error
          this.logout()
          throw new Error('Authentication expired. Please sign in again.')
        }
      }

      throw new Error(errorMessage)
    }

    return response.json()
  }

  async makeFileRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`File request failed: ${response.status} ${response.statusText}`)
    }

    return response
  }

  // Helper methods for common OneDrive operations
  async listFiles(folderId: string = 'root', options: {
    pageSize?: number
    search?: string
    orderBy?: string
  } = {}) {
    let endpoint = ''
    
    if (options.search) {
      endpoint = `/me/drive/root/search(q='${encodeURIComponent(options.search)}')`
    } else if (folderId === 'root') {
      endpoint = '/me/drive/root/children'
    } else {
      endpoint = `/me/drive/items/${folderId}/children`
    }

    const params = new URLSearchParams({
      '$top': (options.pageSize || 100).toString(),
      '$select': 'id,name,size,file,folder,lastModifiedDateTime,createdDateTime,@microsoft.graph.downloadUrl',
      '$orderby': options.orderBy === 'name' ? 'name' : options.orderBy === 'size' ? 'size desc' : 'lastModifiedDateTime desc'
    })

    return this.makeRequest(`${endpoint}?${params.toString()}`)
  }

  async getFileMetadata(fileId: string) {
    return this.makeRequest(`/me/drive/items/${fileId}?$select=id,name,size,file,folder,@microsoft.graph.downloadUrl`)
  }

  async downloadFile(downloadUrl: string): Promise<ArrayBuffer> {
    const response = await this.makeFileRequest(downloadUrl)
    return response.arrayBuffer()
  }

  async uploadFile(fileName: string, fileContent: ArrayBuffer, folderId: string = 'root', contentType: string = 'application/octet-stream') {
    let endpoint = ''
    if (folderId === 'root') {
      endpoint = `/me/drive/root:/${encodeURIComponent(fileName)}:/content`
    } else {
      endpoint = `/me/drive/items/${folderId}:/${encodeURIComponent(fileName)}:/content`
    }

    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Content-Type': contentType,
      },
      body: fileContent,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Upload failed: ${response.status} ${error}`)
    }

    return response.json()
  }
}

// Export a singleton instance
export const graphClient = new MicrosoftGraphClient()


