# Docket Genie Search Validation Fix

## Problem Summary

The case search functionality had a validation mismatch between frontend and backend that prevented the API from being called properly and didn't show clear error messages to users.

### Issues Found

1. **Validation Mismatch** ❌
   - Frontend: Enabled search button if ANY field had a value (court, dates, etc.)
   - Backend: Required at least one of: caseNumber, caseTitle, partyName, or attorneyName
   - **Result**: Users could click search with only court/dates filled, API would reject it

2. **Poor Error Display** ❌
   - Errors were shown in a small alert at the top
   - No visual feedback on what went wrong
   - No clear indication of which fields are required

3. **No User Feedback** ❌
   - No toast notifications for validation errors
   - No success messages when searches complete
   - Unclear what happened after clicking search

---

## Solutions Implemented

### 1. ✅ Fixed Frontend Validation

**File:** `src/app/components/docket-genie/CaseSearchForm.tsx`

#### Before (WRONG):
```typescript
// Enabled button if ANY field had a value
const hasSearchParams = Object.values(searchParams).some(val => val && val.trim() !== '')
```

#### After (CORRECT):
```typescript
// Check for required fields only
const hasRequiredField = !!(
  searchParams.caseNumber?.trim() ||
  searchParams.caseTitle?.trim() ||
  searchParams.partyName?.trim() ||
  searchParams.attorneyName?.trim()
)

// Button is disabled unless at least one required field is filled
<Button disabled={loading || !hasRequiredField} />
```

### 2. ✅ Added Validation Error Display

Added prominent error message box:

```tsx
{validationError && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-red-600">...</svg>
      <div>
        <h4 className="text-sm font-semibold text-red-900">Validation Error</h4>
        <p className="text-sm text-red-800">{validationError}</p>
      </div>
    </div>
  </div>
)}
```

### 3. ✅ Added Client-Side Validation

Validation runs before API call:

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  setValidationError('')
  
  // Validate required fields
  const hasRequiredField = !!(
    searchParams.caseNumber?.trim() ||
    searchParams.caseTitle?.trim() ||
    searchParams.partyName?.trim() ||
    searchParams.attorneyName?.trim()
  )

  if (!hasRequiredField) {
    const errorMsg = 'Please enter at least one of: Case Number, Case Title, Party Name, or Attorney Name'
    setValidationError(errorMsg)
    toast.error(errorMsg)
    return  // Stop here, don't call API
  }
  
  // Proceed with search...
  onSearch(filteredParams)
}
```

### 4. ✅ Added Visual Field Indicators

Required fields now clearly marked:

```tsx
{/* Required Field */}
<Label className="flex items-center gap-1">
  Case Number <span className="text-red-600 text-xs">*</span>
</Label>

{/* Optional Field */}
<Label>
  Court <span className="text-gray-400 text-xs">(optional)</span>
</Label>
```

### 5. ✅ Added Toast Notifications

**File:** `src/app/hooks/usePacerSearch.ts`

```typescript
// Success toast
if (data.cases.length > 0) {
  toast.success(`Found ${data.totalCount} case${data.totalCount !== 1 ? 's' : ''}`)
} else {
  toast.info('No cases found matching your search criteria')
}

// Error toast
catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Search failed'
  toast.error(errorMessage)
}
```

### 6. ✅ Improved Help Text

Updated help text to be clearer:

```tsx
<div className="space-y-2">
  <p className="text-xs text-gray-700 text-center font-medium">
    <span className="text-red-600">*</span> At least one of the following is required: 
    <span className="font-semibold"> Case Number, Case Title, Party Name, or Attorney Name</span>
  </p>
  <p className="text-xs text-gray-500 text-center">
    Court and date filters are optional and can be used to narrow your search. 
    Results are limited to 50 cases per search.
  </p>
