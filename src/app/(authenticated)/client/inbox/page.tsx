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

  const statusOptions = [
    { value: "all", label: "All Conversations", color: "text-gray-600" },
    { value: "pending", label: "Pending", color: "text-yellow-600" },
    { value: "accepted", label: "Accepted", color: "text-blue-600" },
    { value: "in-progress", label: "In Progress", color: "text-green-600" },
    { value: "completed", label: "Completed", color: "text-gray-600" },
    { value: "cancelled", label: "Cancelled", color: "text-red-600" },
  ];

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: "1",
        attorneyId: "attorney-1",
        attorneyName: "Sarah Johnson",
        attorneyAvatar: undefined,
        lastMessage: {
          id: "msg-1",
          content:
            "I've reviewed your case documents. Let's schedule a call to discuss the next steps.",
          senderId: "attorney-1",
          senderName: "Sarah Johnson",
          senderType: "attorney",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: false,
        },
        unreadCount: 2,
        status: "accepted",
        caseType: "Personal Injury",
        urgency: "medium",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "2",
        attorneyId: "attorney-2",
        attorneyName: "Michael Chen",
        attorneyAvatar: undefined,
        lastMessage: {
          id: "msg-2",
          content:
            "Thank you for the consultation request. I'll review your business contract and get back to you within 24 hours.",
          senderId: "attorney-2",
          senderName: "Michael Chen",
          senderType: "attorney",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          isRead: true,
        },
        unreadCount: 0,
        status: "pending",
        caseType: "Business Law",
        urgency: "low",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "3",
        attorneyId: "attorney-3",
        attorneyName: "Emily Rodriguez",
        attorneyAvatar: undefined,
        lastMessage: {
          id: "msg-3",
          content:
            "I understand this is a sensitive family matter. Let's discuss your options confidentially.",
          senderId: "attorney-3",
          senderName: "Emily Rodriguez",
          senderType: "attorney",
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          isRead: false,
        },
        unreadCount: 1,
        status: "in-progress",
        caseType: "Family Law",
        urgency: "high",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ];

    setConversations(mockConversations);
    setIsLoading(false);
  }, []);

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages: Message[] = [
        {
          id: "msg-1",
          content:
            "Hello, I need help with a personal injury case. I was in a car accident last week.",
          senderId: session?.user?.id || "client",
          senderName: "You",
          senderType: "client",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isRead: true,
        },
        {
          id: "msg-2",
          content:
            "I'm sorry to hear about your accident. I'd be happy to help you with your personal injury case. Can you tell me more about what happened?",
          senderId: selectedConversation.attorneyId,
          senderName: selectedConversation.attorneyName,
          senderType: "attorney",
          timestamp: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000
          ),
          isRead: true,
        },
        {
          id: "msg-3",
          content:
            "I was rear-ended at a red light. The other driver was clearly at fault. I have some minor injuries and my car is damaged.",
          senderId: session?.user?.id || "client",
          senderName: "You",
          senderType: "client",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isRead: true,
        },
        {
          id: "msg-4",
          content:
            "I've reviewed your case documents. Let's schedule a call to discuss the next steps.",
          senderId: selectedConversation.attorneyId,
          senderName: selectedConversation.attorneyName,
          senderType: "attorney",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: false,
          attachments: [
            {
              name: "Case Analysis.pdf",
              url: "#",
              type: "application/pdf",
              size: 1024000,
            },
          ],
        },
      ];

      setMessages(mockMessages);
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
      // In real app, this would send to API
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        senderId: session?.user?.id || "client",
        senderName: "You",
        senderType: "client",
        timestamp: new Date(),
        isRead: true,
      };

      setMessages(prev => [...prev, message]);
      setNewMessage("");

      // Update conversation's last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: message,
                updatedAt: new Date(),
              }
            : conv
        )
      );

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
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
            <Badge variant="secondary" className="bg-primary text-white">
              {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}{" "}
              unread
            </Badge>
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
