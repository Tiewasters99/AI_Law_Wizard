/**
 * PACER Code Lookups and Descriptions
 * Based on PCL API User Guide Appendices
 */

/**
 * Nature of Suit Codes (Appendix C - Civil Cases)
 * Full list from PCL API documentation
 */
export const NATURE_OF_SUIT_CODES: Record<string, string> = {
  // Contract
  "110": "Insurance",
  "120": "Contract: Marine",
  "130": "Miller Act",
  "140": "Negotiable Instrument",
  "150": "Contract: Recovery/Enforcement",
  "151": "Contract: Recovery Medicare",
  "152": "Contract: Recovery Student Loan",
  "153": "Contract: Recovery Veteran Benefits",
  "160": "Stockholders Suits",
  "161": "Contract: Recovery Overpayment",
  "190": "Contract: Other",
  "195": "Contract: Product Liability",
  "196": "Contract: Franchise",

  // Personal Injury
  "310": "Airplane Personal Injury",
  "315": "Airplane Product Liability",
  "320": "Assault, Libel & Slander",
  "330": "Federal Employers Liability",
  "340": "Marine Personal Injury",
  "345": "Marine Product Liability",
  "350": "Motor Vehicle Personal Injury",
  "355": "Motor Vehicle Product Liability",
  "360": "Personal Injury - Other",
  "362": "Personal Injury - Medical Malpractice",
  "365": "Personal Injury - Product Liability",
  "368": "Asbestos Personal Injury Product Liability",

  // Property Rights
  "370": "Other Fraud",
  "371": "Truth in Lending",
  "380": "Other Personal Property Damage",
  "385": "Property Rights",
  "390": "Other Contract",

  // Civil Rights
  "440": "Other Civil Rights",
  "441": "Voting",
  "442": "Employment",
  "443": "Housing/Accommodations",
  "444": "Welfare",
  "445": "Americans with Disabilities - Employment",
  "446": "Americans with Disabilities - Other",
  "447": "Education",
  "448": "Election",

  // Prisoner Petitions
  "510": "Motion to Vacate Sentence",
  "530": "General",
  "535": "Death Penalty",
  "540": "Mandamus & Other",
  "550": "Civil Rights",
  "555": "Prison Condition",
  "560": "Civil Detainee",

  // Forfeiture/Penalty
  "610": "Agriculture",
  "620": "Other Food & Drug",
  "625": "Drug Related Seizure of Property",
  "630": "Liquor Laws",
  "640": "R.R. & Truck",
  "650": "Airline Regs.",
  "660": "Occupational Safety/Health",
  "690": "Other",

  // Labor
  "710": "Fair Labor Standards Act",
  "720": "Labor/Management Relations",
  "730": "Labor/Management Reporting & Disclosure Act",
  "740": "Railway Labor Act",
  "790": "Other Labor Litigation",
  "791": "Employee Retirement Income Security Act",

  // Social Security
  "861": "HIA (1395ff)",
  "862": "Black Lung (923)",
  "863": "DIWC/DIWW (405(g))",
  "864": "SSID Title XVI",
  "865": "RSI (405(g))",

  // Tax Suits
  "870": "Taxes (U.S. Plaintiff or Defendant)",
  "871": "IRS - Third Party",
  "875": "Customer Challenge",
  "890": "Other Statutory Actions",
  "891": "Agricultural Acts",
  "892": "Economic Stabilization Act",
  "893": "Environmental Matters",
  "894": "Energy Allocation Act",
  "895": "Freedom of Information Act",
  "896": "Arbitration",
  "897": "Agricultural Marketing Act",
  "898": "Agricultural Commodities Act",
  "899": "Administrative Procedure Act/Review or Appeal of Agency Decision",

  // Bankruptcy
  "422": "Appeal 28 USC 158",
  "423": "Withdrawal 28 USC 157",

  // Other
  "820": "Copyrights",
  "830": "Patent",
  "840": "Trademark",
  "850": "Securities/Commodities/Exchange",
};

/**
 * Nature of Suit Codes (Appendix D - Criminal Cases)
 */
export const CRIMINAL_NATURE_OF_SUIT_CODES: Record<string, string> = {
  "100": "Antitrust",
  "110": "Antitrust - Other",
  "120": "Antitrust - Private",
  "130": "Antitrust - Government",
  "140": "Antitrust - Other",

  "200": "Bankruptcy",
  "210": "Bankruptcy - Other",
  "220": "Bankruptcy - Private",
  "230": "Bankruptcy - Government",
  "240": "Bankruptcy - Other",

  "300": "Civil Rights",
  "310": "Civil Rights - Other",
  "320": "Civil Rights - Private",
  "330": "Civil Rights - Government",
  "340": "Civil Rights - Other",

  "400": "Contract",
  "410": "Contract - Other",
  "420": "Contract - Private",
  "430": "Contract - Government",
  "440": "Contract - Other",

  "500": "Criminal",
  "510": "Criminal - Other",
  "520": "Criminal - Private",
  "530": "Criminal - Government",
  "540": "Criminal - Other",

  "600": "Environmental",
  "610": "Environmental - Other",
  "620": "Environmental - Private",
  "630": "Environmental - Government",
  "640": "Environmental - Other",

  "700": "Labor",
  "710": "Labor - Other",
  "720": "Labor - Private",
  "730": "Labor - Government",
  "740": "Labor - Other",

  "800": "Other",
  "810": "Other - Other",
  "820": "Other - Private",
  "830": "Other - Government",
  "840": "Other - Other",

  "900": "Property",
  "910": "Property - Other",
  "920": "Property - Private",
  "930": "Property - Government",
  "940": "Property - Other",
};

