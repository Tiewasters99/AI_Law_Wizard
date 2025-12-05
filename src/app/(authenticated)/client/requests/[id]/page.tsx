"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  X,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building,
  Star,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Proposal {
  id: string;
  proposedFee: number;
  proposedTimeline: string;
  description: string;
  terms: string | null;
  status: string;
  createdAt: string;
  attorney: {
    id: string;
    name: string;
    image: string | null;
    lawyerProfile: {
      firmName: string | null;
      practiceAreas: string[];
      rating: number | null;
      yearsOfExperience: number | null;
      bio: string | null;
    } | null;
  };
}

interface ConsultationRequest {
  id: string;
  caseType: string;
  description: string;
  urgency: string;
  status: string;
  createdAt: string;
  attorney: {
    id: string;
    name: string;
    image: string | null;
    lawyerProfile: {
      firmName: string | null;
      practiceAreas: string[];
    } | null;
  };
}

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<ConsultationRequest | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const fetchRequestDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/client/consultation-requests/${requestId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch request");
      }
      const data = await response.json();
      if (data.success) {
        setRequest(data.request);
      }
    } catch (err) {
      console.error("Error fetching request:", err);
      setError("Failed to load request details");
    }
  }, [requestId]);

  const fetchProposals = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/client/consultation-requests/${requestId}/proposals`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch proposals");
      }
      const data = await response.json();
      if (data.success) {
        setProposals(data.proposals || []);
      }
    } catch (err) {
      console.error("Error fetching proposals:", err);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequestDetails();
    fetchProposals();
  }, [fetchRequestDetails, fetchProposals]);

  const handleAcceptProposal = useCallback(
    async (proposalId: string) => {
      try {
        setActionLoading(proposalId);
        setError(null);
        const response = await fetch(
          `/api/client/proposals/${proposalId}/accept`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to accept proposal");
        }

        setSuccess("Proposal accepted successfully");
        await fetchProposals();
        await fetchRequestDetails();
        setShowAcceptDialog(false);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to accept proposal"
        );
      } finally {
        setActionLoading(null);
      }
    },
    [fetchProposals, fetchRequestDetails]
  );

  const handleRejectProposal = useCallback(
    async (proposalId: string) => {
      try {
        setActionLoading(proposalId);
        setError(null);
        const response = await fetch(
          `/api/client/proposals/${proposalId}/reject`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to reject proposal");
        }

        setSuccess("Proposal rejected successfully");
        await fetchProposals();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to reject proposal"
        );
      } finally {
        setActionLoading(null);
      }
    },
    [fetchProposals]
  );

  const handleCreateProject = useCallback(async () => {
    if (!selectedProposal) return;

    if (!projectTitle.trim() || !projectDescription.trim()) {
      setError("Please fill in project title and description");
      return;
    }

    try {
      setActionLoading("create-project");
      setError(null);
      const response = await fetch("/api/client/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: selectedProposal.id,
          title: projectTitle,
          description: projectDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create project");
      }

      const data = await response.json();
      setSuccess("Project created successfully");
      setShowAcceptDialog(false);
      router.push(`/client/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setActionLoading(null);
    }
  }, [selectedProposal, projectTitle, projectDescription, router]);

  const openAcceptDialog = useCallback(
    (proposal: Proposal) => {
      setSelectedProposal(proposal);
      setProjectTitle(
        `${proposal.attorney.name} - ${request?.caseType || "Project"}`
      );
      setProjectDescription(request?.description || "");
      setShowAcceptDialog(true);
    },
    [request]
  );

  const getUrgencyColor = useMemo(() => {
    return (urgency: string) => {
      switch (urgency.toUpperCase()) {
        case "URGENT":
          return "bg-red-50 text-red-700 border-red-200";
        case "HIGH":
          return "bg-orange-50 text-orange-700 border-orange-200";
        case "MEDIUM":
          return "bg-yellow-50 text-yellow-700 border-yellow-200";
        case "LOW":
          return "bg-green-50 text-green-700 border-green-200";
        default:
          return "bg-muted text-muted-foreground border-border";
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

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

          {request && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {request.caseType}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={getUrgencyColor(request.urgency)}
                      >
                        {request.urgency} Priority
                      </Badge>
                      <Badge variant="outline">{request.status}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Description
                    </Label>
                    <p className="mt-1 text-foreground">
                      {request.description}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Attorney
                    </Label>
                    <p className="mt-1 text-foreground">
                      {request.attorney.name}
                    </p>
                    {request.attorney.lawyerProfile?.firmName && (
                      <p className="text-sm text-muted-foreground">
                        {request.attorney.lawyerProfile.firmName}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Proposals Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              Proposals ({proposals.length})
            </h2>
          </div>

          {proposals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-bold mb-2">No Proposals Yet</h3>
                <p className="text-muted-foreground">
                  Proposals from attorneys will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {proposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {proposal.attorney.name}
                            </CardTitle>
                            {proposal.attorney.lawyerProfile?.firmName && (
                              <p className="text-sm text-muted-foreground">
                                {proposal.attorney.lawyerProfile.firmName}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            proposal.status === "ACCEPTED"
                              ? "default"
                              : proposal.status === "REJECTED"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {proposal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Proposed Fee
                          </Label>
                          <p className="text-lg font-bold text-foreground">
                            {proposal.proposedFee} tokens
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Timeline
                          </Label>
                          <p className="text-sm font-medium text-foreground">
                            {proposal.proposedTimeline}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Description
                        </Label>
                        <p className="text-sm text-foreground mt-1 line-clamp-3">
                          {proposal.description}
                        </p>
                      </div>

                      {proposal.attorney.lawyerProfile?.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {proposal.attorney.lawyerProfile.rating.toFixed(1)}
                          </span>
                          {proposal.attorney.lawyerProfile
                            .yearsOfExperience && (
                            <span className="text-sm text-muted-foreground">
                              •{" "}
                              {
                                proposal.attorney.lawyerProfile
                                  .yearsOfExperience
                              }{" "}
                              years
                            </span>
                          )}
                        </div>
                      )}

                      {proposal.status === "SENT" && (
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleRejectProposal(proposal.id)}
                            disabled={actionLoading === proposal.id}
                          >
                            {actionLoading === proposal.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </>
                            )}
                          </Button>
                          <Button
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => openAcceptDialog(proposal)}
                            disabled={actionLoading === proposal.id}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept & Create Project
                          </Button>
                        </div>
                      )}

                      {proposal.status === "ACCEPTED" && (
                        <Button
                          className="w-full"
                          onClick={() => router.push("/client/projects")}
                        >
                          View Project
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accept Proposal Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Accept Proposal & Create Project</DialogTitle>
            <DialogDescription>
              Create a project from {selectedProposal?.attorney.name}&apos;s
              proposal
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Fee</Label>
                    <p className="text-lg font-bold">
                      {selectedProposal.proposedFee} tokens
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Timeline
                    </Label>
                    <p className="text-sm font-medium">
                      {selectedProposal.proposedTimeline}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Description
                  </Label>
                  <p className="text-sm mt-1">{selectedProposal.description}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input
                  id="projectTitle"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Contract Review Project"
                />
              </div>

              <div>
                <Label htmlFor="projectDescription">
                  Project Description *
                </Label>
                <Textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={e => setProjectDescription(e.target.value)}
                  className="mt-1 min-h-[100px]"
                  placeholder="Describe the project scope..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAcceptDialog(false)}
                  disabled={actionLoading === "create-project"}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={
                    actionLoading === "create-project" ||
                    !projectTitle.trim() ||
                    !projectDescription.trim()
                  }
                >
                  {actionLoading === "create-project" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
