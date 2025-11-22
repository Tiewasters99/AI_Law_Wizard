"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TourStep } from "@/lib/frontend/tours/attorneyTourConfig";
import { useSession } from "next-auth/react";

interface FeatureTourProps {
  steps: TourStep[];
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FeatureTour({ steps, role, isOpen, onClose }: FeatureTourProps) {
  const { data: session } = useSession();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<"top" | "bottom" | "left" | "right" | "center">("bottom");
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Compute current step safely (before early returns)
  const currentStep = steps && steps.length > 0 ? steps[currentStepIndex] : null;

  // Memoized function to update tooltip position
  const updateTooltipPosition = useCallback((
    element: HTMLElement | null,
    tooltipPlacement: "top" | "bottom" | "left" | "right" | "center"
  ) => {
    if (tooltipPlacement === "center" || !element) {
      // Center on screen
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
      return;
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320; // Approximate tooltip width
    const tooltipHeight = 200; // Approximate tooltip height
    const spacing = 16;

    let top = 0;
    let left = 0;

    switch (tooltipPlacement) {
      case "top":
        top = rect.top - tooltipHeight - spacing;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + spacing;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - spacing;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + spacing;
        break;
    }

    // Ensure tooltip stays within viewport
    top = Math.max(spacing, Math.min(top, window.innerHeight - tooltipHeight - spacing));
    left = Math.max(spacing, Math.min(left, window.innerWidth - tooltipWidth - spacing));

    setTooltipPosition({ top, left });
  }, []);

  // Reset to first step when tour opens
  useEffect(() => {
    if (isOpen && steps && steps.length > 0) {
      setCurrentStepIndex(0);
    }
  }, [isOpen, steps]);

  // Find and highlight the target element
  useEffect(() => {
    if (!isOpen || !currentStep || !steps || steps.length === 0) return;

    const findElement = () => {
      try {
        const element = document.querySelector(currentStep.target) as HTMLElement;
        if (element) {
          // Scroll element into view smoothly
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          
          // Wait a bit for scroll to complete before positioning tooltip
          setTimeout(() => {
            setHighlightedElement(element);
            setPlacement(currentStep.placement || "bottom");
            updateTooltipPosition(element, currentStep.placement || "bottom");
          }, 300);
        } else {
          // If element not found, center the tooltip
          setHighlightedElement(null);
          setPlacement("center");
          updateTooltipPosition(null, "center");
        }
      } catch (error) {
        console.error("Error finding tour target:", error);
        setHighlightedElement(null);
        setPlacement("center");
        updateTooltipPosition(null, "center");
      }
    };

    // Wait for DOM to be ready
    const timeout = setTimeout(findElement, 100);
    return () => clearTimeout(timeout);
  }, [isOpen, currentStep, currentStepIndex, steps, updateTooltipPosition]);

  // Update tooltip position when window resizes or scrolls
  useEffect(() => {
    if (!highlightedElement || placement === "center") return;

    const updatePosition = () => {
      updateTooltipPosition(highlightedElement, placement);
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [highlightedElement, placement, updateTooltipPosition]);

  // Early return checks - must be after all hooks
  if (!steps || steps.length === 0) {
    return null;
  }

  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const markTourCompleted = () => {
    if (!session?.user?.id || !role) return;
    try {
      const storageKey = `tour-completed-${role}-${session.user.id}`;
      localStorage.setItem(storageKey, "true");
    } catch (error) {
      console.error("Error marking tour as completed:", error);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      markTourCompleted();
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    markTourCompleted();
    onClose();
  };

  const handlePrevious = () => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };

  if (!isOpen || !currentStep) return null;

  return (
    <>
      {/* Overlay with highlight */}
      <AnimatePresence>
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] bg-black/60 pointer-events-auto"
          style={{ pointerEvents: "auto" }}
        >
          {highlightedElement && (
            <div
              className="absolute border-4 border-primary rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none"
              style={{
                top: highlightedElement.getBoundingClientRect().top - 4,
                left: highlightedElement.getBoundingClientRect().left - 4,
                width: highlightedElement.getBoundingClientRect().width + 8,
                height: highlightedElement.getBoundingClientRect().height + 8,
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[9999] w-80 bg-card border border-border rounded-xl shadow-lg p-4 pointer-events-auto"
          style={{
            top: placement === "center" ? tooltipPosition.top - 100 : tooltipPosition.top,
            left: placement === "center" ? tooltipPosition.left - 160 : tooltipPosition.left,
            transform:
              placement === "center"
                ? "translate(-50%, -50%)"
                : placement === "right"
                  ? "translateY(-50%)"
                  : placement === "left"
                    ? "translate(-100%, -50%)"
                    : placement === "top"
                      ? "translate(-50%, -100%)"
                      : "translate(-50%, 0)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">
                {currentStep.title}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
            <button
              onClick={handleSkip}
              className="ml-2 p-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close tour"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {currentStep.content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-2"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

