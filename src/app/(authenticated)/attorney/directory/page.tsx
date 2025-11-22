"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Briefcase,
  Award,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle,
  Loader2,
  AlertCircle,
  Send,
  Building,
  Clock,
  FileText,
  X,
  Plus,
  FileCheck,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConsultationRequest {
  id: string;
  status: string;
  caseType: string;
  urgency: string;
  description?: string;
  createdAt: string;
  proposalCount?: number;
  hasProposal?: boolean;
  client?: {
    id: string;
    name: string | null;
    email: string | null;
    customerProfile?: {
      companyName: string | null;
    } | null;
  };
}

interface DirectoryClient {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "CUSTOMER";
  createdAt: string;
  customerProfile?: {
    companyName: string | null;
    phone: string | null;
    industry: string | null;
    needs: string | null;
  } | null;
  consultationRequests?: ConsultationRequest[];
}

export default function DirectoryPage() {
  const router = useRouter();
  const [clients, setClients] = useState<DirectoryClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    requestId: string;
    clientId: string;
    caseType: string;
  } | null>(null);
  const [proposalData, setProposalData] = useState({
    proposedFee: "",
    proposedTimeline: "",
    description: "",
    terms: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<{
    request: ConsultationRequest;
    clientId: string;
  } | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/attorney/directory");

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const data = await response.json();
      setClients(data.users || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load directory. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        client.name?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.customerProfile?.companyName?.toLowerCase().includes(query) ||
        client.customerProfile?.industry?.toLowerCase().includes(query)
      );
    });
  }, [clients, searchQuery]);

  const handleAcceptRequest = useCallback(
    async (requestId: string) => {
      try {
        setActionLoading(requestId);
        setError(null);
        const response = await fetch(
          `/api/attorney/consultation-requests/${requestId}/accept`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to accept request");
        }

        setSuccess("Request accepted successfully");
        await fetchClients();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to accept request"
        );
      } finally {
        setActionLoading(null);
      }
    },
    [fetchClients]
  );

  const handleRejectRequest = useCallback(
    async (requestId: string) => {
      try {
        setActionLoading(requestId);
        setError(null);
        const response = await fetch(
          `/api/attorney/consultation-requests/${requestId}/reject`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Not available" }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to reject request");
        }

        setSuccess("Request rejected successfully");
        await fetchClients();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to reject request"
        );
      } finally {
        setActionLoading(null);
      }
    },
    [fetchClients]
  );

  const handleViewRequest = useCallback(async (requestId: string) => {
    try {
      setActionLoading(requestId);
      setError(null);
      const response = await fetch(
        `/api/attorney/consultation-requests/${requestId}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch request details");
      }

      const data = await response.json();
      if (data.success && data.request) {
        setSelectedRequestDetails({
          request: data.request,
          clientId: data.request.client?.id || "",
        });
        setShowViewModal(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load request details"
      );
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleOpenProposalModal = useCallback(
    (request: ConsultationRequest, clientId: string) => {
      setSelectedRequest({
        requestId: request.id,
        clientId,
        caseType: request.caseType,
      });
      setProposalData({
        proposedFee: "",
        proposedTimeline: "",
        description: "",
        terms: "",
      });
      setShowProposalModal(true);
    },
    []
  );

  const handleSubmitProposal = useCallback(async () => {
    if (!selectedRequest) return;

    if (
      !proposalData.proposedFee ||
      !proposalData.proposedTimeline ||
      !proposalData.description
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const proposedFee = parseInt(proposalData.proposedFee);
    if (isNaN(proposedFee) || proposedFee <= 0) {
      setError("Proposed fee must be a positive number");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/attorney/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationRequestId: selectedRequest.requestId,
          proposedFee,
          proposedTimeline: proposalData.proposedTimeline,
          description: proposalData.description,
          terms: proposalData.terms || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send proposal");
      }

      setSuccess("Proposal sent successfully");
      setShowProposalModal(false);
      await fetchClients();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send proposal");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRequest, proposalData, fetchClients]);

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-5">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Client Directory
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse clients with consultation requests
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, or industry..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-14 h-14 animate-spin mb-5 text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Loading directory...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold mb-2">Error Loading Directory</h3>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button onClick={fetchClients}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredClients.length === 0 && (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">No Clients Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No clients match your search."
                : "There are no clients with consultation requests available at the moment."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Cards Grid */}
      {!loading && !error && filteredClients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-4">
          {filteredClients.map((client, index) => {
            const joinDate = new Date(client.createdAt).toLocaleDateString(
              "en-US",
              { month: "short", year: "numeric" }
            );

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
                  {/* Top Border */}
                  <div className="h-1 bg-primary"></div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold">
                            {client.name || "Anonymous User"}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {client.customerProfile?.companyName ||
                              "Individual Client"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {/* Industry and Join Date */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded-md bg-muted">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          Since {joinDate}
                        </span>
                      </div>
                      {client.customerProfile?.industry && (
                        <div className="px-2.5 py-1.5 rounded-md bg-muted">
                          <div className="flex items-center space-x-2">
                            <Building className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {client.customerProfile.industry}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Needs */}
                    {client.customerProfile?.needs && (
                      <p className="text-xs text-foreground line-clamp-2">
                        {client.customerProfile.needs}
                      </p>
                    )}

                    {/* Contact Information */}
                    <div className="pt-2 border-t border-border space-y-1.5">
                      {client.email && (
                        <div className="flex items-center space-x-2 text-xs">
                          <Mail className="w-3 h-3 text-primary" />
                          <a
                            href={`mailto:${client.email}`}
                            className="truncate flex-1 font-medium hover:underline text-foreground"
                          >
                            {client.email}
                          </a>
                        </div>
                      )}
                      {client.customerProfile?.phone && (
                        <div className="flex items-center space-x-2 text-xs">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <a
                            href={`tel:${client.customerProfile.phone}`}
                            className="font-medium hover:underline text-foreground"
                          >
                            {client.customerProfile.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Consultation Requests */}
                    {client.consultationRequests &&
                      client.consultationRequests.length > 0 && (
                        <div className="pt-3 border-t border-border space-y-2">
                          <p className="text-xs font-semibold mb-2">
                            Consultation Requests (
                            {client.consultationRequests.length})
                          </p>
                          {client.consultationRequests.slice(0, 2).map(req => {
                            const isPending = req.status === "PENDING";
                            const isLoading = actionLoading === req.id;

                            return (
                              <div key={req.id} className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-semibold px-2 py-1 bg-accent text-primary border-primary/20 flex-1"
                                  >
                                    {req.caseType} • {req.status}
                                    {req.proposalCount !== undefined &&
                                      req.proposalCount > 0 && (
                                        <span className="ml-1">
                                          ({req.proposalCount} proposals)
                                        </span>
                                      )}
                                  </Badge>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-8"
                                    onClick={() => handleViewRequest(req.id)}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                      </>
                                    )}
                                  </Button>
                                </div>

                                {!isPending && req.hasProposal && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs h-8"
                                    onClick={() =>
                                      router.push("/attorney/proposals")
                                    }
                                  >
                                    <FileCheck className="w-3 h-3 mr-1" />
                                    View Proposals
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                          {client.consultationRequests.length > 2 && (
                            <Button
                              className="w-full text-primary-foreground shadow-sm bg-primary hover:bg-primary/90"
                              onClick={() => router.push("/attorney/inbox")}
                              size="sm"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              <span className="font-semibold text-xs">
                                View All Requests
                              </span>
                            </Button>
                          )}
                        </div>
                      )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Proposal Creation Modal */}
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Proposal</DialogTitle>
            <DialogDescription>
              Send a proposal for {selectedRequest?.caseType} consultation
              request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="proposedFee">Proposed Fee (Tokens) *</Label>
              <Input
                id="proposedFee"
                type="number"
                placeholder="e.g., 50"
                value={proposalData.proposedFee}
                onChange={e =>
                  setProposalData({
                    ...proposalData,
                    proposedFee: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="proposedTimeline">Proposed Timeline *</Label>
              <Input
                id="proposedTimeline"
                placeholder="e.g., 2-3 weeks"
                value={proposalData.proposedTimeline}
                onChange={e =>
                  setProposalData({
                    ...proposalData,
                    proposedTimeline: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your approach, deliverables, and how you'll help..."
                value={proposalData.description}
                onChange={e =>
                  setProposalData({
                    ...proposalData,
                    description: e.target.value,
                  })
                }
                className="mt-1 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="terms">Terms & Conditions (Optional)</Label>
              <Textarea
                id="terms"
                placeholder="Any specific terms, conditions, or requirements..."
                value={proposalData.terms}
                onChange={e =>
                  setProposalData({ ...proposalData, terms: e.target.value })
                }
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowProposalModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitProposal}
                disabled={
                  isSubmitting ||
                  !proposalData.proposedFee ||
                  !proposalData.proposedTimeline ||
                  !proposalData.description
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Proposal
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Request Details Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultation Request Details</DialogTitle>
            <DialogDescription>
              Review the full details of this consultation request
            </DialogDescription>
          </DialogHeader>
          {selectedRequestDetails && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">
                  Case Type
                </Label>
                <p className="mt-1 text-foreground">
                  {selectedRequestDetails.request.caseType}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">
                  Status
                </Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {selectedRequestDetails.request.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">
                  Urgency
                </Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {selectedRequestDetails.request.urgency}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">
                  Description
                </Label>
                <p className="mt-1 text-foreground whitespace-pre-wrap">
                  {selectedRequestDetails.request.description ||
                    "No description provided"}
                </p>
              </div>
              {selectedRequestDetails.request.client && (
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Client Information
                  </Label>
                  <div className="mt-1 space-y-1">
                    <p className="text-foreground">
                      {selectedRequestDetails.request.client.name || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRequestDetails.request.client.email}
                    </p>
                    {selectedRequestDetails.request.client.customerProfile
                      ?.companyName && (
                      <p className="text-sm text-muted-foreground">
                        {
                          selectedRequestDetails.request.client.customerProfile
                            .companyName
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">
                  Created At
                </Label>
                <p className="mt-1 text-foreground">
                  {new Date(
                    selectedRequestDetails.request.createdAt
                  ).toLocaleString()}
                </p>
              </div>
              {selectedRequestDetails.request.status === "PENDING" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowViewModal(false);
                      handleRejectRequest(selectedRequestDetails.request.id);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowViewModal(false);
                      handleAcceptRequest(selectedRequestDetails.request.id);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setShowViewModal(false);
                      handleOpenProposalModal(
                        selectedRequestDetails.request,
                        selectedRequestDetails.clientId
                      );
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Propose
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
