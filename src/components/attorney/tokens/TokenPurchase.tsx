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

interface TokenPurchaseProps {
  onSuccess?: (tokens: number) => void;
  showWallet?: boolean;
}

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
  const { data: session } = useSession();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [packagesData, walletData] = await Promise.all([
        fetchTokenPackages(),
        fetchWallet(),
      ]);
      setPackages(packagesData);
      setWallet(walletData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
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
      const { clientSecret } = await createPaymentIntent(pkg.id);
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
        const updatedWallet = await fetchWallet();
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
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Authentication Required
        </h3>
        <p className="text-gray-600 mb-4">Please sign in to purchase tokens</p>
        <Button onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Error Loading Packages
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
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

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">
                  {selectedPackage.name}
                </h4>
                <p className="text-blue-700">{selectedPackage.tokens} tokens</p>
                {selectedPackage.description && (
                  <p className="text-sm text-blue-600 mt-1">
                    {selectedPackage.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {formatPrice(selectedPackage.priceInCents)}
                </div>
                <div className="text-sm text-blue-600">
                  {formatPrice(
                    selectedPackage.priceInCents / selectedPackage.tokens
                  )}{" "}
                  per token
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
                  colorPrimary: "#2563eb",
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing payment...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showWallet && wallet && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Available Tokens</p>
                  <p className="text-2xl font-bold">{wallet.tokens}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Wallet ID</p>
                <p className="text-xs font-mono text-blue-200">
                  {wallet.id.slice(-8)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Purchase Tokens
          </h2>
          <p className="text-gray-600">
            Choose a token package to continue with AI analysis
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, index) => (
            <Card
              key={pkg.id}
              className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                index === 0
                  ? "border-2 border-blue-500 shadow-lg"
                  : "border border-gray-200"
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              {index === 0 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
                    index === 0 ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Zap
                    className={`w-8 h-8 ${
                      index === 0 ? "text-blue-600" : "text-gray-600"
                    }`}
                  />
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(pkg.priceInCents)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPrice(pkg.priceInCents / pkg.tokens)} per token
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      {pkg.tokens} AI Analysis Tokens
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">No Expiration</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Instant Activation</span>
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    index === 0
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
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
