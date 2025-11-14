"use client";

import { useState } from "react";
import {
  ExternalLink,
  Calendar,
  Gavel,
  FileText,
  Building,
  Scale,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CaseDetails } from "@/types/pacer";
import {
  getNatureOfSuitDescription,
  getBankruptcyChapterDescription,
  getCaseTypeDescription,
  formatCaseNumber,
} from "@/lib/backend/pacerCodes";

interface CaseDetailsViewProps {
  caseDetails: CaseDetails;
}

export function CaseDetailsView({ caseDetails }: CaseDetailsViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic", "dates"])
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-2">
      {/* Core Case Information */}
      <Section
        title="Case Information"
        icon={<FileText className="w-4 h-4" />}
        isExpanded={expandedSections.has("basic")}
        onToggle={() => toggleSection("basic")}
      >
        <CompactTable>
          <TableRow
            label="Case Number"
            value={formatCaseNumber(caseDetails.caseNumber)}
            onCopy={() => copyToClipboard(caseDetails.caseNumber, "caseNumber")}
            copied={copiedField === "caseNumber"}
          />
          <TableRow label="Case ID" value={caseDetails.caseId?.toString()} />
          <TableRow
            label="Court"
            value={caseDetails.courtName || caseDetails.court?.toUpperCase()}
          />
          <TableRow label="Office" value={caseDetails.caseOffice} />
          <TableRow
            label="Case Type"
            value={getCaseTypeDescription(caseDetails.caseType || "")}
          />
          <TableRow
            label="Case Year"
            value={caseDetails.caseYear?.toString()}
          />
          <TableRow label="Jurisdiction" value={caseDetails.jurisdiction} />
          <TableRow
            label="Nature of Suit"
            value={getNatureOfSuitDescription(caseDetails.nature || "")}
            subValue={
              caseDetails.nature ? `Code: ${caseDetails.nature}` : undefined
            }
          />
          <TableRow label="Status" value={caseDetails.status}>
            {caseDetails.status && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  caseDetails.status === "Open"
                    ? "bg-chart-1/10 text-chart-1 border border-chart-1/30"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {caseDetails.status}
              </span>
            )}
          </TableRow>
        </CompactTable>
      </Section>

      {/* Important Dates */}
      <Section
        title="Important Dates"
        icon={<Calendar className="w-4 h-4" />}
        isExpanded={expandedSections.has("dates")}
        onToggle={() => toggleSection("dates")}
      >
        <CompactTable>
          <TableRow label="Filed" value={formatDate(caseDetails.filingDate)} />
          {caseDetails.effectiveDateClosed && (
            <TableRow
              label="Closed"
              value={formatDate(caseDetails.effectiveDateClosed)}
            />
          )}
          {caseDetails.dateDismissed && (
            <TableRow
              label="Dismissed"
              value={formatDate(caseDetails.dateDismissed)}
            />
          )}
          {caseDetails.dateDischarged && (
            <TableRow
              label="Discharged"
              value={formatDate(caseDetails.dateDischarged)}
            />
          )}
          {caseDetails.dateReopened && (
            <TableRow
              label="Reopened"
              value={formatDate(caseDetails.dateReopened)}
            />
          )}
          {caseDetails.dateTermed && (
            <TableRow
              label="Termed"
              value={formatDate(caseDetails.dateTermed)}
            />
          )}
          {caseDetails.civilDateInitiate && (
            <TableRow
              label="Date Initiated"
              value={formatDate(caseDetails.civilDateInitiate)}
            />
          )}
          {caseDetails.civilDateDisposition && (
            <TableRow
              label="Date Disposition"
              value={formatDate(caseDetails.civilDateDisposition)}
            />
          )}
          {caseDetails.civilDateTerminated && (
            <TableRow
              label="Date Terminated"
              value={formatDate(caseDetails.civilDateTerminated)}
            />
          )}
        </CompactTable>
      </Section>

      {/* Judicial Assignment */}
      {(caseDetails.judge ||
        caseDetails.magistrateJudge ||
        caseDetails.mdlJudgeLastName) && (
        <Section
          title="Judicial Assignment"
          icon={<Gavel className="w-4 h-4" />}
          isExpanded={expandedSections.has("judicial")}
          onToggle={() => toggleSection("judicial")}
        >
          <CompactTable>
            {caseDetails.judge && (
              <TableRow label="Assigned Judge" value={caseDetails.judge} />
            )}
            {caseDetails.magistrateJudge && (
              <TableRow
                label="Magistrate Judge"
                value={caseDetails.magistrateJudge}
              />
            )}
            {caseDetails.mdlJudgeLastName && (
              <TableRow
                label="MDL Judge"
                value={caseDetails.mdlJudgeLastName}
              />
            )}
          </CompactTable>
        </Section>
      )}

      {/* Bankruptcy Details */}
      {caseDetails.bankruptcyChapter && (
        <Section
          title="Bankruptcy Information"
          icon={<Scale className="w-4 h-4" />}
          isExpanded={expandedSections.has("bankruptcy")}
          onToggle={() => toggleSection("bankruptcy")}
        >
          <CompactTable>
            <TableRow
              label="Chapter"
              value={getBankruptcyChapterDescription(
                caseDetails.bankruptcyChapter || ""
              )}
              subValue={caseDetails.bankruptcyChapter}
            />
            <TableRow
              label="Joint Filing"
              value={caseDetails.jointBankruptcyFlag === "y" ? "Yes" : "No"}
            />
            {caseDetails.dispositionMethod && (
              <TableRow
                label="Disposition Method"
                value={caseDetails.dispositionMethod}
              />
            )}
            {caseDetails.jointDispositionMethod && (
              <TableRow
                label="Joint Disposition"
                value={caseDetails.jointDispositionMethod}
              />
            )}
          </CompactTable>
        </Section>
      )}

      {/* Civil Case Details */}
      {(caseDetails.civilStatInitiated ||
        caseDetails.civilStatDisposition ||
        caseDetails.civilStatTerminated) && (
        <Section
          title="Civil Case Status"
          icon={<FileText className="w-4 h-4" />}
          isExpanded={expandedSections.has("civil")}
          onToggle={() => toggleSection("civil")}
        >
          <CompactTable>
            {caseDetails.civilStatInitiated && (
              <TableRow
                label="Status Initiated"
                value={caseDetails.civilStatInitiated}
              />
            )}
            {caseDetails.civilStatDisposition && (
              <TableRow
                label="Status Disposition"
                value={caseDetails.civilStatDisposition}
              />
            )}
            {caseDetails.civilStatTerminated && (
              <TableRow
                label="Status Terminated"
                value={caseDetails.civilStatTerminated}
              />
            )}
            {caseDetails.civilCtoNumber && (
              <TableRow label="CTO Number" value={caseDetails.civilCtoNumber} />
            )}
            {caseDetails.civilTransferee && (
              <TableRow
                label="Transferee"
                value={caseDetails.civilTransferee}
              />
            )}
          </CompactTable>
        </Section>
      )}

      {/* MDL Information */}
      {(caseDetails.mdlCourtId ||
        caseDetails.mdlStatus ||
        caseDetails.jpmlNumber) && (
        <Section
          title="Multi-District Litigation"
          icon={<Building className="w-4 h-4" />}
          isExpanded={expandedSections.has("mdl")}
          onToggle={() => toggleSection("mdl")}
        >
          <CompactTable>
            {caseDetails.jpmlNumber && (
              <TableRow
                label="JPML Number"
                value={caseDetails.jpmlNumber.toString()}
              />
            )}
            {caseDetails.mdlCourtId && (
              <TableRow
                label="MDL Court"
                value={caseDetails.mdlCourtId.toUpperCase()}
              />
            )}
            {caseDetails.mdlStatus && (
              <TableRow label="MDL Status" value={caseDetails.mdlStatus} />
            )}
            {caseDetails.mdlLitType && (
              <TableRow
                label="Litigation Type"
                value={caseDetails.mdlLitType}
              />
            )}
            {caseDetails.mdlTransferee && (
              <TableRow label="Transferee" value={caseDetails.mdlTransferee} />
            )}
            {caseDetails.mdlTransfereeDistrict && (
              <TableRow
                label="Transferee District"
                value={caseDetails.mdlTransfereeDistrict}
              />
            )}
            {caseDetails.mdlExtension && (
              <TableRow label="Extension" value={caseDetails.mdlExtension} />
            )}
            {caseDetails.mdlDateReceived && (
              <TableRow
                label="Date Received"
                value={formatDate(caseDetails.mdlDateReceived)}
              />
            )}
            {caseDetails.mdlDateOrdered && (
              <TableRow
                label="Date Ordered"
                value={formatDate(caseDetails.mdlDateOrdered)}
              />
            )}
          </CompactTable>
        </Section>
      )}

      {/* CM/ECF Access */}
      {caseDetails.caseLink && (
        <div className="bg-chart-3/10 border border-chart-3/30 rounded-lg p-3 mt-4">
          <p className="text-xs text-chart-3 mb-2">
            Access full case details, docket sheets, and documents in CM/ECF
          </p>
          <a
            href={caseDetails.caseLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
          >
            <ExternalLink className="w-4 h-4" />
            Open in CM/ECF
          </a>
        </div>
      )}
    </div>
  );
}

// Helper Components

function Section({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="text-primary">{icon}</div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompactTable({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border">{children}</div>;
}

function TableRow({
  label,
  value,
  subValue,
  onCopy,
  copied,
  children,
}: {
  label: string;
  value?: string;
  subValue?: string;
  onCopy?: () => void;
  copied?: boolean;
  children?: React.ReactNode;
}) {
  if (!value && !children) return null;

  return (
    <div className="flex items-center justify-between p-2 hover:bg-muted/50 transition-colors text-xs">
      <span className="text-muted-foreground font-medium flex-shrink-0 w-32">
        {label}
      </span>
      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
        {children || (
          <div className="text-right">
            <span className="font-semibold text-foreground">{value}</span>
            {subValue && (
              <div className="text-muted-foreground text-xs">{subValue}</div>
            )}
          </div>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-3 h-3 text-chart-1" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
