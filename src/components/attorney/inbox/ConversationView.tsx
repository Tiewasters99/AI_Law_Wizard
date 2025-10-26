"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Send,
  Loader2,
  AlertCircle,
  User,
  ArrowLeft,
  Quote,
  Clock,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Conversation {
  id: string;
  client: {
    id: string;
    name: string | null;
    image: string | null;
    customerProfile?: {
      companyName: string | null;
    } | null;
  };
  attorney: {
    id: string;
    name: string | null;
    image: string | null;
    lawyerProfile?: {
      firmName: string | null;
      specialty: string | null;
    } | null;
  };
  consultationRequest: {
    id: string;
    caseType: string;
    description: string;
    status: string;
    urgency: string;
    createdAt: string;
  };
  messages: Message[];
}

interface ConversationViewProps {
  conversationId: string;
  onClose?: () => void;
}

const getUrgencyConfig = (urgency: string) => {
  const configs: Record<
    string,
    { color: string; bgColor: string; borderColor: string; icon: any }
  > = {
    LOW: {
      color: "#059669",
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
      icon: Clock,
    },
    MEDIUM: {
      color: "#d97706",
      bgColor: "#fffbeb",
      borderColor: "#fde68a",
      icon: Clock,
    },
    HIGH: {
      color: "#dc2626",
      bgColor: "#fef2f2",
      borderColor: "#fecaca",
      icon: AlertTriangle,
    },
    URGENT: {
      color: "#7f1d1d",
      bgColor: "#fee2e2",
      borderColor: "#fca5a5",
      icon: AlertTriangle,
    },
  };
  return configs[urgency] || configs.MEDIUM;
};

export function ConversationView({
  conversationId,
  onClose,
}: ConversationViewProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = useCallback(async () => {
    try {
      // Fetch conversation details from inbox list
      const conversationsResponse = await fetch("/api/attorney/conversations");
      const conversationsData = await conversationsResponse.json();

      if (!conversationsResponse.ok) {
        throw new Error(
          conversationsData.error || "Failed to load conversations"
        );
      }

      // Find the selected conversation
      const foundConversation = conversationsData.conversations?.find(
        (c: any) => c.id === conversationId
      );

      if (!foundConversation) {
        throw new Error("Conversation not found");
      }

      // Fetch messages for this conversation
      const messagesResponse = await fetch(
        `/api/attorney/conversations/${conversationId}`
      );
      const messagesData = await messagesResponse.json();

      if (!messagesResponse.ok) {
        throw new Error(messagesData.error || "Failed to load messages");
      }

      // Construct the full conversation object
      setConversation({
        id: foundConversation.id,
        client: foundConversation.otherParty,
        attorney: {
          id: "", // Will be inferred from session
          name: null,
          image: null,
          lawyerProfile: null,
        },
        consultationRequest: foundConversation.consultationRequest,
        messages: messagesData.messages || [],
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [fetchConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/attorney/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: message.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("");
        await fetchConversation();
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  }, [message, sending, conversationId, fetchConversation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-red-700">Failed to load conversation</p>
        </div>
      </div>
    );
  }

  const otherParty = conversation.client;
  const otherPartyProfile = conversation.client.customerProfile;
  const profileName = otherPartyProfile?.companyName || "Individual Client";
  const currentUserId = conversation.attorney.id;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 px-6 py-4 flex items-center space-x-3">
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        <div className="flex items-center space-x-3 flex-1">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            {otherParty.image ? (
              <Image
                src={otherParty.image}
                alt={otherParty.name || "User"}
                width={48}
                height={48}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-blue-700" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {otherParty.name || "Anonymous User"}
            </h3>
            <p className="text-sm text-slate-600">{profileName}</p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {conversation.consultationRequest.caseType}
        </Badge>
      </div>

      {/* Request Details */}
      {showRequestDetails && (
        <div className="flex-shrink-0 border-b border-slate-200 px-6 py-4 bg-blue-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Quote className="w-5 h-5 text-blue-700" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Client&apos;s Original Request
                </h4>
                <p className="text-xs text-slate-600">
                  Submitted on{" "}
                  {new Date(
                    conversation.consultationRequest.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRequestDetails(false)}
              className="p-1 hover:bg-slate-200 rounded"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {conversation.consultationRequest.caseType}
              </Badge>
              {(() => {
                const urgencyConfig = getUrgencyConfig(
                  conversation.consultationRequest.urgency
                );
                const UrgencyIcon = urgencyConfig.icon;
                return (
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: urgencyConfig.bgColor,
                      color: urgencyConfig.color,
                      borderColor: urgencyConfig.borderColor,
                    }}
                  >
                    <UrgencyIcon className="w-3 h-3 mr-1" />
                    <span>{conversation.consultationRequest.urgency}</span>
                  </Badge>
                );
              })()}
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200"
              >
                {conversation.consultationRequest.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-white border-l-4 border-blue-500 border border-slate-200">
              <p className="text-sm text-slate-700">
                {conversation.consultationRequest.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {conversation.messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {conversation.messages.map(msg => {
          const isSent = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isSent ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${isSent ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${isSent ? "text-blue-100" : "text-slate-500"}`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-slate-200 p-4">
        {error && (
          <div className="mb-2 p-2 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <div className="flex space-x-2">
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
