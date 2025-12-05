# AI Law Wizard - Architecture Specification

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Role-Based Access Control](#role-based-access-control)
7. [Directory Structure](#directory-structure)
8. [Data Flow](#data-flow)
9. [Security Architecture](#security-architecture)

---

## System Overview

AI Law Wizard is a Next.js-based legal consultation platform that provides AI-powered legal services to clients, attorneys, and administrators. The application follows a strict layered architecture pattern with role-based access control at every level.

### Key Characteristics

- **Full-Stack Next.js Application**: Server-side rendering with API routes
- **Layered Backend Architecture**: Route → Controller → Service → Repository pattern
- **Role-Based Access Control**: Three distinct user roles (CUSTOMER, ATTORNEY, ADMIN)
- **Type-Safe**: TypeScript throughout the application
- **Database-First**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js for session management
- **Modern Frontend**: React with Next.js App Router

### User Roles

1. **CUSTOMER (Client)**: End users seeking legal consultation
2. **ATTORNEY**: Legal professionals providing services
3. **ADMIN**: System administrators managing the platform

---

## Technology Stack

### Core Technologies

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI Framework**: React 18+
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **State Management**: Zustand (client-side stores)
- **Animation**: Framer Motion

### External Services

- **AI Models**: OpenRouter API (GPT-4, Claude, etc.)
- **Payment Processing**: Stripe
- **File Storage**: OneDrive (Microsoft Graph API)
- **Vector Database**: Pinecone (for document embeddings)

### Development Tools

- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Version Control**: Git

---

## Architecture Patterns

### 1. Layered Backend Architecture

The backend follows a strict four-layer architecture:

```
API Route → Controller → Service → Repository → Database
```

**Benefits:**

- Clear separation of concerns
- Testability at each layer
- Reusability of business logic
- Maintainability and scalability

### 2. Role-Based Organization

Both backend and frontend are organized by user roles:

- **Backend**: `/api/[role]/[resource]/route.ts`
- **Frontend**: `/app/(authenticated)/[role]/[page]/page.tsx`
- **Components**: `/components/[role]/`
- **Controllers/Services**: Organized by role domains

### 3. Route Groups (Frontend)

Next.js route groups organize pages without affecting URL structure:

- `(authenticated)`: Protected pages requiring authentication
- `(guest)`: Public pages accessible without authentication
- `(public)`: Public landing pages

### 4. Component Composition

- Reusable UI components in `src/components/ui/`
- Role-specific components in `src/components/[role]/`
- Layout components for consistent page structure

---

## Backend Architecture

### Layer Responsibilities

#### 1. API Routes (`src/app/api/[role]/[resource]/route.ts`)

**Purpose**: HTTP endpoint handlers, minimal logic

**Responsibilities:**

- Handle HTTP methods (GET, POST, PATCH, DELETE)
- Route requests to appropriate controllers
- Export route handlers

**Example Structure:**

```typescript
// src/app/api/client/profile/route.ts
import { NextRequest } from "next/server";
import { handleGetProfile } from "@/lib/backend/controllers/client/profile/profileController";

export async function GET(request: NextRequest) {
  return await handleGetProfile(request);
}
```

#### 2. Controllers (`src/lib/backend/controllers/[role]/[resource]/`)

**Purpose**: Request/response handling, authentication, authorization

**Responsibilities:**

- Authenticate requests
- Authorize based on user role
- Validate input
- Call service functions
- Format responses
- Handle errors

**Example Structure:**

```typescript
// src/lib/backend/controllers/client/profile/profileController.ts
import { NextRequest } from "next/server";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { getProfile } from "../../../services/client/profile/profileService";
import { successResponse, errorResponse } from "../../../utils/response";

export async function handleGetProfile(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    await verifyClientAccess(session?.user?.id);
    const profile = await getProfile(session.user.id);
    return successResponse({ profile });
  } catch (error) {
    return errorResponse(error);
  }
}
```

#### 3. Services (`src/lib/backend/services/[role]/[resource]/`)

**Purpose**: Business logic orchestration

**Responsibilities:**

- Implement business rules
- Coordinate between multiple repositories
- Handle complex operations
- Throw custom errors
- No direct database access

**Example Structure:**

```typescript
// src/lib/backend/services/client/profile/profileService.ts
import { findUserById } from "../../../repositories/common/userRepository";
import { NotFoundError } from "../../../utils/errors";

export async function getProfile(userId: string) {
  const user = await findUserById(userId);
  if (!user) throw new NotFoundError("User");
  return formatProfile(user);
}
```

#### 4. Repositories (`src/lib/backend/repositories/[domain]/`)

**Purpose**: Database operations only

**Responsibilities:**

- Execute Prisma queries
- Return data models
- Simple CRUD operations
- No business logic

**Example Structure:**

```typescript
// src/lib/backend/repositories/common/userRepository.ts
import { prisma } from "../../prisma";

export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: { wallet: true },
  });
}
```

### Backend Directory Structure

```
src/lib/backend/
├── controllers/           # Request/response handling by role
│   ├── admin/
│   ├── attorney/
│   ├── client/
│   ├── auth/
│   ├── demo/
│   └── guest/
├── services/             # Business logic orchestration
│   ├── admin/
│   ├── attorney/
│   ├── client/
│   ├── auth/
│   ├── demo/
│   ├── guest/
│   ├── openRouterService.ts
│   ├── documentProcessor.ts
│   └── onedriveService.ts
├── repositories/         # Database access layer
│   ├── admin/
│   ├── attorney/
│   ├── client/
│   ├── common/
│   ├── pricing/
│   └── purchase/
├── utils/               # Utility functions
│   ├── errors.ts
│   ├── response.ts
│   ├── adminAuth.ts
│   ├── clientAuth.ts
│   ├── attorneyAuth.ts
│   └── validation.ts
├── api/                 # API configuration
│   ├── config.ts
│   └── rateLimiter.ts
├── auth.ts              # NextAuth configuration
├── prisma.ts            # Prisma client
└── index.ts             # Main exports
```

---

## Frontend Architecture

### Next.js App Router Structure

The frontend uses Next.js App Router with route groups for organization:

```
src/app/
├── (authenticated)/     # Protected pages
│   ├── client/         # Client pages
│   ├── attorney/       # Attorney pages
│   ├── admin/          # Admin pages
│   └── layout.tsx      # Authenticated layout wrapper
├── (guest)/            # Public authenticated pages
├── (public)/           # Public landing pages
├── api/                # API routes
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── providers.tsx       # Context providers
```

### Page Organization

Pages are organized by role under `(authenticated)`:

- **Client Pages**: `/client/dashboard`, `/client/wizard`, `/client/tokens`, etc.
- **Attorney Pages**: `/attorney/dashboard`, `/attorney/wizard`, `/attorney/blog`, etc.
- **Admin Pages**: `/admin/dashboard`, `/admin/clients`, `/admin/attorneys`, etc.

### Component Organization

```
src/components/
├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── ...
├── admin/              # Admin-specific components
├── attorney/           # Attorney-specific components
│   ├── layout/
│   ├── tokens/
│   └── ...
├── client/             # Client-specific components
└── miniverse/          # 3D visualization components
```

### Layout System

**Root Layout** (`src/app/layout.tsx`):

- Provides HTML structure
- Includes global providers
- Sets up theme

**Authenticated Layout** (`src/app/(authenticated)/layout.tsx`):

- Role-aware layout wrapper
- Redirects unauthenticated users
- Applies role-specific layouts (AttorneyLayout, etc.)

**Role-Specific Layouts**:

- `AttorneyLayout`: Navigation, sidebar for attorneys
- Client/Admin layouts: Similar pattern

### Client-Side State Management

Zustand stores in `src/stores/`:

- `authStore.ts`: Authentication state
- `uiStore.ts`: UI state (modals, themes)
- `documentProcessingStore.ts`: Document processing state
- `queryHistoryStore.ts`: Query history state
- `miniverseStore.ts`: 3D visualization state

---

## Role-Based Access Control

### Role Definitions

**Database Schema** (Prisma):

```prisma
enum Role {
  CUSTOMER
  ATTORNEY
}
```

**Admin System**: Separate authentication system using `Admin` model (not part of User enum)

### Middleware Protection

**File**: `src/middleware.ts`

**Protected Routes Mapping**:

```typescript
const protectedRoutes = {
  "/client": ["CUSTOMER"],
  "/attorney": ["ATTORNEY"],
  "/admin": ["ADMIN"],
};
```

**Protection Flow**:

1. Check if route is public
2. Check if route requires authentication
3. Verify user role matches required role
4. Redirect to appropriate dashboard if role mismatch

### Authentication Utilities

**Per-Role Auth Utilities**:

- `src/lib/backend/utils/adminAuth.ts`: `requireAdminAuth()`
- `src/lib/backend/utils/clientAuth.ts`: `verifyClientAccess()`
- `src/lib/backend/utils/attorneyAuth.ts`: `verifyAttorneyAccess()`

**Pattern**:

```typescript
// In controllers
const user = await verifyClientAccess(session?.user?.id);
// Throws AuthenticationError or AuthorizationError if invalid
```

### API Endpoint Protection

**Pattern**:

```typescript
// In API route handlers
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check
  if (session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Or use utility
  await verifyClientAccess(session.user.id);
}
```

---

## Directory Structure

### Complete Project Structure

```
AI_Law_Wizard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── spec/                      # Architecture specifications
│   ├── ARCHITECTURE_SPEC.md
│   ├── BACKEND_STRUCTURE.md
│   ├── FRONTEND_STRUCTURE.md
│   └── ROLE_BASED_ACCESS.md
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (authenticated)/   # Protected pages
│   │   │   ├── client/
│   │   │   ├── attorney/
│   │   │   ├── admin/
│   │   │   └── layout.tsx
│   │   ├── (guest)/           # Public authenticated pages
│   │   ├── (public)/          # Public landing pages
│   │   ├── api/               # API routes
│   │   │   ├── admin/
│   │   │   ├── attorney/
│   │   │   ├── client/
│   │   │   ├── auth/
│   │   │   ├── guest/
│   │   │   └── demo/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── admin/
│   │   ├── attorney/
│   │   ├── client/
│   │   └── miniverse/
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Library code
│   │   ├── backend/          # Backend logic
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── utils/
│   │   └── frontend/         # Frontend utilities
│   ├── middleware.ts          # Next.js middleware
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript types
├── API_ARCHITECTURE.md        # Backend API documentation
├── DESIGN_SYSTEM.md           # Design system documentation
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## Data Flow

### Request Flow (Backend)

1. **Client Request** → API Route (`/api/client/profile`)
2. **Route Handler** → Controller (`handleGetProfile`)
3. **Controller** → Authentication/Authorization
4. **Controller** → Service (`getProfile`)
5. **Service** → Repository (`findUserById`)
6. **Repository** → Database (Prisma query)
7. **Response** ← Repository (data model)
8. **Response** ← Service (formatted data)
9. **Response** ← Controller (NextResponse)
10. **Response** ← Route (HTTP response)

### Component Rendering Flow (Frontend)

1. **User Navigation** → Next.js Router
2. **Route Matching** → Page Component
3. **Page Component** → Layout Wrapper
4. **Layout** → Role Check (middleware)
5. **Page** → Data Fetching (Server Components or API calls)
6. **Page** → Component Rendering
7. **Components** → UI Display

---

## Security Architecture

### Authentication

- **NextAuth.js**: Session-based authentication
- **JWT Tokens**: Secure session tokens
- **Password Hashing**: bcrypt for password storage
- **Admin Authentication**: Separate admin session system

### Authorization

- **Middleware**: Route-level protection
- **Controller-Level**: Role verification in controllers
- **API-Level**: Role checks in route handlers
- **Resource-Level**: Ownership verification

### Security Measures

- **Rate Limiting**: Per-user and per-role rate limits
- **Input Validation**: Validation at controller and service layers
- **SQL Injection Protection**: Prisma parameterized queries
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: NextAuth.js built-in protection
- **Environment Variables**: Sensitive data in `.env`

---

## Key Design Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Role-Based Organization**: Code organized by user roles
3. **Type Safety**: TypeScript throughout
4. **Consistency**: Standardized patterns across codebase
5. **Security First**: Authentication and authorization at every layer
6. **Scalability**: Layered architecture supports growth
7. **Maintainability**: Clear structure and documentation

---

## Related Documentation

- **Backend Details**: See [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md)
- **Frontend Details**: See [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)
- **RBAC Details**: See [ROLE_BASED_ACCESS.md](./ROLE_BASED_ACCESS.md)
- **API Reference**: See [../API_ARCHITECTURE.md](../API_ARCHITECTURE.md)
- **Design System**: See [../DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)

---

**Last Updated**: January 2025  
**Version**: 1.0
