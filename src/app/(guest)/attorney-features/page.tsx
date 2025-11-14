"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Scale,
  FileText,
  Shield,
  Users,
  Lock,
  CheckCircle,
  ArrowRight,
  Gavel,
  BarChart3,
  Award,
  Building,
} from "lucide-react";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "core" | "advanced" | "premium" | "integration";
  isFree: boolean;
  isLimited: boolean;
  features: string[];
  pricing?: {
    free: string;
    paid: string;
  };
  tooltip: string;
}

const attorneyFeatures: Feature[] = [
  {
    id: "grand-wizard",
    name: "Grand Wizard",
    description: "Advanced AI-powered document processing and legal analysis",
    icon: FileText,
    category: "core",
    isFree: false,
    isLimited: false,
    features: [
      "Advanced document processing",
      "Multi-file analysis",
      "AI-powered legal insights",
      "OneDrive integration",
      "Query history tracking",
      "Real-time processing",
      "Comprehensive reports",
      "Export capabilities",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "Professional-grade document analysis interface exclusively for lawyers. Process multiple documents, search across files, track query history, and get comprehensive legal insights with our advanced AI-powered analysis tools.",
  },
  {
    id: "docket-genie",
    name: "Docket Genie",
    description: "PACER integration for federal court docket research",
    icon: Gavel,
    category: "premium",
    isFree: false,
    isLimited: false,
    features: [
      "PACER case search",
      "Docket sheet access",
      "Document retrieval",
      "Party information",
      "Filing history",
      "Cost tracking",
      "Bulk operations",
      "Search filters",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "PACER integration for federal court docket research. Search cases, access docket sheets, retrieve documents, and track costs with professional-grade court research tools.",
  },
  {
    id: "query-analytics",
    name: "Query History & Analytics",
    description: "Track and analyze your legal research and queries",
    icon: BarChart3,
    category: "advanced",
    isFree: false,
    isLimited: false,
    features: [
      "Query history tracking",
      "Analytics dashboard",
      "Usage statistics",
      "Trend analysis",
      "Search history",
      "Performance metrics",
      "Export reports",
      "Advanced filtering",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "Track and analyze your legal research and queries. Get insights into your practice patterns, usage statistics, and performance metrics with comprehensive analytics tools.",
  },
  {
    id: "attorney-directory",
    name: "Attorney Directory",
    description: "Connect with clients and other legal professionals",
    icon: Users,
    category: "core",
    isFree: false,
    isLimited: false,
    features: [
      "Professional profiles",
      "Client management",
      "Consultation requests",
      "Messaging system",
      "Specialty filtering",
      "Availability status",
      "Rating system",
      "Connection tracking",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "Connect with clients and other legal professionals. Manage your professional network, handle consultation requests, and build your practice with comprehensive directory tools.",
  },
  {
    id: "miniverse",
    name: "Miniverse",
    description: "3D visualization of legal concepts and case relationships",
    icon: Building,
    category: "premium",
    isFree: false,
    isLimited: false,
    features: [
      "3D legal visualization",
      "Case relationship mapping",
      "Interactive exploration",
      "Concept connections",
      "Visual analytics",
      "Immersive experience",
      "Custom views",
      "Export visuals",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "3D visualization of legal concepts and case relationships. Explore complex legal relationships through immersive 3D visualization and interactive case mapping tools.",
  },
];

export default function AttorneyFeaturesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = useCallback(() => {
    router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Professional Services
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Attorney-grade AI tools designed to enhance legal practice
              efficiency, client service, and professional excellence
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge
                variant="secondary"
                className="text-sm px-4 py-2 bg-background/20 backdrop-blur-sm"
              >
                <Scale className="w-4 h-4 mr-2" />
                Bar Compliance
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm px-4 py-2 bg-background/20 backdrop-blur-sm"
              >
                <Shield className="w-4 h-4 mr-2" />
                Secure & Confidential
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm px-4 py-2 bg-background/20 backdrop-blur-sm"
              >
                <Award className="w-4 h-4 mr-2" />
                Bar Certified
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {attorneyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg ${
                          feature.category === "premium"
                            ? "bg-accent/20"
                            : feature.category === "advanced"
                              ? "bg-primary/10"
                              : "bg-primary/10"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            feature.category === "premium"
                              ? "text-accent-foreground"
                              : "text-primary"
                          }`}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        {session && session.user?.role === "ATTORNEY" && (
                          <Badge
                            variant="outline"
                            className="border-accent-200 text-accent"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        )}
                        {!session && (
                          <Badge
                            variant="outline"
                            className="border-muted-foreground"
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            Login Required
                          </Badge>
                        )}
                        {feature.category === "premium" && (
                          <Badge
                            variant="outline"
                            className="border-accent-200 text-accent text-xs"
                          >
                            <Award className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-2xl mb-2">
                      {feature.name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                        Key Features
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {feature.features.slice(0, 6).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary" />
                            <span className="text-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t">
                      {session ? (
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-primary/80"
                          onClick={() => router.push("/auth/login")}
                        >
                          Access Feature
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-primary/80"
                          onClick={handleSignIn}
                        >
                          Sign In to Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 md:mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-8 md:py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Enhance Your Practice?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join legal professionals who trust AI Law Wizard for their
                practice management. Get instant access to attorney-grade tools
                and features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleSignIn}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/auth/register")}
                >
                  Create Attorney Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
