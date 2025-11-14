"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface FeatureToggleProps {
  featureId: string;
  featureName: string;
  isEnabled: boolean;
  onToggle: (featureId: string, enabled: boolean) => Promise<void>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  disabled?: boolean;
}

export function FeatureToggle({
  featureId,
  featureName,
  isEnabled,
  onToggle,
  requiresConfirmation = false,
  confirmationMessage,
  disabled = false,
}: FeatureToggleProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [optimisticEnabled, setOptimisticEnabled] = useState(isEnabled);

  const performToggle = useCallback(async () => {
    setLoading(true);
    const previousState = optimisticEnabled;

    // Optimistic update
    setOptimisticEnabled(!optimisticEnabled);

    try {
      await onToggle(featureId, !optimisticEnabled);
      toast.success(
        `${featureName} ${
          !optimisticEnabled ? "enabled" : "disabled"
        } successfully`
      );
    } catch (error) {
      // Rollback on error
      setOptimisticEnabled(previousState);
      toast.error(
        `Failed to ${!optimisticEnabled ? "enable" : "disable"} ${featureName}`
      );
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  }, [featureId, featureName, onToggle, optimisticEnabled]);

  const handleToggle = useCallback(async () => {
    if (disabled || loading) return;

    if (requiresConfirmation) {
      setShowConfirmation(true);
      return;
    }

    await performToggle();
  }, [disabled, loading, requiresConfirmation, performToggle]);

  const handleConfirm = useCallback(() => {
    performToggle();
  }, [performToggle]);

  const handleCancel = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  return (
    <>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Switch
            checked={optimisticEnabled}
            onCheckedChange={handleToggle}
            disabled={disabled || loading}
            className="data-[state=checked]:bg-green-600"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-slate-600" />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <AnimatePresence mode="wait">
            {optimisticEnabled ? (
              <motion.div
                key="enabled"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Enabled</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="disabled"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Disabled</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Confirm Feature Toggle</span>
            </DialogTitle>
            <DialogDescription>
              {confirmationMessage ||
                `Are you sure you want to ${
                  !optimisticEnabled ? "enable" : "disable"
                } ${featureName}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className={`w-full sm:w-auto ${
                !optimisticEnabled
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {!optimisticEnabled ? "Enable" : "Disable"} Feature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
