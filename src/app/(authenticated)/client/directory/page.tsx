"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "@/lib/frontend/designSystem";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  MessageSquare,
  FileText,
  Shield,
  Award,
  Users,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface Attorney {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  specialties: string[];
  experience: number | null;
  location: string | null;
  rating: number | null;
  reviewCount: number | null;
  isVerified: boolean;
  isAvailable: boolean;
  responseTime: string;
  consultationFee: number | null;
  avatar?: string | null;
  education: string[];
  certifications: string[];
  languages: string[];
  previousClients: number;
  successRate: number;
  barNumber: string | null;
}

interface ConsultationRequestData {
  attorneyId: string;
  caseType: string;
  urgency: string;
  description: string;
  attachments: File[];
}

export default function AttorneyDirectoryPage() {
  const { data: session } = useSession();
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [filteredAttorneys, setFilteredAttorneys] = useState<Attorney[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalEnv, setIsLocalEnv] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | null>(
    null
  );
  const [requestData, setRequestData] = useState<ConsultationRequestData>({
    attorneyId: "",
    caseType: "",
    urgency: "medium",
    description: "",
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  const specialties = [
    "All Specialties",
    "Personal Injury",
    "Criminal Defense",
    "Family Law",
    "Business Law",
    "Real Estate",
    "Immigration",
    "Employment Law",
    "Estate Planning",
    "Tax Law",
    "Intellectual Property",
    "Medical Malpractice",
  ];

  const locations = [
    "All Locations",
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Phoenix, AZ",
    "Philadelphia, PA",
    "San Antonio, TX",
    "San Diego, CA",
    "Dallas, TX",
    "San Jose, CA",
  ];

  const caseTypes = [
    "General Consultation",
    "Contract Review",
    "Litigation Support",
    "Document Preparation",
    "Legal Research",
    "Compliance Issue",
    "Dispute Resolution",
    "Other",
  ];

  const urgencyLevels = [
    { value: "low", label: "Low (1-2 weeks)", color: "text-green-600" },
    { value: "medium", label: "Medium (3-5 days)", color: "text-yellow-600" },
    { value: "high", label: "High (1-2 days)", color: "text-orange-600" },
    { value: "urgent", label: "Urgent (Same day)", color: "text-red-600" },
  ];

  // Transform API data to component interface
  const transformAttorney = (attorney: any): Attorney => ({
    id: attorney.id,
    name: attorney.name || "",
    email: attorney.email || "",
    bio: attorney.bio || null,
    specialties: attorney.practiceAreas || [],
    experience: attorney.yearsOfExperience || null,
    location: attorney.location || null,
    rating: attorney.rating || null,
    reviewCount: attorney.casesHandled || null,
    isVerified: true,
    isAvailable: attorney.availability !== "unavailable",
    responseTime: "",
    consultationFee: attorney.hourlyRate || null,
    avatar: attorney.image || null,
    education: [],
    certifications: [],
    languages: [],
    previousClients: 0,
    successRate: 0,
    barNumber: attorney.barNumber || null,
  });

  // Fetch attorneys from API
  const fetchAttorneys = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedSpecialty !== "all")
          params.append("practiceArea", selectedSpecialty);
        if (selectedLocation !== "all")
          params.append("location", selectedLocation);
        params.append("page", page.toString());
        params.append("limit", "20");

        const response = await fetch(
          `/api/client/attorneys?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch attorneys");
        }

        const data = await response.json();
        if (data.success) {
          // Transform API data to match component interface
          const transformedAttorneys: Attorney[] =
            data.attorneys.map(transformAttorney);

          if (append) {
            setAttorneys(prev => [...prev, ...transformedAttorneys]);
            setFilteredAttorneys(prev => [...prev, ...transformedAttorneys]);
          } else {
            setAttorneys(transformedAttorneys);
            setFilteredAttorneys(transformedAttorneys);
          }

          setHasMore(data.hasMore || false);
          setCurrentPage(page);
        } else {
          throw new Error(data.error || "Failed to fetch attorneys");
        }
      } catch (error) {
        console.error("Error fetching attorneys:", error);
        setError("Failed to load attorneys. Please try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchQuery, selectedSpecialty, selectedLocation]
  );

  // Check if we're in local environment
  useEffect(() => {
    setIsLocalEnv(
      typeof window !== "undefined" &&
        (process.env.ENV === "LOCAL" ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          process.env.NODE_ENV === "development")
    );
  }, []);

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchAttorneys(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedSpecialty, selectedLocation]);

  // Infinite scroll observer
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const isIntersecting = entries[0]?.isIntersecting;

        if (
          isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoading &&
          filteredAttorneys.length > 0
        ) {
          fetchAttorneys(currentPage + 1, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px", // Trigger 200px before the element comes into view
      }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [
    hasMore,
    isLoadingMore,
    isLoading,
    currentPage,
    fetchAttorneys,
    filteredAttorneys.length,
  ]);

  // Apply client-side sorting when sortBy changes
  useEffect(() => {
    let sorted = [...attorneys];

    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "experience":
        sorted.sort((a, b) => (b.experience || 0) - (a.experience || 0));
        break;
      case "responseTime":
        sorted.sort((a, b) => {
          const aTime = parseInt(a.responseTime) || 999;
          const bTime = parseInt(b.responseTime) || 999;
          return aTime - bTime;
        });
        break;
      case "fee":
        sorted.sort(
          (a, b) => (a.consultationFee || 0) - (b.consultationFee || 0)
        );
        break;
      default:
        break;
    }

    setFilteredAttorneys(sorted);
  }, [attorneys, sortBy]);

  // Fetch token balance
  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        const response = await fetch("/api/client/tokens/balance");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTokenBalance(data.balance);
          }
        }
      } catch (error) {
        console.error("Error fetching token balance:", error);
      }
    };

    if (session?.user?.id) {
      fetchTokenBalance();
    }
  }, [session?.user?.id]);

  const handleRequestConsultation = (attorney: Attorney) => {
    setSelectedAttorney(attorney);
    setRequestData({
      ...requestData,
      attorneyId: attorney.id,
    });
    setShowRequestModal(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setRequestData({
      ...requestData,
      attachments: [...requestData.attachments, ...files],
    });
  };

  const removeAttachment = (index: number) => {
    setRequestData({
      ...requestData,
      attachments: requestData.attachments.filter((_, i) => i !== index),
    });
  };

  const handleSubmitRequest = async () => {
    if (!requestData.caseType || !requestData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    // Check token balance
    if (tokenBalance < 10) {
      setError(
        "Insufficient token balance. You need at least 10 tokens to send a consultation request."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload attachments first if any
      const attachmentUrls: string[] = [];
      if (requestData.attachments.length > 0) {
        const formData = new FormData();
        requestData.attachments.forEach(file => {
          formData.append("files", file);
        });

        const uploadResponse = await fetch("/api/client/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload attachments");
        }

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          attachmentUrls.push(...uploadData.files.map((f: any) => f.url));
        }
      }

      // Create consultation request
      const response = await fetch("/api/client/consultation-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attorneyId: requestData.attorneyId,
          caseType: requestData.caseType,
          urgency: requestData.urgency,
          description: requestData.description.trim(),
          attachmentUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to send consultation request"
        );
      }

      const data = await response.json();
      if (data.success) {
        setSuccess("Consultation request sent successfully!");
        setShowRequestModal(false);
        setRequestData({
          attorneyId: "",
          caseType: "",
          urgency: "medium",
          description: "",
          attachments: [],
        });

        // Update token balance
        setTokenBalance(data.tokenBalance);

        // Reset form after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to send consultation request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send consultation request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading attorneys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Find an Attorney
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                Connect with qualified legal professionals in your area
              </p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <div className="text-xs sm:text-sm font-medium text-foreground">
                  {tokenBalance} tokens
                </div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {filteredAttorneys.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Attorneys Available
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search attorneys..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="responseTime">Fastest Response</option>
              <option value="fee">Lowest Fee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm sm:text-base text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Alert variant="destructive">
            <AlertDescription className="text-sm sm:text-base">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Attorney List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-h-[calc(100vh-300px)] overflow-y-auto">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          id="attorney-grid"
        >
          {filteredAttorneys.map((attorney, index) => (
            <motion.div
              key={`${attorney.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 20) * 0.05 }}
            >
              <Card className="h-full">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-base">
                      {attorney.name
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-base">
                        {attorney.name || "N/A"}
                      </h3>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Specialty
                      </div>
                      {attorney.specialties &&
                      attorney.specialties.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {attorney.specialties.map(specialty => (
                            <Badge
                              key={specialty}
                              variant="outline"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">N/A</div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Location
                        </div>
                        <div className="text-sm text-foreground">
                          {attorney.location || "N/A"}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Experience
                        </div>
                        <div className="text-sm text-foreground">
                          {attorney.experience
                            ? `${attorney.experience} years`
                            : "N/A"}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Bar Number
                        </div>
                        <div className="text-sm text-foreground">
                          {attorney.barNumber || "N/A"}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Rating
                        </div>
                        <div className="text-sm text-foreground">
                          {attorney.rating !== null
                            ? `${attorney.rating}${attorney.reviewCount ? ` (${attorney.reviewCount})` : ""}`
                            : "N/A"}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Hourly Rate
                        </div>
                        <div className="text-sm text-foreground">
                          {attorney.consultationFee
                            ? `$${attorney.consultationFee}/hr`
                            : "N/A"}
                        </div>
                      </div>

                      {isLocalEnv && (
                        <div className="col-span-2">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Email
                          </div>
                          <div className="text-sm text-foreground">
                            {attorney.email || "N/A"}
                          </div>
                        </div>
                      )}
                    </div>

                    {attorney.bio && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Bio
                        </div>
                        <div className="text-sm text-foreground line-clamp-2">
                          {attorney.bio}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <Button
                    onClick={() => handleRequestConsultation(attorney)}
                    disabled={!attorney.isAvailable || tokenBalance < 10}
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {!attorney.isAvailable
                      ? "Not Available"
                      : tokenBalance < 10
                        ? "Need 10 tokens"
                        : "Request Consultation"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="col-span-full flex justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading more attorneys...</span>
            </div>
          </div>
        )}

        {/* Intersection observer target - placed after grid for infinite scroll */}
        {/* Always render the target element so observer can attach to it */}
        <div
          ref={observerTarget}
          className={`h-20 w-full flex items-center justify-center ${!hasMore || filteredAttorneys.length === 0 ? "hidden" : ""}`}
          aria-hidden="true"
        >
          {hasMore && filteredAttorneys.length > 0 && (
            <div className="text-sm text-gray-400">Scroll for more...</div>
          )}
        </div>

        {filteredAttorneys.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No attorneys found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialty("all");
                setSelectedLocation("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Consultation Request Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Request Consultation
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Send a consultation request to {selectedAttorney?.name}
              <br />
              <span className="text-xs sm:text-sm font-medium text-orange-600">
                Cost: 10 tokens (Current balance: {tokenBalance})
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="caseType" className="text-sm sm:text-base">
                  Case Type *
                </Label>
                <select
                  value={requestData.caseType}
                  onChange={e =>
                    setRequestData({ ...requestData, caseType: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                >
                  <option value="">Select case type</option>
                  {caseTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="urgency" className="text-sm sm:text-base">
                  Urgency Level *
                </Label>
                <select
                  value={requestData.urgency}
                  onChange={e =>
                    setRequestData({ ...requestData, urgency: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                >
                  <option value="">Select urgency</option>
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm sm:text-base">
                Case Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Please describe your legal issue in detail..."
                value={requestData.description}
                onChange={e =>
                  setRequestData({
                    ...requestData,
                    description: e.target.value,
                  })
                }
                className="min-h-[120px] text-sm sm:text-base mt-1"
              />
            </div>

            <div>
              <Label htmlFor="attachments">Attach Documents (Optional)</Label>
              <div className="mt-2">
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="mb-3"
                />
                {requestData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {requestData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg border border-border transition-all duration-200 hover:bg-muted/80"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                          <span className="text-sm sm:text-base text-foreground font-medium truncate">
                            {file.name}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="flex-shrink-0 ml-2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRequestModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={
                  isSubmitting ||
                  !requestData.caseType ||
                  !requestData.description.trim()
                }
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
