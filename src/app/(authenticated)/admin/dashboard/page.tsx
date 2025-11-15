"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Loader2,
  Activity,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PaymentStats {
  totalRevenue: number;
  totalPurchases: number;
  averagePurchase: number;
}

interface FeatureSpending {
  feature: string;
  totalTokens: number;
  percentage: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [featureSpending, setFeatureSpending] = useState<FeatureSpending[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated" || !session?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    setIsLoading(false);
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [paymentsResponse, spendingResponse] = await Promise.all([
        fetch("/api/admin/dashboard/payments"),
        fetch("/api/admin/dashboard/feature-spending"),
      ]);

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPaymentStats(paymentsData);
      }

      if (spendingResponse.ok) {
        const spendingData = await spendingResponse.json();
        setFeatureSpending(spendingData.spending || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(2)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toLocaleString();
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!session?.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Overview of payments and feature usage across the platform.
        </p>
      </div>

      {/* Payment Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Overall Payment Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentStats
                  ? formatCurrency(paymentStats.totalRevenue)
                  : "$0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                From all completed purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Purchases
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentStats?.totalPurchases || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Purchase
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentStats
                  ? formatCurrency(paymentStats.averagePurchase)
                  : "$0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature-wise Spending */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Feature-wise Spending
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Token Consumption by Feature</CardTitle>
            <CardDescription>
              Total tokens consumed grouped by feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            {featureSpending.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No spending data available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Total Tokens</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureSpending.map((item) => (
                    <TableRow key={item.feature}>
                      <TableCell className="font-medium">
                        {item.feature}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatTokens(item.totalTokens)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">
                            {item.percentage}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
