"use client";

import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <Image
            src="/images/ai_law_wizard_logo_v1.png"
            alt="AI Law Wizard"
            width={1964}
            height={468}
            className="h-12 w-auto object-contain drop-shadow-lg"
            priority
          />
        </Link>

        {/* Glassmorphic Content */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
