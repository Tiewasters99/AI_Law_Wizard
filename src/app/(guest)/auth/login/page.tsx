"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, Mail, Lock, UserIcon, Scale } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "ATTORNEY">("CUSTOMER");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials or role mismatch");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Redirect based on role
        if (role === "CUSTOMER") {
          router.push("/client/dashboard");
        } else if (role === "ATTORNEY") {
          router.push("/attorney/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600">Sign in to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className={`p-6 rounded-xl border-2 transition-all ${
                role === "CUSTOMER"
                  ? "border-blue-500 bg-blue-50/50 backdrop-blur-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white/50"
              }`}
            >
              <UserIcon
                className={`w-6 h-6 mx-auto mb-2 ${
                  role === "CUSTOMER" ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div
                className={`font-medium ${
                  role === "CUSTOMER" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Client
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole("ATTORNEY")}
              className={`p-6 rounded-xl border-2 transition-all ${
                role === "ATTORNEY"
                  ? "border-blue-500 bg-blue-50/50 backdrop-blur-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white/50"
              }`}
            >
              <Scale
                className={`w-6 h-6 mx-auto mb-2 ${
                  role === "ATTORNEY" ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div
                className={`font-medium ${
                  role === "ATTORNEY" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Attorney
              </div>
            </button>
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50/50 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <LogIn className="w-5 h-5 mr-2" />
              Sign in
            </span>
          )}
        </Button>
      </form>

      {/* Register Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
