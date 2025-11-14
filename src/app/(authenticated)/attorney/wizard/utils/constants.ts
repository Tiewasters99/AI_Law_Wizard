import { Variants } from "framer-motion";

// Animation variants for smooth transitions
export const animationVariants = {
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  card: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
} as const;

// Tab definitions for navigation
export const tabs = [
  {
    id: "analysis" as const,
    label: "Analysis",
    icon: "Search",
    description: "AI-powered document analysis and processing",
  },
  {
    id: "files" as const,
    label: "Files",
    icon: "FolderOpen",
    description: "Manage and organize your documents",
  },
  {
    id: "history" as const,
    label: "History",
    icon: "History",
    description: "View past queries and analysis results",
  },
  {
    id: "library" as const,
    label: "Library",
    icon: "Library",
    description: "Document library and storage",
  },
] as const;

// Processing status messages
export const processingMessages = {
  STARTED: "Starting analysis...",
  SEARCHING: "Searching for relevant documents...",
  PROCESSING: "Processing documents with AI...",
  ANALYZING: "Analyzing content and generating insights...",
  COMPLETING: "Finalizing results...",
  COMPLETE: "Analysis complete!",
  ERROR: "An error occurred during processing",
} as const;

// Neumorphic design tokens
export const neumorphicTokens = {
  shadows: {
    light:
      "6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)",
    medium:
      "8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)",
    heavy:
      "12px 12px 24px rgba(163, 177, 198, 0.6), -12px -12px 24px rgba(255, 255, 255, 0.5)",
    inset:
      "inset 4px 4px 8px rgba(163, 177, 198, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.5)",
  },
  colors: {
    background: "#e0e5ec",
    backgroundHover: "#d7dce3",
    text: "#4a5568",
    textLight: "#718096",
    primary: "#3182ce",
    primaryHover: "#2c5aa0",
    success: "#38a169",
    warning: "#d69e2e",
    error: "#e53e3e",
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
  },
} as const;

// File type icons mapping
export const fileTypeIcons = {
  pdf: "FileText",
  doc: "FileText",
  docx: "FileText",
  txt: "FileText",
  json: "FileCode",
  js: "FileCode",
  ts: "FileCode",
  py: "FileCode",
  html: "FileCode",
  css: "FileCode",
  xlsx: "FileSpreadsheet",
  csv: "FileSpreadsheet",
  jpg: "FileImage",
  jpeg: "FileImage",
  png: "FileImage",
  gif: "FileImage",
  mp4: "FileVideo",
  avi: "FileVideo",
  mp3: "FileAudio",
  wav: "FileAudio",
  zip: "Archive",
  rar: "Archive",
  default: "File",
} as const;

// Quick prompts for common analysis tasks
export const quickPrompts = [
  "Summarize the key points of this document",
  "What are the main legal issues discussed?",
  "Extract all important dates and deadlines",
  "Identify potential risks or concerns",
  "What are the key terms and conditions?",
  "Analyze the contract structure and clauses",
  "Find all references to specific laws or regulations",
  "What are the obligations of each party?",
] as const;

// Error messages for different scenarios
export const errorMessages = {
  NO_DOCUMENTS:
    "No relevant documents found. Try uploading more files or rephrasing your query.",
  PROCESSING_TIMEOUT:
    "Processing took too long. Please try with a simpler request.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  INVALID_FILE: "Invalid file format. Please upload a supported document type.",
  UPLOAD_FAILED: "File upload failed. Please try again.",
  ANALYSIS_FAILED: "Analysis failed. Please try again or contact support.",
  GENERIC_ERROR: "An unexpected error occurred. Please try again.",
} as const;

// Success messages
export const successMessages = {
  UPLOAD_SUCCESS: "File uploaded successfully",
  ANALYSIS_COMPLETE: "Analysis completed successfully",
  SESSION_CREATED: "Chat session created",
  FILE_DOWNLOADED: "File downloaded successfully",
  QUERY_SAVED: "Query saved to history",
} as const;

// API endpoints
export const apiEndpoints = {
  DOCUMENT_PROCESSING: "/api/attorney/document-processing",
  CHAT: "/api/attorney/document-processing/chat",
  FILE_CONTENT: "/api/attorney/document-processing/file-content",
  SESSIONS: "/api/attorney/document-processing/sessions",
  QUERY_HISTORY: "/api/attorney/query-history",
  ONEDRIVE: "/api/attorney/onedrive",
} as const;

// Processing timeouts (in milliseconds)
export const timeouts = {
  MODE_DETECTION: 5000,
  AGENT_EXECUTION: 45000,
  FILE_UPLOAD: 30000,
  API_REQUEST: 60000,
} as const;

// File size limits (in bytes)
export const fileLimits = {
  MAX_SINGLE_FILE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_SIZE: 100 * 1024 * 1024, // 100MB
  CHUNK_SIZE: 1024 * 1024, // 1MB
} as const;

// Supported file types
export const supportedFileTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/json",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;
