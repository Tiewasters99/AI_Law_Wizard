"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  CreditCard,
  Shield,
  ArrowLeft,
  Loader2,
  AlertCircle,
  DollarSign,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { colors } from "@/lib/frontend/designSystem";

interface PurchaseData {
  packageId: string;
  packageName: string;
  tokens: number;
  priceInCents: number;
  role: string;
  userId: string;
  walletId: string;
}

export default function PurchasePage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const packageId = searchParams.get("package");
  const role = searchParams.get("role");

  const preparePurchase = useCallback(async () => {
    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to prepare purchase");
      }

      setPurchaseData(data.purchase);
    } catch (err) {
      console.error("Purchase preparation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to prepare purchase"
      );
    } finally {
      setLoading(false);
    }
  }, [packageId, role]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    if (!packageId || !role) {
      setError("Invalid purchase parameters");
      setLoading(false);
      return;
    }

    preparePurchase();
  }, [session, status, packageId, role, preparePurchase, router]);

  const handlePurchase = async () => {
    if (!purchaseData) return;

    setProcessing(true);

    try {
      // In a real implementation, this would redirect to Stripe Checkout
      // For now, we'll simulate the purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to success page or dashboard
      router.push("/dashboard?purchase=success");
    } catch (err) {
      console.error("Purchase error:", err);
      setError("Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: colors.primary[600] }}
          />
          <p style={{ color: colors.text }}>Preparing your purchase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="max-w-md w-full mx-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => router.push("/pricing")}
            className="w-full mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
        </div>
      </div>
    );
  }

  if (!purchaseData) {
    return null;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Complete Your Purchase
            </h1>
            <p className="text-gray-600">
              Review your order and proceed with secure payment
            </p>
          </motion.div>

          {/* Purchase Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {purchaseData.packageName}
                  </span>
                  <Badge variant="outline">{purchaseData.role}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Tokens included:</span>
                  <span className="font-medium">
                    {purchaseData.tokens.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Price:</span>
                  <span className="font-medium">
                    ${formatPrice(purchaseData.priceInCents)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span style={{ color: colors.primary[600] }}>
                      ${formatPrice(purchaseData.priceInCents)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: colors.primary[50] }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Secure Payment</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your payment is processed securely through Stripe. We
                      never store your payment information.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>SSL encrypted connection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>PCI DSS compliant</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Instant token delivery</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4"
          >
            <Button
              onClick={() => router.push("/pricing")}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </Button>

            <Button
              onClick={handlePurchase}
              disabled={processing}
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay ${formatPrice(purchaseData.priceInCents)}
                </>
              )}
            </Button>
          </motion.div>

          {/* Development Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Development Mode:</strong> This is a demo purchase flow.
                In production, this would integrate with Stripe for secure
                payment processing.
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
