# PACER Docket Report Integration - Implementation Guide

## Overview

This document describes the implementation of PACER docket report fetching for the AI Wizard application, specifically for the Southern District of New York (NYSD) court system.

## Architecture

### Core Components

1. **PacerDocketFetcher** (`src/app/lib/pacerDocketFetcher.ts`)
   - Handles court-specific docket fetching
   - Parses HTML responses using Cheerio
   - Calculates PACER fees based on page counts
   - Supports NYSD court system

2. **Court Configuration** (`src/app/lib/courtConfig.ts`)
   - Defines court-specific settings and selectors
   - NYSD configuration with HTML parsing patterns
   - Fee calculation rules

3. **Error Handling** (`src/app/lib/pacerErrors.ts`)
   - Custom error classes for different failure scenarios
   - User-friendly error messages
   - Retry logic for transient errors

4. **API Routes**
   - `/api/pacer/docket` - Fetch docket reports
   - `/api/pacer/docket/estimate-fee` - Estimate fees before fetching

5. **Frontend Integration**
   - `useDocketFetcher` hook for state management
   - Enhanced `ActiveCasePanel` with fee estimation
   - Updated `DocketDisplay` with cost information

## NYSD Integration Details

### Court System Access

**Base URL**: `https://ecf.nysd.uscourts.gov`
**Docket Endpoint**: `/cgi-bin/DktRpt.pl`

### Authentication

Uses PACER session token (`nextGenCSO`) passed via cookies:
```
Cookie: nextGenCSO={sessionToken}
```

### Request Flow

1. **Case Search**: POST to `/cgi-bin/DktRpt.pl` with case number
2. **HTML Parsing**: Extract case info and docket entries from response
3. **Fee Calculation**: Calculate costs based on page counts

### HTML Parsing Patterns

#### Case Information
```typescript
selectors: {
  caseInfo: {
    title: 'td:contains("Case Title:") + td, .caseTitle',
    judge: 'td:contains("Assigned Judge:") + td, .assignedJudge',
    filingDate: 'td:contains("Date Filed:") + td, .filingDate',
    status: 'td:contains("Case Status:") + td, .caseStatus'
  }
}
```

#### Docket Entries
```typescript
selectors: {
  docketEntries: {
    container: 'tr.docketEntry, tr[class*="docket"], .docketTable tr',
    entryNumber: 'td:first-child, .entryNumber',
    date: 'td:nth-child(2), .entryDate',
    description: 'td:nth-child(3), .entryDescription',
    filedBy: 'td:nth-child(4), .filedBy'
  }
}
```

#### Documents
```typescript
selectors: {
  documents: {
    container: 'a[href*="doc1"], .documentLink',
    link: 'a[href*="doc1"]',
    description: 'a[href*="doc1"]',
    cost: 'text()',
    pages: 'text()'
  }
}
```

## Fee Calculation Logic

### PACER Fee Structure
- **Docket Reports**: $0.10 per page
- **Documents**: $0.10 per page
- **Minimum Fee**: $0.00

### Estimation Algorithm
```typescript
// Based on case age and type
const caseYear = extractCaseYear(caseNumber)
const caseAge = currentYear - caseYear
const estimatedEntries = Math.max(10, caseAge * 5)
const estimatedPages = Math.ceil(estimatedEntries / 20)
const estimatedFee = estimatedPages * 0.10
```

### Actual Fee Calculation
```typescript
// Count actual pages from HTML
const docketPages = Math.ceil(entryCount / 20)
const documentPages = sum(documentPageCounts)
const totalFee = (docketPages + documentPages) * 0.10
```

## Error Handling

### Error Types

1. **PacerAuthenticationError**
   - Invalid or expired session token
   - User-friendly: "Your PACER session has expired. Please log in again."

2. **PacerNetworkError**
   - Court system unavailable
   - User-friendly: "The court system is temporarily unavailable."

3. **PacerParsingError**
   - Failed to parse HTML response
   - User-friendly: "Unable to process the court response."

4. **PacerCaseNotFoundError**
   - Case number doesn't exist
   - User-friendly: "Case not found. Please verify the case number."

5. **PacerTimeoutError**
   - Request timed out
   - User-friendly: "Request timed out. The court system may be slow."

### Retry Logic

```typescript
function isRetryableError(error: Error): boolean {
  if (error instanceof PacerNetworkError) return true
  if (error instanceof PacerTimeoutError) return true
  if (error instanceof PacerRateLimitError) return true
  return false
}
```

## API Endpoints

### POST /api/pacer/docket

**Request Body**:
```json
{
  "sessionToken": "string",
  "caseNumber": "string",
  "court": "string"
}
```

