"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lock,
  Unlock,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PacerCredentials } from "@/types/pacer";

interface PacerAuthFormProps {
  onAuthenticate: (credentials: PacerCredentials) => Promise<boolean>;
  onLogout: () => Promise<void>;
  onClose?: () => void;
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
  error: string | null;
}

export function PacerAuthForm({
  onAuthenticate,
  onLogout,
  onClose,
  isAuthenticated,
  username,
  loading,
  error,
}: PacerAuthFormProps) {
  const [formData, setFormData] = useState<PacerCredentials>({
    username: "",
    password: "",
    clientCode: "",
    otpCode: "",
    redactFlag: undefined,
  });

  const [redactionAcknowledged, setRedactionAcknowledged] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const credentialsWithRedact = {
      ...formData,
      redactFlag: redactionAcknowledged ? "1" : undefined,
    };

    await onAuthenticate(credentialsWithRedact);
  };

  const handleLogout = async () => {
    await onLogout();
    setFormData({
      username: "",
      password: "",
      clientCode: "",
      otpCode: "",
      redactFlag: undefined,
    });
    setRedactionAcknowledged(false);
    setShowAdvanced(false);
  };

  if (isAuthenticated) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-xl max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-chart-1/10 to-chart-1/5 border-b border-chart-1/30 rounded-t-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-chart-1/20 rounded-xl flex items-center justify-center">
                <Unlock className="w-7 h-7 text-chart-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-chart-1 mb-1">
                  Connected to PACER
                </h3>
                <p className="text-sm text-chart-1/80">
                  Logged in as: <strong>{username}</strong>
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-chart-1/10 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5 text-chart-1" />
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
            disabled={loading}
          >
            Disconnect from PACER
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-t-xl p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Lock className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Connect to PACER</h2>
              <p className="text-sm text-primary-foreground/80">
                Enter your credentials to access court records
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-primary-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <div className="p-6 border-b border-border">
        <Alert className="bg-primary/10 border-primary/30">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm text-foreground">
            Your credentials are not stored and are only used for this session.
            Standard PACER fees apply and will be billed directly to your PACER
            account.
          </AlertDescription>
        </Alert>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-6 pt-4">
          <Alert className="bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-sm text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Primary Credentials - 2 Column Compact Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username */}
          <div>
            <Label
              htmlFor="username"
              className="text-sm font-semibold mb-1.5 block"
            >
              PACER Username *
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={e =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Enter username"
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          {/* Password */}
          <div>
            <Label
              htmlFor="password"
              className="text-sm font-semibold mb-1.5 block"
            >
              PACER Password *
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter password"
              required
              disabled={loading}
              className="h-10"
            />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Advanced Options {!showAdvanced && "(Client Code, MFA)"}
        </button>

        {/* Advanced Fields - Collapsible */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Client Code */}
                <div>
                  <Label
                    htmlFor="clientCode"
                    className="text-sm font-semibold mb-1.5 block"
                  >
                    Client Code{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="clientCode"
                    type="text"
                    value={formData.clientCode}
                    onChange={e =>
                      setFormData({ ...formData, clientCode: e.target.value })
                    }
                    placeholder="If applicable"
                    disabled={loading}
                    className="h-10"
                  />
                </div>

                {/* OTP Code */}
                <div>
                  <Label
                    htmlFor="otpCode"
                    className="text-sm font-semibold mb-1.5 block"
                  >
                    One-Time Passcode{" "}
                    <span className="text-muted-foreground font-normal">
                      (If MFA enabled)
                    </span>
                  </Label>
                  <Input
                    id="otpCode"
                    type="text"
                    value={formData.otpCode}
                    onChange={e =>
                      setFormData({ ...formData, otpCode: e.target.value })
                    }
                    placeholder="6-digit code"
                    disabled={loading}
                    maxLength={6}
                    className="h-10"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Redaction Acknowledgment - Compact */}
        <div className="bg-chart-3/10 border border-chart-3/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="redaction"
              checked={redactionAcknowledged}
              onChange={e => setRedactionAcknowledged(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <div className="flex-1">
              <Label
                htmlFor="redaction"
                className="cursor-pointer text-sm font-semibold text-chart-3"
              >
                I acknowledge federal redaction rules
              </Label>
              <p className="text-xs text-chart-3/80 mt-1">
                Required for filers: I will redact SSNs, DOBs, minor names,
                financial account numbers, and home addresses per Fed. R. App.
                P. 25(a)(5), Fed. R. Civ. P. 5.2, Fed. R. Crim. P. 49.1, Fed. R.
                Bankr. P. 9037.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 font-semibold text-base"
          disabled={loading || !formData.username || !formData.password}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Connecting to PACER...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Connect to PACER
            </>
          )}
        </Button>

        {/* Fee Disclaimer */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          By connecting, you acknowledge that PACER fees ($0.10/page, $3.00 cap
          per document) will be billed to your PACER account.
        </p>
      </form>
    </div>
  );
}
