"use client";

import { useState, useEffect, useCallback } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, Check, Star, Zap } from "lucide-react";
import {
  getStripe,
  fetchTokenPackages,
  fetchWallet,
  TokenPackage,
  Wallet,
  formatPrice,
  createPaymentIntent,
} from "@/lib/backend/stripeService";
import { PaymentForm } from "@/components/attorney/tokens/PaymentForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getPrimaryColorHex } from "@/lib/frontend/themeUtils";

interface TokenPurchaseProps {
  onSuccess?: (tokens: number) => void;
  showWallet?: boolean;
}

// Static packages fallback (same as client side)
const staticPackages: TokenPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    tokens: 100,
    priceInCents: 999,
    description: "Perfect for getting started with basic legal assistance",
    isActive: true,
  },
  {
    id: "professional",
    name: "Professional Pack",
    tokens: 500,
    priceInCents: 3999,
    description: "Most popular choice for regular legal needs",
    isActive: true,
  },
  {
    id: "business",
    name: "Business Pack",
    tokens: 1000,
    priceInCents: 6999,
    description: "Ideal for businesses with high legal document volume",
    isActive: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    tokens: 2500,
    priceInCents: 14999,
    description: "For large organizations with extensive legal needs",
    isActive: true,
  },
];

export const TokenPurchase = ({
  onSuccess,
  showWallet = true,
}: TokenPurchaseProps) => {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(
    null
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [primaryColorHex, setPrimaryColorHex] = useState("#2563eb");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Get primary color from theme on mount and theme changes
    setPrimaryColorHex(getPrimaryColorHex());

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setPrimaryColorHex(getPrimaryColorHex());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [packagesData, walletData] = await Promise.all([
        fetchTokenPackages("ATTORNEY"), // Explicitly fetch ATTORNEY role packages from unified pricing API
        fetchWallet("ATTORNEY"), // Explicitly fetch ATTORNEY wallet
      ]);
      // Use API packages if available, otherwise use static fallback
      setPackages(packagesData.length > 0 ? packagesData : staticPackages);
      setWallet(walletData);
    } catch (err) {
      // On error, use static packages as fallback
      console.error(
        "Failed to load packages from API, using static fallback:",
        err
      );
      setPackages(staticPackages);
      try {
        const walletData = await fetchWallet("ATTORNEY");
        setWallet(walletData);
      } catch (walletErr) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadData();
    }
  }, [session, loadData]);

  const handlePackageSelect = useCallback(async (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
    setPaymentLoading(true);

    try {
      const { clientSecret } = await createPaymentIntent(pkg.id, "ATTORNEY"); // Explicitly use ATTORNEY role
      setPaymentClientSecret(clientSecret);
      setShowPaymentForm(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initialize payment"
      );
    } finally {
      setPaymentLoading(false);
    }
  }, []);

  const handlePaymentSuccess = useCallback(
    async (tokens: number) => {
      setShowPaymentForm(false);
      setSelectedPackage(null);
      setPaymentClientSecret(null);

      // Refresh wallet data
      try {
        const updatedWallet = await fetchWallet("ATTORNEY");
        setWallet(updatedWallet);
        onSuccess?.(tokens);
      } catch (err) {
        console.error("Failed to refresh wallet:", err);
      }
    },
    [onSuccess]
  );

  const handleCancelPayment = useCallback(() => {
    setShowPaymentForm(false);
    setSelectedPackage(null);
    setPaymentClientSecret(null);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (!session?.user) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Authentication Required
        </h3>
        <p className="text-muted-foreground mb-4">
          Please sign in to purchase tokens
        </p>
        <Button onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-xl h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Error Loading Packages
        </h3>
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={handleRetry}>Try Again</Button>
      </div>
    );
  }

  if (showPaymentForm && selectedPackage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Complete Purchase</h3>
          <Button variant="outline" onClick={handleCancelPayment}>
            Cancel
          </Button>
        </div>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">
                  {selectedPackage.name}
                </h4>
                <p className="text-primary">{selectedPackage.tokens} tokens</p>
                {selectedPackage.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPackage.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {formatPrice(selectedPackage.priceInCents ?? 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedPackage.priceInCents && selectedPackage.tokens
                    ? `${formatPrice(
                        selectedPackage.priceInCents / selectedPackage.tokens
                      )} per token`
                    : ""}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {paymentClientSecret ? (
          <Elements
            stripe={getStripe()}
            options={{
              clientSecret: paymentClientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: primaryColorHex,
                },
              },
            }}
          >
            <PaymentForm
              package={selectedPackage}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancelPayment}
              clientSecret={paymentClientSecret}
            />
          </Elements>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing payment...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showWallet && wallet && (
        <Card className="bg-gradient-to-r from-primary to-chart-2 text-primary-foreground border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-primary-foreground/80 text-sm">
                    Available Tokens
                  </p>
                  <p className="text-2xl font-bold">
                    {wallet.balance ?? wallet.tokens ?? 0}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/80 text-sm">Wallet ID</p>
                <p className="text-xs font-mono text-primary-foreground/70">
                  {wallet.id.slice(-8)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Purchase Tokens
          </h2>
          <p className="text-muted-foreground">
            Choose a token package to continue with AI analysis
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, index) => (
            <Card
              key={pkg.id}
              className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                index === 0
                  ? "border-2 border-primary shadow-lg"
                  : "border border-border"
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              {index === 0 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
                    index === 0 ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <Zap
                    className={`w-8 h-8 ${
                      index === 0 ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-foreground">
                    {formatPrice(pkg.priceInCents ?? 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pkg.priceInCents && pkg.tokens
                      ? `${formatPrice(pkg.priceInCents / pkg.tokens)} per token`
                      : ""}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-chart-1" />
                    <span className="text-sm">
                      {pkg.tokens} AI Analysis Tokens
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-chart-1" />
                    <span className="text-sm">No Expiration</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-chart-1" />
                    <span className="text-sm">Instant Activation</span>
                  </div>
                </div>

                <Button
                  variant={index === 0 ? "default" : "secondary"}
                  className="w-full"
                  onClick={e => {
                    e.stopPropagation();
                    handlePackageSelect(pkg);
                  }}
                  disabled={paymentLoading}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {paymentLoading ? "Loading..." : "Purchase Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
