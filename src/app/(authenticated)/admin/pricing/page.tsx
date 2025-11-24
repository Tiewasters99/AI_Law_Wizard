"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  Scale,
  Loader2,
  Save,
  X,
  Zap,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  RolePricing: RolePricing[];
}

interface FeaturePricing {
  id: string;
  feature: string;
  displayName: string;
  tokens: number;
  role: "ATTORNEY" | "CUSTOMER" | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RolePricing {
  id: string;
  role: "ATTORNEY" | "CUSTOMER";
  priceInCents: number;
  isActive: boolean;
}

export default function PricingManagementPage() {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [featurePricing, setFeaturePricing] = useState<FeaturePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("packages-pricing");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState<TokenPackage | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(
    null
  );
  const [editingFeature, setEditingFeature] = useState<FeaturePricing | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    tokens: 0,
    description: "",
    isActive: true,
    attorneyPriceInCents: null as number | null,
    clientPriceInCents: null as number | null,
  });
  const [featureFormData, setFeatureFormData] = useState({
    feature: "",
    displayName: "",
    tokens: 0,
    role: null as "ATTORNEY" | "CUSTOMER" | null,
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPackages();
    fetchFeaturePricing();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/admin/pricing/packages");
      if (response.ok) {
        const data = await response.json();
        // Handle response structure: { success: true, data: [...] }
        const packagesArray =
          data.success && data.data
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
        setPackages(packagesArray);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to load pricing packages");
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      toast.error("Failed to load pricing packages");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturePricing = async () => {
    try {
      const response = await fetch("/api/admin/pricing/feature-pricing");
      if (response.ok) {
        const data = await response.json();
        // Handle response structure: { success: true, data: { pricing: [...] } }
        const pricingArray =
          data.success && data.data?.pricing
            ? data.data.pricing
            : Array.isArray(data.pricing)
              ? data.pricing
              : Array.isArray(data.data?.pricing)
                ? data.data.pricing
                : Array.isArray(data.data)
                  ? data.data
                  : [];
        setFeaturePricing(pricingArray);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Failed to fetch feature pricing:",
          errorData.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Failed to fetch feature pricing:", error);
      // Don't show error toast as this is secondary data
    }
  };

  const handleCreatePackage = async () => {
    try {
      const response = await fetch("/api/admin/pricing/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Package created successfully");
        setShowCreateDialog(false);
        setEditingPackage(null);
        setFormData({
          name: "",
          tokens: 0,
          description: "",
          isActive: true,
          attorneyPriceInCents: null,
          clientPriceInCents: null,
        });
        fetchPackages();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to create package";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Create package error:", error);
      toast.error("Failed to create package");
    }
  };

  const handleUpdateRolePricing = async (
    rolePricingId: string,
    priceInCents: number
  ) => {
    try {
      const response = await fetch(
        `/api/admin/pricing/role-pricing/${rolePricingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceInCents }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update role pricing");
      }

      return true;
    } catch (error) {
      console.error("Update role pricing error:", error);
      throw error;
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      // Update package first
      const response = await fetch(
        `/api/admin/pricing/packages/${editingPackage.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            tokens: formData.tokens,
            description: formData.description,
            isActive: formData.isActive,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update package");
      }

      // Update role pricing if values have changed and entries exist
      const attorneyPricing = editingPackage.RolePricing?.find(
        rp => rp.role === "ATTORNEY"
      );
      const clientPricing = editingPackage.RolePricing?.find(
        rp => rp.role === "CUSTOMER"
      );

      const updatePromises: Promise<boolean>[] = [];

      // Update attorney pricing if entry exists and value changed
      if (
        attorneyPricing &&
        formData.attorneyPriceInCents !== null &&
        formData.attorneyPriceInCents !== attorneyPricing.priceInCents
      ) {
        updatePromises.push(
          handleUpdateRolePricing(
            attorneyPricing.id,
            formData.attorneyPriceInCents
          )
        );
      }

      // Update client pricing if entry exists and value changed
      if (
        clientPricing &&
        formData.clientPriceInCents !== null &&
        formData.clientPriceInCents !== clientPricing.priceInCents
      ) {
        updatePromises.push(
          handleUpdateRolePricing(clientPricing.id, formData.clientPriceInCents)
        );
      }

      // Wait for all role pricing updates to complete
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      toast.success("Package and pricing updated successfully");
      setEditingPackage(null);
      setShowCreateDialog(false);
      setFormData({
        name: "",
        tokens: 0,
        description: "",
        isActive: true,
        attorneyPriceInCents: null,
        clientPriceInCents: null,
      });
      fetchPackages();
    } catch (error) {
      console.error("Update package error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update package or pricing";
      toast.error(errorMessage);
    }
  };

  const handleDeletePackage = (pkg: TokenPackage) => {
    setDeletingPackage(pkg);
    setShowDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingPackage(null);
    setDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/pricing/packages/${deletingPackage.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Package archived successfully");
        setShowDeleteDialog(false);
        setDeletingPackage(null);
        fetchPackages();
      } else {
        // Parse error response to get actual error message
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || errorData.message || "Failed to archive package";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Archive package error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to archive package. Please try again.";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateFeaturePricing = async () => {
    try {
      const response = await fetch("/api/admin/pricing/feature-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(featureFormData),
      });

      if (response.ok) {
        toast.success("Feature pricing created successfully");
        setShowFeatureDialog(false);
        setEditingFeature(null);
        setFeatureFormData({
          feature: "",
          displayName: "",
          tokens: 0,
          role: null,
          description: "",
          isActive: true,
        });
        fetchFeaturePricing();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "Failed to create feature pricing";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Create feature pricing error:", error);
      toast.error("Failed to create feature pricing");
    }
  };

  const handleUpdateFeaturePricing = async () => {
    if (!editingFeature) return;

    try {
      const response = await fetch(
        `/api/admin/pricing/feature-pricing/${editingFeature.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(featureFormData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Feature pricing updated successfully");
        setEditingFeature(null);
        setShowFeatureDialog(false);
        setFeatureFormData({
          feature: "",
          displayName: "",
          tokens: 0,
          role: null,
          description: "",
          isActive: true,
        });
        fetchFeaturePricing();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "Failed to update feature pricing";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Update feature pricing error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update feature pricing";
      toast.error(errorMessage);
    }
  };

  const handleDeleteFeaturePricing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feature pricing?"))
      return;

    try {
      const response = await fetch(`/api/admin/pricing/feature-pricing/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Feature pricing deleted successfully");
        fetchFeaturePricing();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "Failed to delete feature pricing";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Delete feature pricing error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete feature pricing";
      toast.error(errorMessage);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Pricing Management
        </h1>
        <p className="text-slate-600 mt-2">
          Manage token packages and role-specific pricing for attorneys and
          clients.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Packages
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(packages) ? packages.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Active packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attorney Packages
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(packages)
                ? packages.filter(p =>
                    p.RolePricing?.some(
                      rp => rp.role === "ATTORNEY" && rp.isActive
                    )
                  ).length
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for attorneys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Client Packages
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(packages)
                ? packages.filter(p =>
                    p.RolePricing?.some(
                      rp => rp.role === "CUSTOMER" && rp.isActive
                    )
                  ).length
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Feature Pricing
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featurePricing.length}</div>
            <p className="text-xs text-muted-foreground">
              Active feature pricing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages-pricing">Packages & Pricing</TabsTrigger>
          <TabsTrigger value="feature-pricing">Feature Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="packages-pricing" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Packages & Pricing</CardTitle>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Attorney Price</TableHead>
                    <TableHead>Client Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(packages) ? (
                    packages.map(pkg => {
                      const attorneyPricing = pkg.RolePricing?.find(
                        rp => rp.role === "ATTORNEY"
                      );
                      const clientPricing = pkg.RolePricing?.find(
                        rp => rp.role === "CUSTOMER"
                      );
                      return (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">
                            {pkg.name}
                          </TableCell>
                          <TableCell>{formatTokens(pkg.tokens)}</TableCell>
                          <TableCell>
                            {attorneyPricing ? (
                              formatPrice(attorneyPricing.priceInCents)
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {clientPricing ? (
                              formatPrice(clientPricing.priceInCents)
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={pkg.isActive ? "default" : "secondary"}
                            >
                              {pkg.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(pkg.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPackage(pkg);
                                  const attorneyPrice =
                                    attorneyPricing?.priceInCents || null;
                                  const clientPrice =
                                    clientPricing?.priceInCents || null;
                                  setFormData({
                                    name: pkg.name,
                                    tokens: pkg.tokens,
                                    description: pkg.description || "",
                                    isActive: pkg.isActive,
                                    attorneyPriceInCents: attorneyPrice,
                                    clientPriceInCents: clientPrice,
                                  });
                                  setShowCreateDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePackage(pkg)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-slate-500"
                      >
                        No packages found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feature-pricing" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Feature Pricing</CardTitle>
                <Button onClick={() => setShowFeatureDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Feature Pricing
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featurePricing.length > 0 ? (
                    featurePricing.map(fp => (
                      <TableRow key={fp.id}>
                        <TableCell className="font-medium">
                          {fp.feature}
                        </TableCell>
                        <TableCell>{fp.displayName}</TableCell>
                        <TableCell>{fp.tokens}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {fp.role || "All Roles"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={fp.isActive ? "default" : "secondary"}
                          >
                            {fp.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingFeature(fp);
                                setFeatureFormData({
                                  feature: fp.feature,
                                  displayName: fp.displayName,
                                  tokens: fp.tokens,
                                  role: fp.role,
                                  description: fp.description || "",
                                  isActive: fp.isActive,
                                });
                                setShowFeatureDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFeaturePricing(fp.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No feature pricing found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Package Dialog */}
      <Dialog
        open={showCreateDialog || !!editingPackage}
        onOpenChange={open => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingPackage(null);
            setFormData({
              name: "",
              tokens: 0,
              description: "",
              isActive: true,
              attorneyPriceInCents: null,
              clientPriceInCents: null,
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Create New Package"}
            </DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Update the package details and pricing below. Attorney and Client pricing fields are only editable if pricing entries exist."
                : "Add a new token package to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Basic Plan"
              />
            </div>
            <div>
              <Label htmlFor="tokens">Token Amount</Label>
              <Input
                id="tokens"
                type="number"
                value={formData.tokens}
                onChange={e =>
                  setFormData({
                    ...formData,
                    tokens: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Package description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            {editingPackage && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-4">Role Pricing</h3>
                  <div>
                    <Label htmlFor="attorneyPrice">
                      Attorney Price (USD)
                      {editingPackage.RolePricing?.find(
                        rp => rp.role === "ATTORNEY"
                      ) ? (
                        ""
                      ) : (
                        <span className="text-xs text-muted-foreground ml-2">
                          (No pricing entry exists)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="attorneyPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        formData.attorneyPriceInCents !== null
                          ? (formData.attorneyPriceInCents / 100).toFixed(2)
                          : ""
                      }
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        setFormData({
                          ...formData,
                          attorneyPriceInCents: isNaN(value)
                            ? null
                            : Math.round(value * 100),
                        });
                      }}
                      placeholder="0.00"
                      disabled={
                        !editingPackage.RolePricing?.find(
                          rp => rp.role === "ATTORNEY"
                        )
                      }
                    />
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="clientPrice">
                      Client Price (USD)
                      {editingPackage.RolePricing?.find(
                        rp => rp.role === "CUSTOMER"
                      ) ? (
                        ""
                      ) : (
                        <span className="text-xs text-muted-foreground ml-2">
                          (No pricing entry exists)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="clientPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        formData.clientPriceInCents !== null
                          ? (formData.clientPriceInCents / 100).toFixed(2)
                          : ""
                      }
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        setFormData({
                          ...formData,
                          clientPriceInCents: isNaN(value)
                            ? null
                            : Math.round(value * 100),
                        });
                      }}
                      placeholder="0.00"
                      disabled={
                        !editingPackage.RolePricing?.find(
                          rp => rp.role === "CUSTOMER"
                        )
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingPackage(null);
                setFormData({
                  name: "",
                  tokens: 0,
                  description: "",
                  isActive: true,
                  attorneyPriceInCents: null,
                  clientPriceInCents: null,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editingPackage ? handleUpdatePackage : handleCreatePackage
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {editingPackage ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Feature Pricing Dialog */}
      <Dialog
        open={showFeatureDialog}
        onOpenChange={open => {
          if (!open) {
            setShowFeatureDialog(false);
            setEditingFeature(null);
            setFeatureFormData({
              feature: "",
              displayName: "",
              tokens: 0,
              role: null,
              description: "",
              isActive: true,
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFeature
                ? "Edit Feature Pricing"
                : "Create Feature Pricing"}
            </DialogTitle>
            <DialogDescription>
              {editingFeature
                ? "Update the feature pricing details below."
                : "Add token cost for a feature/action. Leave role empty for role-agnostic pricing."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feature">Feature Name</Label>
              <Input
                id="feature"
                value={featureFormData.feature}
                onChange={e =>
                  setFeatureFormData({
                    ...featureFormData,
                    feature: e.target.value,
                  })
                }
                placeholder="e.g., wizard, grand-wizard, document-assistant"
                disabled={!!editingFeature}
              />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={featureFormData.displayName}
                onChange={e =>
                  setFeatureFormData({
                    ...featureFormData,
                    displayName: e.target.value,
                  })
                }
                placeholder="e.g., Legal Chat, Grand Wizard"
              />
            </div>
            <div>
              <Label htmlFor="tokens">Token Cost</Label>
              <Input
                id="tokens"
                type="number"
                value={featureFormData.tokens}
                onChange={e =>
                  setFeatureFormData({
                    ...featureFormData,
                    tokens: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="5"
              />
            </div>
            <div>
              <Label htmlFor="role">Role (Optional)</Label>
              <select
                id="role"
                value={featureFormData.role || ""}
                onChange={e =>
                  setFeatureFormData({
                    ...featureFormData,
                    role: e.target.value
                      ? (e.target.value as "ATTORNEY" | "CUSTOMER")
                      : null,
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Roles</option>
                <option value="ATTORNEY">Attorney</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={featureFormData.description}
                onChange={e =>
                  setFeatureFormData({
                    ...featureFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Feature description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featureIsActive"
                checked={featureFormData.isActive}
                onChange={e =>
                  setFeatureFormData({
                    ...featureFormData,
                    isActive: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="featureIsActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFeatureDialog(false);
                setEditingFeature(null);
                setFeatureFormData({
                  feature: "",
                  displayName: "",
                  tokens: 0,
                  role: null,
                  description: "",
                  isActive: true,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editingFeature
                  ? handleUpdateFeaturePricing
                  : handleCreateFeaturePricing
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {editingFeature ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Package Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={open => {
          if (!open) {
            handleCancelDelete();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Archive Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive &quot;{deletingPackage?.name}
              &quot;? The package will be disabled and hidden from users, but
              can be restored later by setting it to active.
            </DialogDescription>
          </DialogHeader>
          {deletingPackage && (
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  Package Name:
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {deletingPackage.name}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  Tokens:
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {deletingPackage.tokens}
                </span>
              </div>
              {deletingPackage.RolePricing &&
                deletingPackage.RolePricing.length > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      <strong>Note:</strong> This package has role-specific
                      pricing configured. The package will be archived (set to
                      inactive), but all pricing data will be preserved and can
                      be restored.
                    </p>
                  </div>
                )}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Info:</strong> Archiving will hide this package from
                  users. You can restore it later by editing and setting it to
                  active.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Archiving...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Archive
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
