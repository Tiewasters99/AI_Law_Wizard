"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OnboardingBannerProps {
  className?: string;
}

export const OnboardingBanner = React.memo<OnboardingBannerProps>(
  ({ className }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isDismissed, setIsDismissed] = useState(false);

    // Check if banner should be shown
    const shouldShow = useMemo(() => {
      // Don't show if profile is complete
      if (session?.user?.profileComplete) return false;

      // Don't show if user is not an attorney
      if (session?.user?.role !== "ATTORNEY") return false;

      // Don't show on the onboarding page itself
      if (pathname === "/attorney/onboarding") return false;

      // Don't show if dismissed
      if (isDismissed) return false;

      return true;
    }, [session?.user?.profileComplete, session?.user?.role, pathname, isDismissed]);

    // Check localStorage for dismissal state
    useEffect(() => {
      if (typeof window !== "undefined") {
        const dismissed = localStorage.getItem("attorney-onboarding-banner-dismissed");
        if (dismissed === "true") {
          setIsDismissed(true);
        }
      }
    }, []);

    // Handle dismiss
    const handleDismiss = useCallback(() => {
      setIsDismissed(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("attorney-onboarding-banner-dismissed", "true");
      }
    }, []);

    // Handle complete profile click
    const handleCompleteProfile = useCallback(() => {
      router.push("/attorney/onboarding");
    }, [router]);

    // Reset dismissal when profile becomes incomplete (edge case)
    useEffect(() => {
      if (session?.user?.profileComplete === false && isDismissed) {
        // Reset dismissal if profile becomes incomplete
        setIsDismissed(false);
        if (typeof window !== "undefined") {
          localStorage.removeItem("attorney-onboarding-banner-dismissed");
        }
      }
    }, [session?.user?.profileComplete, isDismissed]);

    if (!shouldShow) return null;

    return (
      <Card className={`mx-4 mt-4 mb-4 border-primary/20 bg-primary/5 ${className || ""}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
          <div className="flex items-start sm:items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Complete Your Profile
              </h3>
              <p className="text-sm text-muted-foreground">
                Please complete your profile to access all features. Only a few required fields
                need to be filled.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleCompleteProfile}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 flex-1 sm:flex-initial"
            >
              Complete Profile
            </Button>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-muted transition-colors duration-200"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </Card>
    );
  }
);

OnboardingBanner.displayName = "OnboardingBanner";

