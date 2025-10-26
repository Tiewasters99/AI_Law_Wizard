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

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceInCents: number;
  description?: string;
  isActive: boolean;
}

export interface Wallet {
  id: string;
  userId: string;
  tokens: number;
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

export const createPaymentIntent = async (packageId: string) => {
  const response = await fetch("/api/attorney/stripe/create-payment-intent", {
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

export const fetchTokenPackages = async (): Promise<TokenPackage[]> => {
  const response = await fetch("/api/attorney/token-packages");

  if (!response.ok) {
    throw new Error("Failed to fetch token packages");
  }

  const data = await response.json();
  return data.packages;
};

export const fetchWallet = async (): Promise<Wallet> => {
  const response = await fetch("/api/attorney/wallet");

  if (!response.ok) {
    throw new Error("Failed to fetch wallet");
  }

  const data = await response.json();
  return data.wallet;
};

export const consumeTokens = async (amount: number, description?: string) => {
  const response = await fetch("/api/attorney/wallet", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "consume",
      amount,
      description,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to consume tokens");
  }

  return response.json();
};
