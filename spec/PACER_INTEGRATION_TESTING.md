# PACER Integration Testing Guide

## Overview

This guide explains how to test the Docket Genie PACER integration with real PACER credentials in a production-like environment.

## Prerequisites

### 1. PACER Account

You need an active PACER account:
- Register at: https://pacer.uscourts.gov
- Verify your email address
- Add funds to your account (minimum $10 recommended for testing)
- Note your username and password

### 2. Environment Configuration

Add your PACER credentials to your environment:

```bash
# .env.local (DO NOT commit this file)
PACER_API_BASE_URL=https://pacer.uscourts.gov
PACER_TIMEOUT_MS=30000
```

**IMPORTANT**: Never commit credentials to version control!

## Testing Strategy

### Phase 1: Authentication Testing

1. **Navigate to Docket Genie**
   - Login as an attorney
   - Go to Court Integration → Docket Genie
   - Click on "Connect" tab

2. **Test Authentication**
   - Enter your PACER username
   - Enter your PACER password
   - (Optional) Enter client code if applicable
   - Click "Connect to PACER"

**Expected Results**:
- ✅ Success: Session token received, timer starts
- ❌ Failure: Check console for error details

**Common Issues**:
- Invalid credentials → Verify username/password
- Network error → Check PACER availability
- CORS errors → May need proxy configuration

### Phase 2: Case Search Testing

1. **Test Simple Search**
   - Search by case number (e.g., "1:23-cv-12345")
   - Verify results display

2. **Test Advanced Search**
   - Search by party name
   - Search by court + date range
   - Search by attorney name

3. **Test Edge Cases**
   - No results found
   - Very broad search (many results)
   - Invalid case number format

**Expected Results**:
- ✅ Results display with case cards
- ✅ Fee estimate shown
- ✅ "View Docket" and "Details" buttons work

### Phase 3: Docket Report Testing

1. **View Docket**
   - Click "View Docket" on any search result
   - Wait for docket to load
   - Verify all entries display

2. **Test Expandable Entries**
   - Click to expand docket entries
   - Verify full docket text shows
   - Check document links appear

3. **Verify Fee Calculation**
   - Check estimated fee display
   - Compare with PACER's fee calculator

**Expected Results**:
- ✅ Docket entries load
- ✅ Expandable content works
- ✅ Document links are present
- ✅ Fees are accurate

### Phase 4: Case Details Testing

1. **View Case Details**
   - Click "Details" on any search result
   - Verify all sections load:
     - Case Overview
     - Parties
     - Attorneys
     - Statistics

2. **Verify Data Accuracy**
   - Compare with actual PACER data
   - Check party types are correct
   - Verify attorney information

**Expected Results**:
- ✅ All details sections populate
- ✅ Data matches PACER
- ✅ Statistics are accurate

### Phase 5: Document Download Testing

1. **Download Document**
   - Find a docket entry with documents
   - Click "Download" on a document
   - Wait for download confirmation

2. **Verify Document**
   - Check Documents tab
   - Verify file information is correct
   - Check fee is calculated properly

3. **Test AI Integration**
   - Click "Analyze with AI" on downloaded document
   - Verify redirect to Document Analysis
   - Test AI analysis functionality

**Expected Results**:
- ✅ Document downloads successfully
- ✅ Appears in Documents tab
- ✅ AI analysis integration works
- ✅ Fees are tracked

### Phase 6: Session Management Testing

1. **Monitor Session**
   - Watch session timer countdown
   - Verify warnings appear before expiry

2. **Test Session Expiration**
   - Let session expire
   - Try to perform action
   - Verify "reconnect" prompt appears

3. **Test Manual Logout**
   - Click "Disconnect from PACER"
   - Verify session ends
   - Try to perform action
   - Verify re-authentication required

**Expected Results**:
- ✅ Timer counts down accurately
- ✅ Expired session detected
- ✅ Reconnect flow works
- ✅ Manual logout works

## Monitoring & Debugging

### Browser Console

Open browser developer console (F12) to monitor:

```javascript
// Watch for PACER client logs
[PACER] Authenticating user: your-username
[PACER] Authentication successful
[PACER] Searching cases with query: {...}
[PACER] Found 15 cases
[PACER] Getting docket for case 1:23-cv-12345 in nysd
[PACER] Retrieved 45 docket entries
```

### Network Tab

