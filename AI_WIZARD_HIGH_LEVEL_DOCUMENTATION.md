# AI Law Wizard - High Level Documentation

## Overview
AI Law Wizard is a comprehensive legal consultation platform built with Next.js that provides AI-powered legal assistance through multiple tiers and interfaces. The application integrates with various AI models, cloud storage services, and provides a modern 3D virtual environment for legal consultations.

## Core Architecture

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: PostgreSQL with vector embeddings
- **AI Models**: Grok-4, GPT-4o-mini, OpenAI embeddings
- **Vector Database**: Pinecone for semantic search
- **Authentication**: NextAuth.js with Microsoft OAuth
- **Cloud Integration**: Microsoft OneDrive, Azure AD
- **3D Graphics**: Three.js with React Three Fiber
- **Payment Processing**: Stripe integration

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following key models:
- **User**: User authentication and profile management
- **ChatSession**: Chat conversation tracking
- **ChatMessage**: Individual chat messages with metadata
- **EmbeddingJob**: Document processing jobs
- **EmbeddingChunk**: Document chunks with vector embeddings
- **DocumentQuery**: Query history and results
- **TokenPackage**: Token-based pricing system
- **Blog**: Content management system

## Core Features

### 1. Multi-Tier Legal Consultation System

#### Apprentice Tier (Free)
- **Location**: `/apprentice`
- **Features**: 
  - Free AI chat with Grok-3
  - Basic legal consultation
  - Chat history management
  - Mobile-responsive interface
  - Quick prompts for common legal questions
- **Limitations**: Basic functionality only

#### Wizard Tier (Premium)
- **Location**: `/wizard`
- **Features**:
  - Advanced document analysis interface
  - OneDrive integration for file management
  - Document processing with AI
  - Query history dashboard
  - File search and retrieval
  - Real-time processing status
- **Authentication**: Required for access

#### Grand Wizard Tier (Ultimate)
- **Location**: `/grand-wizard`
- **Features**: Coming soon
- **Planned**: Advanced legal analysis, complex case research

### 2. Document Processing System

#### Core Processing Engine
- **File**: `src/app/api/document-processing/route.ts`
- **Capabilities**:
  - Multi-format document support (PDF, DOCX, TXT)
  - Intelligent mode detection (question answering vs action performance)
  - Chunk-based processing for efficiency
  - Real-time progress tracking
  - Error handling and recovery

#### Processing Modes
1. **Question Answering Mode**: Fast responses using document chunks
2. **Action Performance Mode**: Full document processing with editing capabilities

#### AI Model Strategy
- **GPT-4o-mini**: Basic tasks, mode detection, simple operations
- **Grok-4**: Complex workflows, advanced reasoning, agentic operations

### 3. Chat System

#### Chat Interface Components
- **ChatMessages**: Message display with copy functionality
- **ChatInput**: Input handling with keyboard shortcuts
- **ChatSidebar**: Session management and history
- **QuickPrompts**: Pre-defined prompts for common queries

#### Chat Features
- Real-time messaging with AI
- Session persistence
- Message copying and sharing
- Mobile-responsive design
- Error handling and user feedback

### 4. OneDrive Integration

#### File Management
- **Browse**: Navigate OneDrive folders
- **Search**: Search across OneDrive files
- **Download**: Direct file downloads
- **Upload**: File upload to OneDrive
- **Metadata**: File information display

#### Authentication
- Microsoft OAuth integration
- Azure AD application registration
- Secure token management

### 5. Miniverse™ - 3D Virtual Environment

#### 3D Features
- **Location**: `/miniverse`
- **Technology**: Three.js with React Three Fiber
- **Environment**: Interactive 3D lawyer's office
- **Interactions**: 
  - Paper memos with legal content
  - Blog access through 3D interface
  - Music player integration
  - Keyboard and mouse controls

#### Virtual Office Components
- Interactive objects (desk, papers, books)
- Modal systems for content access
- Audio integration
- Responsive controls

### 6. Blog System

#### Content Management
- **Location**: `/blog`
- **Features**:
  - AI-generated blog posts
  - Content editing interface
  - Publication workflow
  - Public and private posts

#### Blog API
- Generate content with AI
- Edit and refine posts
- Publish to public blog
- Content categorization

### 7. Payment and Token System

