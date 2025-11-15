"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-advanced";
import {
  Search,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Wallet,
  Edit,
  Trash2,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";

interface Client {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  industry: string | null;
  createdAt: string;
  tokenBalance: number;
  purchaseCount: number;
  totalSpent: number;
}

type SortField =
  | "name"
  | "email"
  | "company"
  | "createdAt"
  | "tokenBalance"
  | "totalSpent"
  | "purchaseCount";
type SortOrder = "asc" | "desc";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Edit dialog state
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    location: "",
    bio: "",
    tokenBalance: 0,
  });
  const [tokenAdjustment, setTokenAdjustment] = useState({
    amount: 0,
    reason: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/clients?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortOrder, searchTerm]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setCurrentPage(1);
        fetchClients();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchClients]);

  // Fetch clients when page, pageSize, sortBy, or sortOrder changes
  useEffect(() => {
    fetchClients();
  }, [currentPage, pageSize, sortBy, sortOrder, fetchClients]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClients();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setEditFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      industry: client.industry || "",
      location: "",
      bio: "",
      tokenBalance: client.tokenBalance,
    });
    setTokenAdjustment({ amount: 0, reason: "" });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;

    try {
      setSaving(true);

      // Update client details
      const updateResponse = await fetch(
        `/api/admin/clients/${editingClient.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editFormData.name || null,
            email: editFormData.email || null,
            phone: editFormData.phone || null,
            company: editFormData.company || null,
            industry: editFormData.industry || null,
            location: editFormData.location || null,
            bio: editFormData.bio || null,
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update client");
      }

      // Adjust tokens if amount is provided
      if (tokenAdjustment.amount !== 0 && tokenAdjustment.reason.trim()) {
        const tokenResponse = await fetch(
          `/api/admin/clients/${editingClient.id}/tokens`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: tokenAdjustment.amount,
              reason: tokenAdjustment.reason,
            }),
          }
        );

        if (!tokenResponse.ok) {
          throw new Error("Failed to adjust tokens");
        }
      }

      toast.success("Client updated successfully");
      setIsEditDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update client"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (clientId: string) => {
    setDeletingClientId(clientId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingClientId) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/clients/${deletingClientId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Client deleted successfully");
        setIsDeleteDialogOpen(false);
        setDeletingClientId(null);
        fetchClients();
      } else {
        throw new Error("Failed to delete client");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete client");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Clients</h1>
          <p className="text-slate-600 mt-2">
            View and manage all client accounts in the system.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/users/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Registered clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                clients.reduce((sum, c) => sum + c.totalSpent, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">From all clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients
                .reduce((sum, c) => sum + c.tokenBalance, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Token balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name (e.g., John Doe), email (e.g., john@example.com), or company..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <div className="w-full sm:w-48">
              <Select
                value={pageSize.toString()}
                onValueChange={value => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No clients found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Name {getSortIcon("name")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("email")}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Email {getSortIcon("email")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("company")}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Company {getSortIcon("company")}
                        </button>
                      </TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("tokenBalance")}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Token Balance {getSortIcon("tokenBalance")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("purchaseCount")}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Purchases {getSortIcon("purchaseCount")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("totalSpent")}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Total Spent {getSortIcon("totalSpent")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("createdAt")}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Joined {getSortIcon("createdAt")}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map(client => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.name || "N/A"}
                        </TableCell>
                        <TableCell>{client.email || "N/A"}</TableCell>
                        <TableCell>{client.company || "N/A"}</TableCell>
                        <TableCell>{client.phone || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {client.tokenBalance.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>{client.purchaseCount}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(client.totalSpent)}
                        </TableCell>
                        <TableCell>{formatDate(client.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(client)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(client.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, total)} of {total} clients
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(prev => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    {getPageNumbers().map((page, idx) => (
                      <div key={idx}>
                        {page === "..." ? (
                          <span className="px-2 text-slate-500">...</span>
                        ) : (
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page as number)}
                          >
                            {page}
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(prev => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information and adjust token balance if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={e =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={e =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={e =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={editFormData.company}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      company: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-industry">Industry</Label>
                <Input
                  id="edit-industry"
                  value={editFormData.industry}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      industry: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editFormData.location}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      location: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editFormData.bio}
                onChange={e =>
                  setEditFormData({ ...editFormData, bio: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Token Balance Adjustment</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="token-amount">
                    Adjustment Amount (positive to add, negative to subtract)
                  </Label>
                  <Input
                    id="token-amount"
                    type="number"
                    value={tokenAdjustment.amount || ""}
                    onChange={e =>
                      setTokenAdjustment({
                        ...tokenAdjustment,
                        amount: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current balance:{" "}
                    {editingClient?.tokenBalance.toLocaleString() || 0} tokens
                  </p>
                </div>
                <div>
                  <Label htmlFor="token-reason">Reason for Adjustment *</Label>
                  <Textarea
                    id="token-reason"
                    value={tokenAdjustment.reason}
                    onChange={e =>
                      setTokenAdjustment({
                        ...tokenAdjustment,
                        reason: e.target.value,
                      })
                    }
                    placeholder="Enter reason for token adjustment..."
                    rows={2}
                    required={tokenAdjustment.amount !== 0}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required when adjusting tokens
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action will soft
              delete the client and they will no longer appear in the list. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingClientId(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Client"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
