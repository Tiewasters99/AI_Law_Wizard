"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Gavel,
  FileText,
  Users,
} from "lucide-react";

type Role = "CUSTOMER" | "ATTORNEY";

const stepVariants = {
  enter: { x: 50, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 },
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateFormData = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setError("");
    },
    []
  );

  const handleRoleChange = useCallback(
    (newRole: Role) => {
      updateFormData("role", newRole);
    },
    [updateFormData]
  );

  const validateStep = useCallback(
    (currentStep: number) => {
      setError("");

      if (currentStep === 1) {
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

      if (currentStep === 2) {
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
    },
    [formData]
  );

  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  }, [step, validateStep]);

  const handleBack = useCallback(() => {
    setStep(prev => prev - 1);
    setError("");
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(2)) return;

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
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Step 1 of 2
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Your information
              </h3>
              <p className="text-sm text-muted-foreground">
                Tell us a bit about yourself
              </p>
            </div>

            <div>
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
                  className="w-full pl-10 pr-3 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
                  placeholder="John Doe"
                />
              </motion.div>
            </div>

            <div>
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
                  className="w-full pl-10 pr-3 py-3 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-foreground"
                  placeholder="you@example.com"
                />
              </motion.div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Step 2 of 2
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Secure your account
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a strong password
              </p>
            </div>

            <div>
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
            </div>

            <div>
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
                  onChange={e =>
                    updateFormData("confirmPassword", e.target.value)
                  }
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
            </div>
          </div>
        );
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
                formData.role === "CUSTOMER"
                  ? "border-primary bg-accent/50 shadow-sm"
                  : "border-border hover:border-primary/50 bg-background"
              }`}
            >
              <motion.div
                animate={{
                  scale: formData.role === "CUSTOMER" ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <UserIcon
                  className={`w-6 h-6 mx-auto mb-2 transition-colors ${
                    formData.role === "CUSTOMER"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </motion.div>
              <div
                className={`text-sm font-semibold mb-1 transition-colors text-center ${
                  formData.role === "CUSTOMER"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                Client
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Seek legal help
              </div>
              {formData.role === "CUSTOMER" && (
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
                formData.role === "ATTORNEY"
                  ? "border-primary bg-accent/50 shadow-sm"
                  : "border-border hover:border-primary/50 bg-background"
              }`}
            >
              <motion.div
                animate={{
                  scale: formData.role === "ATTORNEY" ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Scale
                  className={`w-6 h-6 mx-auto mb-2 transition-colors ${
                    formData.role === "ATTORNEY"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </motion.div>
              <div
                className={`text-sm font-semibold mb-1 transition-colors text-center ${
                  formData.role === "ATTORNEY"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                Attorney
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Provide services
              </div>
              {formData.role === "ATTORNEY" && (
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
          {formData.role === "CUSTOMER" ? (
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
          Create Your Account
        </h2>
        <p className="text-muted-foreground">Join us and get started today</p>
      </motion.div>

      {/* Main Layout - Two Column Grid */}
      <div className="grid md:grid-cols-[35%_65%] gap-8">
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
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
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

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              <AnimatePresence>
                {step > 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      onClick={handleBack}
                      className="w-full bg-background border-2 border-border text-foreground hover:bg-muted transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {step < 2 ? (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1"
                >
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className="flex-1"
                >
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    disabled={isLoading}
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
                  </Button>
                </motion.div>
              )}
            </div>
          </form>

          {/* Login Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
      </div>
    </div>
  );
}
