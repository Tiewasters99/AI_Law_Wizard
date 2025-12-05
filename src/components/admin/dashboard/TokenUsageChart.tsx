"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ChartData {
  date: string;
  consumed: number;
  purchased: number;
}

export function TokenUsageChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/dashboard/token-usage?range=${timeRange}`
      );
      if (response.ok) {
        const chartData = await response.json();
        setData(chartData);
      }
    } catch (error) {
      console.error("Failed to fetch token usage data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ranges = useMemo(() => ["7d", "30d", "90d", "1y"] as const, []);

  const purchasedTotal = useMemo(
    () => data.reduce((sum, d) => sum + d.purchased, 0),
    [data]
  );
  const consumedTotal = useMemo(
    () => data.reduce((sum, d) => sum + d.consumed, 0),
    [data]
  );

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {ranges.map(range => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
            className="text-xs"
          >
            {range === "7d"
              ? "7 Days"
              : range === "30d"
                ? "30 Days"
                : range === "90d"
                  ? "90 Days"
                  : "1 Year"}
          </Button>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200">
        <div className="text-center">
          <div className="text-slate-400 mb-2">📊</div>
          <p className="text-sm text-slate-500">Token Usage Chart</p>
          <p className="text-xs text-slate-400 mt-1">
            {data.length} data points for {timeRange}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-800">
              {purchasedTotal.toLocaleString()}
            </div>
            <div className="text-green-600">Tokens Purchased</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="font-semibold text-red-800">
              {consumedTotal.toLocaleString()}
            </div>
            <div className="text-red-600">Tokens Consumed</div>
          </div>
        </div>
      )}
    </div>
  );
}
