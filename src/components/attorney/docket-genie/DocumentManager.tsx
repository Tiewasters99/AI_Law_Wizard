"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Trash2,
  Brain,
  DollarSign,
  MoreVertical,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface DownloadedDocument {
  id: string;
  documentId: string;
  fileName: string;
  caseNumber: string;
  description?: string;
  pages: number;
  cost: number;
  downloadedAt: Date;
}

interface DocumentManagerProps {
  documents: DownloadedDocument[];
  onDownload: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

export function DocumentManager({
  documents,
  onDownload,
  onDelete,
}: DocumentManagerProps) {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const router = useRouter();

  const toggleSelect = useCallback((docId: string) => {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedDocs(prev => {
      if (prev.size === documents.length) {
        return new Set();
      }
      return new Set(documents.map(d => d.id));
    });
  }, [documents]);

  const deleteSelected = useCallback(() => {
    if (confirm(`Delete ${selectedDocs.size} selected documents?`)) {
      selectedDocs.forEach(docId => onDelete(docId));
      setSelectedDocs(new Set());
    }
  }, [onDelete, selectedDocs]);

  const analyzeDocument = useCallback(
    (doc: DownloadedDocument) => {
      // Navigate to Document Analysis with pre-loaded document
      router.push(
        `/attorney/wizard?document=${encodeURIComponent(doc.fileName)}`
      );
    },
    [router]
  );

  const totalCost = useMemo(
    () => documents.reduce((sum, doc) => sum + doc.cost, 0),
    [documents]
  );

  if (documents.length === 0) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              No Documents Downloaded
            </h3>
            <p className="text-sm text-muted-foreground">
              Download documents from docket entries to view and analyze them
              here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-muted/50 border border-border rounded-lg p-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedDocs.size === documents.length}
            onChange={selectAll}
            className="h-4 w-4 text-primary rounded border-border focus:ring-primary"
          />
          <span className="text-sm font-medium text-foreground">
            {selectedDocs.size > 0
              ? `${selectedDocs.size} selected`
              : "Select all"}
          </span>

          {selectedDocs.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelected}
              className="ml-2"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Total:{" "}
            <strong className="text-foreground">${totalCost.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      {/* Compact Documents List */}
      <div className="space-y-2">
        <AnimatePresence>
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.02 }}
              className={`relative bg-card border rounded-lg p-3 transition-colors ${
                selectedDocs.has(doc.id)
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedDocs.has(doc.id)}
                  onChange={() => toggleSelect(doc.id)}
                  className="mt-1 h-4 w-4 text-primary rounded border-border focus:ring-primary"
                />

                {/* Icon */}
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm truncate">
                    {doc.fileName}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Case: {doc.caseNumber}
                  </p>
                  {doc.description && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                      {doc.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                    <span>{doc.pages} pages</span>
                    <span>•</span>
                    <span className="font-semibold text-primary">
                      ${doc.cost.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(doc.downloadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === doc.id ? null : doc.id)
                    }
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {openMenuId === doc.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 top-8 w-48 bg-popover border border-border rounded-lg shadow-lg z-20 py-1"
                    >
                      <button
                        onClick={() => {
                          analyzeDocument(doc);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Brain className="w-4 h-4" />
                        Analyze with AI
                      </button>
                      <button
                        onClick={() => {
                          onDownload(doc.documentId);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Again
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this document?")) {
                            onDelete(doc.id);
                          }
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Summary */}
      <div className="bg-primary/5 border border-primary/30 rounded-lg p-3 text-center">
        <p className="text-sm text-primary">
          <strong>{documents.length}</strong> documents downloaded • Total cost:{" "}
          <strong>${totalCost.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}
