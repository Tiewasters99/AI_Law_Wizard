# Library Utilities

This folder contains shared utilities organized by their usage context with clear separation between frontend and backend code.

## Folder Structure

```
src/lib/
├── backend/                    # Server-side utilities
│   ├── services/              # External service integrations
│   │   ├── onedriveService.ts # OneDrive/Microsoft Graph API
│   │   ├── openRouterService.ts
│   │   └── documentProcessor.ts
│   ├── api/                   # API configuration
│   ├── auth.ts               # Authentication
│   ├── prisma.ts             # Database
│   ├── pacerCodes.ts         # PACER court codes
│   └── index.ts
├── frontend/                   # Client-side utilities
│   ├── onedriveUtils.ts      # OneDrive UI utilities
│   ├── designSystem.ts       # Design tokens
│   ├── tokenTracker.ts       # Token usage tracking
│   ├── utils.ts              # General frontend utils
│   └── index.ts
└── index.ts                   # Main exports
```

## Quick Start

### Import Backend Utilities

```typescript
import {
  authOptions,
  prisma,
  OneDriveService,
  PacerCodeUtils,
} from "@/lib/backend";
```

### Import Frontend Utilities

```typescript
import { cn, colors, formatFileSize, getFileIcon } from "@/lib/frontend";
```

### Import Everything

```typescript
import {
  authOptions,
  prisma,
  cn,
  colors,
  OneDriveService,
  formatFileSize,
} from "@/lib";
```

## Organization Philosophy

### Backend (`/backend`)

**Used by**: API routes, server components, backend services

- Database operations (Prisma)
- Authentication (NextAuth)
- External service integrations (OneDrive, OpenRouter)
- API configuration and rate limiting
- PACER court codes and legal data
- Server-side file processing

**⚠️ Never use** in client-side React components!

### Frontend (`/frontend`)

**Used by**: React components, pages, client-side code

- UI utilities (className helpers, file formatting)
- Design system (colors, typography)
- Client-side state tracking
- Browser APIs
- OneDrive UI utilities (file icons, size formatting)
- Client-side file operations

**✅ Safe to use** in any React component!

## Example Usage

### API Route (Backend)

```typescript
import { authOptions, prisma, OneDriveService } from "@/lib/backend";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const oneDriveService = new OneDriveService(request.cookies);
  const files = await oneDriveService.listFiles();
  return Response.json({ files });
}
```

### React Component (Frontend)

```typescript
import { cn, formatFileSize, getFileIcon } from '@/lib/frontend'

export function FileItem({ file, className }) {
  return (
    <div className={cn("flex items-center p-2", className)}>
      <span className="mr-2">{getFileIcon(file.type, file.isFolder)}</span>
      <span>{file.name}</span>
      <span className="ml-auto text-sm text-gray-500">
        {formatFileSize(file.size)}
      </span>
    </div>
  )
}
```

## Benefits

- ✅ Clear separation of concerns
- ✅ Easy to understand what's safe to import where
- ✅ Prevents accidentally importing backend code in components
- ✅ Better organization and maintainability
- ✅ TypeScript can catch incorrect imports

## Migration Notes

All imports from `@/lib/*` are now organized:

- `@/lib/auth` → `@/lib/backend/auth`
- `@/lib/prisma` → `@/lib/backend/prisma`
- `@/lib/onedrive/service` → `@/lib/backend/services/onedriveService`
- `@/lib/onedrive/utils` → `@/lib/frontend/onedriveUtils`
- `@/lib/pacerCodes` → `@/lib/backend/pacerCodes`
- `@/lib/utils` → `@/lib/frontend/utils`

You can also use the convenience exports:

- `@/lib/backend` - all backend utilities
- `@/lib/frontend` - all frontend utilities
- `@/lib` - everything (for when you need both)

## New Structure Benefits

- **Clear separation**: Backend code stays on the server, frontend code goes to the client
- **Better organization**: Services are grouped logically in the backend
- **Type safety**: TypeScript can catch incorrect imports across boundaries
- **Performance**: Prevents server-side code from being bundled in client builds
- **Maintainability**: Easy to find and update related functionality
