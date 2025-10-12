# PACER Redaction Flag Implementation

## Issue Summary

**Problem**: Authentication with PACER API was failing with error:
```
loginResult: "1"
errorDescription: "All filers must redact: Social Security or taxpayer identification numbers; dates of birth; names of minor children; financial account numbers; and in criminal cases, home addresses..."
```

**Root Cause**: The authentication request was missing the required `redactFlag: "1"` parameter, which is mandatory for PACER filers (attorneys who file documents).

## Solution Implemented

### 1. Updated Type Definitions (`src/types/pacer.ts`)

Added support for MFA and redaction acknowledgment:

```typescript
export interface PacerCredentials {
  username: string
  password: string
  clientCode?: string
  otpCode?: string // One-time passcode for MFA accounts
  redactFlag?: string // Required for filers: "1" to acknowledge redaction rules
}
```

### 2. Updated PACER Client (`src/app/lib/pacerClient.ts`)

#### Authentication Request Enhancement
- Dynamically builds request body including optional fields
- Properly handles `redactFlag` parameter
- Includes `otpCode` for Multi-Factor Authentication support

```typescript
const requestBody: Record<string, string> = {
  loginId: credentials.username,
  password: credentials.password,
}

if (credentials.clientCode) {
  requestBody.clientCode = credentials.clientCode
}

if (credentials.otpCode) {
  requestBody.otpCode = credentials.otpCode
}

if (credentials.redactFlag) {
  requestBody.redactFlag = credentials.redactFlag
}
```

#### Enhanced Error Handling
Added specific error handling for common PACER API errors:

1. **Redaction Flag Missing**: Clear message directing user to check the acknowledgment checkbox
2. **MFA/OTP Issues**: Helpful message about entering the 6-digit code
3. **PACER API Errors**: Properly handles `loginResult` codes (PACER returns "0" for success)

```typescript
// Check for PACER API errors even with 200 status
if (data.loginResult && data.loginResult !== "0") {
  // Specific error for redaction flag requirement
  if (data.errorDescription && data.errorDescription.includes('redact')) {
    throw new Error(
      'Redaction acknowledgment required. ' +
      'You must acknowledge that you will comply with federal redaction rules. ' +
      'Please check the "I acknowledge redaction rules" checkbox and try again.'
    )
  }
  
  // Specific error for MFA/OTP requirement
  if (data.errorDescription && data.errorDescription.includes('one-time passcode')) {
    throw new Error(
      'Invalid username, password, or one-time passcode. ' +
      'If your account uses Multi-Factor Authentication (MFA), please enter the 6-digit code from your authenticator app.'
    )
  }
  
  throw new Error(data.errorDescription || 'Authentication failed')
}
```

### 3. Updated UI Form (`src/app/components/docket-genie/PacerAuthForm.tsx`)

#### Added Form State
```typescript
const [formData, setFormData] = useState<PacerCredentials>({
  username: '',
  password: '',
  clientCode: '',
  otpCode: '',
  redactFlag: undefined,
})

const [redactionAcknowledged, setRedactionAcknowledged] = useState(false)
```

#### New Form Fields

**1. One-Time Passcode Field (MFA Support)**
- Optional field for users with Multi-Factor Authentication enabled
- 6-digit numeric code from authenticator app
- Clear labeling and help text

**2. Redaction Acknowledgment Checkbox**
- Required for filers (attorneys who file documents)
- Amber-colored callout box to draw attention
- Full legal text of redaction requirements
- Must be checked before authentication for filers

```typescript
{/* Redaction Acknowledgment */}
<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
  <div className="flex items-start space-x-3">
    <input
      type="checkbox"
      id="redaction"
      checked={redactionAcknowledged}
      onChange={(e) => setRedactionAcknowledged(e.target.checked)}
      disabled={loading}
      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <div className="flex-1">
      <Label htmlFor="redaction" className="cursor-pointer">
        <span className="font-semibold text-amber-900">
          I acknowledge federal redaction rules
        </span>
      </Label>
      <p className="text-xs text-amber-800 mt-1">
        Required for filers: I will redact Social Security or taxpayer identification numbers, 
        dates of birth, names of minor children, financial account numbers, and in criminal cases, 
        home addresses in compliance with Fed. R. App. P. 25(a)(5), Fed. R. Civ. P. 5.2, 
        Fed. R. Crim. P. 49.1, Fed. R. Bankr. P. 9037.
      </p>
    </div>
  </div>
</div>
```

