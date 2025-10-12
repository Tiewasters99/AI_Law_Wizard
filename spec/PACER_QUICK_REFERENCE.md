# PACER Integration Quick Reference

## ✅ What's Working Now

### Authentication ✅
- **Endpoint**: `POST /services/cso-auth`
- **Required**: Username, password
- **Optional**: Client code, OTP (for MFA), redaction flag
- **Returns**: 128-character session token (nextGenCSO)

### Case Search ✅  
- **Endpoint**: `POST /pcl-public-api/rest/cases/find?page=0`
- **Headers**: `X-NEXT-GEN-CSO: <token>`
- **Search by**: Case number, title, court, date range, type, nature
- **Returns**: **43+ fields** per case including `caseLink`

### Party Search ✅
- **Endpoint**: `POST /pcl-public-api/rest/parties/find?page=0`
- **Headers**: `X-NEXT-GEN-CSO: <token>`
- **Search by**: Party name (lastName), SSN
- **Filter by**: Court, date range, case type
- **Returns**: Party info + full case details

### Case Details ✅
- **Method**: Uses case search
- **Returns**: Complete case information from PCL
- **Includes**: All 43+ fields available in PCL API

---

## 🎯 Critical: caseLink Field

**Most Important Field**: `caseLink`

This URL provides direct access to the court's CM/ECF system where attorneys can:
- ✅ View complete docket sheet
- ✅ Download case documents
- ✅ View party and attorney information
- ✅ Access sealed or restricted documents (if authorized)
- ✅ File documents (if authorized)

**Example**: `https://ecf.paed.uscourts.gov/cgi-bin/iqquerymenu.pl?637098`

---

## 📊 Data Fields Reference

### Core Fields (Always Present)
```typescript
caseNumber: "2:2025cv02287"
caseTitle: "De Camara et al v. BRYN MAWR COLLEGE et al"
court: "paedc"
caseId: 637098
filingDate: "2025-05-05"
jurisdiction: "Civil"
caseLink: "https://ecf.paed.uscourts.gov/..."
```

### Optional Fields (Depends on Case)
```typescript
// Dates
effectiveDateClosed: "2025-12-31"
dateDismissed: "2025-11-15"
dateDischarged: "2025-10-20"

// Bankruptcy
bankruptcyChapter: "7"
dispositionMethod: "Discharged"
jointBankruptcyFlag: "y"

// Civil
civilStatInitiated: "..."
civilStatDisposition: "..."

// MDL
mdlStatus: "Active"
mdlCourtId: "ca"
jpmlNumber: 12345
```

---

## 🔍 Search Examples

### By Case Number
```typescript
await searchCases({
  caseNumber: "2:2025cv02287",
  court: "paedc"
}, sessionToken)
```

### By Case Title
```typescript
await searchCases({
  caseTitle: "Camara",
  court: "paedc"
}, sessionToken)
```

### By Party Name
```typescript
await searchCases({
  partyName: "De Camara",
  court: "paedc"
}, sessionToken)
```

### By Date Range
```typescript
await searchCases({
  court: "paedc",
  filingDateFrom: "2025-01-01",
  filingDateTo: "2025-12-31",
  caseType: "cv"
}, sessionToken)
```

---

## 🎨 UI Components

### Search Results Display
- **File**: `src/app/components/docket-genie/CaseSearchResults.tsx`
- **Shows**: Case cards with all key information
- **Actions**: View in CM/ECF, View details

### Case Details Display
- **File**: `src/app/components/docket-genie/CaseDetailsView.tsx`
- **Shows**: Complete case information in organized panels
- **Actions**: Access CM/ECF, Copy link

### Code Lookups
- **File**: `src/app/lib/pacerCodes.ts`
- **Provides**: Descriptions for all PACER codes
- **Functions**: Format helpers, code translations

---

## ⚠️ Important Notes

### What PCL API Provides ✅
- Complete case information (43+ fields)
- Basic party information via party search
- Direct links to CM/ECF systems
- Search across all federal courts

### What PCL API Does NOT Provide ❌
- Docket entries/history → Use CM/ECF
- Document downloads → Use CM/ECF
- Detailed party addresses → Use CM/ECF
- Attorney contact info → Use CM/ECF

### Solution: Use caseLink
The `caseLink` field provides direct access to the court's CM/ECF system for everything PCL doesn't provide.

---

## 💰 PACER Fees

### PCL Search Fees
- **$0.10 per page** of search results
- Page = 54 search results
- Example: 100 results = 2 pages = $0.20

### CM/ECF Fees (via caseLink)
- **Docket viewing**: $0.10 per page
- **Document downloads**: $0.10 per page (capped at $3.00 per document)
- **Free quarterly cap**: $30 of fees waived per quarter

---

## 🚀 Usage

### 1. Authenticate
```typescript
const response = await fetch('/api/pacer/auth', {
  method: 'POST',
  body: JSON.stringify({
    username: 'your-username',
    password: 'your-password',
    redactFlag: '1', // Required for filers
  })
})
```

### 2. Search Cases
```typescript
const results = await fetch('/api/pacer/search', {
  method: 'POST',
  body: JSON.stringify({
    sessionToken,
    query: {
      caseNumber: '2:2025cv02287',
      court: 'paedc'
    }
  })
})
```

### 3. Access CM/ECF
```typescript
const caseLink = results.cases[0].caseLink
window.open(caseLink, '_blank')
// Opens: https://ecf.paed.uscourts.gov/cgi-bin/iqquerymenu.pl?637098
```

---

## 📚 Documentation References

- **PACER Authentication API** (May 2025): `Temp/pacerauth.txt`
- **PACER Case Locator API** (November 2024): `Temp/pcl.txt`
- **Appendix C**: Nature of Suit Codes (pages 66-68)
- **Appendix B**: Bankruptcy Chapters (page 65)
- **Appendix A**: Court IDs (pages 60-64)

---

## 🎯 For Your Case

**Case**: De Camara et al v. BRYN MAWR COLLEGE et al  
**Number**: 2:2025cv02287  
**Court**: Eastern District of Pennsylvania  
**Type**: Civil Rights - Americans with Disabilities  
**Status**: Open (Filed May 5, 2025)  
**CM/ECF Link**: https://ecf.paed.uscourts.gov/cgi-bin/iqquerymenu.pl?637098

**What You Can Do Now**:
1. ✅ Search and find this case
2. ✅ See ALL available information from PCL
3. ✅ Click "View in CM/ECF" to access full docket
4. ✅ Download documents from CM/ECF
5. ✅ Review complete case history on CM/ECF

---

## Support

**PACER Support**: 800-676-6856  
**Email**: pacer@psc.uscourts.gov  
**Hours**: 8 AM - 6 PM CT, Monday-Friday

**For API Issues**: Contact PACER support and mention you're using the PCL API

---

**Last Updated**: October 12, 2025  
**Status**: ✅ Production Ready

