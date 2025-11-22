"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface TourState {
  isRunning: boolean;
  currentStep: number;
  isCompleted: boolean;
}

const getStorageKey = (role: string, userId: string): string => {
  return `tour-completed-${role}-${userId}`;
};

export const useFeatureTour = (role: string | undefined) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [tourState, setTourState] = useState<TourState>({
    isRunning: false,
    currentStep: 0,
    isCompleted: false,
  });

  // Check if tour has been completed
  useEffect(() => {
    if (!role || !userId) return;

    try {
      const storageKey = getStorageKey(role, userId);
      const completed = localStorage.getItem(storageKey) === "true";
      
      if (completed) {
        setTourState({
          isRunning: false,
          currentStep: 0,
          isCompleted: true,
        });
      } else {
        // Tour hasn't been completed, should show on login
        setTourState({
          isRunning: true,
          currentStep: 0,
          isCompleted: false,
        });
      }
    } catch (error) {
      console.error("Error checking tour completion:", error);
      // If localStorage fails, default to showing tour
      setTourState({
        isRunning: true,
        currentStep: 0,
        isCompleted: false,
      });
    }
  }, [role, userId]);

  const markTourCompleted = useCallback(() => {
    if (!role || !userId) return;

    try {
      const storageKey = getStorageKey(role, userId);
      localStorage.setItem(storageKey, "true");
      setTourState({
        isRunning: false,
        currentStep: 0,
        isCompleted: true,
      });
    } catch (error) {
      console.error("Error marking tour as completed:", error);
    }
  }, [role, userId]);

  const skipTour = useCallback(() => {
    markTourCompleted();
  }, [markTourCompleted]);

  const nextStep = useCallback((totalSteps: number) => {
    setTourState(prev => {
      const nextStep = prev.currentStep + 1;
      if (nextStep >= totalSteps) {
        markTourCompleted();
        return {
          isRunning: false,
          currentStep: 0,
          isCompleted: true,
        };
      }
      return {
        ...prev,
        currentStep: nextStep,
      };
    });
  }, [markTourCompleted]);

  const previousStep = useCallback(() => {
    setTourState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setTourState(prev => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  return {
    tourState,
    nextStep,
    previousStep,
    goToStep,
    skipTour,
    markTourCompleted,
  };
};

