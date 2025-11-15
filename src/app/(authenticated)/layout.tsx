"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AttorneyLayout } from "@/components/attorney/layout/AttorneyLayout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Fetch unread count for attorneys
  useEffect(() => {
    const role = session?.user?.role as string | undefined;
    if (role === "ATTORNEY" && session?.user?.id) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch("/api/attorney/messages/unread-count");
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.count || 0);
          }
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      };

      // Initial fetch
      fetchUnreadCount();

      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }
  }, [session?.user?.role, session?.user?.id]);

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
    return (
      <AttorneyLayout unreadCount={unreadCount}>{children}</AttorneyLayout>
    );
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
