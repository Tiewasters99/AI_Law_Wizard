"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud } from "lucide-react";

interface OneDriveAuthSectionProps {
  onSignIn: () => void;
  loading: boolean;
  className?: string;
}

export function OneDriveAuthSection({
  onSignIn,
  loading,
  className = "",
}: OneDriveAuthSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>OneDrive Integration</span>
          <Badge variant="secondary">Authentication Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Cloud className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect to OneDrive
            </h3>
            <p className="text-gray-600">
              Sign in with your Microsoft account to access your OneDrive files.
            </p>
          </div>
          <Button
            onClick={onSignIn}
            disabled={loading}
            className="w-full max-w-xs"
          >
            {loading ? "Connecting..." : "Sign in with Microsoft"}
          </Button>
          <div className="mt-4 text-sm text-gray-500">
            <p>This will allow you to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Browse your OneDrive files and folders</li>
              <li>Upload files to OneDrive</li>
              <li>Sync files to the embedding system</li>
              <li>Search through your files</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

