# AI Law Wizard - API Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture Patterns](#architecture-patterns)
3. [API Structure](#api-structure)
4. [Authentication & Authorization](#authentication--authorization)
5. [Rate Limiting](#rate-limiting)
6. [Error Handling](#error-handling)
7. [Database Integration](#database-integration)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Common Patterns](#common-patterns)
10. [Best Practices](#best-practices)

---

## Overview

The AI Law Wizard API is built using **Next.js App Router** with the Route Handler pattern. The API is organized by user roles (Client, Attorney, Admin, Guest) to provide role-specific functionality while maintaining a consistent architecture.

### Key Characteristics

- **Layered Architecture**: Controller → Service → Repository pattern
- **Role-Based Organization**: APIs organized by user roles for security
- **Type-Safe**: Built with TypeScript throughout
- **Database-First**: Uses Prisma ORM for database operations
- **Authentication**: NextAuth.js for session management
- **Rate Limiting**: Configurable rate limits by user tier
- **Service Layer**: Centralized services for external integrations (OpenRouter AI, Stripe, OneDrive, etc.)
- **Error Handling**: Custom error classes with standardized responses

### Backend Directory Structure

```
src/lib/backend/
├── controllers/        # Request/response handling by role
│   ├── admin/
│   ├── attorney/
│   ├── client/
│   ├── auth/
│   ├── demo/
│   └── guest/
├── services/          # Business logic orchestration
│   ├── admin/
│   ├── attorney/
│   ├── client/
│   ├── auth/
│   ├── openRouterService.ts
│   └── documentProcessor.ts
├── repositories/      # Database access layer
│   ├── admin/
│   ├── attorney/
│   ├── common/
│   ├── pricing/
│   └── purchase/
├── utils/            # Utility functions
│   ├── errors.ts            # Custom error classes
│   ├── response.ts          # Response helpers
│   ├── adminAuth.ts         # Admin auth utilities
│   └── validation.ts        # Input validation
├── api/              # API configuration
│   ├── config.ts           # Tier configurations
│   └── rateLimiter.ts      # Rate limiting
├── auth.ts           # NextAuth configuration
├── prisma.ts         # Prisma client
└── index.ts          # Main exports
```

---

## Architecture Patterns

### 1. Layered Architecture (Controller-Service-Repository)

The API follows a three-tier architecture pattern for better separation of concerns:

```
API Route → Controller → Service → Repository → Database
```

- **Routes** (`src/app/api/[role]/[resource]/route.ts`): HTTP endpoint handlers
- **Controllers** (`src/lib/backend/controllers/`): Request/response handling, validation
- **Services** (`src/lib/backend/services/`): Business logic orchestration
- **Repositories** (`src/lib/backend/repositories/`): Database operations, data access layer

### 2. Route Handler Pattern

All API endpoints use Next.js Route Handlers located in `src/app/api/[role]/[resource]/route.ts`.

```typescript
// Example: GET /api/client/profile
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Authorization
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Business Logic
    const data = await fetchData(session.user.id);

    // Response
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 3. Complete Example: Layered Architecture

Here's a complete example showing how all layers work together:

```typescript
// 1. API Route (src/app/api/admin/dashboard/stats/route.ts)
import { NextRequest, NextResponse } from "next/server";
import { handleGetDashboardStats } from "@/lib/backend/controllers/admin/dashboard/dashboardStatsController";

export async function GET(request: NextRequest) {
  return await handleGetDashboardStats(request);
}

// 2. Controller (src/lib/backend/controllers/admin/dashboard/dashboardStatsController.ts)
import { NextRequest } from "next/server";
import { requireAdminAuth } from "../../../utils/adminAuth";
import { getDashboardStats } from "../../../services/admin/dashboard/dashboardStatsService";
import { successResponse, errorResponse } from "../../../utils/response";

export async function handleGetDashboardStats(request: NextRequest) {
  try {
    const admin = await requireAdminAuth(request);
    const stats = await getDashboardStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error, "Failed to fetch dashboard statistics");
  }
}

// 3. Service (src/lib/backend/services/admin/dashboard/dashboardStatsService.ts)
import { getUserCounts, getFeatureCounts, getTokenStats, getRevenueStats }
  from "../../../repositories/admin/dashboardRepository";

export async function getDashboardStats() {
  const userCounts = await getUserCounts();
  const featureCounts = await getFeatureCounts();
  const tokenStats = await getTokenStats(userCounts.total);

  // Business logic aggregation
  return {
    users: { total: userCounts.total, ... },
    features: { ...featureCounts },
    tokens: { ...tokenStats },
  };
}

// 4. Repository (src/lib/backend/repositories/admin/dashboardRepository.ts)
import { prisma } from "../../prisma";

export async function getUserCounts() {
  const total = await prisma.user.count();
  const customers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
  const attorneys = await prisma.user.count({ where: { role: 'ATTORNEY' } });

  return { total, customers, attorneys };
}
```

### 4. Service Layer Pattern

External services and complex operations are abstracted into service classes:

```typescript
// OpenRouter AI Service
const response = await openRouterService.chat({
  model: openRouterService.getModelForTier("premium"),
  messages: [{ role: "system", content: prompt }],
  max_tokens: 4000,
  temperature: 0.1,
});

// Stripe Service
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000,
  currency: "usd",
});

// OneDrive Service
const files = await oneDriveService.listFiles(accessToken);
```

### 5. Database Access Pattern

All database operations go through the Repository layer using Prisma:

```typescript
// Simple query
const user = await prisma.user.findUnique({
  where: { email: session.user.email },
});

// Query with relations
const conversations = await prisma.conversation.findMany({
  where: { clientId: session.user.id },
  include: {
    attorney: { select: { id: true, name: true } },
    messages: { take: 1, orderBy: { createdAt: "desc" } },
  },
});

// Aggregations
const totalTokens = await prisma.tokenTransaction.aggregate({
  where: { userId: session.user.id, type: "PURCHASE" },
  _sum: { amount: true },
});
```

### 6. Error Handling Pattern

The application uses custom error classes with standardized error responses:

```typescript
// Custom error classes (src/lib/backend/utils/errors.ts)
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
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

// Error response handling (src/lib/backend/utils/response.ts)
export function errorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  // Handle unknown errors
  return NextResponse.json(
    { error: defaultMessage, code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}
```

### 7. Response Utility Pattern

Standardized response helpers ensure consistent API responses:

```typescript
// Success response
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}

// Error response
export function errorResponse(
  error: unknown,
  defaultMessage?: string
): NextResponse {
  // Handles AppError and generic errors
}

// Validation error
export function validationErrorResponse(message: string): NextResponse {
  return NextResponse.json(
    { error: message, code: "VALIDATION_ERROR" },
    { status: 400 }
  );
}
```

### Architecture Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Services and repositories can be unit tested independently
3. **Reusability**: Services can be reused across multiple controllers
4. **Maintainability**: Changes are isolated to specific layers
5. **Type Safety**: TypeScript interfaces ensure type safety across layers
6. **Consistency**: Standardized patterns across all endpoints

---

## API Structure

The API is organized into role-based directories:

```
src/app/api/
├── auth/              # Authentication endpoints
├── client/            # Client-specific APIs
├── attorney/          # Attorney-specific APIs
├── admin/             # Admin-only APIs
├── guest/             # Public/demo APIs
├── pricing/           # Public pricing information
├── purchase/          # Purchase processing
└── demo/              # Demo functionality
```

### Directory Breakdown

#### `/api/auth`

- **Purpose**: User authentication and session management
- **Endpoints**: Register, login, OAuth callbacks
- **Auth**: Public

#### `/api/client`

- **Purpose**: Client (CUSTOMER role) functionality
- **Endpoints**: Profile, conversations, document analysis, legal research, tokens
- **Auth**: Required (CUSTOMER role)

#### `/api/attorney`

- **Purpose**: Attorney functionality
- **Endpoints**: Profile, conversations, document processing, legal research, blog, Stripe, OneDrive
- **Auth**: Required (ATTORNEY or LAWYER role)

#### `/api/admin`

- **Purpose**: System administration
- **Endpoints**: Dashboard stats, user management, pricing, features, logs
- **Auth**: Admin session required

#### `/api/guest`

- **Purpose**: Public/demo functionality
- **Endpoints**: Limited legal research
- **Auth**: None (rate limited by IP)

#### `/api/demo`

- **Purpose**: Demo versions of paid features
- **Endpoints**: Document analysis, legal research
- **Auth**: None (rate limited)

#### `/api/pricing`

- **Purpose**: Public pricing information
- **Endpoints**: Packages, role pricing
- **Auth**: Public

#### `/api/purchase`

- **Purpose**: Token package purchases
- **Endpoints**: Create purchase
- **Auth**: Required

---

## Authentication & Authorization

### Authentication Flow

1. **User Registration** (`POST /api/auth/register`)
   - Validates input (email format, password strength)
   - Checks for existing users
   - Hashes password with bcrypt
   - Creates user and wallet with starter tokens

2. **User Login** (`POST /api/auth/[...nextauth]`)
   - NextAuth.js credentials provider
   - Validates email/password
   - Returns JWT session

3. **Admin Login** (`POST /api/auth/admin/[...nextauth]`)
   - Separate credentials provider
   - Validates against Admin table
   - Logs admin activity

### Authorization Patterns

#### Role-Based Access Control

```typescript
// Check authentication
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Check role
const isClient = session.user.role === "CUSTOMER";
if (!isClient) {
  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}
```

#### Admin Authorization

```typescript
// Using requireAdminAuth helper
try {
  const admin = await requireAdminAuth(request);
  // Proceed with admin logic
} catch (error) {
  return NextResponse.json({ error: error.message }, { status: 401 });
}
```

#### User Resource Ownership

```typescript
// Verify user owns the resource
const conversation = await prisma.conversation.findUnique({
  where: { id: conversationId },
});

if (conversation?.clientId !== session.user.id) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## Rate Limiting

### Implementation

Rate limiting is applied based on user tier and authentication status:

```typescript
const rateLimit = checkRateLimit(
  request,
  session?.user?.id || null,
  session?.user?.role || "GUEST",
  !!session
);

if (!rateLimit.allowed) {
  return NextResponse.json(
    { error: "Rate limit exceeded", resetTime: rateLimit.resetTime },
    { status: 429 }
  );
}

// Use rate limit headers in response
return NextResponse.json(data, {
  headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
});
```

### Rate Limit Tiers

Defined in `src/lib/backend/api/config.ts`:

- **GUEST**: 10 requests per 60 seconds
- **BASIC**: 30 requests per 60 seconds
- **PREMIUM**: 100 requests per 60 seconds
- **DEMO**: 5 requests per 60 seconds

### Rate Limit Headers

- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Error Handling

### Standard Error Response

All errors follow a consistent format:

```typescript
return NextResponse.json(
  { error: "Error message", details?: "Optional details" },
  { status: 400 } // Appropriate HTTP status
);
```

### HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Handling Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Validate input
    const body = await request.json();
    if (!body.query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // 2. Authenticate & authorize
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 3. Rate limiting
    const rateLimit = checkRateLimit(...);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // 4. Business logic
    const result = await performOperation(body);

    // 5. Success response
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Operation error:", error);
    return NextResponse.json(
      { error: "Operation failed" },
      { status: 500 }
    );
  }
}
```

---

## Database Integration

### Prisma Schema

Primary models:

- **User**: Core user data
- **Wallet**: Token balance management
- **Conversation**: Chat sessions
- **Message**: Chat messages
- **ConsultationRequest**: Client requests to attorneys
- **DocumentQuery**: AI query history
- **TokenTransaction**: Token purchases and usage
- **TokenPackage**: Purchasable token packages
- **RolePricing**: Role-specific pricing
- **Purchase**: Purchase records
- **Feature**: Feature flags
- **Admin**: Admin users
- **AdminActivityLog**: Admin activity tracking

### Common Prisma Patterns

#### Finding Records

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

#### Creating Records

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
  include: { wallet: true }, // Include related data
});
```

#### Updating Records

```typescript
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    name: "Updated Name",
    phone: "+1234567890",
  },
});
```

#### Aggregations

```typescript
const stats = await prisma.tokenTransaction.aggregate({
  where: { userId, type: "PURCHASE" },
  _sum: { amount: true },
  _count: true,
  _avg: { amount: true },
});
```

---

## API Endpoints Reference

### Authentication

#### `POST /api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "CUSTOMER" | "ATTORNEY"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

### Client APIs

#### `GET /api/client/profile`

Get client profile with statistics.

**Response:**

```json
{
  "id": "...",
  "name": "...",
  "statistics": {
    "totalQueries": 10,
    "tokensUsed": 500,
    "tokensRemaining": 4500
  }
}
```

#### `PATCH /api/client/profile`

Update client profile.

#### `GET /api/client/conversations`

List client conversations.

#### `POST /api/client/document-analysis`

Analyze documents (client tier).

#### `POST /api/client/legal-research`

Perform legal research (client tier).

#### `GET /api/client/tokens/balance`

Get token balance.

#### `GET /api/client/tokens/transactions`

Get token transaction history.

### Attorney APIs

#### `POST /api/attorney/document-processing`

Advanced document analysis.

#### `POST /api/attorney/legal-research`

Comprehensive legal research with citations.

#### `GET /api/attorney/blog`

List attorney blog posts.

#### `POST /api/attorney/blog`

Create blog post.

#### `POST /api/attorney/stripe/create-payment-intent`

Create Stripe payment intent for token purchase.

#### `GET /api/attorney/onedrive`

List OneDrive files.

### Admin APIs

#### `GET /api/admin/dashboard/stats`

Get dashboard statistics.

#### `GET /api/admin/dashboard/activity`

Get recent activity.

#### `GET /api/admin/features`

List feature flags.

#### `PUT /api/admin/features/[id]`

Update feature flag.

#### `GET /api/admin/pricing/packages`

List token packages.

#### `POST /api/admin/pricing/packages`

Create token package.

### Guest/Demo APIs

#### `POST /api/guest/legal-research`

Limited legal research (no auth required).

#### `POST /api/demo/document-analysis`

Demo document analysis (no auth required).

---

## Common Patterns

### 1. Profile Endpoints

Profile endpoints typically support GET (read) and PATCH (update):

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { wallet: true },
  });

  return NextResponse.json(formatProfile(user));
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const body = await request.json();
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: body,
  });

  return NextResponse.json({ success: true, data: updated });
}
```

### 2. List Endpoints

List endpoints support pagination and filtering:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const items = await prisma.model.findMany({
    where: filterCriteria,
    take: limit,
    skip: skip,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items, page, limit });
}
```

