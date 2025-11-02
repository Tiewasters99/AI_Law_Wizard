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
  createdAt: Date;
  updatedAt: Date;
}

export default function InboxPage() {
  const { data: session } = useSession();
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

  const statusOptions = [
    { value: "all", label: "All Conversations", color: "text-gray-600" },
    { value: "pending", label: "Pending", color: "text-yellow-600" },
    { value: "accepted", label: "Accepted", color: "text-blue-600" },
    { value: "in-progress", label: "In Progress", color: "text-green-600" },
    { value: "completed", label: "Completed", color: "text-gray-600" },
    { value: "cancelled", label: "Cancelled", color: "text-red-600" },
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
                  ? JSON.parse(msg.attachments)
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
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                {tokenBalance} tokens
              </Badge>
              <Badge variant="secondary" className="bg-primary text-white">
                {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}{" "}
                unread
              </Badge>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex space-x-2 overflow-x-auto">
              {statusOptions.map(option => (
                <Button
                  key={option.value}
                  variant={
                    filterStatus === option.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setFilterStatus(option.value)}
                  className="whitespace-nowrap"
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
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No conversations found</p>
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
                        ? "bg-primary text-white"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
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
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {conversation.attorneyName}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  selectedConversation?.id === conversation.id
                                    ? "bg-white text-primary"
                                    : "bg-primary text-white"
                                }`}
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <span
                              className={`text-xs ${
                                selectedConversation?.id === conversation.id
                                  ? "text-white/70"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm truncate ${
                              selectedConversation?.id === conversation.id
                                ? "text-white/80"
                                : "text-gray-600"
                            }`}
                          >
                            {conversation.lastMessage.content}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              selectedConversation?.id === conversation.id
                                ? "border-white/30 text-white"
                                : getStatusColor(conversation.status)
                            }`}
                          >
                            {getStatusLabel(conversation.status)}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-xs ${
                              selectedConversation?.id === conversation.id
                                ? "text-white/60"
                                : "text-gray-500"
                            }`}
                          >
                            {conversation.caseType}
                          </span>
                          <span
                            className={`text-xs ${
                              selectedConversation?.id === conversation.id
                                ? "text-white/60"
                                : "text-gray-500"
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
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.attorneyAvatar} />
                    <AvatarFallback>
                      {selectedConversation.attorneyName
                        .split(" ")
                        .map(n => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.attorneyName}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={getStatusColor(selectedConversation.status)}
                      >
                        {getStatusLabel(selectedConversation.status)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {selectedConversation.caseType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
                      <DropdownMenuItem>Archive Conversation</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
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
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderType === "client"
                          ? "bg-primary text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 p-2 bg-gray-100 rounded"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-xs truncate">
                                  {attachment.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      <p
                        className={`text-xs mt-1 ${
                          message.senderType === "client"
                            ? "text-white/70"
                            : "text-gray-500"
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
            <div className="bg-white border-t border-gray-200 p-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="min-h-[40px] max-h-32 resize-none"
                    disabled={isSending}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
