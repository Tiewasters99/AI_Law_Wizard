'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Send,
  Loader2,
  Bot,
  User,
  Copy,
  CheckCircle,
  AlertCircle,
  X,
  Brain,
  Info
} from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
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

interface ContinueChatInterfaceProps {
  sessionId?: string
  onSessionCreate?: (sessionId: string) => void
  onSessionUpdate?: (session: any) => void
  className?: string
}

export function ContinueChatInterface({ 
  sessionId: initialSessionId, 
  onSessionCreate, 
  onSessionUpdate,
  className = '' 
}: ContinueChatInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showContextInfo, setShowContextInfo] = useState(false)
  
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
        body: JSON.stringify({ mode: 'qa', title: 'Follow-up Questions' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newSessionId = data.session.id
        setSessionId(newSessionId)
        setSessionInfo(data.session)
        onSessionCreate?.(newSessionId)
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
    console.log('🚀 handleSendMessage called')
    console.log('Input message:', inputMessage)
    console.log('Is loading:', isLoading)
    console.log('Session ID:', sessionId)
    
    if (!inputMessage.trim() || isLoading) {
      console.log('❌ Early return - no message or loading')
      return
    }

    const messageText = inputMessage.trim()
    console.log('📝 Message text:', messageText)
    
    // Wait for session to be created by parent component (with proper context)
    if (!sessionId) {
      console.log('⚠️ No session exists - waiting for parent to create session with context')
      toast({
        title: 'Session Not Ready',
        description: 'Please wait for the analysis session to be initialized...',
        variant: 'destructive'
      })
      return
    }

    console.log('✅ Session exists, sending message directly')
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
      console.log(`💬 Sending message to chat API: ${userMessage.content}`)
      console.log(`📡 Session ID: ${sessionId}`)

      const response = await fetch('/api/document-processing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          mode: 'qa'
        })
      })

      console.log(`📡 Chat API response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Chat API error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ Chat API response:`, data)

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          metadata: data.metadata
        }

        setMessages(prev => [...prev, assistantMessage])
        
        // Show success animation for first message
        if (messages.length === 0) {
          setShowSuccessAnimation(true)
          setTimeout(() => setShowSuccessAnimation(false), 2000)
        }
        
        toast({
          title: 'Response Generated',
          description: `Processed in ${data.metadata?.processingTime || 0}ms`
        })
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
      
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
      handleSendMessage()
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

  return (
    <div className={`flex flex-col h-full bg-white relative ${className}`}>
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 p-2 text-xs">
          <div>Session ID: {sessionId || 'None'}</div>
          <div>Is Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Is Creating Session: {isCreatingSession ? 'Yes' : 'No'}</div>
          <div>Input Message: "{inputMessage}"</div>
          <div>Messages Count: {messages.length}</div>
        </div>
      )}
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2
                }}
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-semibold text-green-900 mb-1">
                  Chat Started!
                </h3>
                <p className="text-green-700 text-sm">
                  You can now ask follow-up questions
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Session Context Info - Collapsible */}
      {sessionInfo && sessionInfo.context && (
        <AnimatePresence>
          {showContextInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Original Analysis Context
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContextInfo(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-700 space-y-2">
                  {sessionInfo.context.originalQuery && (
                    <div className="bg-white/60 p-2 rounded-lg">
                      <span className="font-medium">Original Question: </span>
                      <span className="text-gray-600">{sessionInfo.context.originalQuery}</span>
                    </div>
                  )}
                  {sessionInfo.context.processedFiles && sessionInfo.context.processedFiles.length > 0 && (
                    <div className="bg-white/60 p-2 rounded-lg">
                      <span className="font-medium">Documents Analyzed: </span>
                      <span className="text-gray-600">
                        {sessionInfo.context.processedFiles.length} file{sessionInfo.context.processedFiles.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Toggle Context Info Button */}
      {sessionInfo && sessionInfo.context && !showContextInfo && messages.length > 0 && (
        <motion.button
          onClick={() => setShowContextInfo(true)}
          className="w-full py-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-b border-gray-100 transition-colors flex items-center justify-center gap-1"
          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
        >
          <Info className="w-3 h-3" />
          View Original Analysis Context
        </motion.button>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              <Bot className="w-8 h-8 text-blue-600" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ask a follow-up question
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Get deeper insights, clarifications, or explore different aspects of your analysis
              </p>
            </motion.div>
            
            {/* Suggested questions */}
            <motion.div 
              className="grid grid-cols-1 gap-2 w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-xs text-gray-400 mb-2">Try asking:</div>
              {[
                "Can you explain this in more detail?",
                "What are the key takeaways?",
                "Are there any contradictions?"
              ].map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => setInputMessage(suggestion)}
                  className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl text-sm text-gray-700 hover:text-blue-700 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        ) : (
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
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`rounded-2xl p-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      
                      {/* Timestamp and copy button */}
                      <div className="mt-2 pt-2 border-t border-gray-200/50">
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
        )}

        {/* Enhanced Loading indicator with typing animation */}
        {isLoading && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-2">
              <motion.div 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Bot className="w-4 h-4 text-blue-600" />
              </motion.div>
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-700">Thinking...</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <motion.div 
        className="border-t bg-gradient-to-r from-white to-blue-50/30 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex space-x-3">
          <motion.div 
            className="flex-1 relative"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a follow-up question about your analysis..."
              className="w-full min-h-[60px] max-h-[120px] resize-none text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl p-4 shadow-sm transition-all duration-200"
              disabled={isLoading || isCreatingSession}
              aria-label="Follow-up question input"
            />
            {/* Character count indicator */}
            {inputMessage.length > 0 && (
              <motion.div 
                className="absolute bottom-2 right-2 text-xs text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {inputMessage.length}
              </motion.div>
            )}
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                console.log('🔘 Send button clicked!')
                console.log('Input message:', inputMessage)
                console.log('Is loading:', isLoading)
                console.log('Is creating session:', isCreatingSession)
                handleSendMessage()
              }}
              disabled={!inputMessage.trim() || isLoading || isCreatingSession}
              size="lg"
              className="self-end h-[60px] px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-2xl shadow-lg transition-all duration-200"
              aria-label={isLoading ? "Processing your request" : "Send follow-up question"}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5" aria-hidden="true" />
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-5 h-5" aria-hidden="true" />
                </motion.div>
              )}
            </Button>
          </motion.div>
        </div>
        
        {/* Quick action suggestions */}
        {inputMessage.length === 0 && (
          <motion.div 
            className="mt-3 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {[
              "Explain more",
              "Key points",
              "Any concerns?"
            ].map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-full border border-gray-200 hover:border-blue-200 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
