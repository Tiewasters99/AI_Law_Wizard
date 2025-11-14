"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "@/lib/frontend/designSystem";
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNotifications } from "@/hooks/useNotifications";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "client" | "attorney";
  timestamp: Date;
  isRead: boolean;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface Conversation {
  id: string;
  attorneyId: string;
  attorneyName: string;
  attorneyAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  caseType: string;
  urgency: string;
  consultationRequestId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function InboxPage() {
  const { data: session } = useSession();
  const { refetch: refetchNotifications } = useNotifications();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Conversations" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/client/conversations");
        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        if (data.success) {
          // Transform API data to match component interface
          const transformedConversations: Conversation[] =
            data.conversations.map((conv: any) => ({
              id: conv.id,
              attorneyId: conv.attorney.id,
              attorneyName: conv.attorney.name,
              attorneyAvatar: conv.attorney.image,
              lastMessage: conv.lastMessage
                ? {
                    id: conv.lastMessage.id,
                    content: conv.lastMessage.content,
                    senderId: conv.lastMessage.senderId,
                    senderName:
                      conv.lastMessage.senderId === session?.user?.id
                        ? "You"
                        : conv.attorney.name,
                    senderType:
                      conv.lastMessage.senderId === session?.user?.id
                        ? "client"
                        : "attorney",
                    timestamp: new Date(conv.lastMessage.createdAt),
                    isRead: conv.lastMessage.isRead,
                  }
                : {
                    id: "empty",
                    content: "No messages yet",
                    senderId: "",
                    senderName: "",
                    senderType: "attorney",
                    timestamp: new Date(conv.createdAt),
                    isRead: true,
                  },
              unreadCount: conv.unreadCount,
              status: conv.consultationRequest?.status || "pending",
              caseType:
                conv.consultationRequest?.caseType || "General Consultation",
              urgency: conv.consultationRequest?.urgency || "medium",
              consultationRequestId: conv.consultationRequest?.id,
              createdAt: new Date(conv.createdAt),
              updatedAt: new Date(conv.lastMessageAt),
            }));

          setConversations(transformedConversations);
        } else {
          throw new Error(data.error || "Failed to fetch conversations");
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setError("Failed to load conversations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchConversations();
    }
  }, [session?.user?.id]);

  // Fetch token balance
  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        const response = await fetch("/api/client/tokens/balance");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTokenBalance(data.balance);
          }
        }
      } catch (error) {
        console.error("Error fetching token balance:", error);
      }
    };

    if (session?.user?.id) {
      fetchTokenBalance();
    }
  }, [session?.user?.id]);

  // Mark messages page as viewed when page loads
  useEffect(() => {
    if (session?.user?.id) {
      const viewedKey = `messages-page-viewed-${session.user.id}`;
      const alreadyViewed = localStorage.getItem(viewedKey) === "true";

      if (!alreadyViewed) {
        localStorage.setItem(viewedKey, "true");
        // Dispatch custom event for same-tab updates (storage event only fires in other tabs)
        window.dispatchEvent(
          new CustomEvent("localStorageChange", {
            detail: { key: viewedKey, value: "true" },
          })
        );
        // Trigger notification count refetch to update badge immediately
        refetchNotifications();
      }
    }
  }, [session?.user?.id, refetchNotifications]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `/api/client/messages/${selectedConversation.id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }

          const data = await response.json();
          if (data.success) {
            // Transform API data to match component interface
            const transformedMessages: Message[] = data.messages.map(
              (msg: any) => ({
                id: msg.id,
                content: msg.content,
                senderId: msg.senderId,
                senderName:
                  msg.senderId === session?.user?.id ? "You" : msg.sender.name,
                senderType:
                  msg.senderId === session?.user?.id ? "client" : "attorney",
                timestamp: new Date(msg.createdAt),
                isRead: msg.isRead,
                attachments: msg.attachments
                  ? (() => {
                      try {
                        // If it's already an object/array, return it
                        if (typeof msg.attachments === "object") {
                          return msg.attachments;
                        }
                        // If it's a string, try to parse it
                        if (typeof msg.attachments === "string") {
                          // Check if it's a URL (starts with http)
                          if (msg.attachments.startsWith("http")) {
                            return [msg.attachments];
                          }
                          // Try to parse as JSON
                          return JSON.parse(msg.attachments);
                        }
                        return undefined;
                      } catch (error) {
                        // If parsing fails, treat as URL string
                        return [msg.attachments];
                      }
                    })()
                  : undefined,
              })
            );

            setMessages(transformedMessages);
          } else {
            throw new Error(data.error || "Failed to fetch messages");
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          setError("Failed to load messages. Please try again.");
        }
      };

      fetchMessages();
    }
  }, [selectedConversation, session?.user?.id]);

  // Mark consultation request as viewed when conversation is selected
  useEffect(() => {
    if (
      selectedConversation?.consultationRequestId &&
      selectedConversation.status === "pending"
    ) {
      const markAsViewed = async () => {
        try {
          const response = await fetch(
            `/api/client/consultation-requests/${selectedConversation.consultationRequestId}/viewed`,
            {
              method: "POST",
            }
          );

          if (response.ok) {
            // Optionally refetch notification counts to update badge
            // The useNotifications hook will poll and update automatically
          }
        } catch (error) {
          // Silently fail - don't disrupt user experience
          console.error("Error marking request as viewed:", error);
        }
      };

      markAsViewed();
    }
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch =
      conv.attorneyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.caseType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/client/messages/${selectedConversation.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newMessage.trim(),
            attachments: null, // TODO: Add file attachment support
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      if (data.success) {
        // Add the new message to the messages list
        const newMessageObj: Message = {
          id: data.message.id,
          content: data.message.content,
          senderId: data.message.senderId,
          senderName:
            data.message.senderId === session?.user?.id
              ? "You"
              : data.message.sender.name,
          senderType:
            data.message.senderId === session?.user?.id ? "client" : "attorney",
          timestamp: new Date(data.message.createdAt),
          isRead: true,
          attachments: data.message.attachments
            ? JSON.parse(data.message.attachments)
            : undefined,
        };

        setMessages(prev => [...prev, newMessageObj]);
        setNewMessage("");

        // Update conversation's last message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: newMessageObj,
                  updatedAt: new Date(),
                }
              : conv
          )
        );
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-accent/10 text-accent-foreground border-accent/30";
      case "accepted":
        return "bg-primary/10 text-primary border-primary/30";
      case "in-progress":
        return "bg-chart-1/10 text-chart-1 border-chart-1/30";
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Toggle sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(true);
      } else if (selectedConversation) {
        setShowSidebar(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedConversation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex relative">
      {/* Mobile Overlay */}
      {showSidebar && selectedConversation && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - Conversation List */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-full sm:w-80 lg:w-1/3 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="lg:hidden mr-2"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground truncate">
                Messages
              </h1>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs sm:text-sm">
                {tokenBalance} tokens
              </Badge>
              <Badge
                variant="secondary"
                className="bg-primary text-primary-foreground text-xs sm:text-sm"
              >
                {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}{" "}
                unread
              </Badge>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
              {statusOptions.map(option => (
                <Button
                  key={option.value}
                  variant={
                    filterStatus === option.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setFilterStatus(option.value)}
                  className="whitespace-nowrap text-xs sm:text-sm h-9"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No conversations found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map(conversation => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      if (isMobile) {
                        setShowSidebar(false);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.attorneyAvatar} />
                        <AvatarFallback>
                          {conversation.attorneyName
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={`font-medium truncate ${
                              selectedConversation?.id === conversation.id
                                ? "text-primary-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {conversation.attorneyName}
                          </h3>
                          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  selectedConversation?.id === conversation.id
                                    ? "bg-primary-foreground text-primary"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <span
                              className={`text-xs whitespace-nowrap ${
                                selectedConversation?.id === conversation.id
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate min-w-0 flex-1 ${
                              selectedConversation?.id === conversation.id
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {conversation.lastMessage.content}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs flex-shrink-0 ${
                              selectedConversation?.id === conversation.id
                                ? "border-primary-foreground/30 text-primary-foreground"
                                : getStatusColor(conversation.status)
                            }`}
                          >
                            {getStatusLabel(conversation.status)}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mt-1 gap-2">
                          <span
                            className={`text-xs truncate ${
                              selectedConversation?.id === conversation.id
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground"
                            }`}
                          >
                            {conversation.caseType}
                          </span>
                          <span
                            className={`text-xs whitespace-nowrap ${
                              selectedConversation?.id === conversation.id
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground"
                            }`}
                          >
                            {conversation.urgency} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content - Messages */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-card border-b border-border p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(true)}
                    className="lg:hidden mr-1"
                    aria-label="Open sidebar"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarImage src={selectedConversation.attorneyAvatar} />
                    <AvatarFallback>
                      {selectedConversation.attorneyName
                        .split(" ")
                        .map(n => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-foreground truncate text-sm sm:text-base">
                      {selectedConversation.attorneyName}
                    </h2>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(selectedConversation.status)}`}
                      >
                        {getStatusLabel(selectedConversation.status)}
                      </Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">
                        {selectedConversation.caseType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <Phone className="w-4 h-4 sm:mr-1" />
                    <span className="hidden md:inline">Call</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <Mail className="w-4 h-4 sm:mr-1" />
                    <span className="hidden md:inline">Email</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
                      <DropdownMenuItem>Archive Conversation</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3 sm:p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.senderType === "client"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                        message.senderType === "client"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border text-card-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className={`flex items-center space-x-2 p-2 sm:p-2.5 rounded-lg transition-all duration-200 ${
                                  message.senderType === "client"
                                    ? "bg-primary-foreground/20 hover:bg-primary-foreground/30"
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                              >
                                <FileText
                                  className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                                    message.senderType === "client"
                                      ? "text-primary-foreground"
                                      : "text-primary"
                                  }`}
                                />
                                <span
                                  className={`text-xs sm:text-sm truncate min-w-0 flex-1 ${
                                    message.senderType === "client"
                                      ? "text-primary-foreground font-medium"
                                      : "text-foreground font-medium"
                                  }`}
                                  title={attachment.name}
                                >
                                  {attachment.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      <p
                        className={`text-xs mt-1 ${
                          message.senderType === "client"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-card border-t border-border p-3 sm:p-4">
              {error && (
                <Alert variant="destructive" className="mb-3 sm:mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <Textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="min-h-[40px] max-h-32 resize-none text-sm sm:text-base"
                    disabled={isSending}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="h-10 w-10 p-0 flex-shrink-0"
                >
                  {isSending ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Select a conversation
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {isMobile
                  ? "Tap a conversation to start messaging"
                  : "Choose a conversation from the sidebar to start messaging"}
              </p>
              {isMobile && (
                <Button
                  onClick={() => setShowSidebar(true)}
                  className="mt-4"
                  variant="outline"
                >
                  View Conversations
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