Monitor network requests:
- Authentication: `POST /psc-public-api/authentication/login`
- Search: `GET /pcl-public-api/search?...`
- Docket: `GET /docket-report/{court}/{caseNumber}`
- Documents: `GET /doc1/{court}/{caseNumber}/{docId}`

### Common Errors

#### 1. Authentication Failure (401)

**Error**: "Authentication failed: 401 Unauthorized"

**Solutions**:
- Verify username and password
- Check if PACER account is active
- Ensure no outstanding bills on PACER account
- Try logging in directly to pacer.uscourts.gov

#### 2. Session Expired (401)

**Error**: "Session expired. Please login again."

**Solutions**:
- Click "Reconnect" button
- Re-enter credentials
- Consider longer session duration in PACER settings

#### 3. CORS Error

**Error**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions**:
- PACER may need to whitelist your domain
- Consider using a proxy for development
- Contact PACER support for API access

#### 4. Network Timeout

**Error**: "Request timed out. Please try again."

**Solutions**:
- Check internet connection
- Verify PACER services are operational
- Increase timeout in environment variables
- Try again during off-peak hours

#### 5. Rate Limiting

**Error**: "Rate limit exceeded"

**Solutions**:
- Wait before retrying
- Reduce frequency of requests
- Contact PACER about rate limits

## Production Checklist

Before deploying to production:

- [ ] Test all authentication flows
- [ ] Verify all search scenarios work
- [ ] Confirm docket reports load correctly
- [ ] Test document downloads end-to-end
- [ ] Validate fee calculations
- [ ] Test session expiration handling
- [ ] Verify error messages are user-friendly
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Monitor PACER fees during testing
- [ ] Review console for any errors
- [ ] Test with multiple PACER accounts
- [ ] Verify logout cleans up sessions
- [ ] Check AI integration works
- [ ] Test with restricted/sealed documents

## Cost Management

### Estimated Testing Costs

Typical PACER fees for testing:
- Authentication: **FREE**
- Case search (20 results): **$2.00** (capped at $3.00)
- Docket report (40 entries): **$3.00** (capped)
- Document download (12 pages): **$1.20**

**Total estimated**: $6.00 - $10.00 for comprehensive testing

### Tips to Minimize Costs

1. **Use Recent Cases**: They load faster and are more likely to work
2. **Test Search Carefully**: Each search incurs fees
3. **Limit Document Downloads**: Documents are the most expensive
4. **Use Same Cases**: Reuse known case numbers for repeated tests
5. **Quarterly Exemption**: First $30/quarter is waived for low-volume users

## API Endpoint Configuration

If PACER provides different endpoints, update `src/app/lib/pacerConfig.ts`:

```typescript
export const PACER_CONFIG = {
  production: {
    base: 'https://pacer.uscourts.gov',  // Update if needed
    pscApi: 'https://actual-psc-api-url', // Update from docs
    pclApi: 'https://actual-pcl-api-url', // Update from docs
  },
  endpoints: {
    login: '/actual/login/path',          // Update from docs
    caseSearch: '/actual/search/path',    // Update from docs
    // ... other endpoints
  },
}
```

## Support

### PACER Support

- **Phone**: 800-676-6856
- **Email**: pacer@psc.uscourts.gov
- **Hours**: Monday-Friday, 8 AM - 6 PM CT
- **Website**: https://pacer.uscourts.gov

### API Documentation

- Request API documentation from PACER
- Check for developer resources
- Join PACER API developer community

### Internal Support

- Check logs in `src/app/lib/pacerClient.ts`
- Review error handling in API routes
- Monitor browser console for client-side errors
- Check server logs for API route errors

## Next Steps

After successful testing:

1. **Document Findings**
   - Note any endpoint differences
   - Document actual response structures
   - Update type definitions if needed

2. **Update Configuration**
   - Adjust timeouts based on actual performance
   - Update fee calculations if different
   - Configure retry logic

3. **Enhance Error Handling**
   - Add specific error messages
   - Implement retry for transient failures
   - Improve user feedback

4. **Optimize Performance**
   - Add caching where appropriate
   - Implement request throttling
   - Optimize data transformations

5. **Security Audit**
   - Review credential handling
   - Check session management
   - Verify no data leaks

---

**Last Updated**: October 2025  
**Version**: 1.0  
**For**: Production PACER Integration Testing
