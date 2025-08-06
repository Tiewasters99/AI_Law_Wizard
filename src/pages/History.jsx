import React, { useState, useEffect } from "react";
import { Consultation } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Eye, Calendar, Scale, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import AnalysisResults from "../components/consultation/AnalysisResults";

const urgencyConfig = {
  low: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  high: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertTriangle },
  urgent: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle }
};

export default function HistoryPage() {
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      const data = await Consultation.list("-created_date");
      setConsultations(data.filter(c => c.status === "completed"));
    } catch (error) {
      console.error("Error loading consultations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewConsultation = (consultation) => {
    setSelectedConsultation(consultation);
  };

  const handleBackToHistory = () => {
    setSelectedConsultation(null);
  };

  if (selectedConsultation) {
    return (
      <AnalysisResults
        consultation={selectedConsultation}
        onNewConsultation={handleBackToHistory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Consultation History</h1>
              <p className="text-slate-600">Review your previous legal consultations and analyses</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : consultations.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Consultations Yet</h3>
                <p className="text-slate-500 mb-6">
                  Start your first legal consultation to see your history here.
                </p>
                <Button
                  onClick={() => window.location.href = "/"}
                  className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black"
                >
                  Start New Consultation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {consultations.map((consultation, index) => {
                const urgencyInfo = urgencyConfig[consultation.analysis?.urgency_level] || urgencyConfig.medium;
                const UrgencyIcon = urgencyInfo.icon;

                return (
                  <motion.div
                    key={consultation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-500">
                                {format(new Date(consultation.created_date), "MMMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <CardTitle className="text-lg line-clamp-2 text-slate-900">
                              {consultation.analysis?.summary || "Legal Consultation"}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${urgencyInfo.color} border flex items-center gap-1`}>
                              <UrgencyIcon className="w-3 h-3" />
                              {consultation.analysis?.urgency_level || "Medium"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewConsultation(consultation)}
                              className="border-slate-300 hover:bg-slate-50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-slate-600 line-clamp-2 mb-4">
                          {consultation.user_issue}
                        </p>
                        {consultation.analysis?.legal_areas && (
                          <div className="flex flex-wrap gap-2">
                            {consultation.analysis.legal_areas.slice(0, 3).map((area, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
                              >
                                {area}
                              </Badge>
                            ))}
                            {consultation.analysis.legal_areas.length > 3 && (
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                                +{consultation.analysis.legal_areas.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}