'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Loader2, RefreshCw, Crown, AlertTriangle, FileText, Image as ImageIcon, Video, Copy, Check, ArrowDown } from 'lucide-react'
import { canUserChat, getCurrentUsage, incrementChatCount, FREE_CHAT_LIMIT } from '@/lib/pricing'
import UpgradeModal from '@/components/UpgradeModal'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [currentUsage, setCurrentUsage] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const el = scrollAreaRef.current
    if (!el) return

    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
      setShowScrollDown(!nearBottom)
    }

    el.addEventListener('scroll', onScroll)
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const sendMessageWithText = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    // Check if user can still chat
    if (!canUserChat()) {
      setShowUpgradeModal(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Increment chat count
    const newUsage = incrementChatCount()
    setCurrentUsage(newUsage)

    try {
      // Call Grok 3 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Chat API error:', response.status, errorData)
        throw new Error(`API Error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorContent = 'Sorry, I encountered an error while processing your message. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          errorContent = 'API key not configured. Please check your environment variables.'
        } else if (error.message.includes('No credits available')) {
          errorContent = 'No credits available. Please purchase credits on https://console.x.ai/'
        } else if (error.message.includes('Invalid API key')) {
          errorContent = 'Invalid API key. Please check your GROK_API_KEY environment variable.'
        } else if (error.message.includes('Rate limit exceeded')) {
          errorContent = 'Rate limit exceeded. Please try again later.'
        } else {
          errorContent = `Error: ${error.message}`
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, setShowUpgradeModal, setCurrentUsage])

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
    setCurrentUsage(getCurrentUsage())
    
    // Check for initial message from consultation form
    const initialMessage = localStorage.getItem('initialChatMessage')
    if (initialMessage && messages.length === 0) {
      // Clear the stored message
      localStorage.removeItem('initialChatMessage')
      // Auto-send the initial message
      setInputMessage(initialMessage)
      // Use setTimeout to ensure state is updated before sending
      setTimeout(() => {
        sendMessageWithText(initialMessage)
      }, 100)
    }
  }, [messages.length, sendMessageWithText])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return
    await sendMessageWithText(inputMessage.trim())
    setInputMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(id)
      toast({ title: 'Copied to clipboard' })
      setTimeout(() => setCopiedMessageId(null), 1200)
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' })
    }
  }

  const remainingChats = FREE_CHAT_LIMIT - currentUsage
  const isLimitReached = isClient && remainingChats <= 0
  const usagePercent = Math.min(100, Math.max(0, Math.round((currentUsage / FREE_CHAT_LIMIT) * 100)))

  const quickPrompts = [
    'Draft a cease and desist letter',
    'Explain my contract terms simply',
    'What should I include in an NDA?',
    'Is this clause enforceable?',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <motion.div 
        className="flex flex-col h-screen bg-white/90 backdrop-blur-sm shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div 
          className="p-4 sm:p-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Chat with <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">Grok</span>
              </h1>
              <p className="text-sm text-gray-600">Ask me anything about legal matters</p>
            </div>
            <div className="flex items-center gap-2">
              {isClient && isLimitReached && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Button
                    onClick={() => setShowUpgradeModal(true)}
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Crown className="w-4 h-4" />
                    <span className="hidden sm:inline">Upgrade</span>
                  </Button>
                </motion.div>
              )}
              <Button
                onClick={clearChat}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Clear Chat</span>
              </Button>
            </div>
          </div>

          {/* Usage meter */}
          {isClient && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant={isLimitReached ? 'destructive' : 'secondary'} className="text-[10px]">
                    {remainingChats} free chats left
                  </Badge>
                  {remainingChats <= 2 && remainingChats > 0 && (
                    <span className="text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Low balance</span>
                  )}
                </div>
                <span>{usagePercent}% used</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className={`h-full ${isLimitReached ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                  style={{ width: `${usagePercent}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercent}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          )}

          {/* Quick prompts */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickPrompts.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs sm:text-sm"
                onClick={() => setInputMessage(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Messages */}
        <div ref={scrollAreaRef} className="relative flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/30 custom-scrollbar">
          {messages.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-center px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Bot className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mb-6" />
              </motion.div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Start a conversation</h3>
              <p className="text-gray-600 max-w-md leading-relaxed text-sm sm:text-base">
                Ask me about legal issues, get advice, or discuss any legal matters. I&apos;m here to help!
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.06, 
                    duration: 0.35,
                    ease: 'easeOut'
                  }}
                >
                  <div className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <motion.div 
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05, duration: 0.25 }}
                      className="flex-1"
                    >
                      <div className="relative">
                        <Card className={`${message.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white shadow-md border border-gray-100'}`}>
                          <CardContent className="p-3 sm:p-4">
                            <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-2 sm:mt-3 ${
                              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </CardContent>
                        </Card>
                        {/* Message actions */}
                        <div className={`absolute top-2 ${message.role === 'user' ? 'left-2' : 'right-2'} flex items-center gap-1`}>
                          <Button
                            size="icon"
                            variant={message.role === 'user' ? 'secondary' : 'ghost'}
                            className="h-6 w-6 sm:h-7 sm:w-7"
                            onClick={() => handleCopy(message.content, message.id)}
                            title="Copy"
                          >
                            {copiedMessageId === message.id ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {isLoading && (
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <Card className="bg-white shadow-md border border-gray-100">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <div className="flex items-center gap-1">
                        {[0,1,2].map((i) => (
                          <motion.span
                            key={i}
                            className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Chat limit warning */}
          {isClient && remainingChats <= 2 && remainingChats > 0 && (
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 max-w-md shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Only {remainingChats} free chat{remainingChats === 1 ? '' : 's'} remaining
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Upgrade to continue chatting with unlimited access!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />

          {/* Scroll to bottom */}
          <AnimatePresence>
            {showScrollDown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6"
              >
                <Button
                  size="sm"
                  className="shadow-md bg-white text-gray-800 hover:bg-gray-50 border"
                  onClick={scrollToBottom}
                >
                  <ArrowDown className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">New messages</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentUsage={currentUsage}
        />

        {/* Input */}
        <motion.div 
          className="p-4 sm:p-6 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-gray-600" title="Attach file">
                <FileText className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-gray-600" title="Attach image">
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-gray-600" title="Attach video">
                <Video className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isClient && isLimitReached ? 'Upgrade to continue chatting...' : 'Type your message here...'}
              className="min-h-[50px] sm:min-h-[60px] max-h-[120px] sm:max-h-[160px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 flex-1 text-sm sm:text-base"
              disabled={isLoading || (isClient && isLimitReached)}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={isClient && isLimitReached ? () => setShowUpgradeModal(true) : sendMessage}
                disabled={(!inputMessage.trim() && !(isClient && isLimitReached)) || isLoading}
                className={`px-4 sm:px-6 self-end h-[44px] sm:h-[60px] ${
                  isClient && isLimitReached 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700'
                }`}
              >
                {isClient && isLimitReached ? <Crown className="w-4 h-4 sm:w-5 sm:h-5" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
              </Button>
            </motion.div>
          </div>
          <div className="mt-2 text-right text-xs text-gray-500">
            {inputMessage.length} characters
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
