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
  '110': 'Insurance',
  '120': 'Contract: Marine',
  '130': 'Miller Act',
  '140': 'Negotiable Instrument',
  '150': 'Contract: Recovery/Enforcement',
  '151': 'Contract: Recovery Medicare',
  '152': 'Contract: Recovery Student Loan',
  '153': 'Contract: Recovery Veteran Benefits',
  '160': 'Stockholders Suits',
  '190': 'Contract: Other',
  '195': 'Contract Product Liability',
  '196': 'Contract: Franchise',
  
  // Real Property
  '210': 'Condemnation',
  '220': 'Real Property: Foreclosure',
  '230': 'Rent Lease & Ejectment',
  '240': 'Torts to Land',
  '245': 'Tort Product Liability',
  '290': 'Real Property: Other',
  
  // Personal Injury
  '310': 'Airplane',
  '315': 'Airplane Product Liability',
  '320': 'Assault Libel & Slander',
  '330': 'Federal Employer\'s Liability',
  '340': 'Marine',
  '345': 'Marine Product Liability',
  '350': 'Motor Vehicle',
  '355': 'Motor Vehicle Product Liability',
  '360': 'P.I.: Other',
  '362': 'Personal Injury Medical Malpractice',
  '365': 'Personal Injury Product Liability',
  '367': 'Personal Injury - Health Care/Pharmaceutical',
  '368': 'P.I.: Asbestos',
  '370': 'Fraud or Truth-In-Lending',
  '371': 'Truth in Lending',
  '375': 'False Claims Act',
  '380': 'Personal Property: Other',
  '385': 'Prop. Damage Prod. Liability',
  
  // Civil Rights
  '400': 'State Reapportionment',
  '410': 'Anti-Trust',
  '422': 'Bankruptcy Appeal (801)',
  '423': 'Bankruptcy Withdrawl',
  '430': 'Banks and Banking',
  '440': 'Civil Rights: Other',
  '441': 'Civil Rights: Voting',
  '442': 'Civil Rights: Jobs',
  '443': 'Civil Rights: Accomodations',
  '444': 'Civil Rights: Welfare',
  '445': 'Civil Rights: Americans with Disabilities - Employment',
  '446': 'Civil Rights: Americans with Disabilities - Other',
  '448': 'Civil Rights: Education',
  
  // Other
  '450': 'Commerce ICC Rates, Etc.',
  '460': 'Deportation',
  '462': 'Naturalization Application',
  '463': 'Habeas Corpus - Alien Detainee',
  '465': 'Other Immigration Actions',
  '470': 'Racketeer/Corrupt Organization',
  '480': 'Consumer Credit',
  '490': 'Cable/Satellite TV',
  
  // Prisoner Petitions
  '510': 'Prisoner: Vacate Sentence',
  '530': 'Habeas Corpus (General)',
  '535': 'Death Penalty - Habeas Corpus',
  '540': 'Mandamus & Other',
  '550': 'Prisoner: Civil Rights',
  '555': 'Habeas Corpus (Prison Condition)',
  '560': 'Prisoner Petitions - Civil Detainee - Conditions of Confinement',
  
  // Forfeiture/Penalty
  '610': 'Forfeit/Penalty: Agriculture',
  '620': 'Forfeit/Penalty: Food and Drug',
  '625': 'Drug Related Seizure of Property',
  '630': 'Forfeit/Penalty: Liquor Laws',
  '640': 'Forfeit/Penalty: R.R. & Truck',
  '650': 'Forfeit/Penalty: Airline Regulations',
  '660': 'Forfeit/Penalty: Occupational Safety',
  '690': 'Forfeit/Penalty: Other',
  
  // Labor
  '710': 'Labor: Fair Standards',
  '720': 'Labor: Labor/Management Relations',
  '730': 'Labor: Reporting/Disclosure',
  '740': 'Labor: Railway Labor Act',
  '751': 'Labor: Family and Medical Leave Act',
  '790': 'Labor: Other',
  '791': 'Labor: E.R.I.S.A.',
  
  // Intellectual Property
  '810': 'Selective Service',
  '820': 'Copyright',
  '830': 'Patent',
  '840': 'Trademark',
  
  // Social Security
  '850': 'Securities/Commodities',
  '861': 'Social Security: HIA',
  '862': 'Social Security: Black Lung',
  '863': 'Social Security: DIWC/DIWW',
  '864': 'Social Security: SSID Tit. XVI',
  '865': 'Social Security: RSI Tax Suits',
  
  // Tax
  '870': 'Taxes',
  '871': 'Tax Suits: IRS-Third Party',
  '875': 'Taxes: Customer Challenge',
  
  // Other Statutory Actions
  '890': 'Other Statutory Actions',
  '891': 'Agriculture Acts',
  '892': 'Economic Stabilization Act',
  '893': 'Environmental Matters',
  '894': 'Energy Allocation Act',
  '895': 'Freedom of Information Act',
  '896': 'Other Statues - Arbitration',
  '899': 'Other Statues - Administrative Procedure Act/Review or Appeal of Agency Decision',
  '900': 'Appeal of Fee Determination',
  '950': 'Constitutional - State Statute',
}

