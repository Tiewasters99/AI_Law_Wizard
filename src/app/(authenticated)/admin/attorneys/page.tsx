"use client";

import { useState, useEffect } from "react";
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
  Scale,
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

interface Attorney {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  specialty: string | null;
  firmName: string | null;
  location: string | null;
  createdAt: string;
  tokenBalance: number;
  purchaseCount: number;
  totalSpent: number;
}

type SortField = "name" | "email" | "firmName" | "specialty" | "createdAt" | "tokenBalance" | "totalSpent" | "purchaseCount";
type SortOrder = "asc" | "desc";

export default function AttorneysPage() {
  const router = useRouter();
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Edit dialog state
  const [editingAttorney, setEditingAttorney] = useState<Attorney | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    bio: "",
    specialty: "",
    firmName: "",
    barLicense: "",
    barNumber: "",
    yearsOfExperience: 0,
    hourlyRate: 0,
    practiceAreas: "",
    tokenBalance: 0,
  });
  const [tokenAdjustment, setTokenAdjustment] = useState({
    amount: 0,
    reason: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAttorneyId, setDeletingAttorneyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAttorneys = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/attorneys?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAttorneys(data.attorneys || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch attorneys:", error);
      toast.error("Failed to load attorneys");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setCurrentPage(1);
        fetchAttorneys();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Fetch attorneys when page, pageSize, sortBy, or sortOrder changes
  useEffect(() => {
    fetchAttorneys();
  }, [currentPage, pageSize, sortBy, sortOrder]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAttorneys();
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

  const handleEdit = async (attorney: Attorney) => {
    // Fetch full attorney details
    try {
      const response = await fetch(`/api/admin/attorneys/${attorney.id}`);
      if (response.ok) {
        const data = await response.json();
        const fullAttorney = data.attorney;
        setEditingAttorney(attorney);
        setEditFormData({
          name: attorney.name || "",
          email: attorney.email || "",
          phone: attorney.phone || "",
          company: attorney.company || "",
          location: attorney.location || "",
          bio: "",
          specialty: attorney.specialty || "",
          firmName: attorney.firmName || "",
          barLicense: "",
          barNumber: "",
          yearsOfExperience: 0,
          hourlyRate: 0,
          practiceAreas: "",
          tokenBalance: attorney.tokenBalance,
        });
        setTokenAdjustment({ amount: 0, reason: "" });
        setIsEditDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch attorney details:", error);
      toast.error("Failed to load attorney details");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAttorney) return;

    try {
      setSaving(true);

      // Update attorney details
      const updateResponse = await fetch(`/api/admin/attorneys/${editingAttorney.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFormData.name || null,
          email: editFormData.email || null,
          phone: editFormData.phone || null,
          company: editFormData.company || null,
          location: editFormData.location || null,
          bio: editFormData.bio || null,
          specialty: editFormData.specialty || null,
          firmName: editFormData.firmName || null,
          barLicense: editFormData.barLicense || null,
          barNumber: editFormData.barNumber || null,
          yearsOfExperience: editFormData.yearsOfExperience || null,
          hourlyRate: editFormData.hourlyRate || null,
          practiceAreas: editFormData.practiceAreas
            ? editFormData.practiceAreas.split(",").map((s) => s.trim())
            : [],
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update attorney");
      }

      // Adjust tokens if amount is provided
      if (tokenAdjustment.amount !== 0 && tokenAdjustment.reason.trim()) {
        const tokenResponse = await fetch(`/api/admin/attorneys/${editingAttorney.id}/tokens`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: tokenAdjustment.amount,
            reason: tokenAdjustment.reason,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to adjust tokens");
        }
      }

      toast.success("Attorney updated successfully");
      setIsEditDialogOpen(false);
      fetchAttorneys();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update attorney");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (attorneyId: string) => {
    setDeletingAttorneyId(attorneyId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingAttorneyId) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/attorneys/${deletingAttorneyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Attorney deleted successfully");
        setIsDeleteDialogOpen(false);
        setDeletingAttorneyId(null);
        fetchAttorneys();
      } else {
        throw new Error("Failed to delete attorney");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete attorney");
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

  if (loading && attorneys.length === 0) {
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
          <h1 className="text-3xl font-bold text-slate-900">All Attorneys</h1>
          <p className="text-slate-600 mt-2">
            View and manage all attorney accounts in the system.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/users/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Attorney
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attorneys</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Registered attorneys</p>
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
                attorneys.reduce((sum, a) => sum + a.totalSpent, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">From all attorneys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attorneys.reduce((sum, a) => sum + a.tokenBalance, 0).toLocaleString()}
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
                placeholder="Search by name (e.g., Jane Smith), email, firm (e.g., Smith & Associates), or specialty (e.g., Corporate Law)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
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
                onValueChange={(value) => {
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

      {/* Attorneys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attorney List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : attorneys.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No attorneys found
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
                          onClick={() => handleSort("firmName")}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Firm {getSortIcon("firmName")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("specialty")}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Specialty {getSortIcon("specialty")}
                        </button>
                      </TableHead>
                      <TableHead>Location</TableHead>
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
                    {attorneys.map((attorney) => (
                      <TableRow key={attorney.id}>
                        <TableCell className="font-medium">
                          {attorney.name || "N/A"}
                        </TableCell>
                        <TableCell>{attorney.email || "N/A"}</TableCell>
                        <TableCell>{attorney.firmName || attorney.company || "N/A"}</TableCell>
                        <TableCell>
                          {attorney.specialty ? (
                            <Badge variant="secondary">{attorney.specialty}</Badge>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>{attorney.location || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {attorney.tokenBalance.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>{attorney.purchaseCount}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(attorney.totalSpent)}
                        </TableCell>
                        <TableCell>{formatDate(attorney.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(attorney)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(attorney.id)}
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
                    {Math.min(currentPage * pageSize, total)} of {total} attorneys
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
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                            variant={currentPage === page ? "default" : "outline"}
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
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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
            <DialogTitle>Edit Attorney</DialogTitle>
            <DialogDescription>
              Update attorney information and adjust token balance if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
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
                  onChange={(e) =>
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
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={editFormData.company}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, company: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-specialty">Specialty</Label>
                <Input
                  id="edit-specialty"
                  value={editFormData.specialty}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, specialty: e.target.value })
                  }
                  placeholder="e.g., Corporate Law"
                />
              </div>
              <div>
                <Label htmlFor="edit-firm">Firm Name</Label>
                <Input
                  id="edit-firm"
                  value={editFormData.firmName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, firmName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-bar-license">Bar License</Label>
                <Input
                  id="edit-bar-license"
                  value={editFormData.barLicense}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, barLicense: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-bar-number">Bar Number</Label>
                <Input
                  id="edit-bar-number"
                  value={editFormData.barNumber}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, barNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editFormData.location}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, location: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-years">Years of Experience</Label>
                <Input
                  id="edit-years"
                  type="number"
                  value={editFormData.yearsOfExperience || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      yearsOfExperience: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-hourly-rate">Hourly Rate ($)</Label>
                <Input
                  id="edit-hourly-rate"
                  type="number"
                  step="0.01"
                  value={editFormData.hourlyRate || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      hourlyRate: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-practice-areas">Practice Areas (comma-separated)</Label>
                <Input
                  id="edit-practice-areas"
                  value={editFormData.practiceAreas}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, practiceAreas: e.target.value })
                  }
                  placeholder="Corporate, Criminal, Family"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editFormData.bio}
                onChange={(e) =>
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
                    onChange={(e) =>
                      setTokenAdjustment({
                        ...tokenAdjustment,
                        amount: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current balance: {editingAttorney?.tokenBalance.toLocaleString() || 0} tokens
                  </p>
                </div>
                <div>
                  <Label htmlFor="token-reason">Reason for Adjustment *</Label>
                  <Textarea
                    id="token-reason"
                    value={tokenAdjustment.reason}
                    onChange={(e) =>
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
            <DialogTitle>Delete Attorney</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attorney? This action will soft delete the attorney
              and they will no longer appear in the list. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingAttorneyId(null);
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
                "Delete Attorney"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
