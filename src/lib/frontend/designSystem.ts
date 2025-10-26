/**
 * Professional Legal Platform Design System
 * Corporate law firm aesthetic with professional color palette and styling
 */

// Professional Color Palette
export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1e40af",
    800: "#1e3a8a",
    900: "#1e293b",
  },
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  accent: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  background: "#f8fafc",
  text: "#1e293b",
};

// Typography Scale
export const typography = {
  h1: { size: "2.5rem", lineHeight: "3rem", weight: "700" },
  h2: { size: "2rem", lineHeight: "2.5rem", weight: "600" },
  h3: { size: "1.5rem", lineHeight: "2rem", weight: "600" },
  h4: { size: "1.25rem", lineHeight: "1.75rem", weight: "600" },
  body: { size: "1rem", lineHeight: "1.5rem", weight: "400" },
  small: { size: "0.875rem", lineHeight: "1.25rem", weight: "400" },
};

// Spacing System (4px grid)
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
};

// Animation Presets
export const animations = {
  fadeIn: "opacity 0.2s ease-in-out",
  slideIn: "transform 0.2s ease-out",
  scaleIn: "transform 0.2s ease-out",
  shimmer: "2s linear infinite",
};

// Legal Practice Areas
export const practiceAreas = [
  "Corporate Law",
  "Family Law",
  "Criminal Defense",
  "Real Estate Law",
  "Intellectual Property",
  "Employment Law",
  "Estate Planning",
  "Immigration Law",
  "Tax Law",
  "Personal Injury",
  "Bankruptcy",
  "Civil Litigation",
];

// Case Types
export const caseTypes = [
  "Consultation",
  "Document Review",
  "Contract Drafting",
  "Litigation",
  "Mediation",
  "Arbitration",
];

// Urgency Levels
export const urgencyLevels = {
  LOW: { label: "Low", color: colors.success[600] },
  MEDIUM: { label: "Medium", color: colors.accent[600] },
  HIGH: { label: "High", color: colors.error[600] },
};
