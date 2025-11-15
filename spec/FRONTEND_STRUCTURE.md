# AI Law Wizard - Frontend Structure Specification

## Table of Contents

1. [Overview](#overview)
2. [Next.js App Router Structure](#nextjs-app-router-structure)
3. [Route Groups](#route-groups)
4. [Page Organization](#page-organization)
5. [Component Organization](#component-organization)
6. [Layout System](#layout-system)
7. [Client-Side State Management](#client-side-state-management)
8. [Design System Integration](#design-system-integration)
9. [File Naming Conventions](#file-naming-conventions)

---

## Overview

The frontend is built with **Next.js 14+ App Router** and follows a role-based organization pattern. Pages, components, and layouts are organized by user roles to maintain clear separation and enable role-specific functionality.

### Key Characteristics

- **Next.js App Router**: File-based routing with route groups
- **Role-Based Organization**: Pages and components organized by role
- **Server & Client Components**: Mix of server and client components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **Zustand**: Client-side state management
- **Framer Motion**: Animations

---

## Next.js App Router Structure

### Root Structure

```
src/app/
├── (authenticated)/     # Protected pages requiring authentication
├── (guest)/            # Public authenticated pages
├── (public)/           # Public landing pages
├── api/                # API routes (backend)
├── globals.css         # Global styles and CSS variables
├── layout.tsx          # Root layout (HTML structure)
└── providers.tsx       # Context providers (SessionProvider, etc.)
```

### Route Groups

Route groups (folders in parentheses) organize pages without affecting URL structure:

- `(authenticated)`: Pages requiring user authentication
- `(guest)`: Public pages accessible without authentication
- `(public)`: Public landing and marketing pages

**URL Structure**: Route groups don't appear in URLs
- File: `src/app/(authenticated)/client/dashboard/page.tsx`
- URL: `/client/dashboard` (not `/(authenticated)/client/dashboard`)

---

## Route Groups

### (authenticated) Route Group

**Purpose**: Protected pages requiring user authentication

**Structure**:
```
src/app/(authenticated)/
├── layout.tsx          # Authenticated layout wrapper
├── client/             # Client pages
│   ├── layout.tsx
│   ├── dashboard/
│   ├── wizard/
│   └── tokens/
├── attorney/           # Attorney pages
│   ├── layout.tsx
│   ├── dashboard/
│   ├── wizard/
│   └── blog/
└── admin/              # Admin pages
    ├── layout.tsx
    ├── dashboard/
    ├── clients/
    └── attorneys/
```

**Layout Flow**:
1. Root layout (`src/app/layout.tsx`)
2. Authenticated layout (`src/app/(authenticated)/layout.tsx`)
3. Role-specific layout (`src/app/(authenticated)/[role]/layout.tsx`)
4. Page component

### (guest) Route Group

**Purpose**: Public pages accessible without authentication

**Structure**:
```
src/app/(guest)/
├── blog/
├── legal-research/
└── attorney-features/
```

### (public) Route Group

**Purpose**: Public landing and marketing pages

**Structure**:
```
src/app/(public)/
└── page.tsx            # Landing page
```

---

## Page Organization

### Role-Based Page Structure

Pages are organized by user role under `(authenticated)`:

#### Client Pages

**Location**: `src/app/(authenticated)/client/`

**Pages**:
- `/client/dashboard` - Client dashboard
- `/client/wizard` - Document analysis wizard
- `/client/grand-wizard` - Advanced AI assistant
- `/client/tokens` - Token management
- `/client/profile` - User profile
- `/client/directory` - Attorney directory
- `/client/blog` - Legal blog posts
- `/client/inbox` - Messages and conversations
- `/client/integrations` - Third-party integrations
- `/client/miniverse` - 3D visualization

**File Structure**:
```
src/app/(authenticated)/client/
├── layout.tsx
├── dashboard/
│   └── page.tsx
├── wizard/
│   ├── page.tsx
│   └── components/
├── tokens/
│   └── page.tsx
└── profile/
    └── page.tsx
```

#### Attorney Pages

**Location**: `src/app/(authenticated)/attorney/`

**Pages**:
- `/attorney/dashboard` - Attorney dashboard
- `/attorney/wizard` - Document processing wizard
- `/attorney/grand-wizard` - Advanced AI assistant
- `/attorney/blog` - Blog management
- `/attorney/directory` - Attorney directory
- `/attorney/inbox` - Messages and conversations
- `/attorney/tokens` - Token management
- `/attorney/profile` - Attorney profile
- `/attorney/query-history` - Query history
- `/attorney/integrations` - Third-party integrations
- `/attorney/miniverse` - 3D visualization
- `/attorney/docket-genie` - Docket management

**File Structure**:
```
src/app/(authenticated)/attorney/
├── layout.tsx
├── dashboard/
│   └── page.tsx
├── wizard/
│   ├── page.tsx
│   └── components/
├── blog/
│   └── page.tsx
└── tokens/
    └── page.tsx
```

#### Admin Pages

**Location**: `src/app/(authenticated)/admin/`

**Pages**:
- `/admin/dashboard` - Admin dashboard
- `/admin/clients` - Client management
- `/admin/attorneys` - Attorney management
- `/admin/pricing` - Pricing management
- `/admin/features` - Feature flags
- `/admin/logs` - Activity logs
- `/admin/users/new` - Create new user

**File Structure**:
```
src/app/(authenticated)/admin/
├── layout.tsx
├── dashboard/
│   └── page.tsx
├── clients/
│   └── page.tsx
└── attorneys/
    └── page.tsx
```

### Page Component Pattern

**Server Component** (default):
```typescript
// src/app/(authenticated)/client/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Server-side data fetching
  const data = await fetchDashboardData(session.user.id);
  
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Render data */}
    </div>
  );
}
```

**Client Component** (when needed):
```typescript
// src/app/(authenticated)/client/wizard/page.tsx
"use client";

import { useState } from "react";

export default function WizardPage() {
  const [state, setState] = useState();
  
  return (
    <div>
      {/* Interactive UI */}
    </div>
  );
}
```

---

## Component Organization

### Component Directory Structure

```
src/components/
├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── input.tsx
│   └── ...
├── admin/              # Admin-specific components
│   ├── layout/
│   │   ├── AdminSidebar.tsx
│   │   └── AdminTopBar.tsx
│   └── ...
├── attorney/           # Attorney-specific components
│   ├── layout/
│   │   └── AttorneyLayout.tsx
│   ├── tokens/
│   │   └── PaymentForm.tsx
│   └── ...
├── client/             # Client-specific components
│   ├── ClientSidebar.tsx
│   ├── ClientTopBar.tsx
│   └── ...
├── miniverse/          # 3D visualization components
│   └── ...
└── providers/          # Context providers
    └── ...
```

### Component Types

#### 1. UI Components (`src/components/ui/`)

**Purpose**: Reusable, theme-aware components from shadcn/ui

**Examples**:
- `Button` - Primary, secondary, destructive variants
- `Card` - Container component
- `Badge` - Status indicators
- `Input` - Form inputs
- `Dialog` - Modal dialogs

**Usage**:
```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

<Card>
  <Button variant="primary">Click me</Button>
</Card>
```

#### 2. Role-Specific Components

**Location**: `src/components/[role]/`

**Purpose**: Components specific to a user role

**Examples**:
- `ClientSidebar` - Client navigation sidebar
- `AttorneyLayout` - Attorney page layout
- `AdminSidebar` - Admin navigation sidebar

**Usage**:
```typescript
import { ClientSidebar } from "@/components/client/ClientSidebar";
```

#### 3. Feature Components

**Location**: `src/components/[role]/[feature]/`

**Purpose**: Components for specific features

**Examples**:
- `src/components/attorney/tokens/PaymentForm.tsx`
- `src/components/client/wizard/DocumentUpload.tsx`

### Component Patterns

#### Server Component
```typescript
// No "use client" directive
import { getServerSession } from "next-auth";

export default async function ServerComponent() {
  const session = await getServerSession(authOptions);
  return <div>Server-rendered content</div>;
}
```

#### Client Component
```typescript
"use client";

import { useState } from "react";

export default function ClientComponent() {
  const [state, setState] = useState();
  return <div>Interactive content</div>;
}
```

#### Layout Component
```typescript
"use client";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout-container">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

---

## Layout System

### Layout Hierarchy

1. **Root Layout** (`src/app/layout.tsx`)
   - HTML structure
   - Global providers
   - Theme setup

2. **Authenticated Layout** (`src/app/(authenticated)/layout.tsx`)
   - Authentication check
   - Role-based layout routing
   - Session management

3. **Role-Specific Layout** (`src/app/(authenticated)/[role]/layout.tsx`)
   - Role-specific navigation
   - Sidebar/topbar
   - Role-specific UI elements

### Root Layout

**File**: `src/app/layout.tsx`

**Responsibilities**:
- HTML structure (`<html>`, `<body>`)
- Global providers (SessionProvider, ThemeProvider)
- Global styles
- Metadata

**Structure**:
```typescript
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Authenticated Layout

**File**: `src/app/(authenticated)/layout.tsx`

**Responsibilities**:
- Check authentication status
- Redirect unauthenticated users
- Route to role-specific layouts
- Fetch role-specific data (e.g., unread counts)

**Structure**:
```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AttorneyLayout } from "@/components/attorney/layout/AttorneyLayout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const role = session?.user?.role;

  if (role === "ATTORNEY") {
    return <AttorneyLayout>{children}</AttorneyLayout>;
  }

  if (role === "CUSTOMER") {
    return <>{children}</>; // ClientLayout applied at role level
  }

  return <>{children}</>;
}
```

### Role-Specific Layouts

#### Client Layout

**File**: `src/app/(authenticated)/client/layout.tsx`

**Features**:
- Client sidebar navigation
- Client top bar
- Mobile-responsive sidebar
- Unread message counts

**Structure**:
```typescript
"use client";

import { ClientSidebar } from "@/components/client/ClientSidebar";
import { ClientTopBar } from "@/components/client/ClientTopBar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col">
      <ClientTopBar />
      <div className="flex-1 flex">
        <ClientSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
```

#### Attorney Layout

**File**: `src/app/(authenticated)/attorney/layout.tsx`

**Note**: Attorney layout is applied in the authenticated layout wrapper.

**Component**: `src/components/attorney/layout/AttorneyLayout.tsx`

**Features**:
- Attorney sidebar navigation
- Attorney top bar
- Unread message counts

#### Admin Layout

**File**: `src/app/(authenticated)/admin/layout.tsx`

**Features**:
- Admin sidebar navigation
- Admin top bar
- Admin authentication check
- Loading states

**Structure**:
```typescript
"use client";

import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopBar } from "@/components/admin/layout/AdminTopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (!session?.isAdmin) {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopBar />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

---

## Client-Side State Management

### Zustand Stores

**Location**: `src/stores/`

**Purpose**: Client-side state management for interactive features

### Store Structure

```
src/stores/
├── authStore.ts              # Authentication state
├── uiStore.ts                # UI state (modals, themes)
├── documentProcessingStore.ts # Document processing state
├── queryHistoryStore.ts      # Query history state
└── miniverseStore.ts         # 3D visualization state
```

### Store Pattern

**Example**: `src/stores/authStore.ts`

```typescript
import { create } from "zustand";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
}));
```

**Usage**:
```typescript
"use client";

import { useAuthStore } from "@/stores/authStore";

export default function Component() {
  const { user, isAuthenticated } = useAuthStore();
  return <div>{user?.name}</div>;
}
```

### Store Responsibilities

- **authStore**: User session state, authentication status
- **uiStore**: Modal states, theme preferences, UI toggles
- **documentProcessingStore**: Document upload/processing state
- **queryHistoryStore**: Query history and search state
- **miniverseStore**: 3D scene state and interactions

---

## Design System Integration

### CSS Variables

**Location**: `src/app/globals.css`

**Usage**: All colors, spacing, and design tokens use CSS variables

```css
:root {
  --primary: oklch(0.589 0.2267 310.2668);
  --background: oklch(0.994 0 0);
  --foreground: oklch(0 0 0);
  /* ... */
}
```

### Tailwind Configuration

**File**: `tailwind.config.js`

**Integration**: Tailwind uses CSS variables for theming

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        background: "var(--background)",
        // ...
      },
    },
  },
};
```

### Component Styling

**Pattern**: Use Tailwind classes with design system tokens

```typescript
<button className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl">
  Button
</button>
```

**Rules**:
- ✅ Use CSS variable classes (`bg-primary`, `text-foreground`)
- ✅ Use Tailwind spacing scale (`p-4`, `gap-4`)
- ✅ Use consistent border radius (`rounded-xl`)
- ❌ Don't use raw color values (`bg-[#1e40af]`)
- ❌ Don't use arbitrary spacing (`p-[13px]`)

---

## File Naming Conventions

### Page Files

- **Page**: Always named `page.tsx`
- **Layout**: Always named `layout.tsx`
- **Loading**: `loading.tsx` (Next.js loading UI)
- **Error**: `error.tsx` (Next.js error boundary)
- **Not Found**: `not-found.tsx` (404 page)

### Component Files

- **PascalCase**: `ClientSidebar.tsx`, `AdminTopBar.tsx`
- **Descriptive**: Component name matches file name
- **Co-located**: Related components in same directory

### Directory Naming

- **kebab-case**: `document-processing/`, `legal-research/`
- **Role-based**: `client/`, `attorney/`, `admin/`
- **Feature-based**: `wizard/`, `tokens/`, `blog/`

### Import Patterns

**Absolute Imports** (preferred):
```typescript
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
```

**Relative Imports** (for co-located files):
```typescript
import { SubComponent } from "./SubComponent";
```

---

## Data Fetching Patterns

### Server Components

**Pattern**: Direct data fetching in server components

```typescript
// src/app/(authenticated)/client/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const data = await fetch(`/api/client/dashboard`, {
    headers: { Cookie: cookies().toString() },
  }).then((res) => res.json());

  return <div>{/* Render data */}</div>;
}
```

### Client Components

**Pattern**: Use React hooks for data fetching

```typescript
"use client";

import { useEffect, useState } from "react";

export default function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/client/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{/* Render data */}</div>;
}
```

### API Route Calls

**Pattern**: Call API routes from client components

```typescript
"use client";

const response = await fetch("/api/client/profile", {
  method: "GET",
  credentials: "include", // Include cookies for auth
});
```

---

## Best Practices

### Do's

- ✅ Use route groups for organization
- ✅ Organize pages by role
- ✅ Use server components by default
- ✅ Use client components only when needed
- ✅ Follow design system tokens
- ✅ Use TypeScript types
- ✅ Co-locate related components

### Don'ts

- ❌ Mix server and client component patterns incorrectly
- ❌ Use raw color values
- ❌ Skip responsive design
- ❌ Create components when shadcn/ui exists
- ❌ Put business logic in components
- ❌ Access Prisma directly from components

---

## Related Documentation

- **Architecture Overview**: See [ARCHITECTURE_SPEC.md](./ARCHITECTURE_SPEC.md)
- **Backend Structure**: See [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md)
- **RBAC Details**: See [ROLE_BASED_ACCESS.md](./ROLE_BASED_ACCESS.md)
- **Design System**: See [../DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)

---

**Last Updated**: January 2025  
**Version**: 1.0

