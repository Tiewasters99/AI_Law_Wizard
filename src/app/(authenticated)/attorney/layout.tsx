"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { OnboardingBanner } from "@/components/attorney/OnboardingBanner";

interface AttorneyLayoutProps {
  children: React.ReactNode;
}

export default function AttorneyLayout({ children }: AttorneyLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Compute whether banner should be shown
  const shouldShowBanner = useMemo(() => {
    // Don't show if profile is complete
    if (session?.user?.profileComplete) return false;

    // Don't show if user is not an attorney
    if (session?.user?.role !== "ATTORNEY") return false;

    // Don't show on the onboarding page itself
    if (pathname === "/attorney/onboarding") return false;

    return true;
  }, [session?.user?.profileComplete, session?.user?.role, pathname]);

  // Layout is already applied in authenticated/layout.tsx
  // This file just passes through children to avoid nested layouts
  return (
    <>
      {shouldShowBanner && <OnboardingBanner />}
      {children}
    </>
  );
}
