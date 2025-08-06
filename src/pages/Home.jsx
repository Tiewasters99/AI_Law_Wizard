import React, { useState } from "react";
import { Consultation } from "@/api/entities";
import { callGrok } from "@/api/functions";
import StreamlinedConsultation from "../components/consultation/StreamlinedConsultation";
import AnalysisResults from "../components/consultation/AnalysisResults";

export default function Home() {
  const [currentView, setCurrentView] = useState("consultation");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState(null);

  const handleSubmitIssue = async (userIssue) => {
    setIsLoading(true);
    
    try {
      const consultation = await Consultation.create({
        user_issue: userIssue,
        status: "processing"
      });

      const analysisPrompt = `
        Analyze the following legal issue in the persona of Grok (witty, a bit rebellious, but ultimately insightful and smart). Provide comprehensive guidance.

        LEGAL ISSUE: "${userIssue}"

        Structure your response as a JSON object with the following keys: "summary", "key_points", "recommendations", "legal_areas", "urgency_level", "disclaimer".
        - summary: A brief, insightful summary of the legal issue.
        - key_points: An array of strings with the main legal points to consider.
        - recommendations: An array of strings with recommended actions or next steps.
        - legal_areas: An array of strings with the relevant areas of law.
        - urgency_level: A string which can be one of: "low", "medium", "high", "urgent".
        - disclaimer: Your standard legal disclaimer, but with a bit of a witty Grok spin.
      `;
      
      const { data, error } = await callGrok({ prompt: analysisPrompt });

      if (error) {
          throw new Error(error.error || "The backend function call failed.");
      }

      let analysisResult;
      
      if (data && data.content) {
        try {
          const jsonMatch = data.content.match(/\{[\s\S]*\}/);
          if (jsonMatch && jsonMatch[0]) {
            analysisResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No valid JSON object found in the AI response.");
          }
        } catch (e) {
            analysisResult = {
              summary: "Failed to parse AI response.",
              key_points: [data.content],
              recommendations: ["The AI response was not in the expected JSON format. The raw text is shown in 'Key Legal Points' for debugging."],
              legal_areas: ["Parsing Error"],
              urgency_level: "high",
              disclaimer: "This is a system error message."
            };
        }
      } else {
          throw new Error("No content received from the AI.");
      }
      
      const updatedConsultation = await Consultation.update(consultation.id, {
        analysis: analysisResult,
        status: "completed"
      });

      setCurrentConsultation(updatedConsultation);
      setCurrentView("results");
    } catch (error) {
      console.error("Error processing consultation:", error);
      const errorConsultation = {
        user_issue: userIssue,
        analysis: {
          summary: "An Error Occurred",
          key_points: [error.message],
          recommendations: ["This is a technical error. Please provide the details above to your developer. Check the API key, model access, and API endpoint in your Grok/X.ai account."],
          legal_areas: ["API Communication Error"],
          urgency_level: "high",
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
    <StreamlinedConsultation
      onSubmit={handleSubmitIssue}
      isLoading={isLoading}
    />
  );
}