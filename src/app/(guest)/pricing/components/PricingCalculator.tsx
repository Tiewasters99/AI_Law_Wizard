"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  FileText,
  MessageSquare,
  Search,
  BarChart3,
  Users,
  Zap,
  DollarSign,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface TokenCost {
  feature: string;
  costPerUse: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface FeaturePricing {
  id: string;
  feature: string;
  displayName: string;
  tokens: number;
  role: "ATTORNEY" | "CUSTOMER" | null;
  description?: string | null;
  isActive: boolean;
}

interface PricingCalculatorProps {
  role: "ATTORNEY" | "CUSTOMER";
  featurePricing?: FeaturePricing[];
}

export function PricingCalculator({
  role,
  featurePricing = [],
}: PricingCalculatorProps) {
  const [usage, setUsage] = useState({
    documentAnalysis: 0,
    consultations: 0,
    research: 0,
    analytics: 0,
    directory: 0,
    chat: 0,
  });

  const [totalCost, setTotalCost] = useState(0);
  const [recommendedPackage, setRecommendedPackage] = useState<string>("");

  // Map feature pricing from database to calculator format
  const tokenCosts: TokenCost[] = useMemo(() => {
    const featureMap: Map<string, TokenCost> = new Map();

    // Feature icon mapping
    const iconMap: Record<
      string,
      React.ComponentType<{ className?: string }>
    > = {
      "document-assistant": FileText,
      "document-analysis": FileText,
      wizard: MessageSquare,
      "grand-wizard": MessageSquare,
      "legal-research": Search,
      "consultation-request": MessageSquare,
      analytics: BarChart3,
      directory: Users,
      chat: Zap,
    };

    // Add features from database
    featurePricing
      .filter(fp => (fp.role === role || fp.role === null) && fp.isActive)
      .forEach(fp => {
        const key = fp.feature.toLowerCase();
        const icon = iconMap[key] || Zap;

        if (!featureMap.has(key)) {
          featureMap.set(key, {
            feature: fp.displayName,
            costPerUse: fp.tokens,
            icon,
            description: fp.description || `${fp.displayName} feature`,
          });
        }
      });

    // Fallback defaults if no pricing found
    if (featureMap.size === 0) {
      return [
        {
          feature: "Document Analysis",
          costPerUse: role === "ATTORNEY" ? 5 : 3,
          icon: FileText,
          description: "AI-powered document review and analysis",
        },
        {
          feature: "Legal Consultations",
          costPerUse: role === "ATTORNEY" ? 10 : 5,
          icon: MessageSquare,
          description: "Professional legal consultation sessions",
        },
        {
          feature: "Legal Research",
          costPerUse: role === "ATTORNEY" ? 3 : 2,
          icon: Search,
          description: "Case law and statute research",
        },
        {
          feature: "Analytics & Reports",
          costPerUse: role === "ATTORNEY" ? 2 : 1,
          icon: BarChart3,
          description: "Usage analytics and performance reports",
        },
        {
          feature: "Directory Access",
          costPerUse: 1,
          icon: Users,
          description: "Attorney/client directory searches",
        },
        {
          feature: "AI Chat",
          costPerUse: role === "ATTORNEY" ? 5 : 2,
          icon: Zap,
          description: "General AI-powered chat interactions",
        },
      ];
    }

    return Array.from(featureMap.values());
  }, [role, featurePricing]);

  useEffect(() => {
    const total = Object.entries(usage).reduce((sum, [key, value]) => {
      const cost = tokenCosts.find(
        tc => tc.feature.toLowerCase().replace(/\s+/g, "") === key.toLowerCase()
      );
      return sum + (cost ? cost.costPerUse * value : 0);
    }, 0);

    setTotalCost(total);

    // Recommend package based on usage
    if (total <= 50) {
      setRecommendedPackage("Starter");
    } else if (total <= 200) {
      setRecommendedPackage("Professional");
    } else {
      setRecommendedPackage("Enterprise");
    }
  }, [usage, tokenCosts]);

  const handleUsageChange = (feature: string, value: number) => {
    setUsage(prev => ({
      ...prev,
      [feature]: value,
    }));
  };

  const resetCalculator = () => {
    setUsage({
      documentAnalysis: 0,
      consultations: 0,
      research: 0,
      analytics: 0,
      directory: 0,
      chat: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Token Usage Calculator
        </h2>
        <p className="text-muted-foreground">
          Estimate your monthly token usage and find the perfect package
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Monthly Usage Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {tokenCosts.map((cost, index) => {
              const featureKey = cost.feature.toLowerCase().replace(/\s+/g, "");
              const currentUsage = usage[featureKey as keyof typeof usage];

              return (
                <motion.div
                  key={cost.feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <cost.icon className="w-4 h-4 text-primary" />
                      <Label className="font-medium">{cost.feature}</Label>
                    </div>
                    <Badge variant="outline">
                      {cost.costPerUse} tokens/use
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{cost.description}</span>
                      <span>{currentUsage} uses</span>
                    </div>

                    <Slider
                      value={[currentUsage]}
                      onValueChange={(values: number[]) =>
                        handleUsageChange(featureKey, values[0])
                      }
                      max={50}
                      step={1}
                      className="w-full"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>50</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <div className="pt-4 border-t">
              <Button
                onClick={resetCalculator}
                variant="outline"
                className="w-full"
              >
                Reset Calculator
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Estimated Monthly Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center p-6 rounded-lg bg-accent/50"
            >
              <div className="text-4xl font-bold mb-2 text-primary">
                {totalCost} tokens
              </div>
              <div className="text-lg text-muted-foreground">
                ≈ ${(totalCost * 0.1).toFixed(2)}/month
              </div>
            </motion.div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">
                Recommended Package
              </h3>

              <div className="text-center p-6 rounded-lg bg-accent/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {recommendedPackage} Package
                  </span>
                  <Badge className="bg-primary">Recommended</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Best value for your estimated usage
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground">
                  Usage Breakdown
                </h4>
                {Object.entries(usage).map(([key, value]) => {
                  const cost = tokenCosts.find(
                    tc =>
                      tc.feature.toLowerCase().replace(/\s+/g, "") ===
                      key.toLowerCase()
                  );
                  if (!cost || value === 0) return null;

                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {cost.feature}
                      </span>
                      <span>
                        {value} × {cost.costPerUse} = {value * cost.costPerUse}{" "}
                        tokens
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-accent/50">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-chart-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-foreground">
                  <strong>Note:</strong> This is an estimate. Actual usage may
                  vary based on document complexity and feature usage patterns.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
