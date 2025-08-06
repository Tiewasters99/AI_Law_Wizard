import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ArrowLeft, Loader2, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConsultationForm({ onSubmit, onBack, isLoading }) {
  const [issue, setIssue] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxChars = 1000;

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setIssue(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (issue.trim() && !isLoading) {
      onSubmit(issue.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Legal Consultation</h1>
            </div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Describe your legal issue in detail. The more specific you are, the better our AI can assist you.
            </p>
          </div>

          {/* Consultation Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="issue" className="block text-sm font-semibold text-slate-900">
                    Describe Your Legal Issue
                  </label>
                  <div className="relative">
                    <Textarea
                      id="issue"
                      value={issue}
                      onChange={handleInputChange}
                      placeholder="Please provide as much detail as possible about your legal situation. Include relevant facts, dates, and any specific questions you have..."
                      className="min-h-[200px] resize-none border-2 border-slate-200 focus:border-slate-400 rounded-xl text-base leading-relaxed p-4"
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                      {charCount}/{maxChars}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!issue.trim() || isLoading}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white px-8 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing Your Case...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="submit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Get Legal Analysis
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>
              </form>

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Disclaimer:</strong> This AI-powered analysis provides general legal information only and does not constitute legal advice. 
                  For specific legal matters, please consult with a qualified attorney licensed in your jurisdiction.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}