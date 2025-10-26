"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { colors } from "@/lib/frontend/designSystem";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import {
  ArrowLeft,
  Menu,
  Shield,
  AlertCircle,
  Briefcase,
  FileText,
  MessageSquare,
  CheckCircle,
  Send,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Star,
  Clock,
  BookOpen,
  Search,
  Lightbulb,
  TrendingUp,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
}

interface QuickPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<any>;
  category: string;
}

export default function LegalChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedConsultationType, setSelectedConsultationType] =
    useState<string>("General Legal");
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if user is an attorney (memoized)
  const isAttorney = useMemo(
    () => session?.user?.role === "ATTORNEY",
    [session?.user?.role]
  );

  // Quick prompts for better UX
  const quickPrompts: QuickPrompt[] = useMemo(
    () => [
      {
        id: "contract-review",
        title: "Contract Review",
        description: "Analyze contract terms and identify potential issues",
        prompt:
          "Please review this contract and identify any potential legal issues, unclear terms, or areas that need attention.",
        icon: FileText,
        category: "Document Analysis",
      },
      {
        id: "legal-research",
        title: "Case Law Research",
        description: "Find relevant case law and legal precedents",
        prompt:
          "I need to research case law related to [specific legal issue]. Can you help me find relevant precedents and key cases?",
        icon: BookOpen,
        category: "Research",
      },
      {
        id: "compliance-check",
        title: "Compliance Check",
        description: "Verify compliance with regulations",
        prompt:
          "I need to ensure my business practices comply with [specific regulation/law]. What are the key requirements I should be aware of?",
        icon: Shield,
        category: "Compliance",
      },
      {
        id: "legal-strategy",
        title: "Legal Strategy",
        description: "Develop legal strategy and approach",
        prompt:
          "I'm facing a legal situation involving [describe situation]. What legal strategies should I consider and what are my options?",
        icon: Lightbulb,
        category: "Strategy",
      },
      {
        id: "intellectual-property",
        title: "IP Protection",
        description: "Intellectual property guidance",
        prompt:
          "I have an invention/creative work that I want to protect. What intellectual property protections are available and how do I secure them?",
        icon: Zap,
        category: "Intellectual Property",
      },
      {
        id: "employment-law",
        title: "Employment Issues",
        description: "Employment law and HR guidance",
        prompt:
          "I'm dealing with an employment issue involving [describe situation]. What are my rights and obligations as an employer/employee?",
        icon: Briefcase,
        category: "Employment",
      },
    ],
    []
  );

  // Filter prompts by consultation type
  const filteredPrompts = useMemo(() => {
    if (selectedConsultationType === "General Legal") {
      return quickPrompts;
    }
    return quickPrompts.filter(
      prompt =>
        prompt.category
          .toLowerCase()
          .includes(selectedConsultationType.toLowerCase()) ||
        selectedConsultationType
          .toLowerCase()
          .includes(prompt.category.toLowerCase())
    );
  }, [quickPrompts, selectedConsultationType]);

  useEffect(() => {
    setIsClient(true);

    // Load sessionId from localStorage if available
    const storedSessionId = localStorage.getItem("legalChatSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }

    // Load initial messages from localStorage
    const loadMessages = () => {
      const storedMessages = localStorage.getItem("legalChatMessages");
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(
            parsedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      }
    };

    loadMessages();

    // Listen for streaming updates from Home component
    const handleChatUpdate = () => {
      loadMessages();
    };

    window.addEventListener("chat-update", handleChatUpdate);

    return () => {
      window.removeEventListener("chat-update", handleChatUpdate);
    };
  }, [session?.user?.id]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollDown(!nearBottom);
  }, []);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Typing animation effect
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setTypingText(prev => {
          if (prev === "AI is thinking...") return "AI is thinking";
          if (prev === "AI is thinking") return "AI is thinking.";
          if (prev === "AI is thinking.") return "AI is thinking..";
          if (prev === "AI is thinking..") return "AI is thinking...";
          return "AI is thinking...";
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isTyping]);

  const handleQuickPrompt = useCallback((prompt: QuickPrompt) => {
    setInputMessage(prompt.prompt);
    setShowQuickPrompts(false);
    // Auto-focus the textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);
    setShowQuickPrompts(false);

    try {
      console.log(
        "Sending message with sessionId:",
        sessionId || "new session"
      );

      // Use appropriate API based on user role
      let apiEndpoint = "/api/guest/legal-research"; // Default for guests

      if (session) {
        const userRole = session.user.role as any;
        if (userRole === "ATTORNEY" || userRole === "LAWYER") {
          apiEndpoint = "/api/attorney/legal-research";
        } else if (userRole === "CUSTOMER") {
          apiEndpoint = "/api/client/legal-research";
        }
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage.content,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      // Check if response is streaming
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        // Handle streaming response
        let markdownContent = "";

        // Create initial assistant message with typing indicator
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "",
          role: "assistant",
          timestamp: new Date(),
          isTyping: true,
        };
        setMessages(prev => [...prev, assistantMessage]);

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
                  try {
                    const data = JSON.parse(line.slice(6));

                    if (data.type === "content") {
                      markdownContent += data.content;
                      setIsTyping(false);
                      // Update the message with accumulated content
                      setMessages(prev => {
                        const updated = [...prev];
                        const lastMessage = updated[updated.length - 1];
                        if (lastMessage && lastMessage.role === "assistant") {
                          lastMessage.content = markdownContent;
                          lastMessage.isTyping = false;
                        }
                        return updated;
                      });
                    } else if (data.type === "done") {
                      // Streaming complete - capture sessionId
                      setIsTyping(false);
                      if (data.sessionId) {
                        setSessionId(data.sessionId);
                        localStorage.setItem(
                          "legalChatSessionId",
                          data.sessionId
                        );
                      }
                    } else if (data.type === "error") {
                      setIsTyping(false);
                      throw new Error(data.error);
                    }
                  } catch (parseError) {
                    console.error("Error parsing stream data:", parseError);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      } else {
        // Fallback to JSON response for non-streaming responses
        const data = await response.json();
        console.log("API Response data:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        // Handle different response formats
        let content = "";
        if (data.result) {
          content = data.result;
        } else if (data.content) {
          content = data.content;
        } else if (data.choices && data.choices[0] && data.choices[0].message) {
          content = data.choices[0].message.content;
        } else {
          content = "No response generated from the AI model";
        }

        if (!content || content.trim() === "") {
          throw new Error("Empty response from AI model");
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: content,
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${
          (error as Error).message
        }\n\nPlease try again later.`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [inputMessage, isLoading, session, sessionId]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const handleCopy = useCallback(async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 1200);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }, []);

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
    setSessionId(null);
    setShowQuickPrompts(true);
    setIsTyping(false);
    localStorage.removeItem("legalChatSessionId");
    localStorage.removeItem("legalChatMessages");
    setInputMessage("");
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("legalChatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed lg:relative top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    Legal Research
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewChat}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    New Chat
                  </Button>
                </div>
              </div>

              {/* Consultation Type Selection */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Briefcase
                    className="w-4 h-4 mr-2"
                    style={{ color: colors.primary[700] }}
                  />
                  Consultation Type
                </h3>
                <div className="space-y-2">
                  {[
                    "General Legal",
                    "Corporate Law",
                    "Family Law",
                    "Real Estate",
                    "Criminal Defense",
                  ].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedConsultationType(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedConsultationType === type
                          ? "bg-blue-50 text-blue-900 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Professional Features */}
              <div className="p-4">
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: colors.text }}
                >
                  Professional Services
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      icon: MessageSquare,
                      title: "Secure Consultation",
                      desc: "Confidential legal discussions",
                    },
                    {
                      icon: FileText,
                      title: "Document Analysis",
                      desc: "AI-powered contract review",
                    },
                    {
                      icon: CheckCircle,
                      title: "Expert Guidance",
                      desc: "Professional legal insights",
                    },
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="p-2 rounded"
                        style={{ backgroundColor: colors.primary[50] }}
                      >
                        <feature.icon
                          className="w-4 h-4"
                          style={{ color: colors.primary[700] }}
                        />
                      </div>
                      <div>
                        <h4
                          className="text-sm font-medium"
                          style={{ color: colors.text }}
                        >
                          {feature.title}
                        </h4>
                        <p
                          className="text-xs"
                          style={{ color: colors.secondary[600] }}
                        >
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <div
          className="flex-shrink-0 bg-white border-b shadow-sm"
          style={{ borderColor: colors.secondary[200] }}
        >
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="hover:bg-gray-50 lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="hover:bg-gray-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div
                  className="hidden lg:block p-2 rounded-lg"
                  style={{ backgroundColor: colors.primary[50] }}
                >
                  <Image
                    src="/images/logo_icon.png"
                    alt="AI Wizard Logo"
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <h1
                    className="text-base sm:text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    Legal Research Assistant
                  </h1>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: colors.secondary[500] }}
                  >
                    {selectedConsultationType} • AI-Powered Legal Research
                    {sessionId && (
                      <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                        •{" "}
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                        Context Active
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-4">
                {isAttorney && (
                  <Badge
                    variant="outline"
                    className="border-amber-200"
                    style={{
                      color: colors.accent[700],
                      backgroundColor: colors.accent[50],
                    }}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Attorney Access
                  </Badge>
                )}
                {session?.user && (
                  <div
                    className="flex items-center space-x-2 text-sm"
                    style={{ color: colors.secondary[600] }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.success[500] }}
                    />
                    <span>Online</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto bg-gray-50">
          <div className="w-full">
            {/* Quick Prompts - Show when no messages or when explicitly shown */}
            {messages.length === 0 && showQuickPrompts && (
              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                      <Sparkles className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome to Legal Research Assistant
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Get instant legal guidance and research assistance. Choose
                      a topic below or ask your own question.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPrompts.map(prompt => (
                      <motion.div
                        key={prompt.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <prompt.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">
                              {prompt.title}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2">
                              {prompt.description}
                            </p>
                            <div className="flex items-center text-xs text-blue-600 group-hover:text-blue-700">
                              <span>Try this prompt</span>
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <p className="text-sm text-gray-500 mb-4">
                      Or type your own legal question below
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      <span>Powered by AI • Secure & Confidential</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } p-4`}
                >
                  <div
                    className={`max-w-5xl ${
                      message.role === "user" ? "ml-12" : "mr-12"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-3 ${
                        message.role === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === "user"
                            ? "bg-blue-600"
                            : "bg-gray-600"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div
                        className={`flex-1 ${
                          message.role === "user" ? "text-right" : ""
                        }`}
                      >
                        <div
                          className={`inline-block p-4 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          {message.isTyping ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {typingText}
                              </span>
                            </div>
                          ) : (
                            <MarkdownRenderer content={message.content} />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.role === "assistant" &&
                            !message.isTyping && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleCopy(message.content, message.id)
                                }
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div
          className="flex-shrink-0 border-t bg-white py-4"
          style={{ borderColor: colors.secondary[200] }}
        >
          <div className="px-4 max-w-5xl mx-auto">
            {/* Quick Actions Bar */}
            {messages.length > 0 && (
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                    className="text-xs"
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    {showQuickPrompts ? "Hide" : "Show"} Quick Prompts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewChat}
                    className="text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    New Chat
                  </Button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{messages.length} messages</span>
                </div>
              </div>
            )}

            <div className="flex items-end space-x-3 max-w-5xl mx-auto">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    messages.length === 0
                      ? "Ask your legal research question..."
                      : "Continue your legal research..."
                  }
                  className="min-h-[44px] max-h-32 resize-none pr-12"
                  disabled={isLoading}
                />
                {inputMessage.trim() && (
                  <div className="absolute right-2 top-2 flex items-center space-x-1">
                    <span className="text-xs text-gray-400">
                      {inputMessage.length}/2000
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="h-11 px-4 min-w-[44px]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Enhanced Legal Disclaimer */}
            <div className="mt-3">
              <div className="text-center text-xs text-gray-500 space-y-1.5">
                <p className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    AI-generated legal information
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>Not legal advice</span>
                  <span className="text-gray-400">•</span>
                  <Link
                    href="/directory"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                  >
                    Consult an attorney
                  </Link>
                </p>
                {!session && (
                  <p className="text-gray-400 text-[11px]">
                    Sign in for secure communication with attorneys
                  </p>
                )}
                <div className="flex items-center justify-center space-x-4 text-[10px] text-gray-400 mt-2">
                  <span className="flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Secure & Confidential
                  </span>
                  <span className="flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Professional Grade
                  </span>
                  <span className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    Instant Results
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
