# AI Law Wizard - Backend Structure Specification

## Table of Contents

1. [Overview](#overview)
2. [API Route Organization](#api-route-organization)
3. [Controller Layer](#controller-layer)
4. [Service Layer](#service-layer)
5. [Repository Layer](#repository-layer)
6. [Authentication & Authorization](#authentication--authorization)
7. [Error Handling](#error-handling)
8. [Response Utilities](#response-utilities)
9. [External Services](#external-services)
10. [File Naming Conventions](#file-naming-conventions)

---

## Overview

The backend follows a strict **four-layer architecture** pattern:

```
API Route → Controller → Service → Repository → Database
```

Each layer has distinct responsibilities and must not violate separation of concerns.

### Layer Responsibilities Summary

| Layer          | Responsibility                        | Location                                         |
| -------------- | ------------------------------------- | ------------------------------------------------ |
| **API Route**  | HTTP handling, routing                | `src/app/api/[role]/[resource]/route.ts`         |
| **Controller** | Auth, validation, response formatting | `src/lib/backend/controllers/[role]/[resource]/` |
| **Service**    | Business logic, orchestration         | `src/lib/backend/services/[role]/[resource]/`    |
| **Repository** | Database operations                   | `src/lib/backend/repositories/[domain]/`         |

---

## API Route Organization

### Directory Structure

API routes are organized by user role:

```
src/app/api/
├── admin/              # Admin-only endpoints
│   ├── dashboard/
│   ├── clients/
│   ├── attorneys/
│   ├── pricing/
│   ├── features/
│   └── logs/
├── attorney/           # Attorney endpoints
│   ├── profile/
│   ├── conversations/
│   ├── document-processing/
│   ├── legal-research/
│   ├── blog/
│   ├── tokens/
│   └── stripe/
├── client/             # Client endpoints
│   ├── profile/
│   ├── conversations/
│   ├── document-analysis/
│   ├── legal-research/
│   ├── tokens/
│   └── consultation-requests/
├── auth/               # Authentication endpoints
│   ├── [...nextauth]/
│   ├── register/
│   └── admin/[...nextauth]/
├── guest/              # Public endpoints (rate limited)
│   └── legal-research/
├── demo/               # Demo endpoints
│   ├── document-analysis/
│   └── legal-research/
├── pricing/            # Public pricing info
│   ├── packages/
│   └── role-pricing/
└── purchase/           # Purchase processing
    └── route.ts
```

### Route Handler Pattern

**File**: `src/app/api/[role]/[resource]/route.ts`

**Structure**:

```typescript
import { NextRequest } from "next/server";
import { handleAction } from "@/lib/backend/controllers/[role]/[resource]/[resource]Controller";

export async function GET(request: NextRequest) {
  return await handleGetAction(request);
}

export async function POST(request: NextRequest) {
  return await handlePostAction(request);
}

export async function PATCH(request: NextRequest) {
  return await handlePatchAction(request);
}

export async function DELETE(request: NextRequest) {
  return await handleDeleteAction(request);
}
```

**Rules**:

- ✅ Minimal logic - only route to controller
- ✅ Export HTTP method handlers
- ❌ No business logic
- ❌ No database queries
- ❌ No authentication checks (delegate to controller)

### Dynamic Routes

For routes with parameters (e.g., `/api/client/conversations/[conversationId]`):

```typescript
// src/app/api/client/conversations/[conversationId]/route.ts
import { NextRequest } from "next/server";
import { handleGetConversation } from "@/lib/backend/controllers/client/conversations/conversationsController";

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  return await handleGetConversation(request, params.conversationId);
}
```

---

## Controller Layer

### Directory Structure

```
src/lib/backend/controllers/
├── admin/
│   ├── dashboard/
│   ├── clients/
│   ├── attorneys/
│   ├── pricing/
│   └── profile/
├── attorney/
│   ├── profile/
│   ├── conversations/
│   ├── documentProcessing/
│   ├── legalResearch/
│   └── blog/
├── client/
│   ├── profile/
│   ├── conversations/
│   ├── documentAnalysis/
│   └── legalResearch/
├── auth/
│   ├── registrationController.ts
│   └── onedriveOAuthController.ts
├── demo/
└── guest/
```

### Controller Responsibilities

1. **Authentication**: Verify user is authenticated
2. **Authorization**: Verify user has required role/permissions
3. **Input Validation**: Validate request data
4. **Service Calls**: Call service layer functions
5. **Response Formatting**: Format responses using utilities
6. **Error Handling**: Catch and format errors

### Controller Pattern

**File**: `src/lib/backend/controllers/[role]/[resource]/[resource]Controller.ts`

**Structure**:

```typescript
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { verifyClientAccess } from "../../../utils/clientAuth";
import { getResource } from "../../../services/[role]/[resource]/[resource]Service";
import { successResponse, errorResponse } from "../../../utils/response";
import { ValidationError } from "../../../utils/errors";

export async function handleGetResource(
  request: NextRequest,
  resourceId: string
) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse(new AuthenticationError("Unauthorized"));
    }

    // 2. Authorization
    await verifyClientAccess(session.user.id);

    // 3. Input Validation
    if (!resourceId) {
      return errorResponse(new ValidationError("Resource ID is required"));
    }

    // 4. Service Call
    const resource = await getResource(resourceId, session.user.id);

    // 5. Success Response
    return successResponse({ resource });
  } catch (error) {
    // 6. Error Handling
    return errorResponse(error, "Failed to fetch resource");
  }
}
```

### Authentication Utilities

**Client**:

```typescript
import { verifyClientAccess } from "../../../utils/clientAuth";
const user = await verifyClientAccess(session?.user?.id);
```

**Attorney**:

```typescript
import { verifyAttorneyAccess } from "../../../utils/attorneyAuth";
const user = await verifyAttorneyAccess(session?.user?.id);
```

**Admin**:

```typescript
import { requireAdminAuth } from "../../../utils/adminAuth";
const admin = await requireAdminAuth(request);
```

### Controller Rules

- ✅ Always authenticate and authorize
- ✅ Validate input before service calls
- ✅ Use response utilities (`successResponse`, `errorResponse`)
- ✅ Use custom error classes
- ❌ No business logic
- ❌ No direct database queries
- ❌ No Prisma imports

---

## Service Layer

### Directory Structure

```
src/lib/backend/services/
├── admin/
│   ├── dashboard/
│   ├── clients/
│   ├── attorneys/
│   └── pricing/
├── attorney/
│   ├── profile/
│   ├── conversations/
│   ├── documentProcessing/
│   └── legalResearch/
├── client/
│   ├── profile/
│   ├── conversations/
│   ├── documentAnalysis/
│   └── legalResearch/
├── auth/
│   ├── registrationService.ts
│   └── onedriveOAuthService.ts
├── openRouterService.ts
├── documentProcessor.ts
└── onedriveService.ts
```

### Service Responsibilities

1. **Business Logic**: Implement business rules
2. **Orchestration**: Coordinate multiple repositories
3. **Data Transformation**: Format data for responses
4. **External Service Integration**: Call external APIs
5. **Error Handling**: Throw custom errors
6. **Validation**: Business-level validation

### Service Pattern

**File**: `src/lib/backend/services/[role]/[resource]/[resource]Service.ts`

**Structure**:

```typescript
import { findResourceById } from "../../../repositories/[domain]/[resource]Repository";
import { findRelatedResource } from "../../../repositories/[domain]/relatedRepository";
import { NotFoundError, ValidationError } from "../../../utils/errors";

export async function getResource(resourceId: string, userId: string) {
  // 1. Business Validation
  if (!resourceId) {
    throw new ValidationError("Resource ID is required");
  }

  // 2. Repository Calls
  const resource = await findResourceById(resourceId);
  if (!resource) {
    throw new NotFoundError("Resource");
  }

  // 3. Business Rules
  if (resource.userId !== userId) {
    throw new AuthorizationError("Access denied");
  }

  // 4. Additional Data
  const related = await findRelatedResource(resourceId);

  // 5. Data Transformation
  return {
    ...resource,
    related,
    formattedField: formatData(resource.field),
  };
}
```

### Service Rules

- ✅ Implement business logic
- ✅ Coordinate multiple repositories
- ✅ Throw custom errors
- ✅ Transform data
- ❌ No direct Prisma access (use repositories)
- ❌ No HTTP response objects
- ❌ No authentication checks (handled in controller)

### External Service Integration

Services can integrate with external APIs:

```typescript
// src/lib/backend/services/openRouterService.ts
import { openRouterService } from "../openRouterService";

export async function generateLegalAnalysis(query: string) {
  const response = await openRouterService.chat({
    model: "openai/gpt-4",
    messages: [{ role: "user", content: query }],
  });
  return response.choices[0]?.message?.content;
}
```

---

## Repository Layer

### Directory Structure

```
src/lib/backend/repositories/
├── admin/
│   ├── dashboardRepository.ts
│   ├── adminRepository.ts
│   └── attorneys/
├── attorney/
│   ├── blogRepository.ts
│   ├── conversationRepository.ts
│   └── documentQueryRepository.ts
├── client/
│   ├── chatSessionRepository.ts
│   └── documentSessionRepository.ts
├── common/
│   └── userRepository.ts
├── pricing/
│   ├── tokenPackageRepository.ts
│   └── featurePricingRepository.ts
└── purchase/
    └── walletRepository.ts
```

### Repository Responsibilities

1. **Database Operations**: Execute Prisma queries
2. **Data Access**: Return data models
3. **Query Optimization**: Efficient database queries
4. **Simple CRUD**: Create, Read, Update, Delete operations

### Repository Pattern

**File**: `src/lib/backend/repositories/[domain]/[resource]Repository.ts`

**Structure**:

```typescript
import { prisma } from "../../prisma";

export async function findResourceById(id: string) {
  return await prisma.resource.findUnique({
    where: { id },
    include: { related: true },
  });
}

export async function findAllResources(userId: string) {
  return await prisma.resource.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createResource(data: CreateResourceInput) {
  return await prisma.resource.create({
    data,
    include: { related: true },
  });
}

export async function updateResource(id: string, data: UpdateResourceInput) {
  return await prisma.resource.update({
    where: { id },
    data,
  });
}

export async function deleteResource(id: string) {
  return await prisma.resource.delete({
    where: { id },
  });
}
```

### Repository Rules

- ✅ Pure database operations
- ✅ Return data models
- ✅ Use Prisma for all queries
- ❌ No business logic
- ❌ No validation
- ❌ No error throwing (return null/empty array)
- ❌ No HTTP responses

### Common Prisma Patterns

**Finding Records**:

```typescript
// Single record
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
});

// Multiple records with filters
const conversations = await prisma.conversation.findMany({
  where: { clientId: userId, status: "ACTIVE" },
  take: 20,
  skip: 0,
  orderBy: { lastMessageAt: "desc" },
});
```

**Creating Records**:

```typescript
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe",
    role: "CUSTOMER",
    wallet: {
      create: {
        balance: 5000,
      },
    },
  },
  include: { wallet: true },
});
```

**Updating Records**:

```typescript
const updated = await prisma.user.update({
  where: { id: userId },
  data: {
    name: "Updated Name",
    phone: "+1234567890",
  },
});
```

**Aggregations**:

```typescript
const stats = await prisma.tokenTransaction.aggregate({
  where: { userId, type: "PURCHASE" },
  _sum: { amount: true },
  _count: true,
  _avg: { amount: true },
});
```

---

## Authentication & Authorization

### Authentication Flow

1. **User Login**: NextAuth.js credentials provider
2. **Session Creation**: JWT token stored in cookie
3. **Session Validation**: Middleware checks session
4. **Role Verification**: Controller checks user role

### Authentication Utilities

**Location**: `src/lib/backend/utils/[role]Auth.ts`

**Client Auth** (`clientAuth.ts`):

```typescript
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
```

**Attorney Auth** (`attorneyAuth.ts`):

```typescript
export async function verifyAttorneyAccess(
  userId: string | undefined
): Promise<{ id: string; role: string }> {
  // Similar pattern, checks for ATTORNEY role
}
```

**Admin Auth** (`adminAuth.ts`):

```typescript
export async function requireAdminAuth(request: NextRequest): Promise<Admin> {
  const session = await getServerSession(authOptions);

  if (!session?.isAdmin || !session?.user?.email) {
    throw new AuthenticationError("Admin privileges required");
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  });

  if (!admin || !admin.isActive) {
    throw new AuthenticationError("Admin account not found or inactive");
  }

  return admin;
}
```

### Authorization Patterns

**Role-Based Authorization**:

```typescript
// In controller
const session = await getServerSession(authOptions);
if (session.user.role !== "CUSTOMER") {
  return errorResponse(new AuthorizationError("Access denied"));
}
```

**Resource Ownership**:

```typescript
// In service
const resource = await findResourceById(resourceId);
if (resource.userId !== userId) {
  throw new AuthorizationError("Access denied");
}
```

---

## Error Handling

### Custom Error Classes

**Location**: `src/lib/backend/utils/errors.ts`

**Error Hierarchy**:

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}
```

### Error Handling Pattern

**In Services**:

```typescript
// Throw custom errors
if (!data) {
  throw new ValidationError("Data is required");
}

if (!resource) {
  throw new NotFoundError("Resource");
}
```

**In Controllers**:

```typescript
// Catch and format errors
try {
  const result = await serviceFunction();
  return successResponse(result);
} catch (error) {
  return errorResponse(error, "Operation failed");
}
```

---

## Response Utilities

### Response Helpers

**Location**: `src/lib/backend/utils/response.ts`

**Success Response**:

```typescript
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}
```

**Error Response**:

```typescript
export function errorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { error: defaultMessage, code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}
```

**Validation Error Response**:

```typescript
export function validationErrorResponse(message: string): NextResponse {
  return NextResponse.json(
    { error: message, code: "VALIDATION_ERROR" },
    { status: 400 }
  );
}
```

### Response Format

**Success Response**:

```json
{
  "resource": { ... },
  "related": [ ... ]
}
```

**Error Response**:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## External Services

### OpenRouter Service

**Location**: `src/lib/backend/services/openRouterService.ts`

**Usage**:

```typescript
import { openRouterService } from "../services/openRouterService";

const response = await openRouterService.chat({
  model: openRouterService.getModelForTier("premium"),
  messages: [{ role: "user", content: query }],
  max_tokens: 4000,
  temperature: 0.1,
});
```

### Stripe Service

**Location**: `src/lib/backend/stripeService.ts`

**Usage**:

```typescript
import { stripe } from "../stripeServer";

const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000,
  currency: "usd",
  metadata: { userId: session.user.id },
});
```

### OneDrive Service

**Location**: `src/lib/backend/services/onedriveService.ts`

**Usage**:

```typescript
import { oneDriveService } from "../services/onedriveService";

const files = await oneDriveService.listFiles(accessToken);
const uploadUrl = await oneDriveService.getUploadUrl(accessToken, fileName);
```

---

## File Naming Conventions

### Naming Patterns

- **Controllers**: `[resource]Controller.ts` (e.g., `profileController.ts`)
- **Services**: `[resource]Service.ts` (e.g., `profileService.ts`)
- **Repositories**: `[resource]Repository.ts` (e.g., `userRepository.ts`)
- **Routes**: `route.ts` (always named `route.ts` in Next.js)

### Directory Naming

- **Controllers**: `src/lib/backend/controllers/[role]/[resource]/`
- **Services**: `src/lib/backend/services/[role]/[resource]/`
- **Repositories**: `src/lib/backend/repositories/[domain]/`
- **API Routes**: `src/app/api/[role]/[resource]/`

### Import Patterns

**From Controllers**:

```typescript
import { handleAction } from "@/lib/backend/controllers/[role]/[resource]/[resource]Controller";
```

**From Services**:

```typescript
import { getResource } from "../../../services/[role]/[resource]/[resource]Service";
```

**From Repositories**:

```typescript
import { findResourceById } from "../../../repositories/[domain]/[resource]Repository";
```

**From Utils**:

```typescript
import { successResponse, errorResponse } from "../../../utils/response";
import { verifyClientAccess } from "../../../utils/clientAuth";
```

---

## Best Practices

### Do's

- ✅ Always follow the four-layer architecture
- ✅ Use custom error classes
- ✅ Use response utilities
- ✅ Validate input at controller layer
- ✅ Implement business logic in services
- ✅ Keep repositories simple (CRUD only)
- ✅ Use TypeScript types throughout

### Don'ts

- ❌ Skip layers (e.g., database queries in controllers)
- ❌ Mix concerns (business logic in repositories)
- ❌ Return NextResponse from services/repositories
- ❌ Use raw error handling
- ❌ Access Prisma directly outside repositories
- ❌ Put authentication logic in services

---

## Related Documentation

- **Architecture Overview**: See [ARCHITECTURE_SPEC.md](./ARCHITECTURE_SPEC.md)
- **Frontend Structure**: See [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)
- **RBAC Details**: See [ROLE_BASED_ACCESS.md](./ROLE_BASED_ACCESS.md)
- **API Reference**: See [../API_ARCHITECTURE.md](../API_ARCHITECTURE.md)

---

**Last Updated**: January 2025  
**Version**: 1.0
