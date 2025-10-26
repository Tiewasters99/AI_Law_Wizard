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
  bio: string;
  specialties: string[];
  experience: number;
  location: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  responseTime: string;
  consultationFee: number;
  avatar?: string;
  education: string[];
  certifications: string[];
  languages: string[];
  previousClients: number;
  successRate: number;
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

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockAttorneys: Attorney[] = [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.johnson@lawfirm.com",
        bio: "Experienced personal injury attorney with over 15 years of practice. Specializes in car accidents, slip and fall cases, and medical malpractice.",
        specialties: ["Personal Injury", "Medical Malpractice"],
        experience: 15,
        location: "New York, NY",
        rating: 4.9,
        reviewCount: 127,
        isVerified: true,
        isAvailable: true,
        responseTime: "2 hours",
        consultationFee: 200,
        education: ["Harvard Law School", "Yale University"],
        certifications: ["Board Certified Personal Injury", "Trial Advocacy"],
        languages: ["English", "Spanish"],
        previousClients: 500,
        successRate: 95,
      },
      {
        id: "2",
        name: "Michael Chen",
        email: "michael.chen@businesslaw.com",
        bio: "Corporate attorney specializing in business formation, contract negotiation, and regulatory compliance. Former Fortune 500 general counsel.",
        specialties: ["Business Law", "Contract Law", "Corporate Law"],
        experience: 12,
        location: "Los Angeles, CA",
        rating: 4.8,
        reviewCount: 89,
        isVerified: true,
        isAvailable: true,
        responseTime: "4 hours",
        consultationFee: 300,
        education: ["Stanford Law School", "UC Berkeley"],
        certifications: ["Corporate Law Specialist", "M&A Expert"],
        languages: ["English", "Mandarin"],
        previousClients: 300,
        successRate: 92,
      },
      {
        id: "3",
        name: "Emily Rodriguez",
        email: "emily.rodriguez@familylaw.com",
        bio: "Family law attorney with a compassionate approach to divorce, child custody, and adoption cases. Certified mediator.",
        specialties: ["Family Law", "Divorce", "Child Custody"],
        experience: 8,
        location: "Chicago, IL",
        rating: 4.7,
        reviewCount: 156,
        isVerified: true,
        isAvailable: false,
        responseTime: "1 day",
        consultationFee: 150,
        education: ["Northwestern Law School", "University of Chicago"],
        certifications: ["Family Law Specialist", "Mediation Certified"],
        languages: ["English", "Spanish"],
        previousClients: 200,
        successRate: 88,
      },
      {
        id: "4",
        name: "David Thompson",
        email: "david.thompson@criminaldefense.com",
        bio: "Criminal defense attorney with extensive trial experience. Former prosecutor with deep understanding of both sides of criminal law.",
        specialties: ["Criminal Defense", "DUI", "White Collar Crime"],
        experience: 20,
        location: "Houston, TX",
        rating: 4.9,
        reviewCount: 203,
        isVerified: true,
        isAvailable: true,
        responseTime: "1 hour",
        consultationFee: 250,
        education: ["University of Texas Law", "Rice University"],
        certifications: ["Criminal Law Specialist", "Trial Advocacy"],
        languages: ["English"],
        previousClients: 800,
        successRate: 96,
      },
      {
        id: "5",
        name: "Lisa Wang",
        email: "lisa.wang@realestate.com",
        bio: "Real estate attorney specializing in commercial transactions, property disputes, and zoning issues. Licensed in multiple states.",
        specialties: ["Real Estate", "Commercial Law", "Property Disputes"],
        experience: 10,
        location: "San Francisco, CA",
        rating: 4.6,
        reviewCount: 94,
        isVerified: true,
        isAvailable: true,
        responseTime: "6 hours",
        consultationFee: 180,
        education: ["UC Berkeley Law", "Stanford University"],
        certifications: ["Real Estate Law Specialist"],
        languages: ["English", "Mandarin", "Cantonese"],
        previousClients: 150,
        successRate: 90,
      },
    ];

    setAttorneys(mockAttorneys);
    setFilteredAttorneys(mockAttorneys);
    setIsLoading(false);
  }, []);

  // Filter and search attorneys
  useEffect(() => {
    let filtered = attorneys;

    // Search by name, bio, or specialties
    if (searchQuery) {
      filtered = filtered.filter(
        attorney =>
          attorney.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attorney.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attorney.specialties.some(specialty =>
            specialty.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by specialty
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(attorney =>
        attorney.specialties.includes(selectedSpecialty)
      );
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter(
        attorney => attorney.location === selectedLocation
      );
    }

    // Sort attorneys
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.experience - a.experience;
        case "responseTime":
          return a.responseTime.localeCompare(b.responseTime);
        case "fee":
          return a.consultationFee - b.consultationFee;
        default:
          return 0;
      }
    });

    setFilteredAttorneys(filtered);
  }, [attorneys, searchQuery, selectedSpecialty, selectedLocation, sortBy]);

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

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload attachments to Vercel Blob (simplified for demo)
      const attachmentUrls: string[] = [];
      for (const file of requestData.attachments) {
        // In real implementation, upload to Vercel Blob
        const mockUrl = `https://blob.vercel-storage.com/attachments/${file.name}`;
        attachmentUrls.push(mockUrl);
      }

      // Create consultation request (API call would go here)
      // In real implementation, this would call the API
      const consultationRequest = {
        id: Date.now().toString(),
        attorneyId: requestData.attorneyId,
        caseType: requestData.caseType,
        urgency: requestData.urgency,
        description: requestData.description,
        attachments: attachmentUrls,
        status: "pending",
      };

      setSuccess("Consultation request sent successfully!");
      setShowRequestModal(false);
      setRequestData({
        attorneyId: "",
        caseType: "",
        urgency: "medium",
        description: "",
        attachments: [],
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting request:", error);
      setError("Failed to send consultation request. Please try again.");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attorneys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Find an Attorney
              </h1>
              <p className="text-gray-600 mt-2">
                Connect with qualified legal professionals in your area
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {filteredAttorneys.length}
              </div>
              <div className="text-sm text-gray-500">Attorneys Available</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Attorney List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAttorneys.map(attorney => (
            <motion.div
              key={attorney.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {attorney.name
                          .split(" ")
                          .map(n => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {attorney.name}
                          </h3>
                          {attorney.isVerified && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{attorney.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{attorney.rating}</span>
                        <span className="text-sm text-gray-500">
                          ({attorney.reviewCount})
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {attorney.experience} years exp
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {attorney.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {attorney.specialties.slice(0, 3).map(specialty => (
                      <Badge
                        key={specialty}
                        variant="outline"
                        className="text-xs"
                      >
                        {specialty}
                      </Badge>
                    ))}
                    {attorney.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{attorney.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Response Time</div>
                      <div className="font-medium">{attorney.responseTime}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Consultation Fee</div>
                      <div className="font-medium">
                        ${attorney.consultationFee}/hr
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{attorney.previousClients} clients</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Success Rate: </span>
                      <span className="font-medium text-green-600">
                        {attorney.successRate}%
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleRequestConsultation(attorney)}
                      disabled={!attorney.isAvailable}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {attorney.isAvailable
                        ? "Request Consultation"
                        : "Not Available"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredAttorneys.length === 0 && (
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Consultation</DialogTitle>
            <DialogDescription>
              Send a consultation request to {selectedAttorney?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="caseType">Case Type *</Label>
                <select
                  value={requestData.caseType}
                  onChange={e =>
                    setRequestData({ ...requestData, caseType: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Label htmlFor="urgency">Urgency Level *</Label>
                <select
                  value={requestData.urgency}
                  onChange={e =>
                    setRequestData({ ...requestData, urgency: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <Label htmlFor="description">Case Description *</Label>
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
                className="min-h-[120px]"
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
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
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
