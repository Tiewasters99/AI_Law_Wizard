"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { TokenPurchase } from "@/components/attorney/tokens/TokenPurchase";
import {
  Coins,
  TrendingUp,
  History,
  Settings,
  CreditCard,
  Award,
  Shield,
  FileText,
  BarChart3,
  Clock,
  Scale,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { fetchWallet, Wallet } from "@/lib/backend/stripeService";

export default function TokensPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const loadWallet = async () => {
      if (session?.user) {
        try {
          const walletData = await fetchWallet();
          setWallet(walletData);
        } catch (error) {
          console.error("Failed to load wallet:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadWallet();
  }, [session?.user]);

  const isAttorney = useMemo(
    () => session?.user?.role === "ATTORNEY",
    [session?.user?.role]
  );

  const serviceStats = useMemo(
    () => [
      {
        title: "Available Credits",
        value: wallet?.tokens || 0,
        icon: Coins,
        iconColor: "text-primary",
        bgColor: "bg-accent",
        borderColor: "border-primary/20",
      },
      {
        title: "Credits Used",
        value: 0, // This would come from usage analytics
        icon: BarChart3,
        iconColor: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      {
        title: "Transaction History",
        value: wallet?.transactions?.length || 0,
        icon: History,
        iconColor: "text-purple-700",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      },
    ],
    [wallet?.tokens, wallet?.transactions?.length]
  );

  const professionalActions = useMemo(
    () => [
      {
        title: "Purchase Credits",
        description: "Acquire analysis credits for legal services",
        icon: CreditCard,
        action: "purchase",
      },
      {
        title: "Usage Reports",
        description: "Comprehensive usage analytics and insights",
        icon: BarChart3,
        action: "analytics",
      },
      {
        title: "Transaction Records",
        description: "Complete transaction history and invoices",
        icon: History,
        action: "history",
      },
      {
        title: "Firm Packages",
        description: "Enterprise solutions for law firms",
        icon: Scale,
        action: "settings",
      },
    ],
    []
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="bg-white mx-auto max-w-6xl p-4 sm:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        className="bg-white mx-auto max-w-6xl p-4 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Professional Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm bg-primary">
                <Coins className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Service Credit Management
                </h1>
                {isAttorney && (
                  <Badge
                    variant="outline"
                    className="mt-1 text-primary bg-accent border-primary/20"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    Attorney Account
                  </Badge>
                )}
              </div>
            </div>
            <p className="mt-2 text-muted-foreground">
              Professional legal analysis credits for AI-powered services
            </p>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border bg-accent border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Secure Platform
            </span>
          </div>
        </div>

        {/* Professional Service Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {serviceStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`hover:shadow-md transition-shadow border ${stat.borderColor}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1 text-foreground">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Professional Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Credit Management
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {professionalActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-accent">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm mb-1 text-foreground">
                            {action.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Professional Credit Purchase Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Purchase Service Credits
          </h2>
          <Card className="border shadow-sm border-gray-200">
            <CardContent className="p-6">
              <TokenPurchase showWallet={true} />
            </CardContent>
          </Card>
        </div>

        {/* Professional Usage Information */}
        <div className="rounded-xl p-6 border bg-muted border-border">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Service Credit Information
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold mb-2 text-primary">
                Credit Usage
              </h4>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 mt-0.5 text-primary" />
                <span className="text-sm text-foreground">
                  Standard legal analysis: 1-3 credits per query
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <FileText className="w-4 h-4 mt-0.5 text-blue-700" />
                <span className="text-sm text-foreground">
                  Complex document processing: 3-5 credits per document
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <Scale className="w-4 h-4 mt-0.5 text-primary" />
                <span className="text-sm text-foreground">
                  Advanced case law research: 5-10 credits per session
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold mb-2 text-green-900">
                Professional Benefits
              </h4>
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 mt-0.5 text-green-700" />
                <span className="text-sm text-foreground">
                  Credits never expire - lifetime validity
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <Award className="w-4 h-4 mt-0.5 text-green-700" />
                <span className="text-sm text-foreground">
                  Volume discounts for law firm packages
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <BarChart3 className="w-4 h-4 mt-0.5 text-green-700" />
                <span className="text-sm text-foreground">
                  Detailed usage analytics and reporting
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
