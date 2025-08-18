import { NextRequest, NextResponse } from 'next/server'

interface OneDriveFileInfo {
  id: string
  name: string
  size: number
  type: string
  isFolder: boolean
  downloadUrl?: string
  lastModified: string
  created: string
  childCount: number
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

// Server-side Graph API client
class ServerGraphClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry: number = 0

  constructor(cookies: any) {
    this.loadTokensFromCookies(cookies)
  }

  private loadTokensFromCookies(cookies: any) {
    try {
      const accessToken = cookies.get('microsoft_access_token')?.value
      const refreshToken = cookies.get('microsoft_refresh_token')?.value
      const expiry = cookies.get('microsoft_token_expiry')?.value

      if (accessToken) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken || null
        this.tokenExpiry = expiry ? parseInt(expiry) : 0
      }
    } catch (error) {
      console.error('Failed to load tokens from cookies:', error)
    }
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
        throw new Error('Authentication expired. Please sign in again.')
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
        const errorData = await response.json()
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

// Convert Microsoft Graph file object to our format
function convertGraphFileToFileInfo(graphFile: any): OneDriveFileInfo {
  return {
    id: graphFile.id,
    name: graphFile.name,
    size: graphFile.size || 0,
    type: graphFile.file?.mimeType || 'folder',
    isFolder: graphFile.folder !== undefined,
    downloadUrl: graphFile['@microsoft.graph.downloadUrl'],
    lastModified: graphFile.lastModifiedDateTime,
    created: graphFile.createdDateTime,
    childCount: graphFile.folder?.childCount || 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId') || 'root'
    const pageSize = parseInt(searchParams.get('pageSize') || '100')
    const search = searchParams.get('search')
    const orderBy = searchParams.get('orderBy') || 'name'

    // Create server-side Graph client
    const graphClient = new ServerGraphClient(request.cookies)

    const data = await graphClient.listFiles(folderId, {
      pageSize,
      search: search || undefined,
      orderBy
    })
    
    const files = data.value.map(convertGraphFileToFileInfo)

    return NextResponse.json({
      files,
      total: files.length
    })
  } catch (error) {
    console.error('OneDrive API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId } = body

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Create server-side Graph client
    const graphClient = new ServerGraphClient(request.cookies)

    // Get file metadata first
    const fileMetadata = await graphClient.getFileMetadata(fileId)
    
    if (fileMetadata.folder) {
      return NextResponse.json(
        { error: 'Cannot download a folder' },
        { status: 400 }
      )
    }

    // Get download URL
    const downloadUrl = fileMetadata['@microsoft.graph.downloadUrl']
    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Download URL not available' },
        { status: 400 }
      )
    }

    // Download the file content
    const fileBuffer = await graphClient.downloadFile(downloadUrl)
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))

    return NextResponse.json({
      file: {
        id: fileMetadata.id,
        name: fileMetadata.name,
        size: fileMetadata.size,
        type: fileMetadata.file.mimeType,
        content: base64Content,
        downloadUrl: downloadUrl
      }
    })
  } catch (error) {
    console.error('OneDrive download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download file' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderId = formData.get('folderId') as string || 'root'

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Check file size limit
    const maxFileSize = parseInt(process.env.ONEDRIVE_MAX_FILE_SIZE || '104857600') // 100MB default
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${formatFileSize(maxFileSize)}` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()

    // Create server-side Graph client
    const graphClient = new ServerGraphClient(request.cookies)

    // Upload to OneDrive
    const uploadedFile = await graphClient.uploadFile(
      file.name,
      fileBuffer,
      folderId,
      file.type
    )

    const fileInfo = convertGraphFileToFileInfo(uploadedFile)

    return NextResponse.json({
      file: fileInfo
    })
  } catch (error) {
    console.error('OneDrive upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
