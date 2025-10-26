# Frontend Utilities

This folder contains client-side utilities used in React components and pages.

## Structure

```
frontend/
├── utils.ts           # General utility functions
├── designSystem.ts    # Design tokens and styling
└── tokenTracker.ts    # Client-side token tracking
```

## Usage

### Import from main index

```typescript
import { cn, colors, tokenTracker } from "@/lib/frontend";
```

### Import directly

```typescript
import { cn } from "@/lib/frontend/utils";
import { colors } from "@/lib/frontend/designSystem";
```

## Key Files

- **utils.ts**: Utility functions (e.g., `cn` for className merging)
- **designSystem.ts**: Design tokens, colors, typography, and styling utilities
- **tokenTracker.ts**: Client-side token usage tracking with localStorage

## Purpose

This folder is specifically for:

- ✅ Client-side utilities
- ✅ UI/UX utilities
- ✅ Design system tokens
- ✅ Browser APIs (localStorage, etc.)
- ✅ React component helpers

**Safe to use** in any client-side React component or page.
