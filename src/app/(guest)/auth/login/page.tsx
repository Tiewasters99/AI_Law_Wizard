"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LogIn,
  Mail,
  Lock,
  UserIcon,
  Scale,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Gavel,
  FileText,
  Users,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "ATTORNEY">("CUSTOMER");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleRoleChange = useCallback((newRole: "CUSTOMER" | "ATTORNEY") => {
    setRole(newRole);
  }, []);

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

  // Role Selector Sidebar Component
  const RoleSelectorSidebar = () => (
    <Card className="p-6 bg-card">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Select Your Role
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            <motion.button
              type="button"
              onClick={() => handleRoleChange("CUSTOMER")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                role === "CUSTOMER"
                  ? "border-primary bg-accent/50 shadow-sm"
                  : "border-border hover:border-primary/50 bg-background"
              }`}
            >
              <motion.div
                animate={{
                  scale: role === "CUSTOMER" ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <UserIcon
                  className={`w-6 h-6 mx-auto mb-2 transition-colors ${
                    role === "CUSTOMER"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </motion.div>
              <div
                className={`text-sm font-semibold mb-1 transition-colors text-center ${
                  role === "CUSTOMER" ? "text-primary" : "text-foreground"
                }`}
              >
                Client
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Seek legal help
              </div>
              {role === "CUSTOMER" && (
                <motion.div
                  layoutId="roleIndicator"
                  className="absolute inset-0 rounded-xl border-2 border-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleRoleChange("ATTORNEY")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                role === "ATTORNEY"
                  ? "border-primary bg-accent/50 shadow-sm"
                  : "border-border hover:border-primary/50 bg-background"
              }`}
            >
              <motion.div
                animate={{
                  scale: role === "ATTORNEY" ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Scale
                  className={`w-6 h-6 mx-auto mb-2 transition-colors ${
                    role === "ATTORNEY"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </motion.div>
              <div
                className={`text-sm font-semibold mb-1 transition-colors text-center ${
                  role === "ATTORNEY" ? "text-primary" : "text-foreground"
                }`}
              >
                Attorney
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Provide services
              </div>
              {role === "ATTORNEY" && (
                <motion.div
                  layoutId="roleIndicator"
                  className="absolute inset-0 rounded-xl border-2 border-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          </div>
        </div>

        {/* Role-specific benefits */}
        <div className="pt-4 border-t">
          {role === "CUSTOMER" ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Legal research and document analysis
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Connect with verified attorneys
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Secure consultation requests
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Gavel className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Professional document processing
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  PACER docket integration
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Client management tools
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
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

      {/* Main Layout - Two Column Grid */}
      <div className="grid md:grid-cols-[35%_65%] gap-5">
        {/* Left Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <RoleSelectorSidebar />
          </motion.div>
        </div>

        {/* Right Content Area */}
        <div className="space-y-6 pr-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
                  required
                  className="w-full pl-10 pr-3 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
                  placeholder="you@example.com"
                />
              </motion.div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: [0, -8, 8, -8, 8, 0],
                  }}
                  transition={{ x: { duration: 0.5 } }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-xl shadow-lg"
                >
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
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
            transition={{ duration: 0.5, delay: 0.5 }}
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
      </div>
    </div>
  );
}
