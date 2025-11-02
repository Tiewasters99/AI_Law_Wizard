"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Users,
  Scale,
} from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsage: number;
  limit: number;
  feature: "home" | "directory" | "attorney-features";
}

// Benefits array - moved outside component
const BENEFITS = [
  "5,000 tokens after sign-up",
  "Access to all AI features",
  "Save conversation history",
  "Priority support",
  "Advanced document analysis",
  "No daily limits",
];

export default function UpgradeModal({
  isOpen,
  onClose,
  currentUsage,
  limit,
  feature,
}: UpgradeModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"limit" | "role">("limit");
  const [selectedRole, setSelectedRole] = useState<
    "ATTORNEY" | "CUSTOMER" | null
  >(null);

  const percentage = useMemo(
    () => (currentUsage / limit) * 100,
    [currentUsage, limit]
  );
  const showBothRoles = useMemo(
    () => feature === "home" || feature === "directory",
    [feature]
  );

  const handleContinue = useCallback(() => {
    if (showBothRoles) {
      setStep("role");
    } else {
      // Attorney features only - go directly to sign-up with ATTORNEY role
      router.push(`/auth?role=ATTORNEY&feature=${feature}`);
    }
  }, [showBothRoles, router, feature]);

  const handleRoleSelect = useCallback(
    (role: "ATTORNEY" | "CUSTOMER") => {
      setSelectedRole(role);
      router.push(`/auth?role=${role}&feature=${feature}`);
    },
    [router, feature]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <AnimatePresence mode="wait">
          {step === "limit" && (
            <motion.div
              key="limit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <DialogTitle className="text-2xl text-center">
                  Token Limit Reached
                </DialogTitle>
                <DialogDescription className="text-center text-base">
                  You&apos;ve used all your available tokens. Sign up to
                  continue with 5,000 free tokens!
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Usage Display */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Current Usage
                        </span>
                        <span className="text-lg font-bold text-foreground">
                          {currentUsage.toLocaleString()} /{" "}
                          {limit.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        You&apos;ve reached your anonymous usage limit
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                    What you get with a free account:
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {BENEFITS.map((benefit, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleContinue}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Continue with Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  No credit card required • Get 5,000 free tokens
                </p>
              </div>
            </motion.div>
          )}

          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl text-center">
                  Choose Your Role
                </DialogTitle>
                <DialogDescription className="text-center text-base">
                  Select the role that best describes you to get started
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 mt-6">
                {/* Attorney Option */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedRole === "ATTORNEY" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleRoleSelect("ATTORNEY")}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Scale className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Attorney</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Legal professional seeking advanced tools and features
                    </p>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/20"
                    >
                      Professional Tools
                    </Badge>
                  </CardContent>
                </Card>

                {/* Customer Option */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedRole === "CUSTOMER" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleRoleSelect("CUSTOMER")}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Client</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Individual seeking legal guidance and document help
                    </p>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/20"
                    >
                      Legal Assistance
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={() => setStep("limit")}
                variant="ghost"
                className="w-full mt-4"
              >
                Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
