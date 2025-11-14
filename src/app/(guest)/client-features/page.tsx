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
import { colors } from "@/lib/frontend/designSystem";
import {
  MessageSquare,
  Users,
  FileText,
  Shield,
  Lock,
  CheckCircle,
  ArrowRight,
  Award,
  BookOpen,
} from "lucide-react";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "core" | "advanced" | "premium";
  isFree: boolean;
  isLimited: boolean;
  isTryable: boolean;
  features: string[];
  pricing?: {
    free: string;
    paid: string;
  };
  tooltip: string;
}

const clientFeatures: Feature[] = [
  {
    id: "legal-consultation",
    name: "Legal Consultation",
    description: "Professional AI-powered legal consultation and guidance",
    icon: MessageSquare,
    category: "core",
    isFree: false,
    isLimited: false,
    isTryable: false,
    features: [
      "Real-time legal consultation",
      "Multiple consultation types",
      "Professional legal guidance",
      "Secure communication",
      "Case analysis and insights",
      "Legal document review",
      "Risk assessment",
      "Professional recommendations",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Unlimited consultations with subscription",
    },
    tooltip:
      "Get instant professional legal guidance through our AI-powered consultation system. Ask questions, get case analysis, and receive professional recommendations tailored to your legal needs.",
  },
  {
    id: "attorney-directory",
    name: "Attorney Directory",
    description: "Find and connect with qualified legal professionals",
    icon: Users,
    category: "core",
    isFree: false,
    isLimited: false,
    isTryable: false,
    features: [
      "Verified attorney profiles",
      "Specialty-based search",
      "Location filtering",
      "Consultation requests",
      "Attorney ratings and reviews",
      "Availability checking",
      "Direct messaging",
      "Case matching",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Full access with subscription",
    },
    tooltip:
      "Browse our comprehensive directory of verified attorneys. Search by specialty, location, and availability. Read reviews, check credentials, and request consultations directly.",
  },
  {
    id: "document-analysis",
    name: "Document Analysis",
    description: "Professional document review and analysis services",
    icon: FileText,
    category: "advanced",
    isFree: false,
    isLimited: false,
    isTryable: false,
    features: [
      "Contract review",
      "Legal document analysis",
      "Risk assessment",
      "Professional recommendations",
      "Document comparison",
      "Clause analysis",
      "Compliance checking",
      "Export reports",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Full access with subscription",
    },
    tooltip:
      "Upload your legal documents for professional analysis. Get detailed reviews, risk assessments, and professional recommendations from our AI-powered analysis system.",
  },
  {
    id: "legal-research",
    name: "Legal Research",
    description: "Comprehensive legal research and case law analysis",
    icon: BookOpen,
    category: "core",
    isFree: false,
    isLimited: false,
    isTryable: false,
    features: [
      "Case law research",
      "Statute analysis",
      "Legal precedent review",
      "Research documentation",
      "Citation tracking",
      "Legal database access",
      "Research summaries",
      "Export capabilities",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Unlimited research with subscription",
    },
    tooltip:
      "Access comprehensive legal research tools. Search case law, analyze statutes, and get detailed legal precedents with professional-grade research capabilities.",
  },
];

export default function ClientFeaturesPage() {
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
              Client Services
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Comprehensive legal support and professional AI-powered tools
              designed to help you navigate your legal needs with confidence
            </p>
            <div className="flex flex-wrap justify-center gap-4">
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
                <CheckCircle className="w-4 h-4 mr-2" />
                Professional Grade
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {clientFeatures.map((feature, index) => {
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
                      {session && session.user?.role === "CUSTOMER" && (
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
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 md:mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-8 md:py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of clients who trust AI Law Wizard for their
                legal needs. Get instant access to professional legal services.
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
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
