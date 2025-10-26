"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { TokenTracker } from "@/lib/frontend/tokenTracker";
import { colors } from "@/lib/frontend/designSystem";
import {
  FileText,
  Upload,
  Search,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Plus,
  FolderOpen,
  Cloud,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Upgrade Modal Component (inline)
function UpgradeModal({
  isOpen,
  onClose,
  currentUsage,
  limit,
  feature,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUsage: number;
  limit: number;
  feature: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md">
        <h3 className="text-lg font-semibold mb-2">Token Limit Reached</h3>
        <p className="text-gray-600 mb-4">
          You've used {currentUsage} of {limit} tokens. Purchase more tokens to
          continue using {feature}.
        </p>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

// Document Analysis Interface Component (inline)
function DocumentAnalysisInterface({
  onDocumentQuery,
  documents,
  tokenCost,
}: {
  onDocumentQuery: (documentId: string, query: string) => void;
  documents: any[];
  tokenCost: number;
}) {
  const [selectedDoc, setSelectedDoc] = React.useState<string>("");
  const [query, setQuery] = React.useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select Document
          </label>
          <select
            value={selectedDoc}
            onChange={e => setSelectedDoc(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a document...</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            Your Question
          </label>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask a question about this document..."
            className="w-full p-2 border rounded min-h-[100px]"
          />
        </div>
        <Button
          onClick={() => {
            if (selectedDoc && query) {
              onDocumentQuery(selectedDoc, query);
              setQuery("");
            }
          }}
          disabled={!selectedDoc || !query}
        >
          Analyze ({tokenCost} tokens)
        </Button>
      </CardContent>
    </Card>
  );
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
  url: string;
  thumbnail?: string;
  metadata?: {
    pages?: number;
    author?: string;
    created?: Date;
    modified?: Date;
  };
}

interface QueryResult {
  id: string;
  query: string;
  result: string;
  timestamp: Date;
  tokensUsed: number;
  documentId: string;
  documentName: string;
}

const DOCUMENT_QUERY_TOKEN_COST = 5;

export default function IntegrationsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [tokenUsage, setTokenUsage] = useState({ used: 0, limit: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("documents");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: "1",
        name: "Employment Contract - John Doe.pdf",
        type: "application/pdf",
        size: 1024000,
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "ready",
        url: "#",
        metadata: {
          pages: 12,
          author: "HR Department",
          created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          modified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      {
        id: "2",
        name: "Lease Agreement - Office Space.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 512000,
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "ready",
        url: "#",
        metadata: {
          pages: 8,
          author: "Legal Team",
          created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          modified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      },
      {
        id: "3",
        name: "Non-Disclosure Agreement.pdf",
        type: "application/pdf",
        size: 256000,
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "processing",
        url: "#",
      },
      {
        id: "4",
        name: "Insurance Policy - General Liability.pdf",
        type: "application/pdf",
        size: 2048000,
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: "ready",
        url: "#",
        metadata: {
          pages: 45,
          author: "Insurance Company",
          created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          modified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    ];

    const mockQueryResults: QueryResult[] = [
      {
        id: "1",
        query: "What are the termination clauses in this employment contract?",
        result:
          "The employment contract contains several termination clauses:\n\n1. **At-Will Employment**: Either party may terminate the employment relationship at any time with or without cause.\n\n2. **Notice Period**: The employee must provide 2 weeks written notice before resignation.\n\n3. **Severance**: In case of termination without cause, the employee is entitled to 2 weeks severance pay for each year of service.\n\n4. **Non-Compete**: For 12 months after termination, the employee cannot work for direct competitors within a 50-mile radius.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tokensUsed: 5,
        documentId: "1",
        documentName: "Employment Contract - John Doe.pdf",
      },
      {
        id: "2",
        query: "What is the rent amount and payment schedule?",
        result:
          "Based on the lease agreement:\n\n**Monthly Rent**: $3,500 per month\n**Payment Schedule**: Rent is due on the 1st of each month\n**Late Fee**: $50 if payment is received after the 5th of the month\n**Security Deposit**: $7,000 (equivalent to 2 months rent)\n**Lease Term**: 3 years with automatic renewal option",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        tokensUsed: 5,
        documentId: "2",
        documentName: "Lease Agreement - Office Space.docx",
      },
    ];

    setDocuments(mockDocuments);
    setQueryResults(mockQueryResults);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Load token usage
    const userId = session?.user?.id;
    if (userId) {
      const used = TokenTracker.getTokenUsage(userId);
      const limit = TokenTracker.getLimit(userId);
      setTokenUsage({ used, limit });
    }
  }, [session?.user?.id]);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDocumentQuery = async (documentId: string, query: string) => {
    const userId = session?.user?.id;
    if (!userId) return;

    // Check token limit
    const hasExceeded = TokenTracker.hasExceededLimit(userId);
    if (hasExceeded) {
      const usage = TokenTracker.getUsageSummary(userId);
      setTokenUsage({ used: usage.used, limit: usage.limit });
      setShowUpgradeModal(true);
      return;
    }

    try {
      // In real app, this would call the document analysis API
      const mockResult: QueryResult = {
        id: Date.now().toString(),
        query,
        result: `This is a mock response for the query: "${query}"\n\nThe document has been analyzed and the relevant information has been extracted. In a real implementation, this would contain the actual AI-generated analysis of the document content.`,
        timestamp: new Date(),
        tokensUsed: DOCUMENT_QUERY_TOKEN_COST,
        documentId,
        documentName:
          documents.find(d => d.id === documentId)?.name || "Unknown Document",
      };

      setQueryResults(prev => [mockResult, ...prev]);

      // Update token usage
      TokenTracker.addTokenUsage(DOCUMENT_QUERY_TOKEN_COST, userId);
      const updatedUsage = TokenTracker.getUsageSummary(userId);
      setTokenUsage({ used: updatedUsage.used, limit: updatedUsage.limit });

      setSuccess("Document query completed successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error querying document:", error);
      setError("Failed to query document. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsLoading(true);
    setError(null);

    try {
      // In real app, this would upload to Vercel Blob and process
      const newDocuments: Document[] = Array.from(files).map((file, index) => ({
        id: (documents.length + index + 1).toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        status: "processing" as const,
        url: "#",
      }));

      setDocuments(prev => [...newDocuments, ...prev]);
      setSuccess(`${files.length} file(s) uploaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);

      // Simulate processing completion
      setTimeout(() => {
        setDocuments(prev =>
          prev.map(doc =>
            newDocuments.some(newDoc => newDoc.id === doc.id)
              ? { ...doc, status: "ready" as const }
              : doc
          )
        );
      }, 3000);
    } catch (error) {
      console.error("Error uploading files:", error);
      setError("Failed to upload files. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setQueryResults(prev =>
      prev.filter(result => result.documentId !== documentId)
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📄";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Document Management
              </h1>
              <p className="text-gray-600 mt-2">
                Upload, manage, and analyze your legal documents with AI
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {tokenUsage.limit - tokenUsage.used}
              </div>
              <div className="text-sm text-gray-500">Credits Remaining</div>
            </div>
          </div>

          {/* Token Usage Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Token Usage
              </span>
              <span className="text-sm text-gray-500">
                {tokenUsage.used} / {tokenUsage.limit} used
              </span>
            </div>
            <Progress
              value={(tokenUsage.used / tokenUsage.limit) * 100}
              className="h-2"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.length}
                    </div>
                    <div className="text-sm text-gray-500">Documents</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.filter(d => d.status === "ready").length}
                    </div>
                    <div className="text-sm text-gray-500">Ready</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {queryResults.length}
                    </div>
                    <div className="text-sm text-gray-500">Queries</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {queryResults.reduce(
                        (sum, result) => sum + result.tokensUsed,
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Tokens Used</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="analysis">Document Analysis</TabsTrigger>
            <TabsTrigger value="queries">Query History</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload your legal documents
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={e =>
                      e.target.files && handleFileUpload(e.target.files)
                    }
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild>
                      <span>
                        <Plus className="w-4 h-4 mr-2" />
                        Choose Files
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 10MB each)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Document List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Documents</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredDocuments.map(document => (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {getFileIcon(document.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {document.name}
                            </h3>
                            {getStatusIcon(document.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatFileSize(document.size)}</span>
                            <span>
                              {document.uploadedAt.toLocaleDateString()}
                            </span>
                            {document.metadata?.pages && (
                              <span>{document.metadata.pages} pages</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocument(document)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("analysis")}
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          Analyze
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDocument(document.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}

                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No documents found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <DocumentAnalysisInterface
              onDocumentQuery={handleDocumentQuery}
              documents={documents.filter(d => d.status === "ready")}
              tokenCost={DOCUMENT_QUERY_TOKEN_COST}
            />
          </TabsContent>

          <TabsContent value="queries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Query History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {queryResults.map(result => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {result.query}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Document: {result.documentName}
                          </p>
                          <div className="text-sm text-gray-600 whitespace-pre-wrap">
                            {result.result}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {result.tokensUsed} tokens
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {result.timestamp.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {queryResults.length === 0 && (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No queries yet</p>
                      <p className="text-sm text-gray-400">
                        Start analyzing your documents to see query history
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={tokenUsage.used}
        limit={tokenUsage.limit}
        feature="document-analysis"
      />
    </div>
  );
}