### 3. AI Processing Endpoints

AI endpoints follow a consistent pattern:

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorized();

    // 2. Rate limit
    const rateLimit = checkRateLimit(...);
    if (!rateLimit.allowed) return rateLimited();

    // 3. Parse request
    const { query, context } = await request.json();
    if (!query) return badRequest("Query required");

    // 4. Process with AI
    const response = await openRouterService.chat({
      model: openRouterService.getModelForTier(userTier),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
    });

    // 5. Save to database
    await prisma.documentQuery.create({
      data: {
        userQuery: query,
        aiResponse: response.choices[0]?.message?.content,
      },
    });

    // 6. Return result
    return NextResponse.json({
      success: true,
      result: response.choices[0]?.message?.content,
    }, {
      headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
    });
  } catch (error) {
    return serverError(error);
  }
}
```

### 4. Transaction Endpoints

Payment and purchase endpoints:

```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized();

  const { packageId } = await request.json();

  // Get package with role pricing
  const packageData = await prisma.tokenPackage.findUnique({
    where: { id: packageId },
    include: { RolePricing: true },
  });

  // Determine price
  const rolePrice = packageData.RolePricing.find(
    rp => rp.role === session.user.role
  );
  const price = rolePrice?.priceInCents || packageData.priceInCents;

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price,
    currency: "usd",
    metadata: { userId: session.user.id, packageId },
  });

  // Create purchase record
  await prisma.purchase.create({
    data: {
      userId: session.user.id,
      packageId,
      stripePaymentIntent: paymentIntent.id,
      tokensAwarded: packageData.tokens,
      amountPaid: price,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
  });
}
```

---

## Best Practices

### 1. Input Validation

Always validate user input:

```typescript
// Check required fields
if (!field) {
  return NextResponse.json({ error: "Field is required" }, { status: 400 });
}

