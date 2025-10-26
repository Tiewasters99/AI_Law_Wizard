"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  UserIcon,
  Scale,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

type Role = "CUSTOMER" | "ATTORNEY";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER" as Role,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep = (currentStep: number) => {
    setError("");

    if (currentStep === 1 && !formData.role) {
      setError("Please select your role");
      return false;
    }

    if (currentStep === 2) {
      if (!formData.name.trim()) {
        setError("Name is required");
        return false;
      }
      if (formData.name.trim().length < 2) {
        setError("Name must be at least 2 characters");
        return false;
      }
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.password) {
        setError("Password is required");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        redirect: false,
      });

      if (result?.ok) {
        if (formData.role === "CUSTOMER") {
          router.push("/client/dashboard");
        } else if (formData.role === "ATTORNEY") {
          router.push("/attorney/dashboard");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Choose your role
              </h3>
              <p className="text-sm text-gray-600">
                Select how you&apos;ll be using AI Law Wizard
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateFormData("role", "CUSTOMER")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.role === "CUSTOMER"
                    ? "border-blue-500 bg-blue-50/50 backdrop-blur-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white/50"
                }`}
              >
                <UserIcon
                  className={`w-8 h-8 mx-auto mb-3 ${
                    formData.role === "CUSTOMER"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                />
                <div
                  className={`font-semibold mb-1 ${
                    formData.role === "CUSTOMER"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  Client
                </div>
                <div className="text-xs text-gray-500">Seek legal help</div>
              </button>

              <button
                type="button"
                onClick={() => updateFormData("role", "ATTORNEY")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.role === "ATTORNEY"
                    ? "border-blue-500 bg-blue-50/50 backdrop-blur-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white/50"
                }`}
              >
                <Scale
                  className={`w-8 h-8 mx-auto mb-3 ${
                    formData.role === "ATTORNEY"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                />
                <div
                  className={`font-semibold mb-1 ${
                    formData.role === "ATTORNEY"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  Attorney
                </div>
                <div className="text-xs text-gray-500">Provide services</div>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your information
              </h3>
              <p className="text-sm text-gray-600">
                Tell us a bit about yourself
              </p>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={e => updateFormData("name", e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={e => updateFormData("email", e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure your account
              </h3>
              <p className="text-sm text-gray-600">Create a strong password</p>
            </div>

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
                  value={formData.password}
                  onChange={e => updateFormData("password", e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e =>
                    updateFormData("confirmPassword", e.target.value)
                  }
                  className="w-full pl-10 pr-3 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Create Account
        </h2>
        <p className="text-gray-600">Join thousands of legal professionals</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step > s
                    ? "bg-blue-600 text-white"
                    : step === s
                      ? "bg-blue-600 text-white ring-4 ring-blue-200"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    step > s ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderStepContent()}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50/50 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white/70"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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
                  Creating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </span>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Login Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
