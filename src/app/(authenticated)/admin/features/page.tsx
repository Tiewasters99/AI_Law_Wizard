"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClientFeaturesPanel } from "@/components/admin/features/ClientFeaturesPanel";
import { AttorneyFeaturesPanel } from "@/components/admin/features/AttorneyFeaturesPanel";
import { Loader2, Search, ToggleLeft, Users, Scale } from "lucide-react";
import { Feature } from "@/types/admin";

export default function FeatureManagementPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("client");

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch("/api/admin/features");
        if (response.ok) {
          const data = await response.json();
          setFeatures(data);
        }
      } catch (error) {
        console.error("Failed to fetch features:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  const handleFeatureToggle = async (featureId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/features/${featureId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isEnabled: enabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle feature");
      }

      // Update local state
      setFeatures(prev =>
        prev.map(feature =>
          feature.id === featureId
            ? { ...feature, isEnabled: enabled }
            : feature
        )
      );
    } catch (error) {
      console.error("Feature toggle error:", error);
      throw error;
    }
  };

  const handleBulkToggle = async (enabled: boolean) => {
    const currentFeatures = features.filter(feature =>
      feature.name.startsWith(activeTab === "client" ? "client_" : "attorney_")
    );

    const promises = currentFeatures.map(feature =>
      fetch(`/api/admin/features/${feature.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isEnabled: enabled }),
      })
    );

    try {
      await Promise.all(promises);

      // Update local state
      setFeatures(prev =>
        prev.map(feature =>
          feature.name.startsWith(
            activeTab === "client" ? "client_" : "attorney_"
          )
            ? { ...feature, isEnabled: enabled }
            : feature
        )
      );
    } catch (error) {
      console.error("Bulk toggle error:", error);
    }
  };

  const clientFeatures = features.filter(f => f.name.startsWith("client_"));
  const attorneyFeatures = features.filter(f => f.name.startsWith("attorney_"));

  const enabledClientFeatures = clientFeatures.filter(f => f.isEnabled).length;
  const enabledAttorneyFeatures = attorneyFeatures.filter(
    f => f.isEnabled
  ).length;

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
          Feature Management
        </h1>
        <p className="text-slate-600 mt-2">
          Enable or disable features for clients and attorneys. Changes take
          effect immediately.
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search features..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleBulkToggle(true)}
            className="text-green-600 hover:text-green-700"
          >
            Enable All
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkToggle(false)}
            className="text-red-600 hover:text-red-700"
          >
            Disable All
          </Button>
        </div>
      </div>

      {/* Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Client Features</span>
            <Badge variant="secondary" className="ml-2">
              {enabledClientFeatures}/{clientFeatures.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="attorney" className="flex items-center space-x-2">
            <Scale className="h-4 w-4" />
            <span>Attorney Features</span>
            <Badge variant="secondary" className="ml-2">
              {enabledAttorneyFeatures}/{attorneyFeatures.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client" className="mt-6">
          <ClientFeaturesPanel
            features={clientFeatures}
            searchTerm={searchTerm}
            onFeatureToggle={handleFeatureToggle}
          />
        </TabsContent>

        <TabsContent value="attorney" className="mt-6">
          <AttorneyFeaturesPanel
            features={attorneyFeatures}
            searchTerm={searchTerm}
            onFeatureToggle={handleFeatureToggle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
