import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise: Promise<any>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export interface RolePricing {
  id: string;
  role: "ATTORNEY" | "CUSTOMER";
  priceInCents: number;
  isActive: boolean;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  description?: string;
  isActive: boolean;
  RolePricing?: RolePricing[];
  // For backward compatibility and convenience, include priceInCents based on role
  priceInCents?: number;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // Token balance (matching Prisma schema)
  tokens?: number; // Legacy field for backward compatibility
  createdAt: string;
  updatedAt: string;
  transactions: TokenTransaction[];
}

export interface TokenTransaction {
  id: string;
  walletId: string;
  type: "PURCHASE" | "CONSUMPTION" | "REFUND" | "ADMIN_ADJUSTMENT";
  amount: number;
  description?: string;
  reference?: string;
  createdAt: string;
}

export const formatPrice = (priceInCents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
};

export type UserRole = "ATTORNEY" | "CUSTOMER";

/**
 * Create payment intent for token package purchase
 * @param packageId - The token package ID
 * @param role - User role (ATTORNEY or CUSTOMER), defaults to ATTORNEY for backward compatibility
 */
export const createPaymentIntent = async (
  packageId: string,
  role: UserRole = "ATTORNEY"
) => {
  const endpoint =
    role === "CUSTOMER"
      ? "/api/client/stripe/create-payment-intent"
      : "/api/attorney/stripe/create-payment-intent";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ packageId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create payment intent");
  }

  return response.json();
};

/**
 * Fetch token packages for a specific role
 * @param role - User role (ATTORNEY or CUSTOMER), defaults to ATTORNEY for backward compatibility
 */
export const fetchTokenPackages = async (
  role: UserRole = "ATTORNEY"
): Promise<TokenPackage[]> => {
  // Use shared pricing endpoint that supports role filtering
  const response = await fetch(
    `/api/pricing/packages${role ? `?role=${role}` : ""}`
  );

  if (!response.ok) {
    // Fallback to attorney endpoint for backward compatibility
    if (role === "ATTORNEY") {
      const fallbackResponse = await fetch("/api/attorney/token-packages");
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return data.packages || [];
      }
    }
    throw new Error("Failed to fetch token packages");
  }

  const data = await response.json();
  const packages = data.packages || [];
  
  // Map packages to include priceInCents based on role
  return packages.map((pkg: any) => {
    const rolePricing = pkg.RolePricing?.find(
      (rp: RolePricing) => rp.role === role && rp.isActive
    );
    return {
      ...pkg,
      priceInCents: rolePricing?.priceInCents || 0,
    };
  });
};

/**
 * Fetch wallet for a specific role
 * @param role - User role (ATTORNEY or CUSTOMER), defaults to ATTORNEY for backward compatibility
 */
export const fetchWallet = async (
  role: UserRole = "ATTORNEY"
): Promise<Wallet> => {
  const endpoint =
    role === "CUSTOMER"
      ? "/api/client/tokens/balance"
      : "/api/attorney/wallet";

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("Failed to fetch wallet");
  }

  const data = await response.json();
  // Normalize response format
  if (data.wallet) {
    return data.wallet;
  }
  if (data.balance !== undefined) {
    // Client balance endpoint returns different format
    return {
      id: "",
      userId: "",
      balance: data.balance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      transactions: [],
    };
  }
  throw new Error("Invalid wallet response format");
};

/**
 * Consume tokens for a specific role
 * @param amount - Amount of tokens to consume
 * @param description - Optional description
 * @param role - User role (ATTORNEY or CUSTOMER), defaults to ATTORNEY for backward compatibility
 */
export const consumeTokens = async (
  amount: number,
  description?: string,
  role: UserRole = "ATTORNEY"
) => {
  const endpoint =
    role === "CUSTOMER"
      ? "/api/client/tokens/consume"
      : "/api/attorney/wallet";

  const body =
    role === "CUSTOMER"
      ? { amount, description }
      : {
          action: "consume",
          amount,
          description,
        };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to consume tokens");
  }

  return response.json();
};