// Validate format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
}

// Check constraints
if (password.length < 8) {
  return NextResponse.json(
    { error: "Password must be at least 8 characters" },
    { status: 400 }
  );
}
```

### 2. Error Logging

Log errors for debugging but don't expose details to users:

```typescript
try {
  // Operation
} catch (error) {
  console.error("Operation error:", error);
  return NextResponse.json(
    { error: "Operation failed" }, // Generic message
    { status: 500 }
  );
}
```

### 3. Database Transactions

Use transactions for multi-step operations:

```typescript
await prisma.$transaction(async tx => {
  // Create user
  const user = await tx.user.create({ data: userData });

  // Create wallet
  await tx.wallet.create({
    data: { userId: user.id, balance: 5000 },
  });
});
```

### 4. Type Safety

Use TypeScript interfaces for API contracts:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
  bio?: string;
}
```

### 5. Consistent Naming

- Use RESTful conventions: GET, POST, PATCH, DELETE
- Use clear endpoint names: `/conversations`, `/document-analysis`
- Use consistent field names: `userId`, `conversationId`, `packageId`

### 6. Security

- Always validate authentication before database access
- Check resource ownership before operations
- Use parameterized queries (Prisma does this automatically)
- Sanitize user input
- Rate limit all public endpoints
- Use HTTPS in production

