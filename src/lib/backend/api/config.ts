// API Configuration for different user tiers

import { APIConfig, UserRole, ProcessingTier } from "@/types/api";

export const API_CONFIGS: Record<ProcessingTier, APIConfig> = {
  demo: {
    maxTokens: 500,
    temperature: 0.3,
    model: "gpt-4o-mini",
    timeout: 10000, // 10 seconds
    features: ["basic_analysis", "simple_qa"],
  },
  basic: {
    maxTokens: 2000,
    temperature: 0.3,
    model: "gpt-4o-mini",
    timeout: 30000, // 30 seconds
    features: ["document_analysis", "qa", "basic_search"],
  },
  premium: {
    maxTokens: 4000,
    temperature: 0.1,
    model: "gpt-4o",
    timeout: 60000, // 60 seconds
    features: [
      "document_analysis",
      "qa",
      "vector_search",
      "file_editing",
      "advanced_analytics",
    ],
  },
  enterprise: {
    maxTokens: 8000,
    temperature: 0.1,
    model: "gpt-4o",
    timeout: 120000, // 2 minutes
    features: [
      "document_analysis",
      "qa",
      "vector_search",
      "file_editing",
      "advanced_analytics",
      "batch_processing",
      "custom_models",
    ],
  },
};

export function getUserTier(
  role: UserRole,
  isAuthenticated: boolean
): ProcessingTier {
  if (!isAuthenticated) return "demo";

  switch (role) {
    case "ATTORNEY":
    case "ADMIN":
      return "premium";
    case "CLIENT":
      return "basic";
    default:
      return "demo";
  }
}

export function getAPIConfig(
  role: UserRole,
  isAuthenticated: boolean
): APIConfig {
  const tier = getUserTier(role, isAuthenticated);
  return API_CONFIGS[tier];
}

export function isFeatureEnabled(
  feature: string,
  role: UserRole,
  isAuthenticated: boolean
): boolean {
  const config = getAPIConfig(role, isAuthenticated);
  return config.features.includes(feature);
}

// Rate limiting configuration
export const RATE_LIMITS = {
  demo: { requests: 5, window: 3600 }, // 5 requests per hour
  basic: { requests: 50, window: 3600 }, // 50 requests per hour
  premium: { requests: 200, window: 3600 }, // 200 requests per hour
  enterprise: { requests: 1000, window: 3600 }, // 1000 requests per hour
};
