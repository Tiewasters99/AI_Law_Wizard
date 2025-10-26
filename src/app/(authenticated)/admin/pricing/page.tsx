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
} from "lucide-react";
import { toast } from "@/components/ui/toast";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceInCents: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  RolePricing: RolePricing[];
}

interface RolePricing {
  id: string;
  role: "ATTORNEY" | "CUSTOMER";
  priceInCents: number;
  isActive: boolean;
}

export default function PricingManagementPage() {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("packages");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    tokens: 0,
    priceInCents: 0,
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/admin/pricing/packages");
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      toast.error("Failed to load pricing packages");
    } finally {
      setLoading(false);
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
        setFormData({
          name: "",
          tokens: 0,
          priceInCents: 0,
          description: "",
          isActive: true,
        });
        fetchPackages();
      } else {
        throw new Error("Failed to create package");
      }
    } catch (error) {
      console.error("Create package error:", error);
      toast.error("Failed to create package");
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      const response = await fetch(
        `/api/admin/pricing/packages/${editingPackage.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Package updated successfully");
        setEditingPackage(null);
        setFormData({
          name: "",
          tokens: 0,
          priceInCents: 0,
          description: "",
          isActive: true,
        });
        fetchPackages();
      } else {
        throw new Error("Failed to update package");
      }
    } catch (error) {
      console.error("Update package error:", error);
      toast.error("Failed to update package");
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const response = await fetch(`/api/admin/pricing/packages/${packageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Package deleted successfully");
        fetchPackages();
      } else {
        throw new Error("Failed to delete package");
      }
    } catch (error) {
      console.error("Delete package error:", error);
      toast.error("Failed to delete package");
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Packages
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">
              {packages.filter(p => p.isActive).length} active
            </p>
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
              {
                packages.filter(p =>
                  p.RolePricing.some(
                    rp => rp.role === "ATTORNEY" && rp.isActive
                  )
                ).length
              }
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
              {
                packages.filter(p =>
                  p.RolePricing.some(
                    rp => rp.role === "CUSTOMER" && rp.isActive
                  )
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Available for clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Token Packages</TabsTrigger>
          <TabsTrigger value="role-pricing">Role Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Token Packages</CardTitle>
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
                    <TableHead>Base Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map(pkg => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{formatTokens(pkg.tokens)}</TableCell>
                      <TableCell>{formatPrice(pkg.priceInCents)}</TableCell>
                      <TableCell>
                        <Badge variant={pkg.isActive ? "default" : "secondary"}>
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
                              setFormData({
                                name: pkg.name,
                                tokens: pkg.tokens,
                                priceInCents: pkg.priceInCents,
                                description: pkg.description || "",
                                isActive: pkg.isActive,
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="role-pricing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Role-Specific Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {packages.map(pkg => (
                  <div key={pkg.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{pkg.name}</h3>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pkg.RolePricing.map(rolePrice => (
                        <div
                          key={rolePrice.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {rolePrice.role === "ATTORNEY"
                                ? "Attorney"
                                : "Client"}
                            </div>
                            <div className="text-sm text-slate-600">
                              {formatPrice(rolePrice.priceInCents)}
                            </div>
                          </div>
                          <Badge
                            variant={
                              rolePrice.isActive ? "default" : "secondary"
                            }
                          >
                            {rolePrice.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingPackage}
        onOpenChange={open => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingPackage(null);
            setFormData({
              name: "",
              tokens: 0,
              priceInCents: 0,
              description: "",
              isActive: true,
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
                ? "Update the package details below."
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
              <Label htmlFor="price">Price (in cents)</Label>
              <Input
                id="price"
                type="number"
                value={formData.priceInCents}
                onChange={e =>
                  setFormData({
                    ...formData,
                    priceInCents: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="1000 (for $10.00)"
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
                  priceInCents: 0,
                  description: "",
                  isActive: true,
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
    </div>
  );
}
