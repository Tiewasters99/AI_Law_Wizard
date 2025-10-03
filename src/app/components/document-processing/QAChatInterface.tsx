'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Send,
  Loader2,
  FileText,
  MessageSquare,
  Clock,
  User,
  Bot,
  Copy,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Brain
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
    confidence?: number
    processingTime?: number
  }
}

interface QAChatInterfaceProps {
  sessionId?: string
  onSessionCreate?: (sessionId: string) => void
  onSessionUpdate?: (session: any) => void
  className?: string
}

export function QAChatInterface({ 
  sessionId: initialSessionId, 
  onSessionCreate, 
  onSessionUpdate,
  className = '' 
}: QAChatInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [showChatMode, setShowChatMode] = useState(false)
  const [lastResponse, setLastResponse] = useState<string>('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSession = useCallback(async (id: string) => {
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
  }, [onSessionUpdate, toast])

  // Load session data if sessionId is provided
  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId)
    }
  }, [initialSessionId, loadSession])

  const createSession = async () => {
    setIsCreatingSession(true)
    try {
      const response = await fetch('/api/document-processing/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'qa', title: 'Q&A Session' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newSessionId = data.session.id
        setSessionId(newSessionId)
        setSessionInfo(data.session)
        onSessionCreate?.(newSessionId)
        
        toast({
          title: 'Session Created',
          description: 'New Q&A session started'
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const messageText = inputMessage.trim()
    
    // If no session exists, create one first and then send message
    if (!sessionId) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/document-processing/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'qa', title: 'Q&A Session' })
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
          mode: 'qa'
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
          title: 'Response Generated',
          description: `Processed in ${data.metadata?.processingTime || 0}ms`
        })
      } else {
        throw new Error(data.error || 'Failed to get response')
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
        description: 'Failed to get response from AI',
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

  // Show initial analysis interface if no messages yet or if we have a response but user hasn't entered chat mode
  const showInitialInterface = messages.length === 0 || (lastResponse && !showChatMode)

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header - Only show when in chat mode */}
      {!showInitialInterface && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Document Analysis</h2>
          </div>
        </div>
      )}

      {/* Enhanced Analysis Interface */}
      {showInitialInterface ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
          {/* Main Logo & Heading */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                AI Document Analysis
              </h1>
              <p className="text-gray-600 text-sm">
                Ask questions about your documents and get intelligent answers
              </p>
            </div>
          </div>

          {/* Show Response if Available */}
          {lastResponse && (
            <div className="max-w-4xl mx-auto w-full">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
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
                placeholder={lastResponse ? "Ask a follow-up question or start a chat for more details..." : "What would you like to know about your documents? (e.g., 'Summarize the main findings', 'Compare different sections', 'Find specific information')"}
                className="flex-1 min-h-[80px] text-base p-5 pr-16 border-2 border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm"
                disabled={isLoading || isCreatingSession}
                aria-label="Document analysis input"
                aria-describedby="input-help"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isCreatingSession}
                size="sm"
                className="absolute bottom-3 right-3 h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-md transition-all duration-200"
                aria-label={isLoading ? "Processing your request" : "Send message"}
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
            <div id="input-help" className="sr-only">
              Enter your question about documents and press Enter or click Send
            </div>
          </div>

          {/* Chat Mode Button */}
          {lastResponse && (
            <div className="flex justify-center">
              <Button
                onClick={() => setShowChatMode(true)}
                variant="outline"
                className="px-6 py-2 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
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
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-12 h-12 text-blue-600" />
                </div>
                <div className="max-w-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    Analysis Complete
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Your analysis is ready! You can now ask follow-up questions 
                    or explore different aspects of your documents.
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
                            ? 'bg-blue-600 text-white' 
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
                            ? 'bg-blue-600 text-white'
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
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
                <div className="max-w-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    Processing Your Request
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    AI is analyzing your documents and preparing a response...
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
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Thinking...</span>
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
                placeholder="Ask a follow-up question about your documents..."
                className="flex-1 min-h-[100px] max-h-[240px] resize-none text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl p-6 shadow-sm"
                disabled={isLoading || isCreatingSession}
                aria-label="Follow-up question input"
                aria-describedby="followup-help"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || isCreatingSession}
                size="lg"
                className="self-end h-[100px] px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-2xl shadow-lg transition-all duration-200"
                aria-label={isLoading ? "Processing your request" : "Send follow-up question"}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-6 h-6" aria-hidden="true" />
                )}
              </Button>
            </div>
            <div id="followup-help" className="sr-only">
              Enter your follow-up question and press Enter or click Send
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