#### Stripe Integration
- Token-based pricing model
- Secure payment processing
- Webhook handling for payment events
- User wallet management

#### Token Packages
- Predefined token packages
- Usage tracking
- Billing integration
- User subscription management

## API Architecture

### Core API Endpoints

#### Chat APIs
- `POST /api/chat` - Main chat interface
- `GET /api/chat/sessions` - Chat session management
- `GET /api/chat/sessions/[id]` - Individual session retrieval

#### Document Processing APIs
- `POST /api/document-processing` - Main processing endpoint
- `GET /api/document-processing/file-content` - File content retrieval
- `GET /api/document-history` - Query history management

#### Integration APIs
- `GET /api/onedrive` - OneDrive file access
- `POST /api/embedding` - Document embedding processing
- `GET /api/similarity-search` - Vector similarity search

#### Authentication APIs
- `POST /api/auth/register` - User registration
- `GET /api/auth/callback` - OAuth callback handling

### Data Flow

#### Document Processing Flow
1. User uploads/selects documents
2. Documents are chunked and embedded
3. Vector embeddings stored in Pinecone
4. User queries trigger similarity search
5. Relevant chunks retrieved and processed
6. AI generates response based on context
7. Results stored in database

#### Chat Flow
1. User sends message
2. Message stored in database
3. AI model processes request
4. Response generated and returned
5. Chat history updated
6. Real-time UI updates

## User Interface

### Layout System
- **Layout Component**: Main application wrapper
- **Navigation**: Multi-tier navigation with authentication
- **Responsive Design**: Mobile-first approach
- **Theme**: Modern gradient design with Tailwind CSS

### Component Architecture
- **Reusable Components**: UI components in `/components/ui/`
- **Feature Components**: Specific functionality components
- **Layout Components**: Page structure and navigation
- **Integration Components**: Third-party service integrations

### State Management
- **React Hooks**: Local state management
- **Context API**: Global state for authentication
- **Database State**: Prisma for data persistence
- **Real-time Updates**: WebSocket-like functionality

## Security and Authentication

### Authentication Flow
1. Microsoft OAuth integration
2. NextAuth.js session management
3. Protected routes and middleware
4. User profile management

### Data Security
- Encrypted database connections
- Secure API endpoints
- Input validation and sanitization
- Error handling without data exposure

## Performance Optimization

### AI Model Optimization
- **Fast Mode Detection**: Instant response for common patterns
- **Chunk-based Processing**: Efficient document handling
- **Timeout Protection**: Prevents hanging requests
- **Model Selection**: Right model for the task

### Database Optimization
- **Vector Indexing**: Efficient similarity search
- **Connection Pooling**: Database performance
- **Query Optimization**: Efficient data retrieval
- **Caching Strategy**: Reduced database load

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js image optimization
- **Bundle Optimization**: Reduced JavaScript payload
- **Responsive Design**: Mobile performance

## Deployment and Infrastructure

### Environment Configuration
- **Development**: Local development with hot reload
- **Production**: Optimized build with performance monitoring
- **Environment Variables**: Secure configuration management
- **Database Migrations**: Prisma migration system

### Monitoring and Analytics
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **Usage Analytics**: User behavior tracking
- **Database Monitoring**: Query performance analysis

## Future Roadmap

### Planned Features
- **Grand Wizard Tier**: Advanced legal analysis capabilities
- **Enhanced 3D Environment**: More interactive Miniverse features
- **Advanced AI Integration**: More sophisticated legal AI
- **Mobile App**: Native mobile application
- **API Expansion**: Public API for third-party integrations

### Technical Improvements
- **Performance Optimization**: Further speed improvements
- **Scalability**: Enhanced multi-user support
- **Security**: Advanced security features
- **Integration**: Additional cloud service integrations

## Development Guidelines

### Code Organization
- **Component Naming**: Descriptive, functionality-based names
- **File Structure**: Feature-based organization
- **TypeScript**: Strict typing throughout
- **Error Handling**: Comprehensive error management

### Best Practices
- **Performance First**: Optimize for speed and efficiency
- **User Experience**: Intuitive and responsive design
- **Security**: Secure by default
- **Maintainability**: Clean, documented code

This documentation provides a high-level overview of the AI Law Wizard platform, covering its architecture, features, and implementation details as of the current development state.