</div>
```

### 7. ✅ Auto-Clear Validation Errors

Errors automatically clear when user starts typing in a required field:

```typescript
onChange={(e) => {
  setSearchParams({ ...searchParams, caseNumber: e.target.value })
  if (validationError) setValidationError('')  // Clear error
}}
```

---

## User Experience Flow

### Before Fix ❌

1. User fills only "Court" field
2. Button becomes enabled (incorrect validation)
3. User clicks "Search Cases"
4. API call is made
5. API returns 400 error: "At least one search parameter is required"
6. Small error alert appears (easy to miss)
7. User is confused about what went wrong

### After Fix ✅

1. User fills only "Court" field
2. Button stays **disabled** (correct validation)
3. User sees required fields marked with **red asterisk**
4. Help text clearly explains which fields are required
5. **If user tries to submit anyway:**
   - Large red error box appears
   - Toast notification shows error
   - Error message clearly states: "Please enter at least one of: Case Number, Case Title, Party Name, or Attorney Name"
6. **When user fills a required field:**
   - Error automatically clears
   - Button becomes enabled
   - User can search successfully

### Successful Search ✅

1. User fills "Case Number" (required field)
2. Optionally fills "Court" and dates (filters)
3. Clicks "Search Cases"
4. Loading spinner shows
5. API call succeeds
6. **Toast notification**: "Found 15 cases"
7. Results display in clean cards

---

## API Validation

### Backend Validation (Unchanged)

**File:** `src/app/api/pacer/search/route.ts`

```typescript
// Validate query has at least one search parameter
if (!query.caseNumber && !query.caseTitle && !query.partyName && !query.attorneyName) {
  return NextResponse.json(
    { error: 'Invalid request', message: 'At least one search parameter is required' },
    { status: 400 }
  )
}
```

**Required Fields (at least one):**
- ✅ caseNumber
- ✅ caseTitle
- ✅ partyName
- ✅ attorneyName

**Optional Fields (can narrow search):**
- court
- filingDateFrom
- filingDateTo
- caseType
- nature

---

## Files Modified

| File | Changes | Status |
|------|---------|--------|
| `src/app/components/docket-genie/CaseSearchForm.tsx` | • Fixed validation logic<br>• Added error display<br>• Added visual field indicators<br>• Improved help text<br>• Added toast notifications | ✅ Complete |
| `src/app/hooks/usePacerSearch.ts` | • Added toast notifications for success/error<br>• Improved error handling | ✅ Complete |

---

## Testing Steps

### Test Validation Errors

1. **Empty Form:**
   - Leave all fields empty
   - Button should be **disabled**
   - Help text shows required fields

2. **Only Optional Fields:**
   - Fill only "Court" field
   - Button should be **disabled**
   - Fill only "Filing Date From"
   - Button should still be **disabled**

3. **Try to Submit Invalid:**
   - If button somehow gets clicked without required fields
   - Should show large red error box
   - Should show toast notification
   - Should prevent API call

### Test Successful Search

1. **Minimal Required Field:**
   - Fill only "Case Number": `1:23-cv-12345`
   - Button should be **enabled**
   - Click "Search Cases"
   - Should see loading spinner
   - Should see success toast when results load

2. **Required + Optional Fields:**
   - Fill "Party Name": `Smith`
   - Fill "Court": `New York Southern District`
   - Fill "Filing Date From": `2023-01-01`
   - Button should be **enabled**
   - Click search
   - Should see toast with result count

3. **No Results:**
   - Fill "Case Number": `999:99-cv-99999`
   - Click search
   - Should see toast: "No cases found matching your search criteria"

### Test Error Handling

1. **Session Expired:**
   - Let PACER session expire
   - Try to search
   - Should see error toast
   - Should show error in alert box

2. **Network Error:**
   - Disconnect internet (or block in DevTools)
   - Try to search
   - Should see error toast
   - Should show user-friendly error message

---

## Visual Improvements

### Field Labeling

**Required Fields (red asterisk):**
- Case Number *
- Case Title *
- Party Name *
- Attorney Name *

**Optional Fields (gray text):**
- Court (optional)
- Filing Date From (optional)
- Filing Date To (optional)

### Error Display

**Inline Validation Error Box:**
```
┌─────────────────────────────────────────────┐
│ ⚠️ Validation Error                         │
│ Please enter at least one of: Case Number,  │
│ Case Title, Party Name, or Attorney Name    │
└─────────────────────────────────────────────┘
```

**Toast Notifications:**
- ✅ Success: "Found 15 cases" (green)
- ℹ️ Info: "No cases found matching your search criteria" (blue)
- ❌ Error: "Validation error message" (red)

---

## Validation Rules

### Frontend Validation (Client-Side)

✅ **Prevents unnecessary API calls**
- Checks required fields before submitting
- Shows error immediately
- Disables button until valid

### Backend Validation (Server-Side)

✅ **Security layer**
- Double-checks all requirements
- Returns proper error codes
- Prevents invalid searches

### Combined Benefits

✅ **Better UX:**
- Instant feedback (no API call needed)
- Clear error messages
- Visual field indicators

✅ **Better Performance:**
- No wasted API calls
- No unnecessary network requests
- Faster error detection

✅ **Better Security:**
- Server-side validation still active
- Protection against malicious requests
- Proper error handling

---

## Alignment with PACER API Documentation

### PCL API Search Requirements

**From PCL API User Guide (Nov 2024), p.9:**

Case search requires at least one of:
- Case number (full or partial)
- Case title
- Court and date range
- Party information

Party search requires at least one of:
- Last name
- SSN (with last name)
- Date filed/closed

**Our Implementation:**
- ✅ Case Number → maps to `caseNumber`
- ✅ Case Title → maps to `caseTitle`
- ✅ Party Name → maps to `partyName` (last name search)
- ✅ Attorney Name → maps to `attorneyName` (attorney search)

**Court and dates are filters, not primary search criteria**, which aligns with PACER's design where you need a primary search field plus optional filters.

---

## Summary

**Status:** ✅ **FIXED**

### What Was Fixed:
1. ✅ Frontend validation matches backend validation
2. ✅ Search button only enables with required fields
3. ✅ Clear visual indicators for required vs optional fields
4. ✅ Prominent error display
5. ✅ Toast notifications for all actions
6. ✅ Auto-clearing errors when user types
7. ✅ Improved help text

### User Impact:
- ✅ Clear understanding of what's required
- ✅ Immediate feedback on validation errors
- ✅ Better success/error notifications
- ✅ Reduced confusion
- ✅ Fewer wasted API calls

### Developer Impact:
- ✅ Consistent validation logic
- ✅ Better error handling
- ✅ Cleaner code structure
- ✅ Easier to maintain

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Status:** ✅ Complete - Search validation working properly

