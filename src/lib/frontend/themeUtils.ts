/**
 * Utility functions for working with theme CSS variables
 */

/**
 * Converts OKLCH color string to RGB hex string
 * Useful for third-party integrations like Stripe that require hex colors
 */
export function oklchToHex(oklchString: string): string {
  // Extract values from oklch(L C H) format
  const match = oklchString.match(/oklch\(([^)]+)\)/);
  if (!match) {
    // Fallback if not OKLCH format
    return "#2563eb"; // Default blue
  }

  const values = match[1].trim().split(/\s+/).map(parseFloat);
  if (values.length < 3) {
    return "#2563eb";
  }

  const [L, C, H] = values;

  // Convert OKLCH to RGB (simplified conversion)
  // This is a basic approximation - for production, consider using a proper color library
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  // Convert to linear RGB
  let r = L + 0.3963377774 * a + 0.2158037573 * b;
  let g = L - 0.1055613458 * a - 0.0638541728 * b;
  let bl = L - 0.0894841775 * a - 1.291485548 * b;

  // Apply gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055 : 12.92 * g;
  bl = bl > 0.0031308 ? 1.055 * Math.pow(bl, 1.0 / 2.4) - 0.055 : 12.92 * bl;

  // Clamp and convert to hex
  const toHex = (val: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(val * 255)));
    return clamped.toString(16).padStart(2, "0");
  };

  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

/**
 * Gets a CSS variable value from the root element
 */
export function getCSSVariable(variableName: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

/**
 * Gets the primary color as a hex string for third-party integrations
 */
export function getPrimaryColorHex(): string {
  if (typeof window === "undefined") {
    return "#2563eb"; // Fallback
  }
  const primaryValue = getCSSVariable("--primary");
  if (!primaryValue) {
    return "#2563eb"; // Fallback
  }
  return oklchToHex(primaryValue);
}
