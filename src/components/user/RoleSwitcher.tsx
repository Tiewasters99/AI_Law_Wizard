"use client";

import { useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttorneyProfileForm } from "@/components/auth/AttorneyProfileForm";
import { ClientProfileForm } from "@/components/auth/ClientProfileForm";
import { Loader2, RefreshCw } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: "ATTORNEY" | "CUSTOMER";
  userId: string;
}

export function RoleSwitcher({ currentRole, userId }: RoleSwitcherProps) {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [isChecking, setIsChecking] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [eligibility, setEligibility] = useState<{
    canSwitch: boolean;
    hasProfile: boolean;
    requiresProfile: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  const targetRole = useMemo(
    () => (currentRole === "ATTORNEY" ? "CUSTOMER" : "ATTORNEY"),
    [currentRole]
  );

  const handleSwitchClick = useCallback(async () => {
    setIsChecking(true);
    setError("");

    try {
      const response = await fetch(
        `/api/user/role/eligibility?targetRole=${targetRole}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to check eligibility");
      }

      // Extract eligibility data (response is wrapped with success: true)
      const eligibilityData =
        result.success !== undefined
          ? {
              canSwitch: result.canSwitch,
              hasProfile: result.hasProfile,
              requiresProfile: result.requiresProfile,
            }
          : result;

      setEligibility(eligibilityData);
      setIsChecking(false);

      if (eligibilityData.requiresProfile) {
        setShowProfileForm(true);
        setShowDialog(true);
      } else {
        setShowDialog(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check eligibility"
      );
      setIsChecking(false);
    }
  }, [targetRole]);

  const handleConfirmSwitch = useCallback(async () => {
    setIsSwitching(true);
    setError("");

    try {
      const response = await fetch("/api/user/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to switch role");
      }

      // Update session
      await updateSession();

      // Close dialog
      setShowDialog(false);
      setShowProfileForm(false);
      setEligibility(null);

      // Redirect to new role's dashboard
      const dashboard =
        targetRole === "ATTORNEY" ? "/attorney/dashboard" : "/client/dashboard";
      router.push(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch role");
      setIsSwitching(false);
    }
  }, [targetRole, router, updateSession]);

  const handleProfileSubmit = useCallback(
    async (profileData: any) => {
      setIsSwitching(true);
      setError("");

      try {
        const response = await fetch("/api/user/role", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: targetRole,
            profileData,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to switch role");
        }

        // Update session
        await updateSession();

        // Close dialog
        setShowDialog(false);
        setShowProfileForm(false);
        setEligibility(null);

        // Redirect to new role's dashboard
        const dashboard =
          targetRole === "ATTORNEY"
            ? "/attorney/dashboard"
            : "/client/dashboard";
        router.push(dashboard);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to switch role");
        setIsSwitching(false);
      }
    },
    [targetRole, router, updateSession]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">
            Current Role
          </p>
          <Badge variant="default">
            {currentRole === "ATTORNEY" ? "Attorney" : "Client"}
          </Badge>
        </div>
        <Button
          onClick={handleSwitchClick}
          disabled={isChecking || isSwitching}
          variant="outline"
          size="sm"
        >
          {isChecking ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Switch to {targetRole === "ATTORNEY" ? "Attorney" : "Client"}
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border-l-4 border-destructive text-destructive p-3 rounded-xl"
        >
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Switch to {targetRole === "ATTORNEY" ? "Attorney" : "Client"} Role
            </DialogTitle>
            <DialogDescription>
              {showProfileForm
                ? `Please complete your ${targetRole === "ATTORNEY" ? "attorney" : "client"} profile to switch roles.`
                : "Are you sure you want to switch roles? You can switch back anytime."}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {showProfileForm ? (
              <motion.div
                key="profile-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {targetRole === "ATTORNEY" ? (
                  <AttorneyProfileForm
                    onSubmit={handleProfileSubmit}
                    isLoading={isSwitching}
                  />
                ) : (
                  <ClientProfileForm
                    onSubmit={handleProfileSubmit}
                    isLoading={isSwitching}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-4"
              >
                <p className="text-sm text-muted-foreground">
                  You already have a profile for this role. Click confirm to
                  switch.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!showProfileForm && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  setEligibility(null);
                }}
                disabled={isSwitching}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmSwitch} disabled={isSwitching}>
                {isSwitching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Switching...
                  </>
                ) : (
                  "Confirm Switch"
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



