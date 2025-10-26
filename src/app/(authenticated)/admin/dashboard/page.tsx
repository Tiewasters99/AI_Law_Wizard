"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {session?.user?.name || session?.user?.email}!
              </p>
            </div>
            <Button onClick={() => signOut()}>Sign Out</Button>
          </div>

          <div className="border-t pt-6">
            <p className="text-gray-600">
              Your dashboard content will go here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
