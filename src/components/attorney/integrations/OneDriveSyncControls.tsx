"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { OneDriveFileInfo } from "@/types/onedrive";

interface OneDriveSyncControlsProps {
  files: OneDriveFileInfo[];
  onFileSync?: (files: any[]) => void;
  className?: string;
}

const MAX_SELECTION_LIMIT = 40;

export function OneDriveSyncControls({
  files,
  onFileSync,
  className = "",
}: OneDriveSyncControlsProps) {
  const [selectedForSync, setSelectedForSync] = useState<Set<string>>(
    new Set()
  );
  const [syncingFiles, setSyncingFiles] = useState<Set<string>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    processed: 0,
    total: 0,
    current: "",
  });
  const [batchErrors, setBatchErrors] = useState<
    Array<{ fileName: string; error: string }>
  >([]);

  const unsyncedFiles = files.filter(
    f => !f.isFolder && f.size <= 50 * 1024 * 1024
  ); // 50MB limit

  const selectAllForSync = useCallback(() => {
    const filesToSelect = unsyncedFiles.slice(0, MAX_SELECTION_LIMIT);
    setSelectedForSync(new Set(filesToSelect.map(f => f.id)));

    if (unsyncedFiles.length > MAX_SELECTION_LIMIT) {
      toast.info(`${MAX_SELECTION_LIMIT} files selected (limit reached)`);
    }
  }, [unsyncedFiles]);

  const clearSelection = useCallback(() => {
    setSelectedForSync(new Set());
  }, []);

  const handleBulkSync = useCallback(async () => {
    if (selectedForSync.size === 0 || !onFileSync) return;

    const filesToSync = files.filter(f => selectedForSync.has(f.id));
    setBatchProcessing(true);
    setBatchProgress({ processed: 0, total: filesToSync.length, current: "" });
    setBatchErrors([]);

    try {
      // Simulate batch processing
      for (let i = 0; i < filesToSync.length; i++) {
        const file = filesToSync[i];
        setBatchProgress({
          processed: i,
          total: filesToSync.length,
          current: file.name,
        });

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Call the sync handler
      onFileSync(filesToSync);

      setSelectedForSync(new Set());
      toast.success(`${filesToSync.length} files synced successfully`);
    } catch (error) {
      console.error("Bulk sync error:", error);
      toast.error("Failed to sync files");
    } finally {
      setBatchProcessing(false);
      setBatchProgress({ processed: 0, total: 0, current: "" });
    }
  }, [selectedForSync, files, onFileSync]);

  const allUnsyncedSelected =
    unsyncedFiles.length > 0 &&
    unsyncedFiles.every(f => selectedForSync.has(f.id));

  return (
    <div
      className={`mb-4 p-3 bg-blue-50/50 border border-blue-200/40 rounded-lg ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-800">
            Prepare Files for Analysis
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllForSync}
            disabled={allUnsyncedSelected || unsyncedFiles.length === 0}
            className="text-xs px-2 py-1 h-7"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedForSync.size === 0}
            className="text-xs px-2 py-1 h-7"
          >
            Clear
          </Button>
          <Button
            onClick={handleBulkSync}
            disabled={selectedForSync.size === 0 || batchProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7"
            size="sm"
          >
            {batchProcessing ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Preparing...</span>
              </div>
            ) : (
              `Prepare (${selectedForSync.size})`
            )}
          </Button>
        </div>
      </div>

      {batchProcessing && (
        <div className="mt-3 p-3 bg-blue-50/50 border border-blue-200/40 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                Preparing files...
              </span>
            </div>
            <span className="text-xs text-blue-600">
              {batchProgress.processed}/{batchProgress.total} (
              {Math.round(
                (batchProgress.processed / batchProgress.total) * 100
              )}
              %)
            </span>
          </div>
          <div className="w-full bg-blue-200/60 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(batchProgress.processed / batchProgress.total) * 100}%`,
              }}
            ></div>
          </div>
          {batchProgress.current && (
            <p className="text-xs text-blue-700 truncate">
              {batchProgress.current}
            </p>
          )}
        </div>
      )}

      {files.some(f => !f.isFolder && f.size > 50 * 1024 * 1024) && (
        <div className="mt-4 flex items-center space-x-2 text-xs text-yellow-700 bg-yellow-50/50 rounded-lg px-3 py-2">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
          <span>
            {files.filter(f => !f.isFolder && f.size > 50 * 1024 * 1024).length}{" "}
            file(s) too large (50MB+) - cannot sync
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-600 bg-gray-50/50 rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          <span>
            Selected: {selectedForSync.size} / {MAX_SELECTION_LIMIT} files
          </span>
          {selectedForSync.size >= MAX_SELECTION_LIMIT && (
            <span className="text-red-600 font-medium">• Limit reached</span>
          )}
        </div>
        {selectedForSync.size > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(selectedForSync.size / MAX_SELECTION_LIMIT) * 100}%`,
                }}
              ></div>
            </div>
            <span className="text-gray-500">
              {Math.round((selectedForSync.size / MAX_SELECTION_LIMIT) * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
