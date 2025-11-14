# PACER Authentication Token Storage Validation

## Overview

This document validates that the PACER session token is properly stored and passed through the authentication flow.

---

## Authentication Flow

### Step 1: User Enters Credentials
**Component:** `PacerAuthForm.tsx`

```typescript
// User fills form
username: "your-username"
password: "your-password"
clientCode: "optional-code"

// Clicks "Connect to PACER"
```

**Expected Console Logs:**
```
[PacerAuthForm] Form submitted, calling onAuthenticate...
```

---

### Step 2: Hook Calls Auth API
**Hook:** `usePacerAuth.ts`

```typescript
// login() function called
const login = async (credentials) => {
  // Calls /api/pacer/auth
}
```

**Expected Console Logs:**
```
[usePacerAuth] Login attempt with credentials: { username: "your-username" }
[usePacerAuth] Calling /api/pacer/auth...
[usePacerAuth] Auth API response status: 200
[usePacerAuth] Auth API response data: { success: true, sessionToken: "...", ... }
```

---

### Step 3: API Route Processes Request
**API Route:** `/api/pacer/auth/route.ts`

```typescript
// Validates user session
// Validates credentials
// Calls pacerClient.authenticate()
```

**Expected Console Logs:**
```
[PACER Auth API] Authentication response: {
  success: true,
  hasSessionToken: true,
  sessionTokenLength: 18 (mock) or 128 (real),
  userInfo: { ... },
  expiresAt: "2025-10-12T..."
}
[PACER Auth API] ✅ Returning to client: {
  success: true,
  hasSessionToken: true,
  hasUserInfo: true,
  hasExpiresAt: true
}
```

---

### Step 4: PACER Client Authenticates
**Client:** `pacerClient.ts`

**Mock Mode:**
```typescript
if (this.mockMode) {
  return {
    success: true,
    sessionToken: `mock-session-${Date.now()}`,
    userInfo: { ... },
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }
}
```

**Real Mode:**
```typescript
// POST to https://pacer.login.uscourts.gov/services/cso-auth
// Returns: { nextGenCSO: "128-char-token", loginResult: "0", ... }
```

**Expected Console Logs:**
```
[PACER] Authenticating user: your-username
[PACER] 🧪 Mock authentication successful (if mock mode)
[PACER] Authentication successful (if real mode)
```

---

### Step 5: Hook Stores Token
**Hook:** `usePacerAuth.ts`

```typescript
// Validate response
if (!data.sessionToken) {
  throw new Error('Invalid authentication response - missing session token')
}

// Store in state
setSessionToken(data.sessionToken)
setUserInfo(data.userInfo)
setExpiresAt(new Date(data.expiresAt))
setIsAuthenticated(true)
```

**Expected Console Logs:**
```
[usePacerAuth] ✅ Setting authentication state...
[usePacerAuth] Session token: mock-session-172344... (first 20 chars)
[usePacerAuth] ✅ Authentication successful!
[usePacerAuth] State updated - isAuthenticated: true, sessionToken set
```

**State Change Effect:**
```
[usePacerAuth] State changed: {
  isAuthenticated: true,
  hasSessionToken: true,
  sessionTokenPreview: "mock-session-172344...",
  hasUserInfo: true,
  username: "your-username",
  expiresAt: "2025-10-12T..."
}
```

---

### Step 6: UI Updates
**Component:** `PacerAuthForm.tsx`

```typescript
// Success callback fires
if (success) {
  toast.success('Successfully connected to PACER!')
}

// isAuthenticated prop becomes true
// Form shows "Connected" state
```

**Expected Console Logs:**
```
[PacerAuthForm] Authentication result: true
[PacerAuthForm] ✅ Authentication successful
```

**Expected UI:**
- ✅ Green success box appears
- ✅ Shows "Connected to PACER"
- ✅ Shows "Logged in as: your-username"
- ✅ Toast notification appears
- ✅ Auto-switches to Search tab (if configured)

---

## Search Flow Validation

### Step 7: User Tries to Search
**Page:** `page.tsx`