**Response**:
```json
{
  "success": true,
  "caseInfo": {
    "caseNumber": "1:24-cv-12345",
    "caseTitle": "Case Title",
    "court": "nysd",
    "courtName": "Southern District of New York",
    "judge": "Hon. John Doe",
    "filingDate": "2024-01-15",
    "status": "Active"
  },
  "docketEntries": [...],
  "totalEntries": 10,
  "estimatedFee": 0.50,
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

### POST /api/pacer/docket/estimate-fee

**Request Body**:
```json
{
  "sessionToken": "string",
  "caseNumber": "string",
  "court": "string"
}
```

**Response**:
```json
{
  "success": true,
  "caseNumber": "1:24-cv-12345",
  "court": "nysd",
  "estimatedFee": 0.50,
  "breakdown": {
    "docketPages": 5,
    "documentPages": 0
  },
  "confidence": "medium",
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

## Frontend Integration

### useDocketFetcher Hook

```typescript
const {
  docketData,
  feeEstimate,
  loading,
  error,
  estimateFee,
  fetchDocket,
  clearData,
  clearError,
} = useDocketFetcher()
```

### Fee Estimation Workflow

1. User selects case from search results
2. System automatically estimates fees
3. User sees fee estimate dialog
4. User confirms or cancels
5. If confirmed, system fetches full docket
6. Actual fees displayed with docket data

### UI Components

- **Fee Estimation Dialog**: Shows estimated costs before fetching
- **Loading States**: Spinners and progress indicators
- **Error Handling**: User-friendly error messages with retry options
- **Cost Display**: Shows fees in docket display and individual documents

## Adding New Courts

### Step 1: Create Court Configuration

```typescript
export const NEW_COURT_CONFIG: CourtConfig = {
  code: 'newcourt',
  name: 'New Court Name',
  baseUrl: 'https://ecf.newcourt.uscourts.gov',
  docketEndpoint: '/cgi-bin/DktRpt.pl',
  timeout: 45000,
  selectors: {
    // Define HTML selectors for this court
  },
  feeCalculation: {
    docketPageRate: 0.10,
    documentPageRate: 0.10,
    minimumFee: 0.00
  }
}
```

### Step 2: Add to Court Config

```typescript
export function getCourtConfig(courtCode: string): CourtConfig {
  switch (courtCode.toLowerCase()) {
    case 'nysd':
      return NYSD_CONFIG
    case 'newcourt':
      return NEW_COURT_CONFIG
    default:
      throw new Error(`Court configuration not found for: ${courtCode}`)
  }
}
```

### Step 3: Add Fetcher Method

```typescript
// In PacerDocketFetcher class
private async fetchNewCourtDocket(caseNumber: string): Promise<DocketReportResponse> {
  // Implement court-specific fetching logic
}

private parseNewCourtDocket(html: string, caseNumber: string): DocketReportResponse {
  // Implement court-specific parsing logic
}
```

### Step 4: Update Main Fetcher

```typescript
async fetchDocketReport(caseNumber: string, court: string): Promise<DocketReportResponse> {
  switch (court.toLowerCase()) {
    case 'nysd':
      return this.fetchNYSDDocket(caseNumber)
    case 'newcourt':
      return this.fetchNewCourtDocket(caseNumber)
    default:
      throw new Error(`Court ${court} not yet supported`)
  }
}
```

## Testing

### Mock Mode

Set `PACER_MOCK_MODE=true` in environment variables to use simulated data for development and testing.

### Integration Testing

1. **Fee Estimation**: Verify estimates are reasonable
2. **HTML Parsing**: Test with real court HTML responses
3. **Error Handling**: Test various error scenarios
4. **Session Management**: Test token expiration handling

### Test Cases

```typescript
describe('PacerDocketFetcher', () => {
  it('should parse NYSD docket HTML correctly', async () => {
    const fetcher = new PacerDocketFetcher('mock-token')
    const result = await fetcher.fetchDocketReport('1:24-cv-12345', 'nysd')
    expect(result.caseInfo.caseNumber).toBe('1:24-cv-12345')
    expect(result.docketEntries.length).toBeGreaterThan(0)
  })

  it('should calculate fees correctly', async () => {
    const fetcher = new PacerDocketFetcher('mock-token')
    const fee = await fetcher.estimateDocketFee('1:24-cv-12345', 'nysd')
    expect(fee).toBeGreaterThanOrEqual(0)
  })
})
```

## Security Considerations

1. **Session Token Protection**: Never log or expose session tokens
2. **Input Validation**: Validate case numbers and court codes
3. **Rate Limiting**: Implement request throttling
4. **Error Information**: Don't expose internal system details

## Performance Optimization

1. **Caching**: Cache parsed docket data
2. **Lazy Loading**: Load docket data only when needed
3. **Pagination**: Handle large docket reports efficiently
4. **Timeout Management**: Appropriate timeouts for different operations

## Monitoring and Logging

1. **Request Logging**: Log all PACER requests (without sensitive data)
2. **Error Tracking**: Monitor error rates and types
3. **Performance Metrics**: Track response times and success rates
4. **Fee Tracking**: Monitor total PACER costs

## Future Enhancements

1. **Additional Courts**: Add support for more federal courts
2. **Document Download**: Implement document download functionality
3. **Batch Processing**: Support multiple case lookups
4. **Advanced Filtering**: Filter docket entries by date, type, etc.
5. **Export Functionality**: Export docket data to various formats

## Troubleshooting

### Common Issues

1. **Session Expired**: User needs to re-authenticate with PACER
2. **Case Not Found**: Verify case number format and court
3. **Parsing Errors**: Court may have changed HTML structure
4. **Network Timeouts**: Court system may be slow or unavailable

### Debug Steps

1. Check session token validity
2. Verify case number format
3. Test with mock mode first
4. Check court system status
5. Review HTML parsing selectors

## Support

For issues or questions regarding PACER docket integration:

1. Check this documentation first
2. Review error logs for specific issues
3. Test with mock mode to isolate problems
4. Contact development team with specific error details