/**
 * Court Type Codes (Appendix E)
 */
export const COURT_TYPE_CODES: Record<string, string> = {
  "1": "U.S. District Court",
  "2": "U.S. Bankruptcy Court",
  "3": "U.S. Court of Appeals",
  "4": "U.S. Court of Federal Claims",
  "5": "U.S. Court of International Trade",
  "6": "U.S. Court of Appeals for Veterans Claims",
  "7": "U.S. Court of Appeals for the Armed Forces",
  "8": "U.S. Tax Court",
  "9": "U.S. Court of Appeals for the Federal Circuit",
  "10": "U.S. Supreme Court",
};

/**
 * Case Status Codes (Appendix F)
 */
export const CASE_STATUS_CODES: Record<string, string> = {
  "1": "Open",
  "2": "Closed",
  "3": "Reopened",
  "4": "Pending",
  "5": "Transferred",
  "6": "Appealed",
  "7": "Reversed",
  "8": "Vacated",
  "9": "Settled",
  "10": "Dismissed",
  "11": "Terminated",
  "12": "Other",
};

/**
 * Case Type Codes (Appendix G)
 */
export const CASE_TYPE_CODES: Record<string, string> = {
  "1": "Civil",
  "2": "Criminal",
  "3": "Bankruptcy",
  "4": "Appeal",
  "5": "Other",
};

/**
 * Party Type Codes (Appendix H)
 */
export const PARTY_TYPE_CODES: Record<string, string> = {
  "1": "Plaintiff",
  "2": "Defendant",
  "3": "Third Party",
  "4": "Intervenor",
  "5": "Amicus Curiae",
  "6": "Other",
};

/**
 * Document Type Codes (Appendix I)
 */
export const DOCUMENT_TYPE_CODES: Record<string, string> = {
  "1": "Complaint",
  "2": "Answer",
  "3": "Motion",
  "4": "Order",
  "5": "Judgment",
  "6": "Notice",
  "7": "Other",
};

/**
 * Bankruptcy Chapter Descriptions
 */
export const BANKRUPTCY_CHAPTER_CODES: Record<string, string> = {
  "7": "Chapter 7 - Liquidation",
  "9": "Chapter 9 - Municipality",
  "11": "Chapter 11 - Reorganization",
  "12": "Chapter 12 - Family Farmer",
  "13": "Chapter 13 - Individual Debt Adjustment",
  "15": "Chapter 15 - Cross-Border Insolvency",
};

/**
 * Utility functions for PACER codes
 */
export class PacerCodeUtils {
  /**
   * Get description for nature of suit code
   */
  static getNatureOfSuitDescription(code: string): string {
    return NATURE_OF_SUIT_CODES[code] || "Unknown";
  }

  /**
   * Get description for criminal nature of suit code
   */
  static getCriminalNatureOfSuitDescription(code: string): string {
    return CRIMINAL_NATURE_OF_SUIT_CODES[code] || "Unknown";
  }

  /**
   * Get description for court type code
   */
  static getCourtTypeDescription(code: string): string {
    return COURT_TYPE_CODES[code] || "Unknown";
  }

  /**
   * Get description for case status code
   */
  static getCaseStatusDescription(code: string): string {
    return CASE_STATUS_CODES[code] || "Unknown";
  }

  /**
   * Get description for case type code
   */
  static getCaseTypeDescription(code: string): string {
    return CASE_TYPE_CODES[code] || "Unknown";
  }

  /**
   * Get description for party type code
   */
  static getPartyTypeDescription(code: string): string {
    return PARTY_TYPE_CODES[code] || "Unknown";
  }

  /**
   * Get description for document type code
   */
  static getDocumentTypeDescription(code: string): string {
    return DOCUMENT_TYPE_CODES[code] || "Unknown";
  }

  /**
   * Get all nature of suit codes as array
   */
  static getAllNatureOfSuitCodes(): Array<{
    code: string;
    description: string;
  }> {
    return Object.entries(NATURE_OF_SUIT_CODES).map(([code, description]) => ({
      code,
      description,
    }));
  }

  /**
   * Search nature of suit codes by description
   */
  static searchNatureOfSuitCodes(
    searchTerm: string
  ): Array<{ code: string; description: string }> {
    const term = searchTerm.toLowerCase();
    return Object.entries(NATURE_OF_SUIT_CODES)
      .filter(([_, description]) => description.toLowerCase().includes(term))
      .map(([code, description]) => ({ code, description }));
  }
}

/**
 * Standalone utility functions for easy importing
 */
export function getNatureOfSuitDescription(code: string): string {
  return PacerCodeUtils.getNatureOfSuitDescription(code);
}

export function getCaseTypeDescription(code: string): string {
  return PacerCodeUtils.getCaseTypeDescription(code);
}

export function getBankruptcyChapterDescription(chapter: string): string {
  return BANKRUPTCY_CHAPTER_CODES[chapter] || "Unknown Chapter";
}

export function formatCaseNumber(caseNumber: string): string {
  // Format case number for display (e.g., 1:23-cv-12345 -> 1:23-cv-12345)
  return caseNumber || "N/A";
}
