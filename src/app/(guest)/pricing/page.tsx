"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Crown,
  Zap,
  Shield,
  Users,
  FileText,
  BarChart3,
  Building,
  Gavel,
  ArrowRight,
  Star,
  Gift,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PricingComparison } from "./components/PricingComparison";
import { PricingCalculator } from "./components/PricingCalculator";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceInCents: number;
  description?: string;
  isActive: boolean;
  RolePricing: RolePricing[];
}

interface RolePricing {
  id: string;
  role: "ATTORNEY" | "CUSTOMER";
  priceInCents: number;
  isActive: boolean;
}

interface PricingData {
  packages: TokenPackage[];
  attorneyFeatures: string[];
  clientFeatures: string[];
}

export default function PricingPage() {
  const { data: session } = useSession();
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"ATTORNEY" | "CUSTOMER">(
    "CUSTOMER"
  );

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      setError(null);

      
      // TODO: Implement proper token package seeding/management system
      // This should replace the mock data with real database integration
      // Fetch token packages from backend
      const packagesResponse = await fetch("/api/pricing/packages");
      if (!packagesResponse.ok) {
        throw new Error("Failed to fetch pricing packages");
      }
      const responseData = await packagesResponse.json();
      
      // Extract packages array from response (API returns { packages: [...] })
      const packages = Array.isArray(responseData.packages) 
        ? responseData.packages 
        : Array.isArray(responseData) 
        ? responseData 
        : [];

      // Define feature lists for each role
      const attorneyFeatures = [
        "Advanced Document Analysis",
        "PACER Integration (Docket Genie)",
        "Query History & Analytics",
        "Attorney Directory Access",
        "3D Legal Visualization (Miniverse)",
        "Unlimited Token Usage",
        "Priority Support",
        "Advanced AI Models",
      ];

      const clientFeatures = [
        "Legal Consultation",
        "Attorney Directory Access",
        "Document Analysis",
        "Legal Research",
        "Basic AI Chat",
        "Email Support",
        "Mobile App Access",
        "Secure Communication",
      ];

      setPricingData({
        packages: packages.filter((pkg: TokenPackage) => pkg.isActive),
        attorneyFeatures,
        clientFeatures,
      });
    } catch (err) {
      console.error("Error fetching pricing data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pricing information"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    if (!session) {
      window.location.href = "/api/auth/signin";
    }
  };

  const handleSelectPackage = (pkg: TokenPackage) => {
    if (!session) {
      handleSignIn();
      return;
    }
    // Redirect to purchase flow
    window.location.href = `/purchase?package=${pkg.id}&role=${selectedRole}`;
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-background"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground">Loading pricing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-background"
      >
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!pricingData) {
    return null;
  }

  const { packages, attorneyFeatures, clientFeatures } = pricingData;

  return (
    <div
      className="min-h-screen bg-background"
    >
      {/* Header Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Legal Solution
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Professional legal tools and AI-powered assistance tailored for
              attorneys and clients
            </p>

            {/* Role Selection */}
            <div className="flex justify-center mb-8">
              <Tabs
                value={selectedRole}
                onValueChange={value =>
                  setSelectedRole(value as "ATTORNEY" | "CUSTOMER")
                }
              >
                <TabsList className="bg-background/20 backdrop-blur-sm">
                  <TabsTrigger
                    value="CUSTOMER"
                    className="data-[state=active]:bg-background data-[state=active]:text-primary"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Client Plans
                  </TabsTrigger>
                  <TabsTrigger
                    value="ATTORNEY"
                    className="data-[state=active]:bg-background data-[state=active]:text-primary"
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    Attorney Plans
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <PricingComparison
            packages={packages}
            role={selectedRole}
            onSelectPackage={handleSelectPackage as any}
            isAuthenticated={!!session}
            onSignIn={handleSignIn}
          />
        </div>
      </div>

      {/* Pricing Calculator */}
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <PricingCalculator role={selectedRole} />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-foreground"
            >
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3
                  className="text-foreground"
                >
                  How do tokens work?
                </h3>
                <p className="text-muted-foreground">
                  Tokens are consumed when you use AI-powered features like
                  document analysis, legal research, or consultation requests.
                  Each feature has a specific token cost, and you only pay for
                  what you use.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3
                  className="text-foreground"
                >
                  Do tokens expire?
                </h3>
                <p className="text-muted-foreground">
                  No, your tokens never expire. You can use them at your own
                  pace, whether that&apos;s over days, weeks, or months.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3
                  className="text-foreground"
                >
                  Can I switch between attorney and client plans?
                </h3>
                <p className="text-muted-foreground">
                  Yes, you can purchase tokens for either role. However,
                  you&apos;ll need to have the appropriate role assigned to your
                  account to access role-specific features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3
                  className="text-foreground"
                >
                  What payment methods do you accept?
                </h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards through our secure Stripe
                  payment system. All transactions are encrypted and secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of legal professionals and clients who trust our
              platform
            </p>
            <Button
              onClick={handleSignIn}
              size="lg"
              className="bg-background text-primary hover:bg-muted px-8 py-3 text-lg"
            >
              {session ? "View Dashboard" : "Sign Up Now"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
