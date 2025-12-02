"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// Message type definition
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Video, Send, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function ClientDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [issue, setIssue] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Check if user has role set, redirect to role-selection if not
  useEffect(() => {
    if (status === "loading") return;
    if (session && !session.user?.role) {
      router.push("/auth/role-selection");
    }
  }, [session, status, router]);

  const handleSubmitIssue = useCallback(
    async (userIssue: string) => {
      setIsLoading(true);

      // Create user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content: userIssue.trim(),
        role: "user",
        timestamp: new Date(),
      };

      try {
        // Call the legal analysis API endpoint
        // Get existing sessionId from localStorage if available
        const existingSessionId = null;

        const response = await fetch("/api/client/legal-research", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: userIssue,
            stream: true,
            model: "openai/gpt-4o-mini",
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorData}`);
        }

        // Handle streaming response
        let markdownContent = "";

        // Create initial assistant message with empty content
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "",
          role: "assistant",
          timestamp: new Date(),
        };

        // Store initial messages and navigate to chat page immediately
        localStorage.setItem(
          "legalChatMessages",
          JSON.stringify([userMessage, assistantMessage])
        );
        // Keep user on dashboard during streaming; redirect after session is created

        // Process the stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === "content") {
                    markdownContent += data.content;
                    // Update localStorage with accumulated content
                    const updatedAssistantMessage = {
                      ...assistantMessage,
                      content: markdownContent,
                    };
                    localStorage.setItem(
                      "legalChatMessages",
                      JSON.stringify([userMessage, updatedAssistantMessage])
                    );
                    // Trigger a custom event to update the chat page
                    window.dispatchEvent(new CustomEvent("chat-update"));
                  } else if (data.type === "done") {
                    // Streaming complete; redirect to wizard with sessionId
                    if (data.sessionId) {
                      localStorage.removeItem("legalChatMessages");
                      router.replace(
                        `/client/wizard?sessionId=${data.sessionId}`
                      );
                    } else {
                      // Fallback: go to wizard without session (should rarely happen)
                      router.replace("/client/wizard");
                    }
                  } else if (data.type === "error") {
                    throw new Error(data.error);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      } catch (error) {
        console.error("Error processing consultation:", error);

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Error: ${
            (error as Error).message
          }\n\nPlease check your API configuration or try again later.`,
          role: "assistant",
          timestamp: new Date(),
        };

        // Store error messages and navigate
        localStorage.setItem(
          "legalChatMessages",
          JSON.stringify([userMessage, errorMessage])
        );
        router.push("/client/wizard");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (issue.trim() && !isLoading) {
        handleSubmitIssue(issue.trim());
      }
    },
    [issue, isLoading, handleSubmitIssue]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as React.FormEvent);
      }
    },
    [handleSubmit]
  );

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const response = await fetch("/api/embedding", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // Add uploaded files to the issue text
      const fileNames = Array.from(files)
        .map(f => f.name)
        .join(", ");
      setIssue(
        prev => prev + (prev ? "\n\n" : "") + `Uploaded files: ${fileNames}`
      );
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setUploadingFiles(false);
    }
  }, []);

  const triggerFileInput = useCallback(
    (type: "document" | "image" | "video") => {
      if (fileInputRef.current) {
        fileInputRef.current.accept =
          type === "document"
            ? ".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.json"
            : type === "image"
              ? ".jpg,.jpeg,.png,.gif,.webp"
              : ".mp4,.avi,.mov,.wmv,.flv,.webm";
        fileInputRef.current.click();
      }
    },
    []
  );

  return (
    <div
      className="bg-background flex flex-col items-center pt-8 sm:pt-16 md:pt-24 lg:pt-40"
      data-tour="dashboard"
    >
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        {/* Main Heading */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-2 leading-tight">
            What{" "}
            <span className="text-transparent bg-gradient-to-r from-primary to-chart-4 bg-clip-text">
              problem
            </span>{" "}
            can I help
            <br />
            you{" "}
            <span className="text-transparent bg-gradient-to-r from-chart-3 to-chart-5 bg-clip-text">
              solve
            </span>{" "}
            today?
          </h1>
        </div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="border shadow-lg">
            <form onSubmit={handleSubmit} className="relative">
              <div className="p-2.5 sm:p-3">
                <Textarea
                  value={issue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setIssue(e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your issue, tell me your concerns, outline your questions."
                  className="min-h-[80px] sm:min-h-[100px] border-none resize-none text-sm sm:text-base placeholder:italic placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  disabled={isLoading}
                />
              </div>

              {/* Bottom toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 sm:p-3 border-t border-border gap-2 sm:gap-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {uploadingFiles ? "Uploading files..." : "Upload files:"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 sm:p-2 h-auto"
                      onClick={() => triggerFileInput("document")}
                      disabled={uploadingFiles}
                      title="Upload Document"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 sm:p-2 h-auto"
                      onClick={() => triggerFileInput("image")}
                      disabled={uploadingFiles}
                      title="Upload Image"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 sm:p-2 h-auto"
                      onClick={() => triggerFileInput("video")}
                      disabled={uploadingFiles}
                      title="Upload Video"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!issue.trim() || isLoading}
                  className="rounded-full p-2 h-auto min-w-[40px] disabled:opacity-50 w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 mr-2 sm:mr-0" />
                  <span className="sm:hidden">Send</span>
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={e => handleFileUpload(e.target.files)}
              />
            </form>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            This AI provides general legal information only and does not
            constitute legal advice. For specific legal matters, consult with a
            qualified attorney.
          </p>
        </div>
      </div>
    </div>
  );
}
