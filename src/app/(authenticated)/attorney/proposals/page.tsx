"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  X,
  Clock,
  Loader2,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building,
  Star,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Proposal {
  id: string;
  consultationRequestId: string;
  proposedFee: number;
  proposedTimeline: string;
  description: string;
  terms: string | null;
  status: string;
  createdAt: string;
  consultationRequest: {
    id: string;
    caseType: string;
    status: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
    customerProfile: {
      companyName: string | null;
    } | null;
  };
}

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [editData, setEditData] = useState({
    proposedFee: "",
    proposedTimeline: "",
    description: "",
    terms: "",
  });

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url =
        statusFilter === "all"
          ? "/api/attorney/proposals"
          : `/api/attorney/proposals?status=${statusFilter}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch proposals");
      }
      const data = await response.json();
      if (data.success) {
        setProposals(data.proposals || []);
      }
    } catch (err) {
      console.error("Error fetching proposals:", err);
      setError("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleWithdrawProposal = useCallback(
    async (proposalId: string) => {
      if (!confirm("Are you sure you want to withdraw this proposal?")) {
        return;
      }

      try {
        setActionLoading(proposalId);
        setError(null);
        const response = await fetch(`/api/attorney/proposals/${proposalId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to withdraw proposal");
        }

        setSuccess("Proposal withdrawn successfully");
        await fetchProposals();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to withdraw proposal"
        );
      } finally {
        setActionLoading(null);
      }
    },
    [fetchProposals]
  );

  const handleOpenEditModal = useCallback((proposal: Proposal) => {
    setSelectedProposal(proposal);
    setEditData({
      proposedFee: proposal.proposedFee.toString(),
      proposedTimeline: proposal.proposedTimeline,
      description: proposal.description,
      terms: proposal.terms || "",
    });
    setShowEditModal(true);
  }, []);

  const handleUpdateProposal = useCallback(async () => {
    if (!selectedProposal) return;

    if (
      !editData.proposedFee ||
      !editData.proposedTimeline ||
      !editData.description
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const proposedFee = parseInt(editData.proposedFee);
    if (isNaN(proposedFee) || proposedFee <= 0) {
      setError("Proposed fee must be a positive number");
      return;
    }

    try {
      setActionLoading(selectedProposal.id);
      setError(null);
      const response = await fetch(
        `/api/attorney/proposals/${selectedProposal.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposedFee,
            proposedTimeline: editData.proposedTimeline,
            description: editData.description,
            terms: editData.terms || undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update proposal");
      }

      setSuccess("Proposal updated successfully");
      setShowEditModal(false);
      await fetchProposals();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update proposal"
      );
    } finally {
      setActionLoading(null);
    }
  }, [selectedProposal, editData, fetchProposals]);

  const getStatusColor = useMemo(() => {
    return (status: string) => {
      switch (status) {
        case "ACCEPTED":
          return "bg-green-50 text-green-700 border-green-200";
        case "REJECTED":
          return "bg-red-50 text-red-700 border-red-200";
        case "WITHDRAWN":
          return "bg-gray-50 text-gray-700 border-gray-200";
        case "SENT":
          return "bg-blue-50 text-blue-700 border-blue-200";
        case "DRAFT":
          return "bg-yellow-50 text-yellow-700 border-yellow-200";
        default:
          return "bg-muted text-muted-foreground border-border";
      }
    };
  }, []);

  const filteredProposals = useMemo(() => {
    return proposals.filter(proposal => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        proposal.consultationRequest.caseType.toLowerCase().includes(query) ||
        proposal.client.name.toLowerCase().includes(query) ||
        proposal.client.email.toLowerCase().includes(query) ||
        proposal.description.toLowerCase().includes(query)
      );
    });
  }, [proposals, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Proposals
          </h1>
          <p className="text-muted-foreground">
            Manage your proposals sent to clients
          </p>
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

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>

        {/* Proposals Grid */}
        {filteredProposals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-bold mb-2">No Proposals Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "No proposals match your filters"
                  : "You haven't sent any proposals yet"}
              </p>
              <Button onClick={() => router.push("/attorney/directory")}>
                Browse Clients
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-1">
                          {proposal.consultationRequest.caseType}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {proposal.client.name}
                          {proposal.client.customerProfile?.companyName && (
                            <span>
                              {" "}
                              • {proposal.client.customerProfile.companyName}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge className={getStatusColor(proposal.status)}>
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
                      <p className="text-sm text-foreground mt-1 line-clamp-2">
                        {proposal.description}
                      </p>
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </div>

                    {(proposal.status === "DRAFT" ||
                      proposal.status === "SENT") && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        {proposal.status === "SENT" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenEditModal(proposal)}
                            disabled={actionLoading === proposal.id}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleWithdrawProposal(proposal.id)}
                          disabled={actionLoading === proposal.id}
                        >
                          {actionLoading === proposal.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Withdraw
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {proposal.status === "ACCEPTED" && (
                      <Button
                        className="w-full"
                        onClick={() => router.push("/attorney/projects")}
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

      {/* Edit Proposal Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Proposal</DialogTitle>
            <DialogDescription>Update your proposal details</DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editFee">Proposed Fee (Tokens) *</Label>
                <Input
                  id="editFee"
                  type="number"
                  placeholder="e.g., 50"
                  value={editData.proposedFee}
                  onChange={e =>
                    setEditData({ ...editData, proposedFee: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editTimeline">Proposed Timeline *</Label>
                <Input
                  id="editTimeline"
                  placeholder="e.g., 2-3 weeks"
                  value={editData.proposedTimeline}
                  onChange={e =>
                    setEditData({
                      ...editData,
                      proposedTimeline: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editDescription">Description *</Label>
                <Textarea
                  id="editDescription"
                  placeholder="Describe your approach..."
                  value={editData.description}
                  onChange={e =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="editTerms">Terms & Conditions (Optional)</Label>
                <Textarea
                  id="editTerms"
                  placeholder="Any specific terms..."
                  value={editData.terms}
                  onChange={e =>
                    setEditData({ ...editData, terms: e.target.value })
                  }
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading === selectedProposal.id}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProposal}
                  disabled={
                    actionLoading === selectedProposal.id ||
                    !editData.proposedFee ||
                    !editData.proposedTimeline ||
                    !editData.description
                  }
                >
                  {actionLoading === selectedProposal.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Proposal
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
