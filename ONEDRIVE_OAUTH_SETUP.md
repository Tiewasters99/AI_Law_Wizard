# OneDrive OAuth Integration Setup Guide

This guide will help you set up the OneDrive integration with OAuth authentication, allowing any user to sign in with their Microsoft account.

## Prerequisites

- Microsoft 365 account or personal Microsoft account
- Azure AD tenant (can be the same as your Microsoft 365 tenant)
- Node.js and npm installed

## Step 1: Register an Azure AD Application

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the following details:
   - **Name**: AI Wizard OneDrive Integration
   - **Supported account types**: Choose "Accounts in any organizational directory and personal Microsoft accounts" (for multi-tenant)
   - **Redirect URI**: `http://localhost:3000/api/auth/callback` (for development)
5. Click **Register**

## Step 2: Configure API Permissions

1. In your registered app, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add the following permissions:
   - `Files.Read` - Read user files
   - `Files.ReadWrite` - Read and write user files
   - `Files.Read.All` - Read all files that user can access
   - `Files.ReadWrite.All` - Read and write all files that user can access
6. Click **Add permissions**
7. Click **Grant admin consent** (if you're an admin)

## Step 3: Create a Client Secret

1. In your registered app, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and choose an expiration
4. Click **Add**
5. **Important**: Copy the secret value immediately (you won't be able to see it again)

## Step 4: Configure Authentication

1. In your registered app, go to **Authentication**
2. Under **Platform configurations**, click **Add a platform**
3. Select **Web**
4. Add the following redirect URIs:
   - `http://localhost:3000/api/auth/callback` (for development)
   - `https://yourdomain.com/api/auth/callback` (for production)
5. Under **Implicit grant and hybrid flows**, check **Access tokens** and **ID tokens**
6. Click **Configure**

## Step 5: Get Application Details

From your registered app, note down:
- **Application (client) ID**
- **Client secret** (from step 3)

## Step 6: Configure Environment Variables

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Update the `.env.local` file with your Azure AD details:
   ```env
   # Azure AD Configuration for OneDrive Integration (OAuth Flow)
   NEXT_PUBLIC_AZURE_CLIENT_ID=your_application_client_id_here
   AZURE_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # OneDrive Configuration
   ONEDRIVE_ENABLED=true
   ONEDRIVE_MAX_FILE_SIZE=104857600  # 100MB in bytes
   ```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the OneDrive interface in your application
3. Click "Sign in with Microsoft"
4. Complete the OAuth flow
5. Test file operations (browse, upload, download)

## How the OAuth Flow Works

1. **User clicks "Sign in with Microsoft"**
   - The app generates an OAuth URL with your client ID
   - User is redirected to Microsoft's login page

2. **User authenticates with Microsoft**
   - User signs in with their Microsoft account
   - Microsoft asks for permission to access OneDrive files
   - User grants permission

3. **Microsoft redirects back to your app**
   - Microsoft sends an authorization code to your callback URL
   - Your app exchanges the code for access and refresh tokens
   - Tokens are stored securely in the browser's localStorage

4. **User can now access OneDrive**
   - The app uses the access token to make API calls
   - When the token expires, it automatically refreshes using the refresh token
   - User can browse, upload, and download files

## Production Deployment

For production, update your environment variables:

```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your_production_client_id
AZURE_CLIENT_SECRET=your_production_client_secret
NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.com/api/auth/callback
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

And add the production redirect URI to your Azure AD app registration.

## Security Features

- **Token Storage**: Access tokens are stored securely in localStorage
- **Automatic Refresh**: Tokens are automatically refreshed when they expire
- **Secure Logout**: Users can sign out to clear all stored tokens
- **Error Handling**: Proper error messages for authentication failures
- **Scope Limitation**: Only requests necessary file permissions

## Troubleshooting

### Common Issues

1. **"Invalid client" error**
   - Check that your client ID is correct
   - Ensure the client secret is properly set

2. **"Redirect URI mismatch" error**
   - Verify the redirect URI in Azure AD matches your environment variable
   - Check for trailing slashes or protocol mismatches

3. **"Insufficient privileges" error**
   - Make sure you've granted the correct API permissions
   - Check that admin consent has been granted

4. **"Token expired" error**
   - This should be handled automatically by the refresh flow
   - If it persists, the user may need to sign in again

### Debug Mode

Enable debug logging by checking the browser console for authentication flow messages.

## API Endpoints

The OAuth integration provides these endpoints:

- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/onedrive` - List files and folders
- `POST /api/onedrive` - Download a file
- `PUT /api/onedrive` - Upload a file

## User Experience

- **First-time users**: See a clean authentication screen with clear instructions
- **Returning users**: Automatically signed in if their tokens are still valid
- **Expired sessions**: Gracefully redirected to sign in again
- **Error states**: Clear error messages and recovery options

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Azure AD configuration
3. Test the OAuth flow manually
4. Review the application logs
5. Ensure all environment variables are set correctly