/**
 * Bankruptcy Chapters (Appendix B)
 */
export const BANKRUPTCY_CHAPTERS: Record<string, string> = {
  '7': 'Chapter 7 - Liquidation',
  '9': 'Chapter 9 - Municipality Reorganization',
  '11': 'Chapter 11 - Business Reorganization',
  '13': 'Chapter 13 - Individual Debt Adjustment',
  '15': 'Chapter 15 - Cross-Border Cases',
  '304': 'Chapter 304 - Ancillary (Replaced by Ch. 15)',
}

/**
 * Case Types (Appendix F)
 */
export const CASE_TYPES: Record<string, string> = {
  'cv': 'Civil',
  'cr': 'Criminal',
  'bk': 'Bankruptcy',
  'ap': 'Adversary Proceeding',
  'misc': 'Miscellaneous',
  'md': 'Multi-District',
  'hc': 'Habeas Corpus',
  'mcrim': 'Misdemeanor Criminal',
  'ncrim': 'Criminal (Felony)',
}

/**
 * Jurisdiction Types
 */
export const JURISDICTION_TYPES: Record<string, string> = {
  'Civil': 'Civil Case',
  'Criminal': 'Criminal Case',
  'Bankruptcy': 'Bankruptcy Case',
  'Appellate': 'Appellate Case',
  'MDL': 'Multi-District Litigation',
}

/**
 * Get nature of suit description
 */
export function getNatureOfSuitDescription(code?: string): string {
  if (!code) return 'N/A'
  return NATURE_OF_SUIT_CODES[code] || `Nature Code: ${code}`
}

/**
 * Get bankruptcy chapter description
 */
export function getBankruptcyChapterDescription(chapter?: string): string {
  if (!chapter) return 'N/A'
  return BANKRUPTCY_CHAPTERS[chapter] || `Chapter ${chapter}`
}

/**
 * Get case type description
 */
export function getCaseTypeDescription(type?: string): string {
  if (!type) return 'N/A'
  return CASE_TYPES[type.toLowerCase()] || type.toUpperCase()
}

/**
 * Get jurisdiction type description
 */
export function getJurisdictionDescription(jurisdiction?: string): string {
  if (!jurisdiction) return 'N/A'
  return JURISDICTION_TYPES[jurisdiction] || jurisdiction
}

/**
 * Format case number for display
 */
export function formatCaseNumber(caseNumber?: string): string {
  if (!caseNumber) return 'N/A'
  
  // Format: o:yy-tp-nnnnn
  // Example: 2:2025cv02287
  const match = caseNumber.match(/^(\d):(\d{4})([a-z]+)(\d+)$/i)
  if (match) {
    const [, office, year, type, number] = match
    return `${office}:${year}-${type.toUpperCase()}-${number.padStart(5, '0')}`
  }
  
  return caseNumber
}

/**
 * Get court location from court ID
 */
export function getCourtLocation(courtId?: string): string {
  if (!courtId) return 'Unknown Court'
  
  // Extract state/district from court ID
  // Format: {state}{district}{type}
  // Example: paedc = Pennsylvania Eastern District Court
  
  const id = courtId.toLowerCase()
  
  if (id.endsWith('dc')) {
    // District court
    const state = id.slice(0, -2)
    return `${state.toUpperCase()} District Court`
  } else if (id.endsWith('bk')) {
    // Bankruptcy court
    const state = id.slice(0, -2)
    return `${state.toUpperCase()} Bankruptcy Court`
  } else if (id.endsWith('ca')) {
    // Circuit court
    const circuit = id.slice(0, -2)
    return `${circuit.toUpperCase()} Circuit Court of Appeals`
  }
  
  return courtId.toUpperCase()
}

/**
 * Determine if case is active/open
 */
export function isCaseOpen(caseDetails: any): boolean {
  return !caseDetails.effectiveDateClosed && 
         !caseDetails.dateDismissed && 
         !caseDetails.dateDischarged
}

/**
 * Get case status badge color
 */
export function getCaseStatusColor(status?: string): {
  bg: string
  text: string
  border: string
} {
  switch (status?.toLowerCase()) {
    case 'open':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200'
      }
    case 'closed':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200'
      }
    case 'dismissed':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      }
    default:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200'
      }
  }
}