### 7. Performance

- Use database indexes on frequently queried fields
- Implement pagination for list endpoints
- Use `select` to limit data returned
- Cache frequently accessed data when appropriate
- Use `take` and `skip` for pagination

---

## Service Layer Reference

### OpenRouterService

Centralized AI model access:

```typescript
// Import
import { openRouterService } from "@/lib/backend";

// Chat completion
const response = await openRouterService.chat({
  model: "openai/gpt-4",
  messages: [{ role: "user", content: "Hello" }],
  max_tokens: 1000,
  temperature: 0.7,
});

// Get model for tier
const model = openRouterService.getModelForTier("premium");

// Get max tokens for tier
const maxTokens = openRouterService.getMaxTokensForTier("premium");
```

### StripeService

Payment processing:

```typescript
import { stripe } from "@/lib/backend/stripeServer";

const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000,
  currency: "usd",
  metadata: { userId: "..." },
});
```

### OneDriveService

OneDrive integration:

```typescript
import { oneDriveService } from "@/lib/backend";

const files = await oneDriveService.listFiles(accessToken);
const uploadUrl = await oneDriveService.getUploadUrl(accessToken, fileName);
```

---

## Adding New Endpoints

Following the layered architecture, here's the complete process:

### 1. Create Repository Functions

```typescript
// src/lib/backend/repositories/[domain]/[entity]Repository.ts
import { prisma } from "../../prisma";

export async function findEntityById(id: string) {
  return await prisma.entity.findUnique({ where: { id } });
}

export async function findAllEntities() {
  return await prisma.entity.findMany();
}
```

