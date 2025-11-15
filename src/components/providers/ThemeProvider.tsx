"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeName,
  getThemeConfig,
  applyTheme,
  getCurrentTheme,
} from "@/lib/theme-config";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "tweakcn",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}) {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    const currentTheme = getCurrentTheme() || defaultTheme;
    setThemeState(currentTheme);
    applyTheme(currentTheme);
  }, [defaultTheme]);

  // Apply theme when it changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
      // Store in localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", theme);
      }
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    availableThemes: ["tweakcn", "default", "custom"] as ThemeName[],
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
