export interface Admin {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenStats {
  balance: number;
  totalPurchased: number;
  totalConsumed: number;
  purchaseCount: number;
  lastPurchaseDate: Date | null;
}

export interface TokenTransaction {
  id: string;
  type: "PURCHASE" | "CONSUMPTION" | "REFUND" | "ADMIN_ADJUSTMENT";
  amount: number;
  description: string;
  reference: string | null;
  createdAt: Date;
}

export interface UserTokenSummary {
  userId: string;
  userName: string;
  userRole: "ATTORNEY" | "CUSTOMER";
  tokensConsumed: number;
  percentageOfTotal: number;
}

export interface TrendData {
  date: string;
  consumed: number;
  purchased: number;
}

export interface Feature {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  route: string;
  category: FeatureCategory;
  isGlobal: boolean;
  isEnabled: boolean;
  roleSpecific: FeatureRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureRole {
  id: string;
  featureId: string;
  role: "ATTORNEY" | "CUSTOMER";
  isEnabled: boolean;
}

export type FeatureCategory =
  | "DOCUMENT_PROCESSING"
  | "LEGAL_RESEARCH"
  | "DOCKET_GENIE"
  | "INTEGRATIONS"
  | "COMMUNICATION"
  | "ANALYTICS"
  | "CLIENT_MANAGEMENT"
  | "RESOURCES";

export interface RolePricing {
  id: string;
  role: "ATTORNEY" | "CUSTOMER";
  packageId: string;
  priceInCents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminActivityLog {
  id: string;
  adminId: string;
  action: AdminAction;
  targetType: string | null;
  targetId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export type AdminAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_PASSWORD_RESET"
  | "FEATURE_TOGGLED"
  | "FEATURE_CREATED"
  | "PRICING_UPDATED"
  | "PACKAGE_CREATED"
  | "PACKAGE_UPDATED"
  | "PACKAGE_DELETED"
  | "TOKEN_ADJUSTMENT"
  | "ROLE_PRICING_CREATED"
  | "ROLE_PRICING_UPDATED"
  | "FEATURE_PRICING_CREATED"
  | "FEATURE_PRICING_UPDATED"
  | "FEATURE_PRICING_DELETED";

export interface DashboardStats {
  users: {
    total: number;
    customers: number;
    attorneys: number;
    change: number;
  };
  features: {
    enabled: number;
    total: number;
    change: number;
  };
  tokens: {
    total: number;
    average: number;
    change: number;
  };
  revenue: {
    amount: number;
    count: number;
    change: number;
  };
}
