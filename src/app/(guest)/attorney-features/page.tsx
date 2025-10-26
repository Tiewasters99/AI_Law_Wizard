"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
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
import { InteractiveFeaturePanel } from "./components/InteractiveFeaturePanel";
import {
  Scale,
  FileText,
  Search,
  Shield,
  Users,
  Lock,
  CheckCircle,
  ArrowRight,
  Gavel,
  Briefcase,
  BarChart3,
  Award,
  AlertCircle,
  Building,
  BookOpen,
  Play,
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
    id: "document-analysis",
    name: "Advanced Document Analysis",
    description:
      "Professional AI-powered document processing and analysis interface",
    icon: FileText,
    category: "core",
    isFree: false,
    isLimited: false,
    features: [
      "Advanced document processing interface",
      "Multi-file analysis and comparison",
      "Intelligent search across documents",
      "File management with OneDrive integration",
      "Query history and analytics",
      "Real-time processing status",
      "Comprehensive legal insights",
      "Export and reporting capabilities",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "Professional-grade document analysis interface exclusively for lawyers. Process multiple documents, search across files, track query history, and get comprehensive legal insights with our advanced AI-powered analysis tools.",
  },
  {
    id: "case-management",
    name: "Case Management",
    description: "Comprehensive case tracking and management tools",
    icon: Briefcase,
    category: "advanced",
    isFree: false,
    isLimited: false,
    features: [
      "Case timeline tracking",
      "Document organization",
      "Client communication logs",
      "Deadline management",
      "Case status updates",
      "Task automation",
      "Team collaboration tools",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "Complete case management system with timeline tracking, document organization, client communication logs, deadline management, and case status updates. Streamline your legal practice workflow with professional tools.",
  },
  {
    id: "contract-drafting",
    name: "Contract Drafting",
    description: "AI-assisted contract creation and review",
    icon: Gavel,
    category: "premium",
    isFree: false,
    isLimited: false,
    features: [
      "Professional contract templates",
      "AI-assisted drafting",
      "Advanced risk assessment",
      "Compliance verification",
      "Negotiation support",
      "Clause library and suggestions",
      "Version control and tracking",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "AI-powered contract drafting exclusively for lawyers. Access professional templates, get intelligent drafting assistance, perform risk assessments, verify compliance, and receive negotiation support to create superior contracts.",
  },
  {
    id: "legal-analytics",
    name: "Legal Analytics",
    description: "Data-driven insights for legal practice",
    icon: BarChart3,
    category: "premium",
    isFree: false,
    isLimited: false,
    features: [
      "Case outcome predictions",
      "Legal trend analysis",
      "Performance metrics",
      "Client satisfaction tracking",
      "Practice area insights",
      "Financial analytics",
      "Competitive intelligence",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "Advanced legal analytics exclusively for lawyers. Get case outcome predictions, trend analysis, performance metrics, and client satisfaction tracking. Make data-driven decisions for your legal practice with professional analytics tools.",
  },
  {
    id: "legal-research",
    name: "Advanced Legal Research",
    description: "Professional legal research and case law analysis",
    icon: Search,
    category: "advanced",
    isFree: false,
    isLimited: false,
    features: [
      "Comprehensive case law search",
      "Advanced statute research",
      "Legal precedent analysis",
      "Citation tracking and verification",
      "Jurisdiction-specific research",
      "Research history tracking",
      "Collaborative research tools",
    ],
    pricing: {
      free: "Not available for guests",
      paid: "Attorney subscription required",
    },
    tooltip:
      "Professional legal research tools exclusively for lawyers. Comprehensive case law search, statute analysis, precedent tracking, and citation management. Access advanced research capabilities to find relevant cases and legal authorities quickly and efficiently.",
  },
];

export default function AttorneyFeaturesPage() {
  const { data: session } = useSession();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSidebarDemo, setShowSidebarDemo] = useState(false);

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  const handleFeatureClick = useCallback((feature: Feature) => {
    setSelectedFeature(feature);
  }, []);

  const handleDemoClick = useCallback(() => {
    // Show sidebar demo for the first available feature
    if (attorneyFeatures.length > 0) {
      setSelectedFeature(attorneyFeatures[0]);
      setShowSidebarDemo(true);
    }
  }, []);

  const handleUpgrade = useCallback(() => {
    // Show sidebar demo for selected feature (works for both guests and authenticated users)
    if (selectedFeature) {
      setShowSidebarDemo(true);
    }
  }, [selectedFeature]);

  const handleCloseSidebarDemo = useCallback(() => {
    setShowSidebarDemo(false);
  }, []);

  const handleSignIn = useCallback(() => {
    if (!session) {
      signIn();
    }
  }, [session]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      {/* Mobile Menu Button */}
      {isMobile && !showMobileSidebar && (
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="fixed bottom-6 right-6 z-30 p-4 rounded-full shadow-xl touch-manipulation"
          style={{
            background: "linear-gradient(to right, #2563eb, #1e40af)",
            minWidth: "56px",
            minHeight: "56px",
          }}
        >
          <Image
            src="/images/logo_icon.png"
            alt="AI Wizard Logo"
            width={24}
            height={24}
          />
        </button>
      )}

      <div className="flex min-h-screen">
        {/* Desktop Sidebar - All Features */}
        {!isMobile && (
          <div
            className="w-72 border-r flex flex-col overflow-hidden"
            style={{
              backgroundColor: "rgba(248, 250, 252, 0.95)",
              borderColor: "rgba(226, 232, 240, 0.5)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Sidebar Header */}
            <div
              className="p-4 border-b"
              style={{
                borderColor: "rgba(226, 232, 240, 0.5)",
                background:
                  "linear-gradient(to right, rgba(239, 246, 255, 0.9), rgba(219, 234, 254, 0.8))",
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background: "linear-gradient(to right, #2563eb, #1e40af)",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Image
                    src="/images/logo_icon.png"
                    alt="AI Wizard Logo"
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <h1
                    className="text-base font-bold"
                    style={{ color: colors.text }}
                  >
                    Professional Services
                  </h1>
                  <p
                    className="text-xs"
                    style={{ color: colors.secondary[600] }}
                  >
                    Attorney-Grade AI Tools
                  </p>
                </div>
              </div>
            </div>

            {/* All Features Navigation */}
            <div className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
              <nav className="space-y-1">
                {attorneyFeatures.map(feature => {
                  const Icon = feature.icon;
                  const isActive = selectedFeature?.id === feature.id;

                  return (
                    <button
                      key={feature.id}
                      onClick={() => handleFeatureClick(feature)}
                      title={feature.tooltip}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left group relative transition-all touch-manipulation ${
                        isActive ? "" : ""
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: "rgba(239, 246, 255, 0.8)",
                              borderLeft: `3px solid ${colors.primary[700]}`,
                              color: colors.primary[900],
                            }
                          : {
                              minHeight: "48px",
                            }
                      }
                    >
                      <div
                        className={`p-1.5 rounded`}
                        style={{
                          backgroundColor:
                            feature.category === "premium"
                              ? colors.accent[100]
                              : feature.category === "advanced"
                                ? colors.primary[100]
                                : colors.primary[100],
                        }}
                      >
                        <span
                          style={{
                            color:
                              feature.category === "premium"
                                ? colors.accent[700]
                                : feature.category === "advanced"
                                  ? colors.primary[700]
                                  : colors.primary[700],
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden relative z-10">
                        <div className="flex items-center space-x-2">
                          <span
                            className="font-medium truncate text-sm"
                            style={{ color: "#000000" }}
                          >
                            {feature.name}
                          </span>
                          {session && session.user?.role === "ATTORNEY" && (
                            <Shield
                              className="w-3 h-3 flex-shrink-0"
                              style={{ color: colors.accent[600] }}
                            />
                          )}
                        </div>
                        <p
                          className="text-xs truncate mt-0.5"
                          style={{ color: "#374151" }}
                        >
                          {feature.description}
                        </p>
                      </div>

                      {/* Hover Background */}
                      {!isActive && (
                        <div
                          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                          }}
                        />
                      )}

                      {/* Professional Tooltip */}
                      <div
                        className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 text-xs rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs whitespace-normal shadow-lg"
                        style={{
                          backgroundColor: "rgba(30, 41, 59, 0.95)",
                          color: "white",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <div>
                          <p
                            className="font-semibold mb-1"
                            style={{ color: colors.primary[300] }}
                          >
                            {feature.name}
                          </p>
                          <p className="leading-relaxed text-white/90">
                            {feature.tooltip}
                          </p>
                        </div>
                        <div
                          className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent"
                          style={{ borderRightColor: "rgba(30, 41, 59, 0.95)" }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Professional Footer */}
            <div
              className="p-4 border-t"
              style={{
                borderColor: "rgba(226, 232, 240, 0.5)",
              }}
            >
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(239, 246, 255, 0.9)",
                  border: "1px solid rgba(59, 130, 246, 0.1)",
                }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Award
                    className="w-4 h-4"
                    style={{ color: colors.accent[600] }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: colors.text }}
                  >
                    Bar Association Certified
                  </span>
                </div>
                <p className="text-xs" style={{ color: colors.secondary[600] }}>
                  Professional-grade legal AI tools
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && showMobileSidebar && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowMobileSidebar(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 z-50"
              style={{
                backgroundColor: "rgba(248, 250, 252, 0.98)",
                borderRight: "1px solid rgba(226, 232, 240, 0.5)",
                boxShadow: "4px 0 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Mobile sidebar content - same as desktop */}
              <div className="h-full flex flex-col">
                <div
                  className="p-4 border-b"
                  style={{
                    borderColor: "rgba(226, 232, 240, 0.5)",
                    background:
                      "linear-gradient(to right, rgba(239, 246, 255, 0.9), rgba(219, 234, 254, 0.8))",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          background:
                            "linear-gradient(to right, #2563eb, #1e40af)",
                        }}
                      >
                        <Image
                          src="/images/logo_icon.png"
                          alt="AI Wizard Logo"
                          width={20}
                          height={20}
                        />
                      </div>
                      <div>
                        <h1
                          className="text-base font-bold"
                          style={{ color: colors.text }}
                        >
                          Professional Services
                        </h1>
                        <p
                          className="text-xs"
                          style={{ color: colors.secondary[600] }}
                        >
                          Attorney Tools
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMobileSidebar(false)}
                      className="p-2 rounded-lg touch-manipulation"
                      style={{
                        backgroundColor: "rgba(241, 245, 249, 0.8)",
                        minWidth: "40px",
                        minHeight: "40px",
                      }}
                    >
                      <span
                        className="text-2xl"
                        style={{ color: colors.secondary[600] }}
                      >
                        ×
                      </span>
                    </button>
                  </div>
                </div>

                {/* Feature list */}
                <div className="flex-1 p-3 overflow-y-auto">
                  <nav className="space-y-1">
                    {attorneyFeatures.map(feature => {
                      const Icon = feature.icon;
                      const isActive = selectedFeature?.id === feature.id;
                      return (
                        <button
                          key={feature.id}
                          onClick={() => {
                            handleFeatureClick(feature);
                            setShowMobileSidebar(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left group relative transition-all touch-manipulation"
                          style={
                            isActive
                              ? {
                                  backgroundColor: "rgba(239, 246, 255, 0.8)",
                                  borderLeft: `3px solid ${colors.primary[700]}`,
                                }
                              : {
                                  minHeight: "48px",
                                }
                          }
                        >
                          <div
                            className={`p-1.5 rounded relative z-10`}
                            style={{
                              backgroundColor:
                                feature.category === "premium"
                                  ? colors.accent[100]
                                  : colors.primary[100],
                            }}
                          >
                            <span
                              style={{
                                color:
                                  feature.category === "premium"
                                    ? colors.accent[700]
                                    : colors.primary[700],
                              }}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 relative z-10">
                            <span
                              className="font-medium text-sm block truncate"
                              style={{ color: "#000000" }}
                            >
                              {feature.name}
                            </span>
                            <p
                              className="text-xs truncate"
                              style={{ color: "#374151" }}
                            >
                              {feature.description}
                            </p>
                          </div>
                          {!isActive && (
                            <div
                              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                              style={{
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Main Content - Selected Feature */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-1 md:p-2 lg:p-3">
            {selectedFeature ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto"
              >
                {/* Professional Feature Header */}
                <div
                  className="mb-2 md:mb-3 pb-2 md:pb-3 border-b rounded-xl p-2 md:p-3"
                  style={{
                    borderColor: "rgba(226, 232, 240, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(226, 232, 240, 0.5)",
                    boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-3 mb-2 md:mb-3">
                    <div
                      className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
                      style={{
                        background:
                          selectedFeature.category === "premium"
                            ? "linear-gradient(to right, #d97706, #b45309)"
                            : "linear-gradient(to right, #2563eb, #1e40af)",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <span
                        style={{
                          color:
                            selectedFeature.category === "premium"
                              ? colors.accent[700]
                              : selectedFeature.category === "advanced"
                                ? colors.primary[700]
                                : colors.primary[700],
                        }}
                      >
                        <selectedFeature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 break-words"
                        style={{ color: colors.text }}
                      >
                        {selectedFeature.name}
                      </h2>
                      <p
                        className="text-xs sm:text-sm break-words"
                        style={{ color: colors.secondary[600] }}
                      >
                        {selectedFeature.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {session && session.user?.role === "ATTORNEY" && (
                      <Badge
                        variant="outline"
                        className="border-amber-200 text-xs"
                        style={{
                          color: colors.accent[700],
                          backgroundColor: colors.accent[50],
                        }}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Attorney Access
                      </Badge>
                    )}
                    {selectedFeature.category === "premium" && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          color: colors.accent[700],
                          backgroundColor: colors.accent[50],
                          borderColor: colors.accent[200],
                        }}
                      >
                        <Award className="w-3 h-3 mr-1" />
                        Premium Service
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        color: colors.primary[700],
                        backgroundColor: colors.primary[50],
                        borderColor: colors.primary[200],
                      }}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Bar Certified
                    </Badge>
                  </div>
                </div>

                {/* Feature Content */}
                <div className="w-full max-w-4xl mx-auto">
                  <div className="space-y-2 md:space-y-3">
                    {/* Professional Feature Details Card */}
                    <Card
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(226, 232, 240, 0.5)",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle
                          className="text-base md:text-lg"
                          style={{ color: colors.text }}
                        >
                          Professional Capabilities
                        </CardTitle>
                        <CardDescription
                          className="text-xs md:text-sm"
                          style={{ color: colors.secondary[600] }}
                        >
                          Comprehensive tools designed for legal professionals
                          to enhance practice efficiency and client service
                          delivery.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3 md:space-y-4">
                          <div>
                            <h4
                              className="font-semibold mb-2 text-sm"
                              style={{ color: colors.text }}
                            >
                              Key Features & Capabilities:
                            </h4>
                            <ul className="space-y-1.5 sm:space-y-2">
                              {selectedFeature.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start space-x-2 p-1.5 rounded hover:bg-gray-50 transition-colors"
                                >
                                  <CheckCircle
                                    className="w-3 h-3 mt-0.5 flex-shrink-0"
                                    style={{ color: colors.success[600] }}
                                  />
                                  <span
                                    className="text-xs break-words"
                                    style={{ color: colors.secondary[700] }}
                                  >
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {selectedFeature.pricing && (
                            <div
                              className="pt-2 border-t"
                              style={{ borderColor: colors.secondary[200] }}
                            >
                              <h4
                                className="font-semibold mb-2 text-sm"
                                style={{ color: colors.text }}
                              >
                                Service Tiers:
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                <div
                                  className="p-2 sm:p-3 rounded-lg border"
                                  style={{
                                    backgroundColor: colors.secondary[50],
                                    borderColor: colors.secondary[200],
                                  }}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Building
                                      className="w-3 h-3"
                                      style={{ color: colors.secondary[600] }}
                                    />
                                    <span
                                      className="text-xs font-medium"
                                      style={{ color: colors.secondary[700] }}
                                    >
                                      Standard Access
                                    </span>
                                  </div>
                                  <p
                                    className="text-xs"
                                    style={{ color: colors.secondary[600] }}
                                  >
                                    {selectedFeature.pricing.free}
                                  </p>
                                </div>
                                <div
                                  className="p-2 sm:p-3 rounded-lg border"
                                  style={{
                                    backgroundColor: colors.primary[50],
                                    borderColor: colors.primary[200],
                                  }}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Award
                                      className="w-3 h-3"
                                      style={{ color: colors.primary[700] }}
                                    />
                                    <span
                                      className="text-xs font-medium"
                                      style={{ color: colors.primary[900] }}
                                    >
                                      Attorney Tier
                                    </span>
                                  </div>
                                  <p
                                    className="text-xs font-semibold"
                                    style={{ color: colors.primary[800] }}
                                  >
                                    {selectedFeature.pricing.paid}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Professional CTA */}
                          <div className="pt-2">
                            <Button
                              onClick={handleUpgrade}
                              className="w-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm"
                              size="sm"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">
                                Try Free Demo
                              </span>
                              <span className="sm:hidden">Try Demo</span>
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Professional Benefits Card */}
                    <Card
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(226, 232, 240, 0.5)",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle
                          className="text-base md:text-lg"
                          style={{ color: colors.text }}
                        >
                          Professional Benefits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                          {[
                            {
                              icon: Scale,
                              title: "Bar Compliance",
                              desc: "Meets professional standards and ethical guidelines",
                            },
                            {
                              icon: Shield,
                              title: "Secure & Confidential",
                              desc: "Enterprise-grade security for client data",
                            },
                            {
                              icon: BarChart3,
                              title: "Practice Analytics",
                              desc: "Track efficiency and case outcomes",
                            },
                            {
                              icon: Users,
                              title: "Client Management",
                              desc: "Streamlined client communication tools",
                            },
                          ].map((benefit, idx) => (
                            <div
                              key={idx}
                              className="flex items-start space-x-2 p-2 rounded-lg"
                              style={{ backgroundColor: colors.secondary[50] }}
                            >
                              <div
                                className="p-1.5 rounded"
                                style={{ backgroundColor: colors.primary[100] }}
                              >
                                <benefit.icon
                                  className="w-3 h-3"
                                  style={{ color: colors.primary[700] }}
                                />
                              </div>
                              <div>
                                <h5
                                  className="text-xs font-semibold mb-1"
                                  style={{ color: colors.text }}
                                >
                                  {benefit.title}
                                </h5>
                                <p
                                  className="text-xs"
                                  style={{ color: colors.secondary[600] }}
                                >
                                  {benefit.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Professional Welcome State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col justify-center items-center px-4 md:px-8"
              >
                {/* Professional Hero Section */}
                <div className="text-center max-w-2xl">
                  {/* Professional Icon */}
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl"
                    style={{
                      background: "linear-gradient(to right, #2563eb, #1e40af)",
                    }}
                  >
                    <Image
                      src="/images/logo_icon.png"
                      alt="AI Wizard Logo"
                      width={32}
                      height={32}
                      className="md:w-12 md:h-12"
                    />
                  </div>

                  {/* Professional Headline */}
                  <h1
                    className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4"
                    style={{ color: colors.text }}
                  >
                    Professional Legal Services
                  </h1>

                  {/* Subtitle */}
                  <p
                    className="text-base md:text-lg mb-6 md:mb-8"
                    style={{ color: colors.secondary[600] }}
                  >
                    Attorney-grade AI tools designed to enhance legal practice
                    efficiency, client service, and professional excellence.
                  </p>

                  {/* Professional Features Grid */}
                  <div className="grid grid-cols-2 gap-2 md:gap-4 mb-6 md:mb-8 max-w-2xl mx-auto">
                    {attorneyFeatures.slice(0, 4).map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleFeatureClick(feature)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-6 rounded-2xl text-center hover:shadow-xl transition-all hover:-translate-y-1"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid rgba(226, 232, 240, 0.5)",
                          }}
                        >
                          <div
                            className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center"
                            style={{
                              background:
                                feature.category === "premium"
                                  ? "linear-gradient(to right, #d97706, #b45309)"
                                  : "linear-gradient(to right, #2563eb, #1e40af)",
                            }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <span
                            className="text-sm font-semibold block"
                            style={{ color: colors.text }}
                          >
                            {feature.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Demo Button */}
                  <Button
                    size="lg"
                    onClick={handleDemoClick}
                    variant="outline"
                    className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Try Free Demos
                  </Button>

                  {/* Professional CTA */}
                  {!session ? (
                    <Button
                      size="lg"
                      onClick={() => signIn()}
                      className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Sign In to Access Services
                    </Button>
                  ) : session.user?.role !== "ATTORNEY" ? (
                    <div
                      className="rounded-xl p-6 max-w-md mx-auto"
                      style={{
                        backgroundColor: "rgba(255, 251, 235, 0.95)",
                        border: "1px solid rgba(217, 119, 6, 0.3)",
                      }}
                    >
                      <AlertCircle
                        className="w-10 h-10 mx-auto mb-3"
                        style={{ color: colors.accent[700] }}
                      />
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: colors.text }}
                      >
                        Attorney Credentials Required
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: colors.secondary[700] }}
                      >
                        These professional services are exclusively available to
                        licensed attorneys and verified legal professionals.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center space-y-4"
                      style={{ color: colors.secondary[500] }}
                    >
                      <ArrowRight className="w-8 h-8" />
                      <p className="text-base">
                        Select a professional service from the sidebar to begin
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Demo Panel */}
      {selectedFeature && (
        <InteractiveFeaturePanel
          isOpen={showSidebarDemo}
          onClose={handleCloseSidebarDemo}
          featureId={selectedFeature.id}
          featureName={selectedFeature.name}
          featureDescription={selectedFeature.description}
          icon={selectedFeature.icon}
          isFree={selectedFeature.isFree}
          isLimited={selectedFeature.isLimited}
          onUpgrade={handleSignIn}
        >
          {/* Include all demo functionality directly in sidebar */}
          <div className="space-y-4">
            {/* Demo Notice */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: colors.accent[50],
                border: `1px solid ${colors.accent[200]}`,
              }}
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">
                    Demo Mode
                  </h3>
                  <p className="text-sm text-amber-700">
                    This is a limited demo version. For full functionality with
                    advanced AI capabilities, vector search, and professional
                    features, please upgrade to a professional account.
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Content based on feature */}
            {selectedFeature.id === "document-analysis" && (
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    Document Analysis Demo
                  </label>
                  <textarea
                    placeholder="Describe the legal document you want to analyze..."
                    className="w-full p-3 border rounded-lg min-h-[100px]"
                    style={{
                      borderColor: colors.secondary[300],
                      backgroundColor: colors.background,
                    }}
                  />
                </div>
                <Button
                  className="w-full"
                  style={{ backgroundColor: colors.primary[600] }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Analyze Document
                </Button>
              </div>
            )}

            {selectedFeature.id === "legal-research" && (
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    Legal Research Demo
                  </label>
                  <textarea
                    placeholder="Enter your legal research question..."
                    className="w-full p-3 border rounded-lg min-h-[100px]"
                    style={{
                      borderColor: colors.secondary[300],
                      backgroundColor: colors.background,
                    }}
                  />
                </div>
                <Button
                  className="w-full"
                  style={{ backgroundColor: colors.primary[600] }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Research Legal Question
                </Button>
              </div>
            )}

            {/* Default demo for other features */}
            {selectedFeature.id !== "document-analysis" &&
              selectedFeature.id !== "legal-research" && (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: colors.primary[100] }}
                  >
                    <selectedFeature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    {selectedFeature.name} Demo
                  </h3>
                  <p
                    className="text-sm mb-4"
                    style={{ color: colors.secondary[600] }}
                  >
                    This professional feature is exclusively available for
                    attorneys. Sign in to access unlimited usage and advanced
                    capabilities.
                  </p>
                  <Button
                    onClick={handleSignIn}
                    className="w-full"
                    style={{ backgroundColor: colors.primary[600] }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Sign In as Attorney
                  </Button>
                </div>
              )}

            {/* Upgrade CTA */}
            <div
              className="p-6 rounded-lg text-center"
              style={{
                background:
                  "linear-gradient(to right, rgba(239, 246, 255, 0.8), rgba(219, 234, 254, 0.8))",
                border: `1px solid ${colors.primary[200]}`,
              }}
            >
              <Shield
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: colors.primary[600] }}
              />
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Unlock Full Professional Features
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: colors.secondary[600] }}
              >
                Get access to advanced AI capabilities, vector search, file
                editing, and comprehensive legal analysis tools.
              </p>
              <Button
                onClick={handleSignIn}
                className="w-full"
                style={{
                  background: "linear-gradient(to right, #2563eb, #1e40af)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Upgrade to Professional
              </Button>
            </div>
          </div>
        </InteractiveFeaturePanel>
      )}
    </div>
  );
}