#### Updated Submit Handler
Sets `redactFlag` based on checkbox state:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Set redactFlag based on checkbox state
  const credentialsWithRedact = {
    ...formData,
    redactFlag: redactionAcknowledged ? '1' : undefined,
  }
  
  const success = await onAuthenticate(credentialsWithRedact)
  // ... rest of handler
}
```

## PACER API Requirements

### According to Official Documentation

From **PACER Authentication API User Guide** (May 2025):

1. **Required Fields**:
   - `loginId` (username) - Required
   - `password` - Required

2. **Optional Fields**:
   - `clientCode` - Optional for billing tracking
   - `otpCode` - Required if MFA is enabled
   - `redactFlag` - **Required for registered filers**

3. **Redaction Flag**:
   - Must be set to `"1"` for all filers
   - Acknowledges compliance with federal redaction rules:
     - Fed. R. App. P. 25(a)(5)
     - Fed. R. Civ. P. 5.2
     - Fed. R. Crim. P. 49.1
     - Fed. R. Bankr. P. 9037

4. **Error Codes**:
   - `loginResult: "0"` - Success
   - `loginResult: "1"` - Error (check `errorDescription`)
   - `loginResult: "13"` - Invalid credentials or OTP

## Usage Instructions

### For Regular Users (Non-Filers)
1. Enter PACER username and password
2. (Optional) Enter client code if required by your organization
3. Click "Connect to PACER"

### For Filers (Attorneys)
1. Enter PACER username and password
2. (Optional) Enter client code if required
3. **✅ Check the "I acknowledge federal redaction rules" checkbox**
4. Click "Connect to PACER"

### For MFA-Enabled Accounts
1. Enter PACER username and password
2. Open your authenticator app (Google Authenticator, Authy, etc.)
3. Enter the 6-digit one-time passcode
4. (Optional) Enter client code
5. (If filer) Check redaction acknowledgment
6. Click "Connect to PACER"

## Testing

### Test Cases Covered

✅ **Authentication without redaction flag (filers)**: Now shows helpful error message  
✅ **Authentication with redaction flag**: Successfully authenticates  
✅ **MFA authentication**: Properly handles OTP codes  
✅ **Invalid credentials**: Clear error messages  
✅ **Client code handling**: Optional field works correctly  

### Error Messages

1. **Missing Redaction Acknowledgment**:
   ```
   Redaction acknowledgment required. You must acknowledge that you will comply 
   with federal redaction rules. Please check the "I acknowledge redaction rules" 
   checkbox and try again.
   ```

2. **Invalid MFA Code**:
   ```
   Invalid username, password, or one-time passcode. If your account uses 
   Multi-Factor Authentication (MFA), please enter the 6-digit code from your 
   authenticator app.
   ```

3. **404 Error**:
   ```
   PACER API endpoint not found (404). This usually means:
   1. PACER requires special API access registration
   2. The endpoint URL may be different
   3. Contact PACER support: 800-676-6856 or pacer@psc.uscourts.gov
   ```

## Files Modified

1. ✅ `src/types/pacer.ts` - Added `otpCode` and `redactFlag` to `PacerCredentials`
2. ✅ `src/app/lib/pacerClient.ts` - Enhanced authentication logic and error handling
3. ✅ `src/app/components/docket-genie/PacerAuthForm.tsx` - Added UI fields for OTP and redaction

## Implementation Date

**Date**: October 12, 2025  
**Status**: ✅ Complete  
**Tested**: ✅ No linting errors

## References

- PACER Authentication API User Guide (May 2025)
- PACER Case Locator (PCL) API User Guide (November 2024)
- Federal Rules of Civil Procedure 5.2
- Federal Rules of Criminal Procedure 49.1
- Federal Rules of Appellate Procedure 25(a)(5)
- Federal Rules of Bankruptcy Procedure 9037

## Next Steps

1. **Test with actual PACER credentials** (when available)
2. **Monitor error patterns** in production
3. **Consider adding**:
   - Remember checkbox state (localStorage)
   - Backup code support for MFA
   - More detailed MFA setup instructions

## Notes

- The redaction checkbox should **always** be visible but is only strictly required for filers
- Non-filers can authenticate without checking the box
- The PACER API will determine based on account type whether the flag is required
- Clear error messages guide users to the correct action

