"use client";

import React from "react";
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
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RolePricing {
  id: string;
  role: "ATTORNEY" | "CUSTOMER";
  priceInCents: number;
  isActive: boolean;
}

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  description?: string;
  isActive: boolean;
  RolePricing: RolePricing[];
}

interface PricingComparisonProps {
  packages: TokenPackage[];
  role: "ATTORNEY" | "CUSTOMER";
  onSelectPackage: (pkg: TokenPackage) => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
}

export function PricingComparison({
  packages,
  role,
  onSelectPackage,
  isAuthenticated,
  onSignIn,
}: PricingComparisonProps) {
  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  const getRoleFeatures = (role: "ATTORNEY" | "CUSTOMER") => {
    if (role === "ATTORNEY") {
      return [
        "Advanced Document Analysis",
        "PACER Integration (Docket Genie)",
        "Query History & Analytics",
        "Attorney Directory Access",
        "3D Legal Visualization (Miniverse)",
        "Unlimited Token Usage",
        "Priority Support",
        "Advanced AI Models",
      ];
    } else {
      return [
        "Legal Consultation",
        "Attorney Directory Access",
        "Document Analysis",
        "Legal Research",
        "Basic AI Chat",
        "Email Support",
        "Mobile App Access",
        "Secure Communication",
      ];
    }
  };

  const features = getRoleFeatures(role);

  return (
    <div className="space-y-8">
      {/* Features Overview */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          {role === "ATTORNEY"
            ? "Professional Attorney Tools"
            : "Client Legal Services"}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {role === "ATTORNEY"
            ? "Advanced legal technology designed for practicing attorneys"
            : "Comprehensive legal assistance for individuals and businesses"}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.slice(0, 8).map((feature, index) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="text-center p-4 rounded-lg bg-accent/50"
          >
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center bg-accent">
              {role === "ATTORNEY" ? (
                index === 0 ? (
                  <FileText className="w-5 h-5 text-primary" />
                ) : index === 1 ? (
                  <Gavel className="w-5 h-5 text-primary" />
                ) : index === 2 ? (
                  <BarChart3 className="w-5 h-5 text-primary" />
                ) : index === 3 ? (
                  <Users className="w-5 h-5 text-primary" />
                ) : index === 4 ? (
                  <Building className="w-5 h-5 text-primary" />
                ) : index === 5 ? (
                  <Zap className="w-5 h-5 text-primary" />
                ) : index === 6 ? (
                  <Shield className="w-5 h-5 text-primary" />
                ) : (
                  <Crown className="w-5 h-5 text-primary" />
                )
              ) : index === 0 ? (
                <Users className="w-5 h-5 text-primary" />
              ) : index === 1 ? (
                <Users className="w-5 h-5 text-primary" />
              ) : index === 2 ? (
                <FileText className="w-5 h-5 text-primary" />
              ) : index === 3 ? (
                <BarChart3 className="w-5 h-5 text-primary" />
              ) : index === 4 ? (
                <Zap className="w-5 h-5 text-primary" />
              ) : index === 5 ? (
                <Shield className="w-5 h-5 text-primary" />
              ) : index === 6 ? (
                <Users className="w-5 h-5 text-primary" />
              ) : (
                <Shield className="w-5 h-5 text-primary" />
              )}
            </div>
            <h3 className="font-semibold text-sm text-foreground">{feature}</h3>
          </motion.div>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages
          .filter(pkg => {
            // Only show packages with pricing for the selected role
            return pkg.RolePricing?.some(rp => rp.role === role && rp.isActive);
          })
          .map((pkg, index) => {
            const isPopular = index === 1; // Mark middle package as popular
            const rolePricing = pkg.RolePricing?.find(
              rp => rp.role === role && rp.isActive
            );
            const priceInCents = rolePricing?.priceInCents || 0;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="relative"
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`h-full transition-all duration-300 hover:shadow-lg ${
                    isPopular ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {pkg.name}
                    </CardTitle>
                    <div className="mt-4">
                      <div className="text-3xl font-bold text-primary">
                        ${formatPrice(priceInCents)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {pkg.tokens.toLocaleString()} tokens
                      </div>
                      {pkg.RolePricing && pkg.RolePricing.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {role === "ATTORNEY" ? "Attorney" : "Client"} pricing
                        </div>
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {pkg.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-chart-1 mr-2 flex-shrink-0" />
                        <span>
                          {pkg.tokens.toLocaleString()} tokens included
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-chart-1 mr-2 flex-shrink-0" />
                        <span>All {role.toLowerCase()} features</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-chart-1 mr-2 flex-shrink-0" />
                        <span>Priority support</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-chart-1 mr-2 flex-shrink-0" />
                        <span>No expiration date</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => onSelectPackage(pkg)}
                      className={`w-full ${
                        isPopular ? "bg-primary hover:bg-primary/90" : ""
                      }`}
                      size="lg"
                      disabled={!isAuthenticated}
                    >
                      {isAuthenticated ? (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Purchase Now
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Sign Up to Purchase
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Additional Info */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 p-4 rounded-lg bg-accent/50">
          <AlertCircle className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground">
            Tokens never expire • Pay only for what you use • Secure payment
            processing
          </span>
        </div>
      </div>
    </div>
  );
}