```typescript
const handleSearch = async (query) => {
  // Check if authenticated
  if (!pacerAuth.sessionToken || !pacerAuth.isAuthenticated) {
    // ❌ Not authenticated
    toast.error('Please connect to PACER first')
    setActiveTab('connect')
    return
  }
  
  // ✅ Authenticated - proceed with search
  await pacerSearch.searchCases(query, pacerAuth.sessionToken)
}
```

**Expected Console Logs (If Authenticated):**
```
[DocketGenie] handleSearch called with query: { caseNumber: "1:23-cv-12345" }
[DocketGenie] Session token exists: true
[DocketGenie] Is authenticated: true
[DocketGenie] Calling searchCases...
```

**Expected Console Logs (If NOT Authenticated):**
```
[DocketGenie] handleSearch called with query: { caseNumber: "1:23-cv-12345" }
[DocketGenie] Session token exists: false
[DocketGenie] Is authenticated: false
[DocketGenie] No session token available - user needs to authenticate
```

---

## Testing Checklist

### ✅ Validate Mock Mode Authentication

1. **Enable mock mode:**
   ```bash
   # .env.local
   PACER_MOCK_MODE=true
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Open browser console** (F12)

4. **Go to Docket Genie** → Connect tab

5. **Enter any credentials:**
   - Username: `test`
   - Password: `test`

6. **Click "Connect to PACER"**

7. **Verify console logs show:**
   ```
   [PacerAuthForm] Form submitted, calling onAuthenticate...
   [usePacerAuth] Login attempt with credentials: { username: "test" }
   [usePacerAuth] Calling /api/pacer/auth...
   [PACER] Authenticating user: test
   [PACER] 🧪 Mock authentication successful
   [PACER Auth API] Authentication response: { success: true, hasSessionToken: true, ... }
   [PACER Auth API] ✅ Returning to client: { success: true, hasSessionToken: true, ... }
   [usePacerAuth] Auth API response status: 200
   [usePacerAuth] Auth API response data: { success: true, sessionToken: "mock-session-...", ... }
   [usePacerAuth] ✅ Setting authentication state...
   [usePacerAuth] Session token: mock-session-172344...
   [usePacerAuth] ✅ Authentication successful!
   [usePacerAuth] State updated - isAuthenticated: true, sessionToken set
   [usePacerAuth] State changed: { isAuthenticated: true, hasSessionToken: true, ... }
   [PacerAuthForm] Authentication result: true
   [PacerAuthForm] ✅ Authentication successful
   ```

8. **Verify UI shows:**
   - ✅ Green "Connected to PACER" box
   - ✅ "Logged in as: test"
   - ✅ Toast: "Successfully connected to PACER!"
   - ✅ Auto-switched to Search tab

---

### ✅ Validate Token Persistence During Search

1. **After successful authentication**

2. **Go to Search tab**

3. **Fill in Case Number:** `1:23-cv-12345`

4. **Click "Search Cases"**

5. **Verify console logs show:**
   ```
   [CaseSearchForm] Form submitted with params: { caseNumber: "1:23-cv-12345", ... }
   [CaseSearchForm] Has required field: true
   [CaseSearchForm] Calling onSearch with: { caseNumber: "1:23-cv-12345" }
   [DocketGenie] handleSearch called with query: { caseNumber: "1:23-cv-12345" }
   [DocketGenie] Session token exists: true  ← SHOULD BE TRUE
   [DocketGenie] Is authenticated: true      ← SHOULD BE TRUE
   [DocketGenie] Calling searchCases...
   [usePacerSearch] searchCases called with: { query: {...}, sessionToken: "mock-session-..." }
   [usePacerSearch] Making API call to /api/pacer/search
   ```

6. **If logs show `Session token exists: false`:**
   - ❌ Token not stored properly
   - Check previous authentication logs
   - Verify `setSessionToken(data.sessionToken)` was called

---

## Common Issues & Solutions

### Issue 1: No Session Token After Authentication

**Symptoms:**
```
[usePacerAuth] Auth API response data: { success: true, sessionToken: undefined }
```

**Causes:**
1. API not returning sessionToken field
2. Mock mode not enabled properly
3. PACER client returning wrong field name

**Solution:**
- Check API response in browser Network tab
- Verify `/api/pacer/auth` returns `sessionToken` field
- Check `pacerClient.authenticate()` return value

---

### Issue 2: Token Lost After Re-Render

**Symptoms:**
```
[usePacerAuth] State changed: { isAuthenticated: false, hasSessionToken: false }
```

**Causes:**
- Component re-mounted
- State not persisted
- Page refreshed

**Solution:**
- Current implementation: Token only persists during session (lost on refresh)
- For persistence: Add localStorage support (future enhancement)
- For now: Keep browser tab open, don't refresh

---

### Issue 3: Authentication Succeeds but isAuthenticated is False

**Symptoms:**
```
[usePacerAuth] ✅ Authentication successful!
[usePacerAuth] State changed: { isAuthenticated: false, ... }  ← Still false!
```

**Causes:**
- `setIsAuthenticated(true)` not called
- State update batched/delayed
- Multiple instances of hook (shouldn't happen)

**Solution:**
- Check `setIsAuthenticated(true)` is called after successful auth
- Verify no errors between token storage and state update
- Add delay to verify state propagates

---

### Issue 4: Mock Mode Not Working

**Symptoms:**
```
[PACER] Authentication error: Error: Authentication failed: 404 Not Found
```

**Causes:**
- `PACER_MOCK_MODE` not set
- Environment variable not loaded
- Dev server not restarted

**Solution:**
```bash
# 1. Add to .env.local
PACER_MOCK_MODE=true