### 2. Create Service Functions

```typescript
// src/lib/backend/services/[domain]/[entity]Service.ts
import {
  findEntityById,
  findAllEntities,
} from "../../../repositories/[domain]/[entity]Repository";
import { NotFoundError } from "../../../utils/errors";

export async function getEntity(id: string) {
  const entity = await findEntityById(id);
  if (!entity) throw new NotFoundError("Entity");
  return entity;
}

export async function listEntities() {
  return await findAllEntities();
}
```

### 3. Create Controller Functions

```typescript
// src/lib/backend/controllers/[domain]/[entity]Controller.ts
import { NextRequest } from "next/server";
import { requireAuth } from "../../../utils/[role]Auth";
import {
  getEntity,
  listEntities,
} from "../../../services/[domain]/[entity]Service";
import { successResponse, errorResponse } from "../../../utils/response";

export async function handleGetEntity(request: NextRequest, id: string) {
  try {
    const user = await requireAuth(request);
    const entity = await getEntity(id);
    return successResponse({ entity });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleListEntities(request: NextRequest) {
  try {
    await requireAuth(request);
    const entities = await listEntities();
    return successResponse({ entities });
  } catch (error) {
    return errorResponse(error);
  }
}
```

### 4. Create API Route

```typescript
// src/app/api/[role]/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleListEntities } from "@/lib/backend/controllers/[domain]/[entity]Controller";

export async function GET(request: NextRequest) {
  return await handleListEntities(request);
}

// src/app/api/[role]/[resource]/[id]/route.ts
import { handleGetEntity } from "@/lib/backend/controllers/[domain]/[entity]Controller";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await handleGetEntity(request, params.id);
}
```

### Quick Checklist

- [ ] Repository functions for database operations
- [ ] Service functions with business logic
- [ ] Controller functions with auth and error handling
- [ ] API route handlers
- [ ] Error handling at service layer
- [ ] Authentication at controller layer
- [ ] TypeScript interfaces for type safety
- [ ] Standardized responses

---

## Testing Endpoints

### Manual Testing

Use curl or Postman:

```bash
# GET request
curl -X GET http://localhost:3000/api/client/profile \
  -H "Cookie: next-auth.session-token=..."

# POST request
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test","role":"CUSTOMER"}'
```

### Authentication

For authenticated endpoints, include the session cookie from NextAuth.

---

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check session is valid and user is authenticated
2. **403 Forbidden**: Verify user role matches endpoint requirements
3. **429 Rate Limited**: Check rate limit configuration and wait for reset
4. **500 Internal Server Error**: Check server logs and database connectivity
5. **Prisma Errors**: Verify database schema matches Prisma schema

---

## Additional Resources

- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- NextAuth.js: https://next-auth.js.org
- Prisma: https://www.prisma.io/docs
- Stripe API: https://stripe.com/docs/api
- OpenRouter: https://openrouter.ai/docs

---

**Last Updated**: January 2025  
**Maintainer**: AI Law Wizard Team
