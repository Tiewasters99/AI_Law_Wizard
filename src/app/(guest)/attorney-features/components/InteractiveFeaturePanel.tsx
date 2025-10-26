"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { colors } from "@/lib/frontend/designSystem";
import { X, Lock, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

interface InteractiveFeaturePanelProps {
  isOpen: boolean;
  onClose: () => void;
  featureId: string;
  featureName: string;
  featureDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  isFree: boolean;
  isLimited: boolean;
  onUpgrade: () => void;
  children?: React.ReactNode;
}

export function InteractiveFeaturePanel({
  isOpen,
  onClose,
  featureId,
  featureName,
  featureDescription,
  icon: Icon,
  isFree,
  isLimited,
  onUpgrade,
  children,
}: InteractiveFeaturePanelProps) {
  const { data: session } = useSession();
  const [triesUsed, setTriesUsed] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const MAX_FREE_TRIES = 1;

  useEffect(() => {
    // Load tries from localStorage for guests
    if (!session) {
      const storedTries = localStorage.getItem(
        `attorney_feature_${featureId}_tries`
      );
      if (storedTries) {
        setTriesUsed(parseInt(storedTries, 10));
      }
    }
  }, [featureId, session, isOpen]);

  const handleFeatureUse = () => {
    if (!session) {
      const newTriesUsed = triesUsed + 1;
      setTriesUsed(newTriesUsed);
      localStorage.setItem(
        `attorney_feature_${featureId}_tries`,
        newTriesUsed.toString()
      );

      // Show login prompt after first successful use
      if (newTriesUsed === 1) {
        setShowLoginPrompt(true);
      }
    }
  };

  const canUseFreebie = !session && triesUsed < 1;
  const isAttorney = session?.user?.role === "ATTORNEY";
  const remainingTries = 1 - triesUsed;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Panel Header */}
            <div
              className="text-white p-4 sm:p-6 flex-shrink-0"
              style={{
                background: "linear-gradient(to right, #2563eb, #1e40af)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div
                    className="p-2 rounded-lg backdrop-blur-sm flex-shrink-0"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
                      {featureName}
                    </h2>
                    <p className="text-blue-100 text-xs sm:text-sm truncate">
                      {featureDescription}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {!session && triesUsed === 0 && (
                  <Badge
                    className="text-white"
                    style={{ backgroundColor: colors.success[600] }}
                  >
                    Free Trial - 1 Demo
                  </Badge>
                )}
                {!session && triesUsed >= 1 && (
                  <Badge
                    className="text-white"
                    style={{ backgroundColor: colors.accent[600] }}
                  >
                    Trial Used - Sign In for More
                  </Badge>
                )}
                {isAttorney && (
                  <Badge
                    className="text-white"
                    style={{ backgroundColor: colors.primary[600] }}
                  >
                    Unlimited Access
                  </Badge>
                )}
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Usage Notice for Guests */}
              {!session && canUseFreebie && (
                <div
                  className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg"
                  style={{
                    backgroundColor: colors.success[50],
                    border: `1px solid ${colors.success[200]}`,
                  }}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-green-900 mb-1 text-sm sm:text-base">
                        Try This Feature Free
                      </h3>
                      <p className="text-xs sm:text-sm text-green-700 mb-3">
                        Experience this professional feature with one free demo.
                        Sign in as an attorney for unlimited access.
                      </p>
                      <Button
                        onClick={onUpgrade}
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white text-xs sm:text-sm"
                      >
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Sign In to Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Feature Component */}
              {canUseFreebie || isAttorney ? (
                <div
                  className="rounded-lg p-4 sm:p-6 min-h-[300px] sm:min-h-[400px]"
                  style={{ backgroundColor: colors.background }}
                >
                  {children}
                </div>
              ) : (
                <div
                  className="rounded-lg p-4 sm:p-8 min-h-[300px] sm:min-h-[400px] flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(to bottom right, rgba(239, 246, 255, 0.8), rgba(219, 234, 254, 0.8))",
                  }}
                >
                  <div className="text-center max-w-md px-4">
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                      style={{ backgroundColor: colors.primary[100] }}
                    >
                      <Lock
                        className="w-8 h-8 sm:w-10 sm:h-10"
                        style={{ color: colors.primary[600] }}
                      />
                    </div>
                    <h3
                      className="text-lg sm:text-xl lg:text-2xl font-bold mb-3"
                      style={{ color: colors.text }}
                    >
                      Continue as an Attorney
                    </h3>
                    <p
                      className="text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed"
                      style={{ color: colors.secondary[600] }}
                    >
                      You&apos;ve completed your free trial. Sign in or create
                      an attorney account to unlock unlimited access, advanced
                      features, and professional legal tools.
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={onUpgrade}
                        className="w-full shadow-lg text-white text-sm sm:text-base"
                        style={{
                          background:
                            "linear-gradient(to right, #2563eb, #1e40af)",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        size="lg"
                      >
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Sign In as Attorney
                      </Button>
                      <p
                        className="text-xs"
                        style={{ color: colors.secondary[500] }}
                      >
                        Get unlimited access to all professional legal features
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div
              className="p-3 sm:p-4 border-t flex-shrink-0"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.secondary[200],
              }}
            >
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="text-sm"
                  style={{
                    borderColor: colors.secondary[300],
                    color: colors.text,
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