# 2. Restart dev server
npm run dev

# 3. Verify logs show:
[PACER] 🧪 Running in MOCK MODE - Using simulated data
```

---

## Validation Results

### ✅ Token Storage Flow

| Step | Component | Action | Validation |
|------|-----------|--------|------------|
| 1 | PacerAuthForm | User submits credentials | ✅ Logs form submission |
| 2 | usePacerAuth | Calls `/api/pacer/auth` | ✅ Logs API call |
| 3 | API Route | Calls pacerClient.authenticate() | ✅ Logs auth attempt |
| 4 | pacerClient | Returns session token | ✅ Logs token generation |
| 5 | API Route | Returns token to client | ✅ Validates token exists |
| 6 | usePacerAuth | Stores token in state | ✅ Logs state update |
| 7 | UI | Shows connected state | ✅ Toast notification |
| 8 | Search | Uses stored token | ✅ Logs token availability |

### ✅ State Management

```typescript
// Hook state variables
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [sessionToken, setSessionToken] = useState<string | null>(null)
const [userInfo, setUserInfo] = useState<...>(null)
const [expiresAt, setExpiresAt] = useState<Date | null>(null)

// After successful auth:
setSessionToken(data.sessionToken)        // ✅ Stores token
setUserInfo(data.userInfo)                // ✅ Stores user info
setExpiresAt(new Date(data.expiresAt))    // ✅ Stores expiration
setIsAuthenticated(true)                  // ✅ Sets authenticated flag

