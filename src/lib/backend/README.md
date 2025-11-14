# Backend Utilities

This folder contains server-side utilities used in API routes and backend services.

## Structure

```
backend/
├── api/           # API configuration and utilities
│   ├── config.ts  # API tier configurations
│   └── rateLimiter.ts  # Rate limiting utilities
├── services/      # External service integrations
│   ├── openRouterService.ts  # AI model service
│   └── documentProcessor.ts  # Document processing
├── auth.ts        # NextAuth configuration
├── prisma.ts      # Prisma database client
└── api.ts         # Consultation API utilities
```

## Usage

### Import from main index

```typescript
import { authOptions, prisma } from "@/lib/backend";
```

### Import directly

```typescript
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";
```

## Key Files

- **auth.ts**: NextAuth configuration with OAuth and credentials providers
- **prisma.ts**: Database client singleton
- **api/config.ts**: API tier configurations (demo, basic, premium, enterprise)
- **api/rateLimiter.ts**: Rate limiting for API endpoints
- **services/openRouterService.ts**: AI model integration service
- **services/documentProcessor.ts**: Document analysis and processing

## Purpose

This folder is specifically for:

- ✅ Server-side only code
- ✅ API route handlers
- ✅ Database operations
- ✅ Authentication logic
- ✅ External service integrations

**Never use** these utilities in client-side components (React components).
