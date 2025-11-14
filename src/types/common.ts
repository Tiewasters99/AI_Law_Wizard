// Common types used across the application

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface Consultation {
  id: number;
  user_issue: string;
  status: "processing" | "completed" | "error";
  created_at: string;
  updated_at: string;
  analysis?: {
    summary: string;
    key_points: string[];
    recommendations: string[];
    legal_areas: string[];
    urgency_level: "low" | "medium" | "high" | "urgent";
    disclaimer: string;
  };
}

export interface TokenPackage {
  id: string;
  name: string;
  description: string;
  tokens: number;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "ATTORNEY" | "CUSTOMER";
  profileComplete: boolean;
}
