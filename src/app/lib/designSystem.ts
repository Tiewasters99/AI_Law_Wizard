/**
 * Professional Legal Platform Design System
 * Corporate law firm aesthetic with professional color palette and styling
 */

// Professional Color Palette
export const colors = {
  // Primary - Professional Blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#1e293b',
  },
  // Secondary - Neutral Gray
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Accent - Premium Gold/Amber
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Success - Professional Green
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Error - Conservative Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Background & Text
  background: '#f8fafc',
  text: '#1e293b',
}

// Typography Scale
export const typography = {
  h1: {
    size: '2.5rem',
    lineHeight: '3rem',
    weight: '700',
    letterSpacing: '-0.025em',
  },
  h2: {
    size: '2rem',
    lineHeight: '2.5rem',
    weight: '600',
    letterSpacing: '-0.025em',
  },
  h3: {
    size: '1.5rem',
    lineHeight: '2rem',
    weight: '600',
    letterSpacing: '-0.0125em',
  },
  h4: {
    size: '1.25rem',
    lineHeight: '1.75rem',
    weight: '600',
    letterSpacing: '-0.0125em',
  },
  body: {
    size: '1rem',
    lineHeight: '1.5rem',
    weight: '400',
  },
  small: {
    size: '0.875rem',
    lineHeight: '1.25rem',
    weight: '400',
  },
  tiny: {
    size: '0.75rem',
    lineHeight: '1rem',
    weight: '400',
  },
}

// Spacing System
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
}

// Professional Shadow System
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  base: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
}

// Professional Animation Timings
export const animations = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
}

// Legal Practice Areas
export const practiceAreas = [
  'Corporate Law',
  'Family Law',
  'Criminal Defense',
  'Real Estate Law',
  'Intellectual Property',
  'Employment Law',
  'Estate Planning',
  'Immigration Law',
  'Tax Law',
  'Personal Injury',
  'Bankruptcy',
  'Civil Litigation',
]

// Professional Badge Types
export const badgeTypes = {
  certified: {
    label: 'Board Certified',
    color: colors.success[600],
    bgColor: colors.success[50],
  },
  verified: {
    label: 'Bar Verified',
    color: colors.primary[700],
    bgColor: colors.primary[50],
  },
  premium: {
    label: 'Premium Member',
    color: colors.accent[700],
    bgColor: colors.accent[50],
  },
  featured: {
    label: 'Featured Attorney',
    color: colors.accent[700],
    bgColor: colors.accent[50],
  },
}

// Legal Disclaimers
export const disclaimers = {
  general: 'The information provided through this platform is for general informational purposes only and does not constitute legal advice. Consult with a qualified attorney for advice specific to your situation.',
  attorneyClient: 'Communications through this platform may not be privileged or confidential. An attorney-client relationship is not established until a formal engagement agreement is signed.',
  noRepresentation: 'Use of this platform does not create an attorney-client relationship. For specific legal advice, please consult with a licensed attorney in your jurisdiction.',
  professional: 'All attorneys listed are licensed professionals. Verify credentials with your state bar association.',
}

