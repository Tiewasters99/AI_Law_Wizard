import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Scale, ArrowLeft, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface AnalysisResult {
  summary: string;
  key_points: string[];
  recommendations: string[];
  legal_areas: string[];
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  disclaimer: string;
}

interface ConsultationData {
  user_issue: string;
  analysis: AnalysisResult;
}

interface AnalysisResultsProps {
  consultation: ConsultationData;
  onNewConsultation: () => void;
}

const urgencyConfig: Record<string, { color: string; icon: React.ComponentType<any> }> = {
  low: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  high: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertTriangle },
  urgent: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle }
};

export default function AnalysisResults({ consultation, onNewConsultation }: AnalysisResultsProps) {
  const { analysis } = consultation;
  const urgencyInfo = urgencyConfig[analysis.urgency_level] || urgencyConfig.medium;
  const UrgencyIcon = urgencyInfo.icon;

  // Helper function to safely render arrays
  const renderArray = (array: any, fallback = ["No data provided"]) => {
    if (!array || !Array.isArray(array)) return fallback;
    return array.length > 0 ? array : fallback;
  };

  // Helper function to safely render text
  const renderText = (text: any, fallback = "No data provided") => {
    return text || fallback;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Legal Analysis Complete</h1>
                <p className="text-slate-600">AI-generated insights for your legal matter</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onNewConsultation}
              className="border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Consultation
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Scale className="w-5 h-5 text-slate-700" />
                      Case Summary
                    </CardTitle>
                    <Badge className={`${urgencyInfo.color} border flex items-center gap-1`}>
                      <UrgencyIcon className="w-3 h-3" />
                      {renderText(analysis.urgency_level, "medium").charAt(0).toUpperCase() + renderText(analysis.urgency_level, "medium").slice(1)} Priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed text-lg">
                    {renderText(analysis.summary)}
                  </p>
                </CardContent>
              </Card>

              {/* Key Points */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-700" />
                    Key Legal Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {renderArray(analysis.key_points).map((point, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-slate-600">{index + 1}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {renderArray(analysis.recommendations).map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-start"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-slate-700 leading-relaxed">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Legal Areas */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Areas of Law</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {renderArray(analysis.legal_areas).map((area, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 border-blue-200"
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Original Issue */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Your Original Issue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {renderText(consultation.user_issue)}
                    </p>
                  </div>
                </CardContent>
              </Card>


            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}