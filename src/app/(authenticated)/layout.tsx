"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AttorneyLayout } from "@/components/attorney/layout/AttorneyLayout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Role-aware layout wrapper
  const role = session.user?.role as string | undefined;

  // Attorney/Lawyer layout
  if (role === "ATTORNEY") {
    return <AttorneyLayout>{children}</AttorneyLayout>;
  }

  // Client layout (TODO: Create ClientLayout)
  if (role === "CUSTOMER") {
    return <>{children}</>; // Temporary - will create ClientLayout
  }

  // Admin layout (TODO: Create AdminLayout)
  if (role === "ADMIN") {
    return <>{children}</>; // Temporary - will create AdminLayout
  }

  // Default fallback
  return <>{children}</>;
}
