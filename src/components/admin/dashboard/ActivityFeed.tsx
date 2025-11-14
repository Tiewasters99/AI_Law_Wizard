"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Clock,
  User,
  Settings,
  DollarSign,
  ToggleLeft,
} from "lucide-react";

interface ActivityData {
  id: string;
  action: string;
  adminName: string;
  targetType?: string;
  targetId?: string;
  createdAt: string;
  details?: any;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/dashboard/activity?limit=20");
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActionIcon = useCallback((action: string) => {
    if (action.includes("USER")) return User;
    if (action.includes("FEATURE")) return ToggleLeft;
    if (action.includes("PRICING") || action.includes("PACKAGE"))
      return DollarSign;
    return Settings;
  }, []);

  const getActionColor = useCallback((action: string) => {
    if (action.includes("CREATE")) return "bg-green-100 text-green-800";
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800";
    if (action.includes("DELETE")) return "bg-red-100 text-red-800";
    if (action.includes("LOGIN")) return "bg-purple-100 text-purple-800";
    return "bg-slate-100 text-slate-800";
  }, []);

  const formatAction = useCallback((action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3 p-3">
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

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => {
            const ActionIcon = getActionIcon(activity.action);

            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <ActionIcon className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-slate-900">
                      {activity.adminName}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getActionColor(activity.action)}`}
                    >
                      {formatAction(activity.action)}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    {activity.targetType && (
                      <span>
                        {activity.targetType.toLowerCase()}
                        {activity.targetId &&
                          ` #${activity.targetId.slice(-8)}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Link */}
      {activities.length > 0 && (
        <div className="pt-3 border-t border-slate-200">
          <Button variant="ghost" size="sm" className="w-full text-slate-600">
            View All Activity
          </Button>
        </div>
      )}
    </div>
  );
}
