# Role Management System Migration - LAWYER to ATTORNEY

## Overview
This document summarizes the implementation of a robust role management system that migrates the `LAWYER` role to `ATTORNEY` while maintaining backward compatibility.

## Completed Changes

### 1. Database Migration
**File**: `prisma/migrations/20251010000000_migrate_lawyer_to_attorney/migration.sql`
- Added `ATTORNEY` to the Role enum
- Migrated existing LAWYER users to ATTORNEY
- Maintained backward compatibility by keeping LAWYER temporarily

**Prisma Schema** (`prisma/schema.prisma`):
```prisma
enum Role {
  ATTORNEY
  LAWYER    // Deprecated: Use ATTORNEY instead
  CUSTOMER
}
```

### 2. Enhanced Auth Store
**File**: `src/app/stores/authStore.ts`

**New Types**:
- `UserRole`: `'ATTORNEY' | 'CUSTOMER'` (new application-level type)
- `PrismaRole`: `'ATTORNEY' | 'LAWYER' | 'CUSTOMER'` (includes legacy support)
- `ROLE_MAPPING`: Maps legacy LAWYER to ATTORNEY

**New Helper Functions**:
- `normalizeRole()`: Converts LAWYER to ATTORNEY for backward compatibility
- `getRoleDisplayName()`: Returns user-friendly role names

**Enhanced State**:
- `isAttorney`: New property for attorney role check
- `isClient`: Alias for isCustomer
- `isLawyer`: Deprecated but kept for backward compatibility

**New Actions**:
- `getRoleDisplayName()`: Get display name for current user's role
- `hasRole(role)`: Check if user has specific role
- `checkRoleAccess(allowedRoles)`: Check if user has access based on allowed roles

### 3. Role Management Hook
**File**: `src/app/hooks/useRole.ts`
- Provides convenient access to role-specific functionality
- Includes access control helpers
- Future-ready for multiple OAuth providers

**Key Features**:
- `hasAccess(requiredRoles)`: Role-based access control
- `isRole(targetRole)`: Specific role checking
- `canManageClients`: Attorney-specific permission
- `canRequestServices`: Client-specific permission

### 4. OAuth Role Selection Flow
**Updated Files**:
- `src/lib/auth.ts`: OAuth users now have `profileComplete: false` to force role selection
- `src/app/components/auth/OAuthRoleSelection.tsx`: New component for role selection
- `src/app/profile-setup/page.tsx`: Shows role selection for new OAuth users

**Flow**:
1. User signs in with Google OAuth
2. New user created with `profileComplete: false`
3. Redirected to `/profile-setup`
4. Shows OAuthRoleSelection component
5. User selects role (Attorney/Client)
6. Profile marked as complete
7. Redirected to dashboard

### 5. Code Updates (19 Files)

**API Routes**:
- ✅ `src/app/api/auth/register/route.ts` - Registration with ATTORNEY
- ✅ `src/app/api/auth/update-role/route.ts` - Role update with normalization
- ✅ `src/app/api/auth/complete-profile/route.ts` - Profile completion
- ✅ `src/app/api/directory/route.ts` - Directory listing
- ✅ `src/app/api/token-packages/route.ts` - Admin access control
- ✅ `src/app/api/token-packages/[id]/route.ts` - Package management

**Components**:
- ✅ `src/app/auth/page.tsx` - Authentication page with ATTORNEY role
- ✅ `src/app/components/auth/AuthGuard.tsx` - Route protection with role normalization
- ✅ `src/app/components/auth/OAuthRoleSelection.tsx` - New OAuth role selector

**Pages**:
- ✅ `src/app/directory/page.tsx` - User directory
- ✅ `src/app/attorney-features/page.tsx` - Attorney features
- ✅ `src/app/attorney-features/components/InteractiveFeaturePanel.tsx` - Feature panel
- ✅ `src/app/profile/page.tsx` - User profile
- ✅ `src/app/wizard/page.tsx` - Wizard page
- ✅ `src/app/grand-wizard/page.tsx` - Grand wizard page
- ✅ `src/app/blog/page.tsx` - Blog management
- ✅ `src/app/admin/page.tsx` - Admin panel

**TypeScript Types**:
- ✅ `src/types/next-auth.d.ts` - NextAuth type definitions
- ✅ `src/app/stores/index.ts` - Store exports

### 6. Backward Compatibility Strategy

**Legacy Support**:
- All role checks now include both `ATTORNEY` and `LAWYER`
- Example: `session.user?.role === 'ATTORNEY' || session.user?.role === 'LAWYER'`
- Database migration keeps both enum values temporarily
- `normalizeRole()` function converts LAWYER to ATTORNEY seamlessly

**Session Handling**:
- JWT callback normalizes LAWYER to ATTORNEY automatically
- Existing sessions with LAWYER continue to work
- New sessions use ATTORNEY

**API Validation**:
- API routes accept both ATTORNEY and LAWYER
- Normalization happens at the API layer
- Ensures consistent internal representation

## How to Run the Migration

1. **Review the migration file**:
   ```bash
   cat prisma/migrations/20251010000000_migrate_lawyer_to_attorney/migration.sql
   ```

2. **Run the migration** (when ready):
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify the migration**:
   ```bash
   npx prisma studio
   ```
   - Check that all LAWYER users are now ATTORNEY
   - Verify both enum values exist

4. **Test the application**:
   - Test OAuth sign-in flow
   - Test role selection for new users
   - Test existing user sign-in
   - Test role-based access control

## Testing Checklist

- [ ] New OAuth user registration → shows role selection
- [ ] OAuth user selects Attorney role → profile completes
- [ ] OAuth user selects Client role → profile completes
- [ ] Existing LAWYER users can sign in
- [ ] Role-based access control works
- [ ] Directory shows correct roles
- [ ] Admin features accessible to attorneys
- [ ] Token purchase works for all roles

## Future Cleanup (Optional)

After verifying everything works:

1. **Create a second migration** to remove LAWYER enum value:
   ```sql
   -- This requires enum recreation in PostgreSQL
   -- Only do this after thorough testing
   ```

2. **Remove backward compatibility code**:
   - Remove `|| session.user?.role === 'LAWYER'` checks
   - Remove `isLawyer` deprecated property
   - Update to use only `isAttorney`

## Key Benefits

1. **Proper Terminology**: Uses "Attorney" instead of "Lawyer" throughout the application
2. **OAuth Support**: New users can select their role during sign-up
3. **Backward Compatible**: Existing users and sessions continue to work
4. **Type Safe**: Full TypeScript support with proper type definitions
5. **Future Ready**: Built with extensibility for additional OAuth providers
6. **Robust**: Comprehensive role management with helper functions

## Notes

- The LawyerProfile table name remains unchanged (no breaking schema changes)
- All UI text displays "Attorney" instead of "Lawyer"
- Database can have both ATTORNEY and LAWYER roles temporarily
- Role normalization happens at multiple layers for safety
- OAuth flow requires role selection for better UX

## Migration Author
AI Assistant - Implementation completed on October 10, 2025

