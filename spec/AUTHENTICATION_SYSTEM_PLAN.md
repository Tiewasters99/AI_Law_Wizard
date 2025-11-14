# Authentication System Implementation Plan

## Overview
Implement a role-based authentication system with Google OAuth, supporting two user profiles:
- **Attorney**: Full access to all features including wizard, token management, and advanced functionality
- **Client**: Limited access with different UI/UX, no token visibility, specialized wizard functionality

## Core Components

### 1. Authentication Architecture
- **Provider**: Google OAuth via NextAuth.js
- **State Management**: Zustand store for client-side auth state
- **Role Management**: Database-driven role assignment
- **Route Protection**: Middleware-based access control

### 2. User Roles & Permissions

#### Attorney Role
- Access to all current features
- Token purchase and management
- Full wizard functionality
- Document processing capabilities
- Admin features (if applicable)
- Billing and subscription management

#### Client Role
- Limited feature set
- No token visibility
- Specialized wizard for client needs
- Basic document viewing
- Consultation features
- No billing access

### 3. Database Schema Changes

#### User Model Updates
```sql
-- Add role and profile fields to User model
ALTER TABLE User ADD COLUMN role ENUM('ATTORNEY', 'CLIENT') DEFAULT 'CLIENT';
ALTER TABLE User ADD COLUMN profile_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE User ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE User ADD COLUMN profile_data JSON;
```

### 4. Authentication Flow

#### Initial Login Process
1. User clicks "Sign In with Google"
2. Google OAuth authentication
3. Role selection screen (Attorney/Client)
4. Profile completion (if needed)
5. Redirect to appropriate dashboard

#### Role Selection Logic
- First-time users: Must select role
- Existing users: Role remembered, can switch if needed
- Attorney verification: Future implementation for verification process

### 5. State Management (Zustand)

#### Auth Store Structure
```typescript
interface AuthState {
  user: User | null
  role: 'ATTORNEY' | 'CLIENT' | null
  isAuthenticated: boolean
  isLoading: boolean
  profileComplete: boolean
  actions: {
    signIn: (role: 'ATTORNEY' | 'CLIENT') => Promise<void>
    signOut: () => Promise<void>
    updateProfile: (data: ProfileData) => Promise<void>
    switchRole: (role: 'ATTORNEY' | 'CLIENT') => Promise<void>
  }
}
```

### 6. UI Components

#### Role Selection Component
- Clean, professional design
- Clear distinction between Attorney and Client options
- Information about each role's capabilities
- Google OAuth integration

#### Conditional Rendering
- Token management (Attorney only)
- Wizard features (role-specific)
- Navigation menu (role-based)
- Dashboard layouts (different for each role)

### 7. Route Protection

#### Protected Routes
- `/wizard` - Attorney only
- `/tokens` - Attorney only
- `/admin` - Attorney only
- `/profile` - Both roles
- `/query-history` - Both roles (different views)

#### Middleware Updates
- Check authentication status
- Verify role permissions
- Redirect unauthorized users
- Handle role switching

### 8. Security Considerations

#### Data Protection
- Role-based data access
- Secure session management
- Token validation
- CSRF protection

#### Privacy
- Client data isolation
- Attorney-client confidentiality
- Secure document handling

### 9. Implementation Phases

#### Phase 1: Core Authentication
- Google OAuth setup
- Role-based database schema
- Basic Zustand store
- Role selection UI

#### Phase 2: Route Protection
- Middleware implementation
- Protected route logic
- Conditional rendering

#### Phase 3: Feature Differentiation
- Attorney-specific features
- Client-specific features
- UI/UX customization

#### Phase 4: Advanced Features
- Role switching
- Profile management
- Verification system (future)

### 10. File Structure

```
src/
├── app/
│   ├── api/auth/
│   │   └── [...nextauth]/
│   │       └── route.ts (Google OAuth config)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── RoleSelection.tsx
│   │   │   ├── GoogleSignIn.tsx
│   │   │   └── AuthGuard.tsx
│   │   └── role-based/
│   │       ├── AttorneyDashboard.tsx
│   │       └── ClientDashboard.tsx
│   └── lib/
│       ├── auth.ts (NextAuth config)
│       └── roleUtils.ts
├── stores/
│   └── authStore.ts (Zustand auth store)
└── middleware.ts (Route protection)
```

### 11. Environment Variables

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 12. Testing Strategy

#### Unit Tests
- Auth store functionality
- Role-based utilities
- Route protection logic

#### Integration Tests
- Google OAuth flow
- Database operations
- API endpoints

#### E2E Tests
- Complete authentication flow
- Role switching
- Feature access control

## Security Best Practices

1. **JWT Token Management**: Secure token storage and validation
2. **Role Validation**: Server-side role verification
3. **Data Isolation**: Role-based data access controls
4. **Session Security**: Secure session management
5. **Input Validation**: Sanitize all user inputs
6. **Rate Limiting**: Prevent abuse of authentication endpoints

## Future Enhancements

1. **Attorney Verification**: Document verification system
2. **Multi-tenant Architecture**: Support for law firms
3. **Advanced Permissions**: Granular permission system
4. **Audit Logging**: Track user actions and role changes
5. **SSO Integration**: Enterprise authentication options
