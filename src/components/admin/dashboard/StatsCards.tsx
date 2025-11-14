"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ToggleLeft,
  Coins,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";

interface StatsData {
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

export function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2"></div>
              <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load statistics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Users
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground/70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatNumber(stats.users.total)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>
              {stats.users.customers} customers, {stats.users.attorneys}{" "}
              attorneys
            </span>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            {stats.users.change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-chart-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span
              className={`text-xs ${
                stats.users.change >= 0 ? "text-chart-1" : "text-destructive"
              }`}
            >
              {Math.abs(stats.users.change)}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Features */}
      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Features
          </CardTitle>
          <ToggleLeft className="h-4 w-4 text-muted-foreground/70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.features.enabled}/{stats.features.total}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Features enabled</span>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            {stats.features.change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-chart-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span
              className={`text-xs ${
                stats.features.change >= 0 ? "text-chart-1" : "text-destructive"
              }`}
            >
              {Math.abs(stats.features.change)}% change
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Token Circulation */}
      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Token Circulation
          </CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground/70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatNumber(stats.tokens.total)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Avg: {formatNumber(stats.tokens.average)} per user</span>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            {stats.tokens.change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-chart-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span
              className={`text-xs ${
                stats.tokens.change >= 0 ? "text-chart-1" : "text-destructive"
              }`}
            >
              {Math.abs(stats.tokens.change)}% from last week
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Revenue This Month */}
      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Revenue (This Month)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground/70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(stats.revenue.amount)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{stats.revenue.count} purchases</span>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            {stats.revenue.change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-chart-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span
              className={`text-xs ${
                stats.revenue.change >= 0 ? "text-chart-1" : "text-destructive"
              }`}
            >
              {Math.abs(stats.revenue.change)}% from last month
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
