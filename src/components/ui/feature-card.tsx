"use client";

import * as React from "react";
import { cn } from "@/lib/frontend/utils";

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  category?: "core" | "advanced" | "premium" | "integration";
  isActive?: boolean;
  onClick?: () => void;
  tooltip?: string;
  badge?: React.ReactNode;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  category = "core",
  isActive = false,
  onClick,
  tooltip,
  badge,
  className,
}: FeatureCardProps) {
  const getCategoryColors = () => {
    switch (category) {
      case "premium":
        return {
          iconBg: "bg-accent/20",
          iconColor: "text-accent-foreground",
        };
      case "advanced":
        return {
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
        };
      case "integration":
        return {
          iconBg: "bg-secondary/20",
          iconColor: "text-secondary-foreground",
        };
      default:
        return {
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
        };
    }
  };

  const { iconBg, iconColor } = getCategoryColors();

  return (
    <button
      onClick={onClick}
      title={tooltip || title}
      className={cn(
        "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left group relative transition-all duration-200",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
        isActive
          ? "bg-sidebar-accent border-l-2 border-l-primary text-sidebar-accent-foreground"
          : "text-sidebar-foreground",
        className
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "p-2 rounded-lg flex-shrink-0 transition-colors",
          iconBg,
          isActive && "bg-primary/20"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 transition-colors",
            iconColor,
            isActive && "text-primary"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-hidden relative z-10">
        <div className="flex items-center space-x-2 mb-0.5">
          <span
            className={cn(
              "font-medium truncate text-sm transition-colors",
              isActive
                ? "text-sidebar-accent-foreground font-semibold"
                : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
            )}
          >
            {title}
          </span>
          {badge}
        </div>
        <p
          className={cn(
            "text-xs truncate transition-colors",
            isActive
              ? "text-sidebar-accent-foreground/80"
              : "text-muted-foreground group-hover:text-muted-foreground/90"
          )}
        >
          {description}
        </p>
      </div>

      {/* Tooltip for collapsed state or additional info */}
      {tooltip && (
        <div
          className={cn(
            "absolute left-full ml-3 top-1/2 transform -translate-y-1/2",
            "text-xs rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100",
            "transition-opacity duration-200 pointer-events-none z-50",
            "max-w-xs whitespace-normal shadow-lg border",
            "bg-popover text-popover-foreground border-border",
            "hidden lg:block"
          )}
        >
          <div>
            <p className="font-semibold mb-1 text-primary">{title}</p>
            <p className="leading-relaxed text-muted-foreground">{tooltip}</p>
          </div>
          {/* Tooltip Arrow */}
          <div
            className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent"
            style={{ borderRightColor: "var(--popover)" }}
            aria-hidden="true"
          />
        </div>
      )}
    </button>
  );
}
