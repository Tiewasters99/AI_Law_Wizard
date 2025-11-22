"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Clock,
  CheckCircle,
  MessageSquare,
  FileText,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalEnv, setIsLocalEnv] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
  const [activeTab, setActiveTab] = useState<"find" | "requests">("find");
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editRequestData, setEditRequestData] = useState<{
    caseType: string;
    urgency: string;
    description: string;
    attachments: File[];
    existingAttachments: string[];
  }>({
    caseType: "",
    urgency: "medium",
    description: "",
    attachments: [],
    existingAttachments: [],
  });
  const [isUpdatingRequest, setIsUpdatingRequest] = useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

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
          } else {
            setAttorneys(transformedAttorneys);
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
    []
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

  // Initial fetch
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchAttorneys(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          attorneys.length > 0
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
    attorneys.length,
  ]);

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

  // Fetch my requests
  const fetchMyRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const response = await fetch("/api/client/consultation-requests");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMyRequests(data.requests || []);
        }
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "requests" && session?.user?.id) {
      fetchMyRequests();
    }
  }, [activeTab, session?.user?.id, fetchMyRequests]);

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
        toast.success("Request sent to attorney successfully!");
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

        // Refresh my requests if on that tab
        if (activeTab === "requests") {
          fetchMyRequests();
        }

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

  const handleEditRequest = () => {
    if (!selectedRequest) return;
    setIsEditMode(true);
  };

  const handleEditFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setEditRequestData({
      ...editRequestData,
      attachments: [...editRequestData.attachments, ...files],
    });
  };

  const removeEditAttachment = (index: number) => {
    setEditRequestData({
      ...editRequestData,
      attachments: editRequestData.attachments.filter((_, i) => i !== index),
    });
  };

  const removeExistingAttachment = (index: number) => {
    setEditRequestData({
      ...editRequestData,
      existingAttachments: editRequestData.existingAttachments.filter(
        (_, i) => i !== index
      ),
    });
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    if (!editRequestData.caseType || !editRequestData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsUpdatingRequest(true);
    setError(null);

    try {
      // Upload new attachments first if any
      const attachmentUrls: string[] = [...editRequestData.existingAttachments];
      if (editRequestData.attachments.length > 0) {
        const formData = new FormData();
        editRequestData.attachments.forEach(file => {
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

      // Update consultation request
      const response = await fetch(
        `/api/client/consultation-requests/${selectedRequest.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caseType: editRequestData.caseType,
            urgency: editRequestData.urgency,
            description: editRequestData.description.trim(),
            attachmentUrls,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update consultation request"
        );
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Request updated successfully!");
        setShowViewEditModal(false);
        setIsEditMode(false);
        setSelectedRequest(null);

        // Refresh my requests
        fetchMyRequests();

        // Reset form after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to update consultation request");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update consultation request. Please try again."
      );
    } finally {
      setIsUpdatingRequest(false);
    }
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
                  {attorneys.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Attorneys Available
                </div>
              </div>
            </div>
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("find")}
            className={`px-4 py-2 font-semibold text-sm transition-colors ${
              activeTab === "find"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Find Attorney
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 font-semibold text-sm transition-colors ${
              activeTab === "requests"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Requests
          </button>
        </div>
      </div>

      {/* My Requests Tab */}
      {activeTab === "requests" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-h-[calc(100vh-300px)] overflow-y-auto">
          {loadingRequests ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Requests Yet</h3>
              <p className="text-muted-foreground">
                You haven&apos;t sent any consultation requests yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myRequests.map((req: any) => (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {req.attorney?.name || "Attorney"}
                        </h3>
                        {req.attorney?.lawyerProfile?.firmName && (
                          <p className="text-sm text-muted-foreground">
                            {req.attorney.lawyerProfile.firmName}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          req.status === "ACCEPTED"
                            ? "default"
                            : req.status === "REJECTED"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Case Type:{" "}
                        </span>
                        <span className="text-sm text-foreground">
                          {req.caseType}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Urgency:{" "}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {req.urgency}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Created:{" "}
                        </span>
                        <span className="text-sm text-foreground">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(req);
                          setEditRequestData({
                            caseType: req.caseType || "",
                            urgency: req.urgency?.toLowerCase() || "medium",
                            description: req.description || "",
                            attachments: [],
                            existingAttachments:
                              (req.documents as string[]) || [],
                          });
                          setIsEditMode(false);
                          setShowViewEditModal(true);
                        }}
                        className="flex-1"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {req.status === "ACCEPTED" && req.conversation?.id && (
                        <Button
                          onClick={() =>
                            (window.location.href = `/client/inbox?conversation=${req.conversation.id}`)
                          }
                          className="flex-1"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Chat
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attorney List */}
      {activeTab === "find" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          <div className="space-y-0">
            {attorneys.map((attorney, index) => (
              <motion.div
                key={`${attorney.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 20) * 0.03 }}
                className="border-b border-border hover:bg-muted/50 transition-colors duration-200"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                      {attorney.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  </div>

                  {/* Attorney Info */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                          {attorney.name || "N/A"}
                        </h3>

                        {/* Specialties */}
                        {attorney.specialties &&
                          attorney.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {attorney.specialties.map((specialty: string) => (
                                <Badge
                                  key={specialty}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mb-3">
                          {attorney.location && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Location
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {attorney.location}
                                </div>
                              </div>
                            </div>
                          )}

                          {attorney.experience !== null && (
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Experience
                              </div>
                              <div className="text-sm font-medium text-foreground">
                                {attorney.experience} years
                              </div>
                            </div>
                          )}

                          {attorney.rating !== null && (
                            <div className="flex items-start gap-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Rating
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {attorney.rating}
                                  {attorney.reviewCount
                                    ? ` (${attorney.reviewCount})`
                                    : ""}
                                </div>
                              </div>
                            </div>
                          )}

                          {attorney.consultationFee && (
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Hourly Rate
                              </div>
                              <div className="text-sm font-medium text-foreground">
                                ${attorney.consultationFee}/hr
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bio Preview */}
                        {attorney.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {attorney.bio}
                          </p>
                        )}

                        {/* Bar Number (if available) */}
                        {attorney.barNumber && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Bar Number: {attorney.barNumber}
                          </div>
                        )}

                        {/* Email (local env only) */}
                        {isLocalEnv && attorney.email && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Email: {attorney.email}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <Button
                          onClick={() => handleRequestConsultation(attorney)}
                          disabled={!attorney.isAvailable || tokenBalance < 10}
                          className="w-full sm:w-auto min-w-[180px]"
                          size="lg"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {!attorney.isAvailable
                            ? "Not Available"
                            : tokenBalance < 10
                              ? "Need 10 tokens"
                              : "Request Consultation"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Loading indicator for infinite scroll */}
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Loading more attorneys...</span>
              </div>
            </div>
          )}

          {/* Intersection observer target */}
          <div
            ref={observerTarget}
            className={`h-20 w-full flex items-center justify-center ${!hasMore || attorneys.length === 0 ? "hidden" : ""}`}
            aria-hidden="true"
          >
            {hasMore && attorneys.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Scroll for more...
              </div>
            )}
          </div>

          {attorneys.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No attorneys found
              </h3>
              <p className="text-muted-foreground">
                There are no attorneys available at this time.
              </p>
            </div>
          )}
        </div>
      )}

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

      {/* View/Edit Consultation Request Modal */}
      <Dialog
        open={showViewEditModal}
        onOpenChange={open => {
          setShowViewEditModal(open);
          if (!open) {
            setIsEditMode(false);
            setSelectedRequest(null);
            setEditRequestData({
              caseType: "",
              urgency: "medium",
              description: "",
              attachments: [],
              existingAttachments: [],
            });
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {isEditMode ? "Edit Request" : "Request Details"}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {isEditMode
                ? "Update your consultation request details"
                : selectedRequest?.attorney?.name
                  ? `Consultation request to ${selectedRequest.attorney.name}`
                  : "View consultation request details"}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 sm:space-y-6">
              {/* Attorney Info */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  {selectedRequest.attorney?.name || "Attorney"}
                </h3>
                {selectedRequest.attorney?.lawyerProfile?.firmName && (
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.attorney.lawyerProfile.firmName}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm sm:text-base">Status</Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedRequest.status === "ACCEPTED"
                        ? "default"
                        : selectedRequest.status === "REJECTED"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              {/* Case Type */}
              <div>
                <Label className="text-sm sm:text-base">Case Type *</Label>
                {isEditMode && selectedRequest.status !== "ACCEPTED" ? (
                  <select
                    value={editRequestData.caseType}
                    onChange={e =>
                      setEditRequestData({
                        ...editRequestData,
                        caseType: e.target.value,
                      })
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
                ) : (
                  <p className="mt-1 text-sm sm:text-base text-foreground">
                    {selectedRequest.caseType}
                  </p>
                )}
              </div>

              {/* Urgency */}
              <div>
                <Label className="text-sm sm:text-base">Urgency Level *</Label>
                {isEditMode && selectedRequest.status !== "ACCEPTED" ? (
                  <select
                    value={editRequestData.urgency}
                    onChange={e =>
                      setEditRequestData({
                        ...editRequestData,
                        urgency: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    {urgencyLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {selectedRequest.urgency}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm sm:text-base">
                  Case Description *
                </Label>
                {isEditMode && selectedRequest.status !== "ACCEPTED" ? (
                  <Textarea
                    placeholder="Please describe your legal issue in detail..."
                    value={editRequestData.description}
                    onChange={e =>
                      setEditRequestData({
                        ...editRequestData,
                        description: e.target.value,
                      })
                    }
                    className="min-h-[120px] text-sm sm:text-base mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm sm:text-base text-foreground whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                )}
              </div>

              {/* Attachments */}
              <div>
                <Label className="text-sm sm:text-base">Attachments</Label>
                {isEditMode && selectedRequest.status !== "ACCEPTED" ? (
                  <div className="mt-2">
                    {/* Existing Attachments */}
                    {editRequestData.existingAttachments.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {editRequestData.existingAttachments.map(
                          (url: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg border border-border"
                            >
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                <span className="text-sm sm:text-base text-foreground font-medium truncate">
                                  {url.split("/").pop() || "Attachment"}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExistingAttachment(index)}
                                className="flex-shrink-0 ml-2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* New Attachments Upload */}
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleEditFileUpload}
                      className="mb-3"
                    />

                    {/* New Attachments List */}
                    {editRequestData.attachments.length > 0 && (
                      <div className="space-y-2">
                        {editRequestData.attachments.map((file, index) => (
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
                              onClick={() => removeEditAttachment(index)}
                              className="flex-shrink-0 ml-2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    {selectedRequest.documents &&
                    Array.isArray(selectedRequest.documents) &&
                    selectedRequest.documents.length > 0 ? (
                      <div className="space-y-2">
                        {selectedRequest.documents.map(
                          (url: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center p-2 sm:p-3 bg-muted rounded-lg border border-border"
                            >
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 flex-shrink-0" />
                              <span className="text-sm sm:text-base text-foreground font-medium truncate">
                                {url.split("/").pop() || "Attachment"}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No attachments
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created: </span>
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </div>
                {selectedRequest.updatedAt &&
                  selectedRequest.updatedAt !== selectedRequest.createdAt && (
                    <div>
                      <span className="font-medium">Last Updated: </span>
                      {new Date(selectedRequest.updatedAt).toLocaleString()}
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                {!isEditMode ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowViewEditModal(false)}
                    >
                      Close
                    </Button>
                    {selectedRequest.status !== "ACCEPTED" && (
                      <Button onClick={handleEditRequest}>Edit</Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditMode(false);
                        // Reset to original values
                        setEditRequestData({
                          caseType: selectedRequest.caseType || "",
                          urgency:
                            selectedRequest.urgency?.toLowerCase() || "medium",
                          description: selectedRequest.description || "",
                          attachments: [],
                          existingAttachments:
                            (selectedRequest.documents as string[]) || [],
                        });
                      }}
                      disabled={isUpdatingRequest}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateRequest}
                      disabled={
                        isUpdatingRequest ||
                        !editRequestData.caseType ||
                        !editRequestData.description.trim()
                      }
                    >
                      {isUpdatingRequest ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Update Request
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
