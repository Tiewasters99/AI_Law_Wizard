"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FeatureToggle } from "./FeatureToggle";
import { ChevronDown, ChevronRight, ExternalLink, Info } from "lucide-react";
import { Feature } from "@/types/admin";

interface AttorneyFeaturesPanelProps {
  features: Feature[];
  searchTerm: string;
  onFeatureToggle: (featureId: string, enabled: boolean) => Promise<void>;
}

const categoryGroups = {
  "Client Management": ["attorney_directory", "attorney_profile"],
  "Legal Tools": [
    "attorney_wizard",
    "attorney_grand_wizard",
    "attorney_query_history",
  ],
  "Court Integration": ["attorney_docket_genie"],
  Resources: ["attorney_blog", "attorney_miniverse", "attorney_integrations"],
  Account: ["attorney_inbox", "attorney_tokens"],
  Dashboard: ["attorney_dashboard"],
};

export function AttorneyFeaturesPanel({
  features,
  searchTerm,
  onFeatureToggle,
}: AttorneyFeaturesPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(categoryGroups))
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const filteredFeatures = features.filter(feature => {
    if (!searchTerm) return true;
    return (
      feature.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getFeaturesByCategory = (category: string) => {
    const featureNames =
      categoryGroups[category as keyof typeof categoryGroups] || [];
    return filteredFeatures.filter(feature =>
      featureNames.includes(feature.name)
    );
  };

  const getCategoryStats = (category: string) => {
    const categoryFeatures = getFeaturesByCategory(category);
    const enabled = categoryFeatures.filter(f => f.isEnabled).length;
    return { total: categoryFeatures.length, enabled };
  };

  return (
    <div className="space-y-4">
      {Object.keys(categoryGroups).map(category => {
        const categoryFeatures = getFeaturesByCategory(category);
        const { total, enabled } = getCategoryStats(category);
        const isExpanded = expandedCategories.has(category);

        if (total === 0) return null;

        return (
          <Card key={category} className="overflow-hidden">
            <Collapsible
              open={isExpanded}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        )}
                        <CardTitle className="text-lg">{category}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {enabled}/{total} enabled
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {enabled === total && total > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          All Enabled
                        </Badge>
                      )}
                      {enabled === 0 && total > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          All Disabled
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {categoryFeatures.map(feature => (
                      <div
                        key={feature.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-slate-900">
                                  {feature.displayName}
                                </h3>
                                <a
                                  href={feature.route}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                              <p className="text-sm text-slate-500 mb-2">
                                {feature.description ||
                                  "No description available"}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {feature.route}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    feature.category === "DOCUMENT_PROCESSING"
                                      ? "bg-blue-100 text-blue-800"
                                      : feature.category === "DOCKET_GENIE"
                                        ? "bg-orange-100 text-orange-800"
                                        : feature.category === "COMMUNICATION"
                                          ? "bg-green-100 text-green-800"
                                          : feature.category === "ANALYTICS"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-slate-100 text-slate-800"
                                  }`}
                                >
                                  {feature.category
                                    .replace(/_/g, " ")
                                    .toLowerCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 ml-4">
                          <FeatureToggle
                            featureId={feature.id}
                            featureName={feature.displayName}
                            isEnabled={feature.isEnabled}
                            onToggle={onFeatureToggle}
                            requiresConfirmation={
                              feature.name.includes("wizard") ||
                              feature.name.includes("docket")
                            }
                            confirmationMessage={
                              feature.name.includes("wizard")
                                ? `This will ${
                                    feature.isEnabled ? "disable" : "enable"
                                  } a core AI analysis feature. Are you sure?`
                                : feature.name.includes("docket")
                                  ? `This will ${
                                      feature.isEnabled ? "disable" : "enable"
                                    } court integration. Are you sure?`
                                  : undefined
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {filteredFeatures.length === 0 && (
        <div className="text-center py-12">
          <Info className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No features found
          </h3>
          <p className="text-slate-500">
            Try adjusting your search terms or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
