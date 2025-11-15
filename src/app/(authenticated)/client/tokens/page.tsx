"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import {
  Zap,
  Crown,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Plus,
  Minus,
  DollarSign,
  Star,
  Shield,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getStripe,
  fetchTokenPackages,
  createPaymentIntent,
  TokenPackage as StripeTokenPackage,
  formatPrice,
  UserRole,
} from "@/lib/backend/stripeService";
import { PaymentForm } from "@/components/attorney/tokens/PaymentForm";
import { getPrimaryColorHex } from "@/lib/frontend/themeUtils";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  features: string[];
  description: string;
}

interface TokenTransaction {
  id: string;
  type: "purchase" | "usage" | "grant" | "refund";
  amount: number;
  description: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  feature?: string;
  packageName?: string;
}

interface UsageStats {
  totalUsed: number;
  totalPurchased: number;
  currentBalance: number;
  usageByFeature: {
    feature: string;
    tokens: number;
    percentage: number;
    count?: number;
  }[];
  dailyUsage: {
    date: string;
    tokens: number;
  }[];
}

export default function TokensPage() {
  const { data: session } = useSession();
  const { balance, refetch: refetchBalance } = useTokenBalance();
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] =
    useState<StripeTokenPackage | null>(null);
  const [activeTab, setActiveTab] = useState("packages");
  const [stripePackages, setStripePackages] = useState<StripeTokenPackage[]>(
    []
  );
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(
    null
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [primaryColorHex, setPrimaryColorHex] = useState("#2563eb");
  const [featurePricing, setFeaturePricing] = useState<any[]>([]);

  // Load real token packages from API
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const packages = await fetchTokenPackages("CUSTOMER" as UserRole);
        setStripePackages(packages);
      } catch (error) {
        console.error("Failed to load token packages:", error);
        setError("Failed to load token packages");
      }
    };
    if (session?.user) {
      loadPackages();
    }
  }, [session?.user]);

  // Load feature pricing from API
  useEffect(() => {
    const loadFeaturePricing = async () => {
      try {
        const response = await fetch(
          "/api/pricing/feature-pricing?role=CUSTOMER"
        );
        if (response.ok) {
          const data = await response.json();
          const pricing = Array.isArray(data.pricing) ? data.pricing : [];
          setFeaturePricing(pricing);
        }
      } catch (error) {
        console.error("Failed to load feature pricing:", error);
        // Don't show error, just use fallback
      }
    };
    loadFeaturePricing();
  }, []);

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

  // Convert Stripe packages to display format
  const tokenPackages: TokenPackage[] =
    stripePackages.length > 0
      ? stripePackages.map((pkg, index) => ({
          id: pkg.id,
          name: pkg.name,
          tokens: pkg.tokens,
          price: (pkg.priceInCents ?? 0) / 100,
          popular: index === 1, // Mark second package as popular
          features: [
            `${pkg.tokens} tokens`,
            "All legal chat access",
            "Document analysis",
            "Legal research",
          ],
          description:
            pkg.description || `${pkg.tokens} tokens for legal services`,
        }))
      : [
          {
            id: "starter",
            name: "Starter Pack",
            tokens: 100,
            price: 9.99,
            features: [
              "100 tokens",
              "Basic legal chat access",
              "Document upload (5 tokens each)",
              "Email support",
            ],
            description:
              "Perfect for getting started with basic legal assistance",
          },
          {
            id: "professional",
            name: "Professional Pack",
            tokens: 500,
            price: 39.99,
            originalPrice: 49.99,
            discount: 20,
            popular: true,
            features: [
              "500 tokens",
              "All chat tiers access",
              "Document analysis (5 tokens each)",
              "Legal Chat access",
              "Priority support",
              "Advanced features",
            ],
            description: "Most popular choice for regular legal needs",
          },
          {
            id: "business",
            name: "Business Pack",
            tokens: 1000,
            price: 69.99,
            originalPrice: 99.99,
            discount: 30,
            features: [
              "1000 tokens",
              "All features included",
              "Grand Wizard access",
              "Bulk document processing",
              "API access",
              "Dedicated support",
              "Custom integrations",
            ],
            description: "Ideal for businesses with high legal document volume",
          },
          {
            id: "enterprise",
            name: "Enterprise Pack",
            tokens: 2500,
            price: 149.99,
            originalPrice: 249.99,
            discount: 40,
            features: [
              "2500 tokens",
              "Unlimited access to all features",
              "White-label options",
              "Custom AI training",
              "24/7 phone support",
              "SLA guarantee",
              "On-premise deployment",
            ],
            description: "For large organizations with extensive legal needs",
          },
        ];

  // Get feature costs from database, with fallback to defaults
  const getFeatureCost = (featureName: string): number => {
    const pricing = featurePricing.find(
      fp =>
        (fp.feature === featureName.toLowerCase() ||
          fp.displayName.toLowerCase() === featureName.toLowerCase()) &&
        (fp.role === "CUSTOMER" || fp.role === null) &&
        fp.isActive
    );
    return pricing ? pricing.tokens : 0;
  };

  // Map feature pricing to display format
  const features = useMemo(() => {
    const featureMap = new Map<
      string,
      { name: string; cost: number; description: string }
    >();

    // Add features from database
    featurePricing
      .filter(fp => fp.role === "CUSTOMER" || fp.role === null)
      .forEach(fp => {
        const key = fp.feature;
        if (!featureMap.has(key)) {
          featureMap.set(key, {
            name: fp.displayName,
            cost: fp.tokens,
            description: fp.description || `${fp.displayName} feature`,
          });
        }
      });

    // Fallback defaults if no pricing found
    if (featureMap.size === 0) {
      return [
        {
          name: "Legal Chat",
          cost: 2,
          description: "Basic AI legal assistance",
        },
        {
          name: "Document Analysis",
          cost: 5,
          description: "AI-powered document queries",
        },
        {
          name: "Grand Wizard",
          cost: 5,
          description: "Ultimate AI with master-level insights",
        },
        {
          name: "File Upload",
          cost: 0,
          description: "Upload documents (free)",
        },
        {
          name: "Consultation Request",
          cost: 0,
          description: "Send consultation requests (free)",
        },
      ];
    }

    return Array.from(featureMap.values());
  }, [featurePricing]);

  const fetchTokenData = useCallback(async () => {
    try {
      // Fetch transactions
      const transactionsResponse = await fetch(
        "/api/client/tokens/transactions"
      );
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        const formattedTransactions: TokenTransaction[] =
          transactionsData.transactions.map((t: any) => ({
            id: t.id,
            type:
              t.type === "PURCHASE"
                ? "purchase"
                : t.type === "CONSUMPTION"
                  ? "usage"
                  : t.type === "REFUND"
                    ? "refund"
                    : "grant",
            amount: t.amount,
            description: t.description || "Transaction",
            timestamp: new Date(t.createdAt),
            status: "completed",
            feature: t.feature || undefined,
            packageName: t.metadata?.packageName,
          }));
        setTransactions(formattedTransactions);
      }

      // Fetch usage statistics
      const usageResponse = await fetch("/api/client/tokens/usage");
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsageStats({
          totalUsed: usageData.totalUsed || 0,
          totalPurchased: usageData.totalPurchased || 0,
          currentBalance: balance,
          usageByFeature: usageData.breakdown || [],
          dailyUsage: [],
        });
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
      setError("Failed to load token data");
    } finally {
      setIsLoading(false);
    }
  }, [balance]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTokenData();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id, fetchTokenData]);

  const handlePurchasePackage = useCallback(
    async (pkg: TokenPackage) => {
      // Find the corresponding Stripe package
      const stripePkg = stripePackages.find(sp => sp.id === pkg.id);
      if (!stripePkg) {
        setError("Package not found");
        return;
      }

      setSelectedPackage(stripePkg);
      setPaymentLoading(true);
      setError(null);

      try {
        // Create payment intent with CUSTOMER role
        const { clientSecret } = await createPaymentIntent(
          stripePkg.id,
          "CUSTOMER" as UserRole
        );
        setPaymentClientSecret(clientSecret);
        setShowPaymentForm(true);
      } catch (error) {
        console.error("Error initializing payment:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize payment. Please try again."
        );
        setTimeout(() => setError(null), 5000);
      } finally {
        setPaymentLoading(false);
      }
    },
    [stripePackages]
  );

  const handlePaymentSuccess = useCallback(
    async (tokens: number) => {
      setShowPaymentForm(false);
      setSelectedPackage(null);
      setPaymentClientSecret(null);

      // Refetch balance and transactions
      await refetchBalance();
      await fetchTokenData();

      setSuccess(`Successfully purchased ${tokens} tokens!`);
      setTimeout(() => setSuccess(null), 5000);
    },
    [refetchBalance, fetchTokenData]
  );

  const handleCancelPayment = useCallback(() => {
    setShowPaymentForm(false);
    setSelectedPackage(null);
    setPaymentClientSecret(null);
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case "usage":
        return <Zap className="w-4 h-4 text-blue-600" />;
      case "grant":
        return <Gift className="w-4 h-4 text-purple-600" />;
      case "refund":
        return <RefreshCw className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "text-green-600";
      case "usage":
        return "text-blue-600";
      case "grant":
        return "text-purple-600";
      case "refund":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, []);

  // Memoize computed values
  const totalTokens = useMemo(() => {
    if (!usageStats) return 0;
    return usageStats.totalPurchased;
  }, [usageStats]);

  const totalUsed = useMemo(() => {
    if (!usageStats) return 0;
    return usageStats.totalUsed;
  }, [usageStats]);

  const availableTokens = useMemo(() => {
    return balance;
  }, [balance]);

  const groupedTransactions = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const feature = tx.feature || "Other";
        if (!acc[feature]) {
          acc[feature] = [];
        }
        acc[feature].push(tx);
        return acc;
      },
      {} as Record<string, TokenTransaction[]>
    );
  }, [transactions]);

  const formattedTransactions = useMemo(() => {
    return transactions.map(tx => ({
      ...tx,
      formattedDate: formatDate(tx.timestamp),
    }));
  }, [transactions, formatDate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading token information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Token Management
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                Manage your AI credits and purchase additional tokens
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {availableTokens.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Credits Available
              </div>
            </div>
          </div>

          {/* Token Usage Bar */}
          {usageStats && totalTokens > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Usage Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  {totalUsed} / {totalTokens} used
                </span>
              </div>
              <Progress
                value={(totalUsed / totalTokens) * 100}
                className="h-3"
              />
            </div>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm sm:text-base text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm sm:text-base">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 sm:space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger
              value="packages"
              className="text-xs sm:text-sm py-2 sm:py-2.5"
            >
              Buy Tokens
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              className="text-xs sm:text-sm py-2 sm:py-2.5"
            >
              Usage Stats
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="text-xs sm:text-sm py-2 sm:py-2.5"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="text-xs sm:text-sm py-2 sm:py-2.5"
            >
              Feature Costs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-4 sm:space-y-6">
            {/* Payment Form */}
            {showPaymentForm && selectedPackage && paymentClientSecret && (
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
                        <p className="text-primary">
                          {selectedPackage.tokens} tokens
                        </p>
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
                          {formatPrice(
                            (selectedPackage.priceInCents ?? 0) /
                              selectedPackage.tokens
                          )}{" "}
                          per token
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
              </div>
            )}

            {/* Token Packages */}
            {!showPaymentForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {tokenPackages.map(pkg => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative ${pkg.popular ? "lg:scale-105" : ""}`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <Card
                      className={`h-full ${
                        pkg.popular ? "ring-2 ring-purple-500 shadow-lg" : ""
                      }`}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className="flex items-center justify-center mb-2">
                          <Crown className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                        <div className="space-y-1">
                          <div className="text-3xl font-bold text-primary">
                            {pkg.tokens.toLocaleString()} tokens
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                              ${pkg.price}
                            </span>
                            {pkg.originalPrice && (
                              <span className="text-lg text-gray-500 line-through">
                                ${pkg.originalPrice}
                              </span>
                            )}
                          </div>
                          {pkg.discount && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {pkg.discount}% OFF
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 text-center">
                          {pkg.description}
                        </p>

                        <div className="space-y-2">
                          {pkg.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-600">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => handlePurchasePackage(pkg)}
                          disabled={paymentLoading}
                          variant={pkg.popular ? "default" : "outline"}
                        >
                          {paymentLoading && selectedPackage?.id === pkg.id ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Purchase Now
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Payment Security */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Secure payment processing by Stripe</span>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="hidden sm:block h-4"
                  />
                  <span className="hidden sm:inline">SSL encrypted</span>
                  <Separator
                    orientation="vertical"
                    className="hidden sm:block h-4"
                  />
                  <span className="hidden sm:inline">
                    30-day money-back guarantee
                  </span>
                  <div className="sm:hidden text-center">
                    <div>SSL encrypted</div>
                    <div>30-day money-back guarantee</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4 sm:space-y-6">
            {usageStats && (
              <>
                {/* Usage Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {usageStats.totalUsed}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tokens Used
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {usageStats.totalPurchased}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tokens Purchased
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Crown className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {usageStats.currentBalance}
                          </div>
                          <div className="text-sm text-gray-500">
                            Current Balance
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Usage by Feature */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage by Feature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usageStats.usageByFeature.length > 0 ? (
                      <div className="space-y-4">
                        {usageStats.usageByFeature.map((item, index) => {
                          const featureName =
                            item.feature === "document-assistant"
                              ? "Document Assistant"
                              : item.feature === "wizard"
                                ? "Legal Chat"
                                : item.feature === "grand-wizard"
                                  ? "Grand Wizard"
                                  : item.feature === "consultation-request"
                                    ? "Consultation Requests"
                                    : item.feature;
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-foreground">
                                    {featureName}
                                  </span>
                                  {item.count !== undefined && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ({item.count}{" "}
                                      {item.count === 1 ? "use" : "uses"})
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {item.tokens} credits (
                                  {item.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <Progress
                                value={item.percentage}
                                className="h-2"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No usage data available yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formattedTransactions.map(transaction => {
                    const featureName =
                      transaction.feature === "document-assistant"
                        ? "Document Assistant"
                        : transaction.feature === "wizard"
                          ? "Legal Chat"
                          : transaction.feature === "grand-wizard"
                            ? "Grand Wizard"
                            : transaction.feature === "consultation-request"
                              ? "Consultation Request"
                              : transaction.feature;
                    return (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg gap-3 sm:gap-0"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          {getTransactionIcon(transaction.type)}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground text-sm sm:text-base truncate">
                              {transaction.description}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {transaction.formattedDate}
                              </div>
                              {transaction.feature && (
                                <Badge variant="secondary" className="text-xs">
                                  {featureName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-0 sm:flex-col sm:items-end">
                          <div
                            className={`font-semibold text-sm sm:text-base ${
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {Math.abs(transaction.amount)} credits
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs sm:text-sm"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}

                  {transactions.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No transactions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Token Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {feature.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {feature.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          {feature.cost === 0
                            ? "Free"
                            : `${feature.cost} token${
                                feature.cost !== 1 ? "s" : ""
                              }`}
                        </div>
                        {feature.cost > 0 && (
                          <div className="text-xs text-gray-500">per use</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
