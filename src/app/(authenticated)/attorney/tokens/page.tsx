"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { fetchWallet, Wallet } from "@/lib/backend/stripeService";
import { TokenPurchase } from "@/components/attorney/tokens/TokenPurchase";
import {
  Zap,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Gift,
  Shield,
  FileText,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

export default function TokensPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("packages");
  const [featurePricing, setFeaturePricing] = useState<any[]>([]);

  // Load feature pricing from API
  useEffect(() => {
    const loadFeaturePricing = async () => {
      try {
        const response = await fetch(
          "/api/pricing/feature-pricing?role=ATTORNEY"
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

  // Map feature pricing to display format
  const features = useMemo(() => {
    const featureMap = new Map<
      string,
      { name: string; cost: number; description: string }
    >();

    // Add features from database
    featurePricing
      .filter(fp => fp.role === "ATTORNEY" || fp.role === null)
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
          name: "Document Analysis (Wizard)",
          cost: 5,
          description: "AI-powered document queries and analysis",
        },
        {
          name: "Advanced Analysis (Grand Wizard)",
          cost: 10,
          description: "Ultimate AI with master-level insights",
        },
        {
          name: "Legal Research",
          cost: 3,
          description: "Comprehensive legal research queries",
        },
        {
          name: "Document Processing",
          cost: 2,
          description: "Document upload and processing",
        },
      ];
    }

    return Array.from(featureMap.values());
  }, [featurePricing]);

  const fetchTokenData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch wallet
      const walletData = await fetchWallet();
      setWallet(walletData);

      // Fetch transactions
      const transactionsResponse = await fetch(
        "/api/attorney/tokens/transactions"
      );
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        const formattedTransactions: TokenTransaction[] =
          transactionsData.transactions?.map((t: any) => ({
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
          })) || [];
        setTransactions(formattedTransactions);
      }

      // Fetch usage statistics
      const usageResponse = await fetch("/api/attorney/tokens/usage");
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsageStats({
          totalUsed: usageData.totalUsed || 0,
          totalPurchased: usageData.totalPurchased || 0,
          currentBalance: (walletData?.balance ?? walletData?.tokens) || 0,
          usageByFeature: usageData.breakdown || [],
        });
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
      setError("Failed to load token data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchTokenData();
    } else {
      setIsLoading(false);
    }
  }, [session?.user, fetchTokenData]);

  const handlePurchaseSuccess = useCallback(
    async (tokens: number) => {
      setSuccess(`Successfully purchased ${tokens} tokens!`);
      setTimeout(() => setSuccess(null), 5000);
      await fetchTokenData();
    },
    [fetchTokenData]
  );

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

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, []);

  const totalTokens = useMemo(() => {
    if (!usageStats) return 0;
    return usageStats.totalPurchased;
  }, [usageStats]);

  const totalUsed = useMemo(() => {
    if (!usageStats) return 0;
    return usageStats.totalUsed;
  }, [usageStats]);

  const availableTokens = useMemo(() => {
    return (wallet?.balance ?? wallet?.tokens) || 0;
  }, [wallet]);

  const formattedTransactions = useMemo(() => {
    return transactions.map(tx => ({
      ...tx,
      formattedDate: formatDate(tx.timestamp),
    }));
  }, [transactions, formatDate]);

  const getFeatureDisplayName = (feature: string) => {
    switch (feature) {
      case "wizard":
        return "Document Analysis (Wizard)";
      case "grand-wizard":
        return "Advanced Analysis (Grand Wizard)";
      case "document-assistant":
        return "Document Assistant";
      case "legal-research":
        return "Legal Research";
      case "consultation-request":
        return "Consultation Request";
      default:
        return feature;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading token information...</p>
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
            {/* Token Purchase Section */}
            <Card>
              <CardContent className="p-6">
                <TokenPurchase
                  onSuccess={handlePurchaseSuccess}
                  showWallet={false}
                />
              </CardContent>
            </Card>

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
                          <div className="text-2xl font-bold text-foreground">
                            {usageStats.totalUsed}
                          </div>
                          <div className="text-sm text-muted-foreground">
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
                          <div className="text-2xl font-bold text-foreground">
                            {usageStats.totalPurchased}
                          </div>
                          <div className="text-sm text-muted-foreground">
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
                          <CreditCard className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {usageStats.currentBalance}
                          </div>
                          <div className="text-sm text-muted-foreground">
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
                          const featureName = getFeatureDisplayName(
                            item.feature
                          );
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
                    const featureName = transaction.feature
                      ? getFeatureDisplayName(transaction.feature)
                      : undefined;
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
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No transactions yet
                      </p>
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
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {feature.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
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
                          <div className="text-xs text-muted-foreground">
                            per use
                          </div>
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
