"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, User, Scale, Users } from "lucide-react";

interface ConsumerData {
  userId: string;
  userName: string;
  userRole: "ATTORNEY" | "CUSTOMER";
  tokensConsumed: number;
  percentageOfTotal: number;
}

export function TopTokenConsumers() {
  const [consumers, setConsumers] = useState<ConsumerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/dashboard/top-consumers?range=${timeRange}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setConsumers(data);
        }
      } catch (error) {
        console.error("Failed to fetch top consumers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getRoleIcon = (role: "ATTORNEY" | "CUSTOMER") => {
    return role === "ATTORNEY" ? Scale : Users;
  };

  const getRoleColor = (role: "ATTORNEY" | "CUSTOMER") => {
    return role === "ATTORNEY"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {(["7d", "30d", "90d"] as const).map(range => (
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
              : "90 Days"}
          </Button>
        ))}
      </div>

      {/* Consumers List */}
      <div className="space-y-3">
        {consumers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <User className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p>No consumption data available</p>
          </div>
        ) : (
          consumers.map((consumer, index) => {
            const RoleIcon = getRoleIcon(consumer.userRole);

            return (
              <div
                key={consumer.userId}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full text-sm font-semibold text-slate-600">
                    {index + 1}
                  </div>
                  <div className="flex items-center space-x-2">
                    <RoleIcon className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">
                        {consumer.userName}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getRoleColor(consumer.userRole)}`}
                      >
                        {consumer.userRole === "ATTORNEY"
                          ? "Attorney"
                          : "Client"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {consumer.tokensConsumed.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500">
                    {consumer.percentageOfTotal.toFixed(1)}% of total
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View All Link */}
      {consumers.length > 0 && (
        <div className="pt-3 border-t border-slate-200">
          <Button variant="ghost" size="sm" className="w-full text-slate-600">
            View All Users
          </Button>
        </div>
      )}
    </div>
  );
}
