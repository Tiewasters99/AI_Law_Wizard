"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

// Helper function to poll for session with exponential backoff
async function pollForSession(
  maxAttempts: number = 20,
  initialDelay: number = 300
): Promise<Awaited<ReturnType<typeof getSession>> | null> {
  let delay = initialDelay;
  const maxDelay = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const session = await getSession();
    if (session) {
      return session;
    }

    // Wait before next attempt with exponential backoff
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  return null;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Helper function to handle session-based redirect
  const handleSessionRedirect = useCallback(
    (session: Awaited<ReturnType<typeof getSession>>) => {
      if (!session) {
        setError("Session not available. Please try again.");
        setIsOAuthLoading(false);
        return;
      }

      if (session.user?.role === null || session.user?.role === undefined) {
        router.push("/auth/role-selection");
      } else {
        const dashboard =
          session.user.role === "ATTORNEY"
            ? "/attorney/dashboard"
            : "/client/dashboard";
        router.push(dashboard);
      }
    },
    [router]
  );

  // Check for OAuth errors in URL and handle callback completion
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setIsOAuthLoading(false);
      // Handle different error types with more specific messages
      switch (errorParam) {
        case "OAuthAccountNotLinked":
          setError(
            "This Google account is not linked to an existing account. Please sign up first or use email/password to login."
          );
          break;
        case "AccessDenied":
          setError("Access denied. Please try again or contact support.");
          break;
        case "OAuthSignin":
          setError(
            "Error occurred during Google sign in. Please try again or use email/password."
          );
          break;
        case "OAuthCallback":
          setError(
            "Error occurred during authentication callback. Please try again."
          );
          break;
        case "OAuthCreateAccount":
          setError(
            "Could not create account. Please try again or use email/password to sign up."
          );
          break;
        case "Configuration":
          setError(
            "Authentication configuration error. Please contact support."
          );
          break;
        case "Verification":
          setError("Verification failed. Please try again.");
          break;
        default:
          setError(
            `Authentication error: ${errorParam}. Please try again or contact support.`
          );
      }
      // Clean up URL after a delay to allow user to see the error
      const timer = setTimeout(() => {
        router.replace("/auth/register");
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // Check if user has a session (might be returning from OAuth callback)
      // This handles cases where NextAuth redirects back to register page
      const checkForSession = async () => {
        const session = await getSession();
        if (session && !isOAuthLoading && !error) {
          // User has session but is on register page - likely returning from OAuth
          setIsOAuthLoading(true);
          handleSessionRedirect(session);
        }
      };

      // Small delay to allow callback to process
      const timer = setTimeout(checkForSession, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router, isOAuthLoading, error, handleSessionRedirect]);

  const updateFormData = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setError("");
    },
    []
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const handleGoogleSignUp = useCallback(async () => {
    setIsOAuthLoading(true);
    setError("");
    try {
      // OAuth callback and middleware will handle redirect based on role
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/auth/role-selection",
      });

      if (result?.error) {
        // Handle specific OAuth errors
        const errorMessage = result.error;
        if (errorMessage === "OAuthAccountNotLinked") {
          setError(
            "This Google account is not linked. Please sign up first or use email/password."
          );
        } else if (errorMessage === "AccessDenied") {
          setError("Access denied. Please try again.");
        } else {
          setError(`Google sign up failed: ${errorMessage}`);
        }
        setIsOAuthLoading(false);
        return;
      }

      if (result?.ok) {
        // Poll for session with exponential backoff
        // The OAuth callback may take several seconds to complete
        const session = await pollForSession(20, 500);

        if (session) {
          handleSessionRedirect(session);
        } else {
          // Session not available after polling - timeout occurred
          setError(
            "Authentication is taking longer than expected. Please wait a moment and try again."
          );
          setIsOAuthLoading(false);
        }
      } else {
        // signIn returned but result.ok is false
        setError("Google sign up failed. Please try again.");
        setIsOAuthLoading(false);
      }
    } catch (error) {
      console.error("Google sign up error:", error);
      setError(
        error instanceof Error
          ? `Failed to sign up with Google: ${error.message}`
          : "Failed to sign up with Google. Please try again."
      );
      setIsOAuthLoading(false);
    }
  }, [handleSessionRedirect]);

  const validateForm = useCallback(() => {
    setError("");

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

    return true;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Sign in the user
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        // Redirect to role selection page
        router.push("/auth/role-selection");
      } else {
        setError(
          "Registration successful but login failed. Please try logging in."
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Create Your Account
        </h2>
        <p className="text-muted-foreground">Join us and get started today</p>
      </motion.div>

      {/* Google OAuth Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isOAuthLoading || isLoading}
          className="w-full bg-background border-2 border-border text-foreground hover:bg-muted transition-all"
        >
          {isOAuthLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>
      </motion.div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Full Name
          </label>
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => updateFormData("name", e.target.value)}
              required
              className="w-full pl-10 pr-3 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
              placeholder="John Doe"
            />
          </motion.div>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Email address
          </label>
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => updateFormData("email", e.target.value)}
              required
              className="w-full pl-10 pr-3 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
              placeholder="you@example.com"
            />
          </motion.div>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Password
          </label>
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={e => updateFormData("password", e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
              placeholder="••••••••"
            />
            <motion.button
              type="button"
              onClick={togglePasswordVisibility}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <AnimatePresence mode="wait">
                {showPassword ? (
                  <motion.div
                    key="eye-off"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EyeOff className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="eye"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Eye className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
          <p className="mt-1 text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
        </motion.div>

        {/* Confirm Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Confirm Password
          </label>
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={e => updateFormData("confirmPassword", e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
              placeholder="••••••••"
            />
            <motion.button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <AnimatePresence mode="wait">
                {showConfirmPassword ? (
                  <motion.div
                    key="eye-off"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EyeOff className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="eye"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Eye className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-xl"
            >
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <motion.button
            type="submit"
            disabled={isLoading || isOAuthLoading}
            whileHover={{ scale: isLoading || isOAuthLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading || isOAuthLoading ? 1 : 0.98 }}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </span>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Login Link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="text-center text-sm text-muted-foreground"
      >
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
        >
          Sign in
        </Link>
      </motion.p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Create Your Account
            </h2>
            <p className="text-muted-foreground">
              Join us and get started today
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
