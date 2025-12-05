"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DocumentAnalysisInterface } from "./components/interface/DocumentAnalysisInterface";

export default function WizardPage() {
  const { data: session, status } = useSession();

  // Check if user is authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  // Check if user is an attorney
  const isAttorney = session?.user?.role === "ATTORNEY";

  if (!isAttorney) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 mb-6">
            This feature is only available for attorneys. Please contact support
            if you need access.
          </p>
          <a
            href="/attorney/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full overflow-hidden">
      <DocumentAnalysisInterface model="openai/gpt-4o-mini" />
    </div>
  );
}
