"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-advanced";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

interface AdminActivityLog {
  id: string;
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  admin: {
    name?: string;
    email: string;
  };
}

interface LogFilters {
  search: string;
  action: string;
  dateRange: string;
  adminId: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<LogFilters>({
    search: "",
    action: "",
    dateRange: "",
    adminId: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [admins, setAdmins] = useState<
    { id: string; name?: string; email: string }[]
  >([]);

  const itemsPerPage = 20;

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.action && { action: filters.action }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.adminId && { adminId: filters.adminId }),
      });

      const response = await fetch(`/api/admin/logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, itemsPerPage]);

  useEffect(() => {
    fetchLogs();
    fetchAdmins();
  }, [currentPage, filters, fetchLogs]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/admins");
      if (response.ok) {
        const result = await response.json();
        // Handle both response formats: { success: true, data: [...] } or direct array
        const adminsData = Array.isArray(result) ? result : (result.data || []);
        setAdmins(Array.isArray(adminsData) ? adminsData : []);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      setAdmins([]); // Ensure admins is always an array
    }
  };

  const handleFilterChange = (key: keyof LogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      action: "",
      dateRange: "",
      adminId: "",
    });
    setCurrentPage(1);
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.action && { action: filters.action }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.adminId && { adminId: filters.adminId }),
      });

      const response = await fetch(`/api/admin/logs/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `admin-logs-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Logs exported successfully");
      } else {
        throw new Error("Failed to export logs");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export logs");
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "LOGIN":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "LOGOUT":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "LOGIN_FAILED":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "USER_CREATED":
      case "USER_UPDATED":
      case "USER_DELETED":
        return <User className="h-4 w-4 text-blue-600" />;
      case "FEATURE_TOGGLED":
      case "FEATURE_CREATED":
        return <Activity className="h-4 w-4 text-purple-600" />;
      case "PACKAGE_CREATED":
      case "PACKAGE_UPDATED":
      case "PACKAGE_DELETED":
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("LOGIN") || action.includes("CREATED")) {
      return "default";
    }
    if (action.includes("FAILED") || action.includes("DELETED")) {
      return "destructive";
    }
    return "secondary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatUserAgent = (userAgent?: string) => {
    if (!userAgent) return "Unknown";
    if (userAgent.length > 50) {
      return userAgent.substring(0, 50) + "...";
    }
    return userAgent;
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
          Admin Activity Logs
        </h1>
        <p className="text-slate-600 mt-2">
          Monitor admin activities and system changes across the platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Current page</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
            <p className="text-xs text-muted-foreground">Registered admins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Actions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                logs.filter(log => {
                  const today = new Date().toDateString();
                  return new Date(log.createdAt).toDateString() === today;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Actions today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(log => log.action === "LOGIN_FAILED").length}
            </div>
            <p className="text-xs text-muted-foreground">Failed attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="outline" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={fetchLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={e => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select
                value={filters.action}
                onValueChange={value => handleFilterChange("action", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                  <SelectItem value="USER_CREATED">User Created</SelectItem>
                  <SelectItem value="USER_UPDATED">User Updated</SelectItem>
                  <SelectItem value="USER_DELETED">User Deleted</SelectItem>
                  <SelectItem value="FEATURE_TOGGLED">
                    Feature Toggled
                  </SelectItem>
                  <SelectItem value="PACKAGE_CREATED">
                    Package Created
                  </SelectItem>
                  <SelectItem value="PACKAGE_UPDATED">
                    Package Updated
                  </SelectItem>
                  <SelectItem value="PACKAGE_DELETED">
                    Package Deleted
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Date Range
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={value => handleFilterChange("dateRange", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Admin</label>
              <Select
                value={filters.adminId}
                onValueChange={value => handleFilterChange("adminId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All admins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All admins</SelectItem>
                  {Array.isArray(admins) && admins.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name || admin.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {log.admin.name || "Unknown"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {log.admin.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.targetType && log.targetId ? (
                      <div>
                        <div className="font-medium">{log.targetType}</div>
                        <div className="text-sm text-slate-500">
                          ID: {log.targetId}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                      {log.ipAddress || "Unknown"}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={log.userAgent}>
                      {formatUserAgent(log.userAgent)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(log.createdAt)}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