// State change effect logs all updates
useEffect(() => {
  console.log('[usePacerAuth] State changed:', { ... })
}, [isAuthenticated, sessionToken, userInfo, expiresAt])
```

---

## Testing Steps

### Full Authentication Flow Test

1. **Clear console** (keep DevTools open)

2. **Go to Connect tab**

3. **Enter credentials** (with mock mode: any username/password)

4. **Click "Connect to PACER"**

5. **Watch console logs** - Should see complete flow:
   ```
   [PacerAuthForm] Form submitted
   [usePacerAuth] Login attempt
   [usePacerAuth] Calling /api/pacer/auth
   [PACER] Authenticating user
   [PACER] 🧪 Mock authentication successful
   [PACER Auth API] Authentication response
   [PACER Auth API] ✅ Returning to client
   [usePacerAuth] Auth API response status: 200
   [usePacerAuth] Auth API response data: {...}
   [usePacerAuth] ✅ Setting authentication state...
   [usePacerAuth] Session token: mock-session-...
   [usePacerAuth] ✅ Authentication successful!
   [usePacerAuth] State changed: { isAuthenticated: true, hasSessionToken: true, ... }
   [PacerAuthForm] Authentication result: true
   [PacerAuthForm] ✅ Authentication successful
   ```

6. **Verify UI:**
   - ✅ Green "Connected to PACER" box
   - ✅ Toast notification
   - ✅ Auto-switches to Search tab

7. **Go to Search tab**

8. **Fill Case Number:** `1:23-cv-12345`

9. **Click "Search Cases"**

10. **Verify console logs:**
    ```
    [CaseSearchForm] Form submitted
    [DocketGenie] handleSearch called
    [DocketGenie] Session token exists: true  ← CRITICAL
    [DocketGenie] Is authenticated: true      ← CRITICAL
    [DocketGenie] Calling searchCases...
    ```

---

## Troubleshooting Guide

### ❌ If "Session token exists: false"

**Check these console logs:**

1. **Did authentication succeed?**
   - Look for: `[usePacerAuth] ✅ Authentication successful!`
   - If missing → Auth failed, check error logs

2. **Was token stored?**
   - Look for: `[usePacerAuth] Session token: mock-session-...`
   - If missing → API didn't return token

3. **Did state update?**
   - Look for: `[usePacerAuth] State changed: { isAuthenticated: true, hasSessionToken: true }`
   - If `hasSessionToken: false` → Token not stored

4. **Is state still valid?**
   - Look for: `[usePacerAuth] State changed:` (most recent)
   - Should show `isAuthenticated: true, hasSessionToken: true`

### ✅ If All Logs Look Good But Still Failing

**Possible causes:**

1. **Component Re-mounted:**
   - Hook state resets when component re-mounts
   - Check if page is re-rendering unnecessarily
   - Add React DevTools to track re-renders

2. **Multiple Hook Instances:**
   - Each hook instance has separate state
   - Verify `usePacerAuth()` is only called once in page component
   - Check for duplicate imports

3. **State Update Timing:**
   - State updates may be batched
   - Add small delay before searching
   - Check state in useEffect after auth

---

## Quick Debug Commands

### Check Current Auth State

Add this temporarily to `page.tsx`:

```typescript
useEffect(() => {
  console.log('[DEBUG] Current auth state:', {
    isAuthenticated: pacerAuth.isAuthenticated,
    hasToken: !!pacerAuth.sessionToken,
    token: pacerAuth.sessionToken?.substring(0, 30)
  })
}, [pacerAuth.isAuthenticated, pacerAuth.sessionToken])
```

### Force Log Before Search

Already added in `handleSearch()`:
```typescript
console.log('[DocketGenie] Session token exists:', !!pacerAuth.sessionToken)
console.log('[DocketGenie] Is authenticated:', pacerAuth.isAuthenticated)
```

---

## Expected Behavior

### After Successful Authentication

**State should be:**
```javascript
{
  isAuthenticated: true,
  sessionToken: "mock-session-1728844..." // or 128-char PACER token
  userInfo: {
    username: "your-username",
    accountId: "PACER-MOCK-...",
    accountName: "your-username"
  },
  expiresAt: Date (15 minutes from now)
}
```

**UI should show:**
- ✅ Connect tab: Green "Connected" box
- ✅ Search tab: Enabled and accessible
- ✅ Docket tab: Disabled (no case selected yet)
- ✅ Details tab: Disabled (no case selected yet)

**Searches should:**
- ✅ Include session token in API calls
- ✅ Not show "Please connect" error
- ✅ Make actual API requests

---

## Files with Logging

| File | Purpose | Key Logs |
|------|---------|----------|
| `PacerAuthForm.tsx` | Form submission | Form submitted, result |
| `usePacerAuth.ts` | Auth state management | API calls, state updates |
| `/api/pacer/auth/route.ts` | Auth API | Request validation, response |
| `pacerClient.ts` | PACER API calls | Auth attempts, mock mode |
| `page.tsx` | Search coordination | Token check before search |
| `usePacerSearch.ts` | Search execution | API calls, results |

---

## Next Steps

1. **Test authentication** following the steps above
2. **Share console logs** if token is not persisting
3. **Verify mock mode** is enabled for testing
4. **Check for errors** in any step of the flow

---

**Status:** ✅ Comprehensive logging added  
**Ready for:** Authentication flow validation  
**Last Updated:** October 2025

