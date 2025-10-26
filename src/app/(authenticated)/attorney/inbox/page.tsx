"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, AlertCircle, User, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConversationView } from "@/components/attorney/inbox/ConversationView";

interface Conversation {
  id: string;
  consultationRequestId: string;
  otherParty: {
    id: string;
    name: string | null;
    image: string | null;
    customerProfile?: {
      companyName: string | null;
    } | null;
    lawyerProfile?: {
      firmName: string | null;
      specialty: string | null;
    } | null;
  };
  consultationRequest: {
    id: string;
    caseType: string;
    status: string;
    urgency: string;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

function InboxPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversationIdParam);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/attorney/conversations");
      const data = await response.json();

      if (response.ok) {
        setConversations(data.conversations || []);
        setError(null);
      } else {
        setError(data.error || "Failed to load conversations");
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (conversationIdParam) {
      setSelectedConversationId(conversationIdParam);
    }
  }, [conversationIdParam]);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      router.push(`/attorney/inbox?conversationId=${conversationId}`, {
        scroll: false,
      });
    },
    [router]
  );

  const handleCloseConversation = useCallback(() => {
    setSelectedConversationId(null);
    router.push("/attorney/inbox", { scroll: false });
  }, [router]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 shadow-sm py-4 sm:py-6 bg-slate-50">
        <div className="px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Inbox</h1>
              <p className="text-sm mt-1 text-slate-600">
                Manage your consultation conversations
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 overflow-y-auto flex-shrink-0 ${
            selectedConversationId ? "hidden md:block" : "block"
          }`}
        >
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {error && !loading && (
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="p-6 text-center py-12">
              <Mail className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-bold mb-2 text-slate-900">
                No Conversations Yet
              </h3>
              <p className="text-sm text-slate-600">
                Your consultation conversations will appear here
              </p>
            </div>
          )}

          {!loading && !error && conversations.length > 0 && (
            <div className="divide-y divide-slate-200">
              {conversations.map(conversation => {
                const isSelected = selectedConversationId === conversation.id;
                const otherParty = conversation.otherParty;
                const profile =
                  otherParty.lawyerProfile || otherParty.customerProfile;
                const profileName =
                  profile && "firmName" in profile
                    ? profile.firmName
                    : profile && "companyName" in profile
                      ? profile.companyName
                      : "Professional";

                return (
                  <motion.button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                      isSelected ? "bg-blue-50 border-l-4 border-blue-700" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative flex-shrink-0">
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
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">
                            {conversation.unreadCount > 9
                              ? "9+"
                              : conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm truncate">
                            {otherParty.name || "Anonymous User"}
                          </h4>
                          <span className="text-xs flex-shrink-0 text-slate-500">
                            {new Date(
                              conversation.lastMessageAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-xs mb-2 truncate text-slate-600">
                          {profileName}
                        </p>
                        <div className="flex items-center mb-2">
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {conversation.consultationRequest.caseType}
                          </Badge>
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-xs line-clamp-2 text-slate-600">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Conversation View */}
        <div
          className={`flex-1 ${selectedConversationId ? "" : "hidden md:flex"}`}
        >
          {selectedConversationId ? (
            <ConversationView
              conversationId={selectedConversationId}
              onClose={handleCloseConversation}
            />
          ) : (
            <div className="flex items-center justify-center w-full p-4">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-bold mb-2 text-slate-900">
                  Select a Conversation
                </h3>
                <p className="text-sm text-slate-600">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full bg-white overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-slate-600">Loading conversations...</p>
            </div>
          </div>
        </div>
      }
    >
      <InboxPageContent />
    </Suspense>
  );
}
