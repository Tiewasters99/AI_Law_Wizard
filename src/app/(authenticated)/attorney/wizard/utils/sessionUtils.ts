import { apiEndpoints } from "./constants";

export interface DocumentAnalysisSession {
  sessionId: string;
  userPrompt: string;
  processedFiles: any[];
  analysisResult: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  userPrompt: string;
  processedFiles: any[];
  analysisResult: string;
}

export interface CreateSessionResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

// Create a new document analysis session
export const createDocumentAnalysisSession = async (
  request: CreateSessionRequest
): Promise<string | null> => {
  try {
    const response = await fetch(apiEndpoints.SESSIONS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: CreateSessionResponse = await response.json();

    if (data.success && data.sessionId) {
      return data.sessionId;
    } else {
      console.error("Failed to create session:", data.error);
      return null;
    }
  } catch (error) {
    console.error("Error creating document analysis session:", error);
    return null;
  }
};

// Get session details
export const getDocumentAnalysisSession = async (
  sessionId: string
): Promise<DocumentAnalysisSession | null> => {
  try {
    const response = await fetch(`${apiEndpoints.SESSIONS}/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && data.session) {
      return data.session;
    } else {
      console.error("Failed to get session:", data.error);
      return null;
    }
  } catch (error) {
    console.error("Error getting document analysis session:", error);
    return null;
  }
};

// Update session with new data
export const updateDocumentAnalysisSession = async (
  sessionId: string,
  updates: Partial<DocumentAnalysisSession>
): Promise<boolean> => {
  try {
    const response = await fetch(`${apiEndpoints.SESSIONS}/${sessionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ?? false;
  } catch (error) {
    console.error("Error updating document analysis session:", error);
    return false;
  }
};

// Delete a session
export const deleteDocumentAnalysisSession = async (
  sessionId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${apiEndpoints.SESSIONS}/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ?? false;
  } catch (error) {
    console.error("Error deleting document analysis session:", error);
    return false;
  }
};

// List all sessions for the current user
export const listDocumentAnalysisSessions = async (): Promise<
  DocumentAnalysisSession[]
> => {
  try {
    const response = await fetch(apiEndpoints.SESSIONS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && data.sessions) {
      return data.sessions;
    } else {
      console.error("Failed to list sessions:", data.error);
      return [];
    }
  } catch (error) {
    console.error("Error listing document analysis sessions:", error);
    return [];
  }
};

// Generate a unique session ID
export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `doc_${timestamp}_${randomStr}`;
};

// Validate session data
export const validateSessionData = (
  data: Partial<DocumentAnalysisSession>
): boolean => {
  return !!(
    data.userPrompt &&
    data.processedFiles &&
    Array.isArray(data.processedFiles) &&
    data.analysisResult
  );
};

// Format session for display
export const formatSessionForDisplay = (
  session: DocumentAnalysisSession
): {
  id: string;
  title: string;
  preview: string;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
} => {
  const title =
    session.userPrompt.length > 50
      ? `${session.userPrompt.substring(0, 50)}...`
      : session.userPrompt;

  const preview =
    session.analysisResult.length > 100
      ? `${session.analysisResult.substring(0, 100)}...`
      : session.analysisResult;

  return {
    id: session.sessionId,
    title,
    preview,
    fileCount: session.processedFiles.length,
    createdAt: new Date(session.createdAt).toLocaleDateString(),
    updatedAt: new Date(session.updatedAt).toLocaleDateString(),
  };
};
