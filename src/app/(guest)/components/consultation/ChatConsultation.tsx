import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Video, Send, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface ChatConsultationProps {
  onSubmit: (issue: string) => void;
  isLoading: boolean;
}

export default function ChatConsultation({
  onSubmit,
  isLoading,
}: ChatConsultationProps) {
  const [issue, setIssue] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (issue.trim() && !isLoading) {
        onSubmit(issue.trim());
      }
    },
    [issue, isLoading, onSubmit]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
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
    <div className="bg-white flex flex-col items-center px-4 pt-40">
      <div className="w-full max-w-3xl mx-auto">
        {/* Main Heading */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-2 leading-tight">
            What{" "}
            <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
              problem
            </span>{" "}
            can I help
            <br />
            you{" "}
            <span className="text-transparent bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text">
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
          <Card className="border border-gray-200 shadow-lg bg-white">
            <form onSubmit={handleSubmit} className="relative">
              <div className="p-2.5 sm:p-3">
                <Textarea
                  value={issue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setIssue(e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your issue, tell me your concerns, outline your questions."
                  className="min-h-[80px] sm:min-h-[100px] border-none resize-none text-sm sm:text-base placeholder:italic placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  disabled={isLoading}
                />
              </div>

              {/* Bottom toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 sm:p-3 border-t border-gray-100 gap-2 sm:gap-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {uploadingFiles ? "Uploading files..." : "Upload files:"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 sm:p-2 h-auto"
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
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 sm:p-2 h-auto"
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
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 sm:p-2 h-auto"
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
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full p-2 h-auto min-w-[40px] disabled:opacity-50 w-full sm:w-auto"
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
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto px-4">
            This AI provides general legal information only and does not
            constitute legal advice. For specific legal matters, consult with a
            qualified attorney.
          </p>
        </div>
      </div>
    </div>
  );
}
