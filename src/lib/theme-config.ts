/**
 * Theme Configuration System
 *
 * This file manages theme definitions and provides utilities for theme switching.
 * All themes are defined here, making it easy to switch designs in the future.
 */

export type ThemeName = "tweakcn" | "default" | "custom";

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  dark: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  typography: {
    fontSans: string;
    fontSerif: string;
    fontMono: string;
    letterSpacing: string;
  };
  spacing: {
    radius: string;
    spacing: string;
  };
}

/**
 * Tweakcn Theme Configuration
 * This is the active theme from tweakcn.com
 */
const tweakcnTheme: ThemeConfig = {
  name: "tweakcn",
  displayName: "Tweakcn Theme",
  colors: {
    background: "oklch(0.9940 0 0)",
    foreground: "oklch(0 0 0)",
    primary: "oklch(0.5890 0.2267 310.2668)",
    primaryForeground: "oklch(1.0000 0 0)",
    secondary: "oklch(0.9113 0.0109 280.4626)",
    secondaryForeground: "oklch(0.1344 0 0)",
    muted: "oklch(0.9702 0 0)",
    mutedForeground: "oklch(0.4386 0 0)",
    accent: "oklch(0.8763 0.0508 286.5404)",
    accentForeground: "oklch(0.4416 0.1844 273.4193)",
    destructive: "oklch(0.6580 0.1116 44.0316)",
    destructiveForeground: "oklch(1.0000 0 0)",
    border: "oklch(0.8953 0.0110 297.6062)",
    input: "oklch(0.9401 0 0)",
    ring: "oklch(0 0 0)",
  },
  dark: {
    background: "oklch(0.2147 0.0058 285.8986)",
    foreground: "oklch(0.9551 0 0)",
    primary: "oklch(0.6518 0.1925 311.1274)",
    primaryForeground: "oklch(1.0000 0 0)",
    secondary: "oklch(0.2844 0.0109 293.3411)",
    secondaryForeground: "oklch(0.9551 0 0)",
    muted: "oklch(0.2844 0.0109 293.3411)",
    mutedForeground: "oklch(0.7058 0 0)",
    accent: "oklch(0.2597 0.0337 281.3162)",
    accentForeground: "oklch(0.6803 0.1294 272.1695)",
    destructive: "oklch(0.7469 0.0971 47.3494)",
    destructiveForeground: "oklch(1.0000 0 0)",
    border: "oklch(0.3161 0.0089 295.0586)",
    input: "oklch(0.3161 0.0089 295.0586)",
    ring: "oklch(0.6518 0.1925 311.1274)",
  },
  typography: {
    fontSans: "Alatsi, ui-sans-serif, sans-serif, system-ui",
    fontSerif: "Abyssinica SIL, ui-serif, serif",
    fontMono: "IBM Plex Mono, monospace",
    letterSpacing: "0.025em",
  },
  spacing: {
    radius: "1.4rem",
    spacing: "0.27rem",
  },
};

/**
 * Default Shadcn Theme Configuration
 * Standard shadcn/ui theme (HSL format)
 */
const defaultTheme: ThemeConfig = {
  name: "default",
  displayName: "Default Shadcn",
  colors: {
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    primary: "222.2 47.4% 11.2%",
    primaryForeground: "210 40% 98%",
    secondary: "210 40% 96%",
    secondaryForeground: "222.2 84% 4.9%",
    muted: "210 40% 96%",
    mutedForeground: "215.4 16.3% 46.9%",
    accent: "210 40% 96%",
    accentForeground: "222.2 84% 4.9%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "210 40% 98%",
    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    ring: "222.2 84% 4.9%",
  },
  dark: {
    background: "222.2 84% 4.9%",
    foreground: "210 40% 98%",
    primary: "210 40% 98%",
    primaryForeground: "222.2 47.4% 11.2%",
    secondary: "217.2 32.6% 17.5%",
    secondaryForeground: "210 40% 98%",
    muted: "217.2 32.6% 17.5%",
    mutedForeground: "215 20.2% 65.1%",
    accent: "217.2 32.6% 17.5%",
    accentForeground: "210 40% 98%",
    destructive: "0 62.8% 30.6%",
    destructiveForeground: "210 40% 98%",
    border: "217.2 32.6% 17.5%",
    input: "217.2 32.6% 17.5%",
    ring: "212.7 26.8% 83.9%",
  },
  typography: {
    fontSans: "Inter, ui-sans-serif, sans-serif, system-ui",
    fontSerif: "ui-serif, serif",
    fontMono: "ui-monospace, monospace",
    letterSpacing: "0em",
  },
  spacing: {
    radius: "0.5rem",
    spacing: "0rem",
  },
};

/**
 * Theme Registry
 * Add new themes here
 */
const themes: Record<ThemeName, ThemeConfig> = {
  tweakcn: tweakcnTheme,
  default: defaultTheme,
  custom: tweakcnTheme, // Custom theme placeholder - currently uses tweakcn
};

/**
 * Get theme configuration by name
 */
export function getThemeConfig(themeName: ThemeName = "tweakcn"): ThemeConfig {
  return themes[themeName] || themes.tweakcn;
}

/**
 * Get all available themes
 */
export function getAvailableThemes(): ThemeConfig[] {
  return Object.values(themes);
}

/**
 * Apply theme CSS variables to the document
 * This function updates CSS variables based on the selected theme
 */
export function applyTheme(themeName: ThemeName = "tweakcn"): void {
  if (typeof document === "undefined") return;

  const theme = getThemeConfig(themeName);
  const root = document.documentElement;

  // Apply light theme colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });

  // Apply typography
  root.style.setProperty("--font-sans", theme.typography.fontSans);
  root.style.setProperty("--font-serif", theme.typography.fontSerif);
  root.style.setProperty("--font-mono", theme.typography.fontMono);
  root.style.setProperty("--letter-spacing", theme.typography.letterSpacing);
  root.style.setProperty("--tracking-normal", theme.typography.letterSpacing);

  // Apply spacing
  root.style.setProperty("--radius", theme.spacing.radius);
  root.style.setProperty("--spacing", theme.spacing.spacing);

  // Store theme name in data attribute for CSS selectors
  root.setAttribute("data-theme", themeName);
}

/**
 * Get current theme from document (if applied)
 */
export function getCurrentTheme(): ThemeName {
  if (typeof document === "undefined") return "tweakcn";
  return (
    (document.documentElement.getAttribute("data-theme") as ThemeName) ||
    "tweakcn"
  );
}

/**
 * Check if theme is available
 */
export function isThemeAvailable(themeName: string): themeName is ThemeName {
  return themeName in themes;
}
