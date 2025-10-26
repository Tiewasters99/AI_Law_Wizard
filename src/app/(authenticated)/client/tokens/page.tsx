"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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
  }[];
  dailyUsage: {
    date: string;
    tokens: number;
  }[];
}

export default function TokensPage() {
  const { data: session } = useSession();
  const [tokenUsage, setTokenUsage] = useState({ used: 0, limit: 0 });
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("packages");

  const tokenPackages: TokenPackage[] = [
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
      description: "Perfect for getting started with basic legal assistance",
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
        "Wizard chat access",
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

  const features = [
    { name: "Legal Chat", cost: 1, description: "Basic AI legal assistance" },
    {
      name: "Document Analysis",
      cost: 5,
      description: "AI-powered document queries",
    },
    {
      name: "Wizard Chat",
      cost: 2,
      description: "Premium AI with enhanced capabilities",
    },
    {
      name: "Grand Wizard",
      cost: 5,
      description: "Ultimate AI with master-level insights",
    },
    { name: "File Upload", cost: 0, description: "Upload documents (free)" },
    {
      name: "Attorney Request",
      cost: 0,
      description: "Send consultation requests (free)",
    },
  ];

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // Fetch token balance
        const balanceResponse = await fetch("/api/client/tokens/balance");
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setTokenUsage({
            used: balanceData.totalConsumed || 0,
            limit: balanceData.balance + (balanceData.totalConsumed || 0),
          });
        }

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
              feature: t.metadata?.feature,
              packageName: t.metadata?.packageName,
            }));
          setTransactions(formattedTransactions);
        }

        // Fetch usage statistics
        const usageResponse = await fetch("/api/client/tokens/usage");
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          setUsageStats({
            totalUsed: usageData.totalConsumed || 0,
            totalPurchased: usageData.totalPurchased || 0,
            currentBalance: usageData.balance || 0,
            usageByFeature: usageData.byFeature || [],
            dailyUsage: [],
          });
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
        setError("Failed to load token data");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchTokenData();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const handlePurchasePackage = async (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
    setIsProcessing(true);
    setError(null);

    try {
      // In real app, this would integrate with Stripe
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing

      // Simulate successful purchase
      const newTransaction: TokenTransaction = {
        id: Date.now().toString(),
        type: "purchase",
        amount: pkg.tokens,
        description: `${pkg.name} - ${pkg.tokens} tokens`,
        timestamp: new Date(),
        status: "completed",
        packageName: pkg.name,
      };

      setTransactions(prev => [newTransaction, ...prev]);

      // Update token balance
      const newBalance = tokenUsage.limit + pkg.tokens;
      setTokenUsage(prev => ({ ...prev, limit: newBalance }));

      setSuccess(`Successfully purchased ${pkg.tokens} tokens!`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error("Error purchasing package:", error);
      setError("Failed to process payment. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Token Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your AI credits and purchase additional tokens
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {tokenUsage.limit - tokenUsage.used}
              </div>
              <div className="text-sm text-gray-500">Tokens Available</div>
            </div>
          </div>

          {/* Token Usage Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Usage Progress
              </span>
              <span className="text-sm text-gray-500">
                {tokenUsage.used} / {tokenUsage.limit} used
              </span>
            </div>
            <Progress
              value={(tokenUsage.used / tokenUsage.limit) * 100}
              className="h-3"
            />
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="packages">Buy Tokens</TabsTrigger>
            <TabsTrigger value="usage">Usage Stats</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="features">Feature Costs</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-6">
            {/* Token Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        disabled={isProcessing}
                        variant={pkg.popular ? "default" : "outline"}
                      >
                        {isProcessing && selectedPackage?.id === pkg.id ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
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

            {/* Payment Security */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span>Secure payment processing by Stripe</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>SSL encrypted</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>30-day money-back guarantee</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            {usageStats && (
              <>
                {/* Usage Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <div className="space-y-4">
                      {usageStats.usageByFeature.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {item.feature}
                            </span>
                            <span className="text-sm text-gray-500">
                              {item.tokens} tokens ({item.percentage.toFixed(1)}
                              %)
                            </span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
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
                  {transactions.map(transaction => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(transaction.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount} tokens
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            transaction.status === "completed"
                              ? "text-green-600 border-green-200"
                              : transaction.status === "pending"
                              ? "text-yellow-600 border-yellow-200"
                              : "text-red-600 border-red-200"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}

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
