# AI Wizard - Legal Consultation Platform

A Next.js application that provides AI-powered legal consultation using Grok API and OneDrive file management.

## Features

- 🤖 **AI-Powered Chat**: Real-time legal consultation with Grok 4
- 💬 **Chat Interface**: Modern chat UI
- 💎 **Subscription Tiers**: Silver, Gold, and Platinum plans
- 🔒 **Chat Limits**: Free tier with upgrade prompts
- 📱 **Responsive Design**: Works on all devices
- 📁 **OneDrive Integration**: Browse and manage OneDrive files
- 🔍 **File Search**: Search through OneDrive files
- 📥 **File Download**: Download files from OneDrive
- 🗂️ **Folder Navigation**: Navigate through OneDrive folders
- 🎯 **Legal Analysis**: AI-powered legal document analysis
- 🔍 **Smart Recommendations**: Intelligent legal insights and recommendations

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Grok API Configuration
GROK_API_KEY=your_actual_grok_api_key_here

# Microsoft Graph Configuration for OneDrive
AZURE_AD_CLIENT_ID=your_AZURE_AD_CLIENT_ID
AZURE_AD_CLIENT_SECRET=your_AZURE_AD_CLIENT_SECRET
AZURE_AD_TENANT_ID=your_AZURE_AD_TENANT_ID

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=supersecretstring
```

**To get your Microsoft Graph API credentials:**

1. **Register an Azure AD Application:**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Name your application (e.g., "AI Wizard OneDrive")
   - Select "Accounts in any organizational directory and personal Microsoft accounts"
   - Set redirect URI to `http://localhost:3000`
   - Click "Register"

2. **Configure API Permissions:**
   - In your app registration, go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Choose "Delegated permissions"
   - Add the following permissions:
     - `Files.ReadWrite.All` (for full file access including downloads)
     - `User.Read` (for user profile information)
   - Click "Grant admin consent"

3. **Get Client Credentials:**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Add a description and set expiration
   - Copy the generated secret value
   - Go to "Overview" and copy the "Application (client) ID"

4. **Configure Environment Variables:**
   - Set `AZURE_AD_CLIENT_ID` to your Application (client) ID
   - Set `AZURE_AD_CLIENT_SECRET` to your client secret
   - Set `AZURE_AD_TENANT_ID` to your tenant ID (or "common" for multi-tenant)

**To get your Grok API key:**
1. Visit [https://console.x.ai/](https://console.x.ai/)
2. Sign up or log in to your account
3. Navigate to API keys section
4. Create a new API key
5. Copy the key and paste it in your `.env.local` file

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### AI-Powered Legal Consultation
- **Real-time Chat**: Chat with AI assistant for legal guidance
- **Document Analysis**: Upload and analyze legal documents
- **Legal Insights**: Get AI-powered legal insights and recommendations
- **Smart Recommendations**: Intelligent suggestions based on your legal situation

### OneDrive Integration
- **File Browsing**: Navigate through OneDrive folders
- **File Search**: Search for files across OneDrive
- **File Download**: Download files directly from OneDrive
- **File Metadata**: View file size, type, and last modified date
- **Folder Navigation**: Navigate through folder hierarchy
- **File Actions**: Download, share, and manage files

### User Interface
- **Modern Design**: Clean, responsive interface
- **Chat Interface**: Real-time chat with AI assistant
- **Consultation Forms**: Streamlined legal consultation process
- **Results Display**: Clear presentation of analysis results

### Authentication
- **Microsoft Authentication**: Secure login with Microsoft accounts
- **Session Management**: Persistent user sessions
- **User Profiles**: User profile management

## API Integration

The application uses the Grok API for AI-powered legal consultation:

### Chat API
- **Endpoint**: `/api/chat`
- **Method**: POST
- **Purpose**: Real-time chat with AI assistant

### Legal Analysis API
- **Endpoint**: `/api/legal-analysis`
- **Method**: POST
- **Purpose**: AI-powered legal document analysis

### OneDrive API
- **Endpoint**: `/api/integrations`
- **Methods**: GET, POST
- **Purpose**: OneDrive file management and access

## Project Structure

```
AI-wizard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── chat/           # Chat API endpoint
│   │   │   ├── legal-analysis/ # Legal analysis API endpoint
│   │   │   └── onedrive/       # OneDrive API endpoint
│   │   ├── auth/               # Authentication pages
│   │   ├── chat/               # Chat interface
│   │   ├── components/         # Reusable components
│   │   ├── wizard/             # AI wizard interface
│   │   └── page.tsx            # Home page
│   ├── middleware.ts           # Authentication middleware
│   └── lib/                    # Utility functions
├── public/                     # Static assets
└── README.md                   # Project documentation
```

## Usage

1. **Start a Consultation**: Navigate to the home page to begin a legal consultation
2. **Chat with AI**: Use the chat interface to ask legal questions
3. **Get Analysis**: Receive AI-powered legal analysis and recommendations
4. **View Results**: Review detailed analysis results and insights
5. **OneDrive Integration**: Access and manage your OneDrive files through the wizard interface

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Microsoft Azure AD application
- Grok API key

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

### Building for Production
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
