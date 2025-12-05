"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, getSession, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  // Helper function to handle session-based redirect
  const handleSessionRedirect = useCallback(
    (session: Awaited<ReturnType<typeof getSession>>) => {
      if (!session) {
        setError("Session not available. Please try again.");
        setIsOAuthLoading(false);
        return;
      }

      if (
        session.user?.role === null ||
        session.user?.role === undefined
      ) {
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
        router.replace("/auth/login");
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // Check if user has a session (might be returning from OAuth callback)
      // This handles cases where NextAuth redirects back to login page
      const checkForSession = async () => {
        const session = await getSession();
        if (session && !isOAuthLoading && !error) {
          // User has session but is on login page - likely returning from OAuth
          setIsOAuthLoading(true);
          handleSessionRedirect(session);
        }
      };
      
      // Small delay to allow callback to process
      const timer = setTimeout(checkForSession, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router, isOAuthLoading, error, handleSessionRedirect]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
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
          setError(`Google sign in failed: ${errorMessage}`);
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
        setError("Google sign in failed. Please try again.");
        setIsOAuthLoading(false);
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(
        error instanceof Error
          ? `Failed to sign in with Google: ${error.message}`
          : "Failed to sign in with Google. Please try again."
      );
      setIsOAuthLoading(false);
    }
  }, [handleSessionRedirect]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const normalizedEmail = email.trim().toLowerCase();

      if (!emailRegex.test(normalizedEmail)) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      if (!password || password.length < 1) {
        setError("Please enter your password");
        setIsLoading(false);
        return;
      }

      try {
        const result = await signIn("credentials", {
          email: normalizedEmail,
          password,
          redirect: false,
        });

        if (result?.error) {
          // Provide more specific error messages
          if (result.error === "CredentialsSignin") {
            setError("Invalid email or password. Please try again.");
          } else {
            setError(`Login failed: ${result.error}`);
          }
          setIsLoading(false);
          return;
        }

        if (result?.ok) {
          // Get session to check role
          // Wait a moment for session to be available
          let session = await getSession();
          let attempts = 0;
          const maxAttempts = 5;

          // Retry getting session if not immediately available
          while (!session && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 300));
            session = await getSession();
            attempts++;
          }

          if (session) {
            // Middleware will handle redirect based on role (null or set)
            // If role is null, redirect to role-selection, otherwise to dashboard
            if (
              session.user?.role === null ||
              session.user?.role === undefined
            ) {
              router.push("/auth/role-selection");
            } else {
              const dashboard =
                session.user.role === "ATTORNEY"
                  ? "/attorney/dashboard"
                  : "/client/dashboard";
              router.push(dashboard);
            }
          } else {
            setError("Session not available. Please try again.");
            setIsLoading(false);
          }
        } else {
          setError("Login failed. Please try again.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Login error:", error);
        setError(
          error instanceof Error
            ? `An error occurred: ${error.message}`
            : "An unexpected error occurred. Please try again."
        );
        setIsLoading(false);
      }
    },
    [email, password, router]
  );

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
          Login to Your Account
        </h2>
        <p className="text-muted-foreground">
          Sign in to continue your journey
        </p>
      </motion.div>

      {/* Google OAuth Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Button
          type="button"
          onClick={handleGoogleSignIn}
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

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
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
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={e => {
                // Normalize email on blur
                const normalized = e.target.value.trim().toLowerCase();
                if (normalized !== email) {
                  setEmail(normalized);
                }
              }}
              required
              className="w-full pl-10 pr-3 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </motion.div>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-foreground"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary hover:text-primary/80 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
              placeholder="••••••••"
              autoComplete="current-password"
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
          transition={{ duration: 0.4, delay: 0.4 }}
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
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Sign in
              </span>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Register Link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
        >
          Sign up for free
        </Link>
      </motion.p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Login to Your Account
          </h2>
          <p className="text-muted-foreground">
            Sign in to continue your journey
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
