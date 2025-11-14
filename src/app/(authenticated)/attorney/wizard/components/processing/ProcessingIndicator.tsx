"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProcessingIndicatorProps {
  currentStep?: number;
  totalSteps?: number;
  message?: string;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  currentStep = 0,
  totalSteps = 1,
  message = "Processing your request...",
}) => {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border">
        <CardContent className="py-8 px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Loader2 className="w-12 h-12 text-primary" />
            </motion.div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">{message}</h3>
              {totalSteps > 1 && (
                <p className="text-primary font-medium">
                  Step {currentStep} of {totalSteps}
                </p>
              )}
            </div>

            {totalSteps > 1 && (
              <div className="w-full max-w-md">
                <div className="h-2 rounded-full overflow-hidden bg-muted">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
