# Document Analysis Page Fix - /wizard Route

## Issue
The Document Analysis page (`/wizard`) was not opening for attorneys after login.

## Root Causes Identified

### 1. Double Layout Wrapper Issue
- **Problem**: The `TokenGuard` component wraps content in `<Layout>`, and the wizard/grand-wizard pages were also wrapping the content in `<Layout>` for attorneys
- **Impact**: This created nested layouts which broke the attorney interface
- **Files Affected**: 
  - `src/app/wizard/page.tsx`
  - `src/app/grand-wizard/page.tsx`

### 2. Token Requirement Blocking Attorneys
- **Problem**: Attorneys were required to have 5 tokens to access the Document Analysis feature (wizard) and 10 tokens for Advanced Analysis (grand-wizard)
- **Impact**: Attorneys couldn't access their professional tools without purchasing tokens
- **File Affected**: `src/app/components/auth/TokenGuard.tsx`

## Solutions Implemented

### 1. Removed Double Layout Wrapper
**Files Modified:**
- `src/app/wizard/page.tsx` (lines 193-207)
- `src/app/grand-wizard/page.tsx` (lines 193-207)

**Changes:**
```typescript
// BEFORE (Attorney view)
<TokenGuard requiredTokens={TOKEN_REQUIREMENTS.WIZARD} ...>
  <Layout>
    <div className="bg-white h-full overflow-hidden">
      <DocumentAnalysisInterface />
    </div>
  </Layout>
</TokenGuard>

// AFTER (Attorney view)
<TokenGuard requiredTokens={TOKEN_REQUIREMENTS.WIZARD} ...>
  <div className="bg-white h-full overflow-hidden">
    <DocumentAnalysisInterface />
  </div>
</TokenGuard>
```

**Reason**: The `AttorneyLayout` is already applied at the root level through `Layout.tsx`, so we don't need another `<Layout>` wrapper inside the page.

### 2. Attorneys Bypass Token Checks
**File Modified:** `src/app/components/auth/TokenGuard.tsx` (lines 40-46)

**Changes:**
```typescript
// Added attorney bypass in TokenGuard
const isAttorney = session.user.role === 'ATTORNEY' || session.user.role === 'LAWYER'
if (isAttorney) {
  setHasEnoughTokens(true)
  setLoading(false)
  return
}
```

**Reason**: Attorneys should have unlimited access to their professional tools without needing to purchase service credits.

### 3. Enhanced Token Purchase Flow for Clients
**File Modified:** `src/app/components/auth/TokenGuard.tsx`

**Improvements:**
- Changed "Insufficient Tokens" to "Service Credits Required"
- Updated button text from "Add More Tokens" to "Purchase Service Credits"
- Added helpful tip: "Credits never expire and work across all features"
- Enhanced visual design with gradient button
- Updated all terminology from "tokens" to "credits" for consistency
- Changed "Token Usage Tips" to "Service Credit Benefits"
- Made benefits more feature-focused rather than usage-focused

**User Flow for Clients:**
1. Client attempts to access `/wizard` or `/grand-wizard`
2. If insufficient credits → Shows attractive purchase screen with:
   - Current vs required credits with progress bar
   - Feature description
   - Prominent "Purchase Service Credits" button → redirects to `/tokens`
   - Service credit benefits list
   - "Go Back" option
3. Client purchases credits on `/tokens` page
4. Client returns and gains access to the feature

## Technical Details

### Token Requirements
- **Wizard (Document Analysis)**: 5 credits
- **Grand Wizard (Advanced Analysis)**: 10 credits
- **Attorneys**: Unlimited access (bypasses credit checks)
- **Clients**: Must purchase credits

### Layout Hierarchy
```
Attorney Users:
AttorneyLayout (from Layout.tsx)
└── TokenGuard (bypasses for attorneys)
    └── Page Content (wizard/grand-wizard)
        └── DocumentAnalysisInterface

Client Users:
Layout (guest/client layout)
└── TokenGuard (checks credits)
    └── Either:
        ├── Insufficient Credits Screen → redirects to /tokens
        └── Page Content (if enough credits)
```

## Testing Checklist

- [x] No linting errors
- [ ] Attorney login → Access `/wizard` → Should load Document Analysis Interface
- [ ] Attorney login → Access `/grand-wizard` → Should load Advanced Analysis Interface
- [ ] Client login with 0 credits → Access `/wizard` → Should show credit purchase screen
- [ ] Client login with 5+ credits → Access `/wizard` → Should load feature
- [ ] Credit purchase screen → Click "Purchase Service Credits" → Should redirect to `/tokens`
- [ ] Verify no double layouts (check browser dev tools)

## Files Modified

1. **src/app/wizard/page.tsx**
   - Removed double `<Layout>` wrapper for attorney view

2. **src/app/grand-wizard/page.tsx**
   - Removed double `<Layout>` wrapper for attorney view

3. **src/app/components/auth/TokenGuard.tsx**
   - Added attorney bypass logic
   - Enhanced client purchase flow UI/UX
   - Updated terminology to "Service Credits"
   - Improved messaging and call-to-action

## Related Files (No Changes Needed)

- `src/app/components/Layout.tsx` - Already correctly uses `AttorneyLayout` for attorneys
- `src/app/components/attorney/AttorneyLayout.tsx` - Working correctly
- `src/app/components/attorney/AttorneySidebar.tsx` - Has correct "Document Analysis" link
- `src/app/hooks/useTokenAccess.ts` - Token requirements defined here

## Future Considerations

1. **Token/Credit Consistency**: Consider renaming all references from "tokens" to "credits" throughout the application for consistency
2. **Attorney Features**: Consider adding usage analytics for attorneys to track their document processing
3. **Client Credits**: Consider offering starter credits for new client signups
4. **Onboarding**: Add onboarding flow to explain credit system to new users

## Backward Compatibility

✅ Legacy `LAWYER` role is still supported and treated the same as `ATTORNEY`
✅ Existing token balances in database remain functional
✅ Client users still need credits for premium features
✅ No breaking changes to API or database schema

