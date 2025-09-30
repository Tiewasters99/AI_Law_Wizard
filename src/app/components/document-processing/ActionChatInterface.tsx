'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Send,
  Loader2,
  FileText,
  Settings,
  Clock,
  User,
  Bot,
  Copy,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Play,
  Pause,
  FileIcon,
  Download,
  Edit3,
  Brain,
  MessageSquare
} from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/use-toast'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    filesReferenced: string[]
    actionsPerformed?: string[]
    confidence?: number
    processingTime?: number
  }
}

interface ActionChatInterfaceProps {
  sessionId?: string
  onSessionCreate?: (sessionId: string) => void
  onSessionUpdate?: (session: any) => void
  className?: string
}

export const ActionChatInterface = ({ 
  sessionId: initialSessionId, 
  onSessionCreate, 
  onSessionUpdate,
  className = '' 
}: ActionChatInterfaceProps) => {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
  const [showFileSelector, setShowFileSelector] = useState(false)
  const [showChatMode, setShowChatMode] = useState(false)
  const [lastResponse, setLastResponse] = useState<string>('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load session data if sessionId is provided
  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId)
    }
  }, [initialSessionId])

  const loadSession = async (id: string) => {
    try {
      const response = await fetch(`/api/document-processing/sessions?sessionId=${id}`)
      const data = await response.json()
      
      if (data.success && data.session) {
        setSessionInfo(data.session)
        
        // Convert messages to our format
        const chatMessages: ChatMessage[] = data.session.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          metadata: msg.metadata
        }))
        
        setMessages(chatMessages)
        onSessionUpdate?.(data.session)
      }
    } catch (error) {
      console.error('Error loading session:', error)
      toast({
        title: 'Error',
        description: 'Failed to load session data',
        variant: 'destructive'
      })
    }
  }

  const createSession = async () => {
    setIsCreatingSession(true)
    try {
      const response = await fetch('/api/document-processing/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'action', title: 'Action Session' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newSessionId = data.session.id
        setSessionId(newSessionId)
        setSessionInfo(data.session)
        onSessionCreate?.(newSessionId)
        
        toast({
          title: 'Session Created',
          description: 'New Action session started'
        })
      } else {
        throw new Error(data.error || 'Failed to create session')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive'
      })
    } finally {
      setIsCreatingSession(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionId) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/document-processing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          mode: 'action'
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          metadata: data.metadata
        }

        setMessages(prev => [...prev, assistantMessage])
        
        // Store the first response to show in initial interface
        if (messages.length === 0) {
          setLastResponse(data.message)
        }
        
        toast({
          title: 'Action Executed',
          description: `Processed in ${data.metadata?.processingTime || 0}ms`
        })
      } else {
        throw new Error(data.error || 'Failed to execute action')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: 'Error',
        description: 'Failed to execute action',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard'
    })
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-100 text-gray-800'
    if (confidence >= 0.8) return 'bg-green-100 text-green-800'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'edit': return <Edit3 className="w-4 h-4" />
      case 'create': return <FileIcon className="w-4 h-4" />
      case 'analyze': return <Settings className="w-4 h-4" />
      case 'summarize': return <FileText className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // If no session exists, create one first and then send message
    if (!sessionId) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/document-processing/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'action', title: 'Action Session' })
        })
        
        const data = await response.json()
        
        if (data.success) {
          const newSessionId = data.session.id
          setSessionId(newSessionId)
          setSessionInfo(data.session)
          onSessionCreate?.(newSessionId)
          
          // Now send the message with the new session
          await sendMessage()
        } else {
          throw new Error(data.error || 'Failed to create session')
        }
      } catch (error) {
        console.error('Error creating session:', error)
        toast({
          title: 'Error',
          description: 'Failed to create session',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
      return
    }

    await sendMessage()
  }

  // Show initial analysis interface if no messages yet or if we have a response but user hasn't entered chat mode
  const showInitialInterface = messages.length === 0 || (lastResponse && !showChatMode)

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header - Only show when in chat mode */}
      {!showInitialInterface && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Action Analysis</h2>
          </div>
        </div>
      )}

      {/* Initial Analysis Interface - Cursor-style */}
      {showInitialInterface ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
          {/* Main Logo & Heading */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                AI Action Center
              </h1>
              <p className="text-gray-600 text-sm">
                Perform actions on your documents and get intelligent results
              </p>
            </div>
          </div>

          {/* Show Response if Available */}
          {lastResponse && (
            <div className="max-w-4xl mx-auto w-full">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="prose prose-sm max-w-none text-gray-900">
                      <ReactMarkdown>{lastResponse}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Search Input with Proper Alignment */}
          <div className="relative max-w-3xl mx-auto w-full">
            <div className="relative flex items-end">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={lastResponse ? "Ask for another action or start a chat for more details..." : "What action would you like to perform on your documents? (e.g., 'Edit the contract document', 'Analyze the financial report', 'Create a summary of all PDFs')"}
                className="flex-1 min-h-[80px] text-base p-5 pr-16 border-2 border-gray-200 rounded-xl resize-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 shadow-sm"
                disabled={isLoading || isCreatingSession}
                aria-label="Action input"
                aria-describedby="action-help"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isCreatingSession}
                size="sm"
                className="absolute bottom-3 right-3 h-10 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-md transition-all duration-200"
                aria-label={isLoading ? "Processing your request" : "Send action"}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : isCreatingSession ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            <div id="action-help" className="sr-only">
              Enter your action request and press Enter or click Send
            </div>
          </div>

          {/* Chat Mode Button */}
          {lastResponse && (
            <div className="flex justify-center">
              <Button
                onClick={() => setShowChatMode(true)}
                variant="outline"
                className="px-6 py-2 border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Chat for More Details
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Chat Interface - Full Width */
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-12 h-12 text-green-600" />
                </div>
                <div className="max-w-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    Action Complete
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Your action has been processed! You can now ask for follow-up actions
                    or explore different operations on your documents.
                  </p>
                </div>
              </div>
            ) : messages.length > 0 ? (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                          message.role === 'user' 
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-5 h-5" />
                          ) : (
                            <Bot className="w-5 h-5" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div className={`rounded-xl p-4 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-50 text-gray-900 border border-gray-200'
                        }`}>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                          
                          {/* Simple timestamp and copy button */}
                          <div className="mt-3 pt-2 border-t border-gray-200/50">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.content)}
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              /* Show loading when processing first message */
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                </div>
                <div className="max-w-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    Processing Your Action
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    AI is executing your action and preparing a response...
                  </p>
                </div>
              </div>
            )}

            {/* Loading indicator for follow-up messages */}
            {isLoading && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Executing action...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input - Enhanced with Accessibility */}
          <div className="border-t bg-white p-8 rounded-b-lg">
            <div className="flex space-x-4 max-w-6xl mx-auto">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask for another action on your documents..."
                className="flex-1 min-h-[100px] max-h-[240px] resize-none text-lg border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-2xl p-6 shadow-sm"
                disabled={isLoading || isCreatingSession}
                aria-label="Follow-up action input"
                aria-describedby="followup-action-help"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || isCreatingSession}
                size="lg"
                className="self-end h-[100px] px-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-2xl shadow-lg transition-all duration-200"
                aria-label={isLoading ? "Processing your request" : "Send follow-up action"}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-6 h-6" aria-hidden="true" />
                )}
              </Button>
            </div>
            <div id="followup-action-help" className="sr-only">
              Enter your follow-up action and press Enter or click Send
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
