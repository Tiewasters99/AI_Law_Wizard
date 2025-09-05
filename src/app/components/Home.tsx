'use client'

import React, { useState } from "react";
import { Consultation } from "@/app/lib/api";
import StreamlinedConsultation from "./consultation/StreamlinedConsultation";
import AnalysisResults from "./consultation/AnalysisResults";
import OneDriveInterface from "./OneDriveInterface";

interface AnalysisResult {
  summary: string;
  key_points: string[];
  recommendations: string[];
  legal_areas: string[];
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  disclaimer: string;
}

export default function Home() {
  const [currentView, setCurrentView] = useState("consultation");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState<{ user_issue: string; analysis?: AnalysisResult } | null>(null);

  const handleSubmitIssue = async (userIssue: string) => {
    setIsLoading(true);
    
    try {
      const consultation = await Consultation.create({
        user_issue: userIssue,
        status: "processing"
      });

      // Call the legal analysis API endpoint
      const response = await fetch('/api/legal-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIssue: userIssue
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const responseData = await response.json();

      if (responseData.error) {
          throw new Error(responseData.error || "The backend function call failed.");
      }

      let analysisResult: AnalysisResult;
      
      if (responseData.success && responseData.content) {
        console.log("Raw AI Response:", responseData.content);
        
        try {
          // First, try to parse the entire response as JSON
          analysisResult = JSON.parse(responseData.content);
        } catch {
          // If that fails, try to extract JSON from the response
          try {
            const jsonMatch = responseData.content.match(/\{[\s\S]*\}/);
            if (jsonMatch && jsonMatch[0]) {
              analysisResult = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error("No valid JSON object found in the AI response.");
            }
          } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            console.error("Raw content:", responseData.content);
            
            // Create a fallback response with the raw content
            analysisResult = {
              summary: "AI provided a response but it wasn't in the expected format. Here's what we got:",
              key_points: [responseData.content.substring(0, 500) + (responseData.content.length > 500 ? "..." : "")],
              recommendations: [
                "The AI response format was unexpected. Please try rephrasing your question.",
                "Contact support if this issue persists."
              ],
              legal_areas: ["Response Format Error"],
              urgency_level: "medium",
              disclaimer: "This response contains the raw AI output due to formatting issues. Please consult a qualified legal professional for actual legal advice."
            };
          }
        }
        
        // Validate that we have all required fields
        const missingFields: string[] = [];
        if (!analysisResult.summary) missingFields.push('summary');
        if (!analysisResult.key_points) missingFields.push('key_points');
        if (!analysisResult.recommendations) missingFields.push('recommendations');
        if (!analysisResult.legal_areas) missingFields.push('legal_areas');
        if (!analysisResult.urgency_level) missingFields.push('urgency_level');
        if (!analysisResult.disclaimer) missingFields.push('disclaimer');
        
        if (missingFields.length > 0) {
          console.warn("Missing fields in AI response:", missingFields);
          // Fill in missing fields with defaults
          missingFields.forEach(field => {
            switch (field) {
              case 'summary':
                analysisResult.summary = analysisResult.summary || "Analysis completed but summary was missing.";
                break;
              case 'key_points':
                analysisResult.key_points = analysisResult.key_points || ["Key points were not provided by the AI."];
                break;
              case 'recommendations':
                analysisResult.recommendations = analysisResult.recommendations || ["Recommendations were not provided by the AI."];
                break;
              case 'legal_areas':
                analysisResult.legal_areas = analysisResult.legal_areas || ["General Legal"];
                break;
              case 'urgency_level':
                analysisResult.urgency_level = analysisResult.urgency_level || "medium";
                break;
              case 'disclaimer':
                analysisResult.disclaimer = analysisResult.disclaimer || "This analysis is for informational purposes only. Please consult a qualified legal professional for actual legal advice.";
                break;
            }
          });
        }
      } else {
          throw new Error("No content received from the AI.");
      }
      
      const updatedConsultation = await Consultation.update(consultation.id, {
        analysis: analysisResult,
        status: "completed"
      });

      setCurrentConsultation({
        user_issue: updatedConsultation.user_issue,
        analysis: {
          ...analysisResult,
          urgency_level: analysisResult.urgency_level as 'low' | 'medium' | 'high' | 'urgent'
        }
      });
      setCurrentView("results");
    } catch (error) {
      console.error("Error processing consultation:", error);
      const errorConsultation = {
        user_issue: userIssue,
        analysis: {
          summary: "An Error Occurred",
          key_points: [(error as Error).message],
          recommendations: ["This is a technical error. Please provide the details above to your developer. Check the API key, model access, and API endpoint in your Grok/X.ai account."],
          legal_areas: ["API Communication Error"],
          urgency_level: "high" as const,
          disclaimer: "The connection to the AI service failed. Technical details are provided for debugging purposes."
        }
      };
      setCurrentConsultation(errorConsultation);
      setCurrentView("results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConsultation = () => {
    setCurrentView("consultation");
    setCurrentConsultation(null);
  };

  if (currentView === "results" && currentConsultation) {
    return (
      <AnalysisResults
        consultation={currentConsultation}
        onNewConsultation={handleNewConsultation}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          AI Legal Assistant
        </h1>
        <p className="text-gray-600 mb-4">
          Get instant legal guidance or manage your documents with OneDrive integration.
        </p>
      </div>

      {currentView === "consultation" && (
        <StreamlinedConsultation
          onSubmit={handleSubmitIssue}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
