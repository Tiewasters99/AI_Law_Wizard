# AI Law Wizard - Role-Based Access Control Specification

## Table of Contents

1. [Overview](#overview)
2. [Role Definitions](#role-definitions)
3. [Middleware Configuration](#middleware-configuration)
4. [Route Protection](#route-protection)
5. [API Endpoint Protection](#api-endpoint-protection)
6. [Authentication Utilities](#authentication-utilities)
7. [Authorization Patterns](#authorization-patterns)
8. [Admin Authentication](#admin-authentication)
9. [Resource Ownership](#resource-ownership)
10. [Best Practices](#best-practices)

---

## Overview

AI Law Wizard implements a comprehensive **Role-Based Access Control (RBAC)** system that protects both frontend routes and backend API endpoints. The system uses NextAuth.js for authentication and custom middleware/utilities for authorization.

### Key Components

1. **Role Definitions**: Database schema and TypeScript types
2. **Middleware**: Route-level protection (`src/middleware.ts`)
3. **Authentication Utilities**: Per-role auth helpers
4. **Controller-Level Checks**: Authorization in API handlers
5. **Resource-Level Checks**: Ownership verification

### Protection Layers

```
1. Middleware (Route Protection)
   ↓
2. Layout Components (Frontend Protection)
   ↓
3. API Route Handlers (Endpoint Protection)
   ↓
4. Controllers (Authentication/Authorization)
   ↓
5. Services (Business Logic Authorization)
   ↓
6. Repositories (Data Access)
```

---

## Role Definitions

### Database Schema

**File**: `prisma/schema.prisma`

```prisma
enum Role {
  CUSTOMER
  ATTORNEY
}

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  role      Role     @default(CUSTOMER)
  // ... other fields
}
```

**Note**: `ADMIN` is not part of the User Role enum. Admins use a separate authentication system.

### TypeScript Types

**File**: `src/types/next-auth.d.ts`

```typescript
export type UserRole = "ATTORNEY" | "CUSTOMER";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      email: string;
      role: UserRole;
    };
    isAdmin?: boolean;
  }
}
```

### Role Descriptions

#### CUSTOMER (Client)

- **Purpose**: End users seeking legal consultation
- **Access**: Client-specific features and pages
- **Routes**: `/client/*`
- **APIs**: `/api/client/*`

**Capabilities**:

- Document analysis
- Legal research
- Attorney consultation requests
- Token management
- Profile management

#### ATTORNEY

- **Purpose**: Legal professionals providing services
- **Access**: Attorney-specific features and pages
- **Routes**: `/attorney/*`
- **APIs**: `/api/attorney/*`

**Capabilities**:

- Advanced document processing
- Legal research with citations
- Blog management
- Client conversations
- Token management
- OneDrive integration

#### ADMIN

- **Purpose**: System administrators
- **Access**: Admin-specific features and pages
- **Routes**: `/admin/*`
- **APIs**: `/api/admin/*`
- **Authentication**: Separate admin authentication system

**Capabilities**:

- User management (clients, attorneys)
- Pricing management
- Feature flags
- Activity logs
- Dashboard analytics

---

## Middleware Configuration

### Middleware File

**File**: `src/middleware.ts`

**Purpose**: Protect routes at the edge before rendering

### Protected Routes Mapping

```typescript
const protectedRoutes = {
  "/client": ["CUSTOMER"],
  "/client/dashboard": ["CUSTOMER"],
  "/attorney": ["ATTORNEY"],
  "/attorney/dashboard": ["ATTORNEY"],
  "/admin": ["ADMIN"],
  "/admin/dashboard": ["ADMIN"],
  "/admin/clients": ["ADMIN"],
  "/admin/attorneys": ["ADMIN"],
  "/admin/pricing": ["ADMIN"],
};
```

### Public Routes

```typescript
const publicRoutes = [
  "/",
  "/auth",
  "/auth/login",
  "/auth/register",
  "/admin/login",
  "/api/auth",
  "/blog",
  "/legal-research",
  "/attorney-features",
  "/client-features",
];
```

### Middleware Flow

1. **Check Public Routes**: Allow access if route is public
2. **Check Authentication**: Verify user has valid session
3. **Check Role**: Verify user role matches required role
4. **Redirect**: Redirect to appropriate dashboard if role mismatch

### Middleware Implementation

```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Skip authentication check for admin login page
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check public routes first
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check if the current path requires authentication
    const route = Object.keys(protectedRoutes).find(route =>
      pathname.startsWith(route)
    );

    if (route) {
      const requiredRoles = protectedRoutes[route];

      // User must be authenticated
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }

      // For admin routes, check admin authentication
      if (pathname.startsWith("/admin")) {
        if (!token || !token.isAdmin) {
          return NextResponse.redirect(new URL("/admin/login", req.url));
        }
      } else {
        // Check if user has required role
        const userRole = token.role as "ATTORNEY" | "CUSTOMER";
        if (!requiredRoles.includes(userRole)) {
          // Redirect based on user's actual role
          if (userRole === "ATTORNEY") {
            return NextResponse.redirect(
              new URL("/attorney/dashboard", req.url)
            );
          } else {
            return NextResponse.redirect(new URL("/client/dashboard", req.url));
          }
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // For all other routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
```

### Middleware Rules

- ✅ Protects all routes except public routes
- ✅ Checks authentication before role check
- ✅ Redirects to appropriate dashboard on role mismatch
- ✅ Allows admin login page without authentication
- ❌ Does not protect API routes (handled separately)

---

## Route Protection

### Frontend Route Protection

Routes are protected at multiple levels:

#### 1. Middleware Protection

- **Location**: `src/middleware.ts`
- **When**: Before page rendering
- **Action**: Redirects unauthenticated/unauthorized users

#### 2. Layout Protection

**Authenticated Layout** (`src/app/(authenticated)/layout.tsx`):

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthenticatedLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (!session) return null;

  return <>{children}</>;
}
```

#### 3. Role-Specific Layout Protection

**Admin Layout** (`src/app/(authenticated)/admin/layout.tsx`):

```typescript
"use client";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.isAdmin) {
      router.push("/admin/login");
    }
  }, [session, status]);

  if (!session?.isAdmin) return null;

  return <>{children}</>;
}
```

### Route Protection Patterns

#### Pattern 1: Middleware Only

**Use Case**: Simple role-based protection

```typescript
// Middleware handles everything
// No additional checks needed in layout
```

#### Pattern 2: Middleware + Layout

**Use Case**: Additional client-side checks

```typescript
// Middleware checks authentication
// Layout checks role-specific requirements
```

#### Pattern 3: Middleware + Layout + Page

**Use Case**: Page-specific authorization

```typescript
// Middleware checks authentication
// Layout checks role
// Page checks specific permissions
```

---

## API Endpoint Protection

### API Route Protection Pattern

**File**: `src/app/api/[role]/[resource]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Role Check
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Delegate to Controller
    return await handleGetResource(request);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Controller-Level Protection

**File**: `src/lib/backend/controllers/[role]/[resource]/[resource]Controller.ts`

```typescript
import { verifyClientAccess } from "../../../utils/clientAuth";

export async function handleGetResource(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Use authentication utility
    await verifyClientAccess(session?.user?.id);

    // Proceed with business logic
    const resource = await getResource();
    return successResponse({ resource });
  } catch (error) {
    return errorResponse(error);
  }
}
```

### API Protection Rules

- ✅ Always check authentication in API routes
- ✅ Verify role matches endpoint role
- ✅ Use authentication utilities in controllers
- ✅ Return appropriate HTTP status codes
- ❌ Don't skip authentication checks
- ❌ Don't trust client-side role information

---

## Authentication Utilities

### Client Authentication

**File**: `src/lib/backend/utils/clientAuth.ts`

```typescript
import { prisma } from "../prisma";
import { AuthenticationError, AuthorizationError } from "./errors";

export async function verifyClientAccess(
  userId: string | undefined
): Promise<{ id: string; role: string }> {
  if (!userId) {
    throw new AuthenticationError("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  if (user.role !== "CUSTOMER") {
    throw new AuthorizationError("Client access required");
  }

  return user;
}

export async function isClient(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "CUSTOMER";
}
```

### Attorney Authentication

**File**: `src/lib/backend/utils/attorneyAuth.ts`

```typescript
import { prisma } from "../prisma";
import { AuthenticationError, AuthorizationError } from "./errors";

export async function verifyAttorneyAccess(
  userId: string | undefined
): Promise<{ id: string; role: string }> {
  if (!userId) {
    throw new AuthenticationError("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  if (user.role !== "ATTORNEY") {
    throw new AuthorizationError("Attorney access required");
  }

  return user;
}
```

### Admin Authentication

**File**: `src/lib/backend/utils/adminAuth.ts`

```typescript
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth";
import { AuthenticationError, AuthorizationError } from "./errors";
import { Admin } from "@/types/admin";
import { prisma } from "../prisma";

export async function requireAdminAuth(request: NextRequest): Promise<Admin> {
  const session = await getServerSession(authOptions);

  if (!session?.isAdmin || !session?.user?.email) {
    throw new AuthenticationError("Admin privileges required");
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  });

  if (!admin) {
    throw new AuthenticationError("Admin account not found");
  }

  if (!admin.isActive) {
    throw new AuthorizationError("Admin account inactive");
  }

  return admin;
}
```

### Authentication Utility Usage

**In Controllers**:

```typescript
// Client endpoint
import { verifyClientAccess } from "../../../utils/clientAuth";
const user = await verifyClientAccess(session?.user?.id);

// Attorney endpoint
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
const user = await verifyAttorneyAccess(session?.user?.id);

// Admin endpoint
import { requireAdminAuth } from "../../../utils/adminAuth";
const admin = await requireAdminAuth(request);
```

---

## Authorization Patterns

### Pattern 1: Role-Based Authorization

**Use Case**: Check if user has required role

```typescript
// In controller
const session = await getServerSession(authOptions);
if (session.user.role !== "CUSTOMER") {
  return errorResponse(new AuthorizationError("Access denied"));
}
```

### Pattern 2: Resource Ownership

**Use Case**: Verify user owns the resource

```typescript
// In service
const resource = await findResourceById(resourceId);
if (resource.userId !== userId) {
  throw new AuthorizationError("Access denied");
}
```

### Pattern 3: Role + Ownership

**Use Case**: Check role and ownership

```typescript
// In service
await verifyClientAccess(userId); // Role check
const resource = await findResourceById(resourceId);
if (resource.userId !== userId) {
  throw new AuthorizationError("Access denied");
}
```

### Pattern 4: Admin Override

**Use Case**: Admins can access any resource

```typescript
// In service
const session = await getServerSession(authOptions);
const isAdmin = session?.isAdmin;

if (!isAdmin) {
  const resource = await findResourceById(resourceId);
  if (resource.userId !== userId) {
    throw new AuthorizationError("Access denied");
  }
}
```

---

## Admin Authentication

### Separate Admin System

Admins use a separate authentication system, not part of the User model.

### Admin Model

**File**: `prisma/schema.prisma`

```prisma
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Admin Authentication Flow

1. **Admin Login**: `POST /api/auth/admin/[...nextauth]`
2. **Session Creation**: Admin session with `isAdmin: true`
3. **Middleware Check**: Verify `token.isAdmin`
4. **Controller Check**: Use `requireAdminAuth()`

### Admin Session

```typescript
// NextAuth admin session
{
  user: {
    email: "admin@example.com",
  },
  isAdmin: true,
}
```

### Admin Route Protection

**Middleware**:

```typescript
if (pathname.startsWith("/admin")) {
  if (!token || !token.isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}
```

**Controller**:

```typescript
import { requireAdminAuth } from "../../../utils/adminAuth";
const admin = await requireAdminAuth(request);
```

---

## Resource Ownership

### Ownership Verification Pattern

**In Service Layer**:

```typescript
export async function updateResource(
  resourceId: string,
  userId: string,
  data: UpdateData
) {
  // 1. Find resource
  const resource = await findResourceById(resourceId);
  if (!resource) {
    throw new NotFoundError("Resource");
  }

  // 2. Verify ownership
  if (resource.userId !== userId) {
    throw new AuthorizationError("Access denied");
  }

  // 3. Update resource
  return await updateResource(resourceId, data);
}
```

### Ownership in Relations

**Example**: Conversation ownership

```typescript
// Client can only access their conversations
const conversation = await findConversationById(conversationId);
if (conversation.clientId !== userId) {
  throw new AuthorizationError("Access denied");
}

// Attorney can access conversations they're part of
const conversation = await findConversationById(conversationId);
if (conversation.clientId !== userId && conversation.attorneyId !== userId) {
  throw new AuthorizationError("Access denied");
}
```

### Ownership Rules

- ✅ Always verify ownership in services
- ✅ Check ownership before updates/deletes
- ✅ Return 403 Forbidden on ownership mismatch
- ❌ Don't trust client-provided ownership data
- ❌ Don't skip ownership checks

---

## Best Practices

### Do's

- ✅ Always authenticate before authorization
- ✅ Use authentication utilities consistently
- ✅ Verify role at multiple layers
- ✅ Check resource ownership in services
- ✅ Return appropriate HTTP status codes
- ✅ Log authorization failures
- ✅ Use custom error classes

### Don'ts

- ❌ Skip authentication checks
- ❌ Trust client-side role information
- ❌ Mix authentication and authorization logic
- ❌ Expose sensitive error messages
- ❌ Allow role escalation
- ❌ Skip ownership verification

### Security Checklist

- [ ] All protected routes have middleware protection
- [ ] All API endpoints check authentication
- [ ] All controllers use authentication utilities
- [ ] All services verify resource ownership
- [ ] Admin routes use separate authentication
- [ ] Error messages don't leak sensitive information
- [ ] Role checks happen at multiple layers

---

## Common Patterns

### Pattern 1: Simple Role Check

```typescript
// In controller
await verifyClientAccess(session?.user?.id);
// Proceed with operation
```

### Pattern 2: Role + Ownership

```typescript
// In service
await verifyClientAccess(userId);
const resource = await findResourceById(resourceId);
if (resource.userId !== userId) {
  throw new AuthorizationError("Access denied");
}
```

### Pattern 3: Admin Override

```typescript
// In service
const isAdmin = session?.isAdmin;
if (!isAdmin) {
  // Regular ownership check
  if (resource.userId !== userId) {
    throw new AuthorizationError("Access denied");
  }
}
// Admin can proceed
```

### Pattern 4: Multi-Role Access

```typescript
// In service
const user = await findUserById(userId);
if (user.role !== "ATTORNEY" && user.role !== "CUSTOMER") {
  throw new AuthorizationError("Access denied");
}
```

---

## Related Documentation

- **Architecture Overview**: See [ARCHITECTURE_SPEC.md](./ARCHITECTURE_SPEC.md)
- **Backend Structure**: See [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md)
- **Frontend Structure**: See [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)

---

**Last Updated**: January 2025  
**Version**: 1.0
