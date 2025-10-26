"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Admin } from "@/types/admin";

export function useAdminAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (status === "loading") return;

      if (!session?.isAdmin || !session?.adminId) {
        router.push("/admin/login");
        return;
      }

      try {
        const response = await fetch("/api/admin/profile");
        if (response.ok) {
          const adminData = await response.json();
          setAdmin(adminData);
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmin();
  }, [session, status, router]);

  const isAdmin = !!session?.isAdmin;
  const isSuperAdmin = !!session?.isSuperAdmin;

  return {
    admin,
    isAdmin,
    isSuperAdmin,
    isLoading,
    session,
  };
}
