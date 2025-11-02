# API Quick Reference Guide

This is a condensed reference for developers working with the AI Law Wizard API.

## Authentication

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## Authorization

```typescript
// Check role
if (session.user.role !== "CUSTOMER") {
  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}

// Admin check
import { requireAdminAuth } from "@/lib/admin/apiProtection";
const admin = await requireAdminAuth(request);
```

## Rate Limiting

```typescript
import { checkRateLimit, getRateLimitHeaders } from "@/lib/backend";

const rateLimit = checkRateLimit(
  request,
  session.user.id,
  session.user.role,
  true // isAuthenticated
);

if (!rateLimit.allowed) {
  return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
}

// Include headers in response
return NextResponse.json(data, {
  headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
});
```

## Database Operations

```typescript
import { prisma } from "@/lib/backend/prisma";

// Find
const user = await prisma.user.findUnique({ where: { id } });

// List
const items = await prisma.item.findMany({
  where: { condition },
  take: 20,
  skip: 0,
  orderBy: { createdAt: "desc" },
});

// Create
const item = await prisma.item.create({ data: {...} });

// Update
const item = await prisma.item.update({
  where: { id },
  data: {...},
});

// Delete
await prisma.item.delete({ where: { id } });
```

## AI Operations

```typescript
import { openRouterService } from "@/lib/backend";

const response = await openRouterService.chat({
  model: openRouterService.getModelForTier("premium"),
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userQuery },
  ],
  max_tokens: 4000,
  temperature: 0.1,
});

const result = response.choices[0]?.message?.content;
```

## Payment Processing

```typescript
import { stripe } from "@/lib/backend/stripeServer";

const paymentIntent = await stripe.paymentIntents.create({
  amount: priceInCents,
  currency: "usd",
  metadata: { userId, packageId },
});

// Return client secret
return NextResponse.json({
  clientSecret: paymentIntent.client_secret,
});
```

## Standard Response Format

```typescript
// Success
return NextResponse.json({ success: true, data: result });

// Error
return NextResponse.json({ error: "Error message" }, { status: 400 });
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Endpoint Patterns

### GET List

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();

  const items = await prisma.model.findMany();
  return NextResponse.json({ items });
}
```

### GET Single

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();

  const item = await prisma.model.findUnique({ where: { id } });
  if (!item) return notFound();

  return NextResponse.json({ item });
}
```

### POST Create

```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();

  const body = await request.json();
  const item = await prisma.model.create({ data: body });

  return NextResponse.json({ success: true, item }, { status: 201 });
}
```

### PATCH Update

```typescript
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();

  const body = await request.json();
  const item = await prisma.model.update({
    where: { id: session.user.id },
    data: body,
  });

  return NextResponse.json({ success: true, item });
}
```

### DELETE Remove

```typescript
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();

  await prisma.model.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

## Imports Cheat Sheet

```typescript
// Core
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";

// Services
import { openRouterService } from "@/lib/backend";
import { stripe } from "@/lib/backend/stripeServer";
import { oneDriveService } from "@/lib/backend";

// Utilities
import { checkRateLimit, getRateLimitHeaders } from "@/lib/backend";
import { requireAdminAuth } from "@/lib/admin/apiProtection";
import { logAdminAction } from "@/lib/admin/activityLogger";
```

## Error Helpers

```typescript
function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function serverError(error: unknown) {
  console.error("Error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

## Common Validations

```typescript
// Required field
if (!field) {
  return badRequest("Field is required");
}

// Email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return badRequest("Invalid email format");
}

// Password strength
if (password.length < 8) {
  return badRequest("Password must be at least 8 characters");
}

// Role validation
if (!["ATTORNEY", "CUSTOMER"].includes(role)) {
  return badRequest("Invalid role");
}
```

## Query Parameters

```typescript
const { searchParams } = new URL(request.url);
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "20");
const skip = (page - 1) * limit;
```

## Pagination Response

```typescript
return NextResponse.json({
  items: [...],
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
```

## File Structure

```
src/app/api/
├── auth/                    # Authentication
├── client/                  # Client endpoints
│   ├── profile/route.ts
│   ├── conversations/route.ts
│   ├── document-analysis/route.ts
│   └── tokens/
├── attorney/                # Attorney endpoints
│   ├── profile/route.ts
│   ├── document-processing/route.ts
│   ├── stripe/
│   └── onedrive/
├── admin/                   # Admin endpoints
│   ├── dashboard/
│   ├── pricing/
│   └── features/
├── guest/                   # Public endpoints
│   └── legal-research/route.ts
├── demo/                    # Demo endpoints
├── pricing/                 # Public pricing
└── purchase/                # Purchase processing
```
