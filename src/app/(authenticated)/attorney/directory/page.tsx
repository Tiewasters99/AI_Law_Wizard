"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface ConsultationRequest {
  id: string;
  status: string;
  caseType: string;
  urgency: string;
  createdAt: string;
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

  const filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.customerProfile?.companyName?.toLowerCase().includes(query) ||
      client.customerProfile?.industry?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-5">
          <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Client Directory
            </h1>
            <p className="text-slate-600 mt-1">
              Browse clients with consultation requests
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, company, or industry..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-14 h-14 animate-spin mb-5 text-blue-600" />
          <p className="text-lg font-medium text-slate-600">
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
            <p className="mb-6 text-slate-600">{error}</p>
            <Button onClick={fetchClients}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredClients.length === 0 && (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-bold mb-2">No Clients Found</h3>
            <p className="text-slate-600">
              {searchQuery
                ? "No clients match your search."
                : "There are no clients with consultation requests available at the moment."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Cards Grid */}
      {!loading && !error && filteredClients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  <div className="h-1 bg-blue-700"></div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold">
                            {client.name || "Anonymous User"}
                          </CardTitle>
                          <p className="text-xs text-slate-600">
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
                      <div className="flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded-md bg-slate-50">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span className="font-medium text-slate-700">
                          Since {joinDate}
                        </span>
                      </div>
                      {client.customerProfile?.industry && (
                        <div className="px-2.5 py-1.5 rounded-md bg-slate-50">
                          <div className="flex items-center space-x-2">
                            <Building className="w-3 h-3 text-slate-600" />
                            <span className="text-xs font-medium">
                              {client.customerProfile.industry}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Needs */}
                    {client.customerProfile?.needs && (
                      <p className="text-xs text-slate-700 line-clamp-2">
                        {client.customerProfile.needs}
                      </p>
                    )}

                    {/* Contact Information */}
                    <div className="pt-2 border-t border-slate-200 space-y-1.5">
                      {client.email && (
                        <div className="flex items-center space-x-2 text-xs">
                          <Mail className="w-3 h-3 text-blue-600" />
                          <a
                            href={`mailto:${client.email}`}
                            className="truncate flex-1 font-medium hover:underline text-slate-700"
                          >
                            {client.email}
                          </a>
                        </div>
                      )}
                      {client.customerProfile?.phone && (
                        <div className="flex items-center space-x-2 text-xs">
                          <Phone className="w-3 h-3 text-slate-600" />
                          <a
                            href={`tel:${client.customerProfile.phone}`}
                            className="font-medium hover:underline text-slate-700"
                          >
                            {client.customerProfile.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Consultation Requests */}
                    {client.consultationRequests &&
                      client.consultationRequests.length > 0 && (
                        <div className="pt-3 border-t border-slate-200">
                          <p className="text-xs font-semibold mb-2">
                            Consultation Requests (
                            {client.consultationRequests.length})
                          </p>
                          {client.consultationRequests.slice(0, 1).map(req => (
                            <Badge
                              key={req.id}
                              variant="outline"
                              className="w-full text-xs font-semibold px-3 py-2 mb-2 bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {req.caseType} • {req.status}
                            </Badge>
                          ))}
                          <Button
                            className="w-full text-white shadow-sm bg-blue-700 hover:bg-blue-800"
                            onClick={() => router.push("/attorney/inbox")}
                            size="sm"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            <span className="font-semibold text-xs">
                              View All Requests
                            </span>
                          </Button>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
