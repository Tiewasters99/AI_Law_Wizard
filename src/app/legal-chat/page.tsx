'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/app/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ChatMessages from '@/app/components/chat/ChatMessages'
import ChatInput from '@/app/components/chat/ChatInput'
import ChatSidebar from '@/app/components/chat/ChatSidebar'
import { Message } from '@/app/components/chat/types'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Card } from '@/app/components/ui/card'
import { TokenUsageIndicator } from '@/app/components/ui/TokenUsageIndicator'
import { UpgradeModal } from '@/app/components/auth/UpgradeModal'
import { TokenTracker } from '@/app/lib/tokenTracker'
import { colors, disclaimers, practiceAreas } from '@/app/lib/designSystem'
import { 
  ArrowLeft, 
  Menu, 
  Shield, 
  AlertCircle, 
  Briefcase, 
  FileText,
  MessageSquare,
  CheckCircle
} from 'lucide-react'

export default function LegalChatPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [tokenUsage, setTokenUsage] = useState({ used: 0, limit: 0 })
  const [selectedConsultationType, setSelectedConsultationType] = useState<string>('General Legal')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Check if user is an attorney (memoized)
  const isAttorney = useMemo(
    () => session?.user?.role === 'ATTORNEY' || session?.user?.role === 'LAWYER',
    [session?.user?.role]
  )

  useEffect(() => {
    setIsClient(true)
    
    // Load current token usage
    const userId = session?.user?.id
    const used = TokenTracker.getTokenUsage(userId)
    const limit = TokenTracker.getLimit(userId)
    setTokenUsage({ used, limit })
    
    // Load sessionId from localStorage if available
    const storedSessionId = localStorage.getItem('legalChatSessionId')
    if (storedSessionId) {
      setSessionId(storedSessionId)
      console.log('Loaded sessionId from localStorage:', storedSessionId)
    }
    
    // Load initial messages from localStorage
    const loadMessages = () => {
      const storedMessages = localStorage.getItem('legalChatMessages')
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages)
          setMessages(parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })))
        } catch (error) {
          console.error('Error loading messages:', error)
        }
      }
    }

    loadMessages()

    // Listen for streaming updates from Home component
    const handleChatUpdate = () => {
      loadMessages()
    }

    window.addEventListener('chat-update', handleChatUpdate)
    
    return () => {
      window.removeEventListener('chat-update', handleChatUpdate)
    }
  }, [session?.user?.id])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    setShowScrollDown(!nearBottom)
  }, [])

  useEffect(() => {
    const el = scrollAreaRef.current
    if (!el) return

    el.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return

    // Check token limit before proceeding
    const userId = session?.user?.id
    const hasExceeded = TokenTracker.hasExceededLimit(userId)
    
    if (hasExceeded) {
      const usage = TokenTracker.getUsageSummary(userId)
      setTokenUsage({ used: usage.used, limit: usage.limit })
      setShowUpgradeModal(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      console.log('Sending message with sessionId:', sessionId || 'new session')
      
      const response = await fetch('/api/legal-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIssue: userMessage.content,
          sessionId: sessionId // Include sessionId for context
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response
        let markdownContent = ''
        let responseStructure: string[] = []

        // Create initial assistant message with empty content
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '',
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])

        // Process the stream
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))

                    if (data.type === 'metadata') {
                      responseStructure = data.responseStructure
                      console.log('Response format used:', responseStructure)
                    } else if (data.type === 'content') {
                      markdownContent += data.content
                      // Update the message with accumulated content
                      setMessages(prev => {
                        const updated = [...prev]
                        const lastMessage = updated[updated.length - 1]
                        if (lastMessage && lastMessage.role === 'assistant') {
                          lastMessage.content = markdownContent
                        }
                        return updated
                      })
                    } else if (data.type === 'done') {
                      // Streaming complete - track token usage and capture sessionId
                      console.log('Streaming complete')
                      
                      // Capture sessionId for conversation context
                      if (data.sessionId) {
                        setSessionId(data.sessionId)
                        localStorage.setItem('legalChatSessionId', data.sessionId)
                        console.log('Session ID captured and stored:', data.sessionId)
                      }
                      
                      if (data.tokensUsed) {
                        TokenTracker.addTokenUsage(data.tokensUsed, userId)
                        // Update local state
                        const updatedUsage = TokenTracker.getUsageSummary(userId)
                        setTokenUsage({ used: updatedUsage.used, limit: updatedUsage.limit })
                      }
                    } else if (data.type === 'error') {
                      throw new Error(data.error)
                    }
                  } catch (parseError) {
                    console.error('Error parsing stream data:', parseError)
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }
        }
      } else {
        // Fallback to JSON response for non-streaming responses
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        // Log the dynamic format structure that was used
        if (data.responseStructure) {
          console.log('Response format used:', data.responseStructure)
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.content,
          role: 'assistant',
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${(error as Error).message}\n\nPlease try again later.`,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [inputMessage, isLoading, session, toast])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  const handleCopy = useCallback(async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(id)
      toast({ title: 'Copied to clipboard' })
      setTimeout(() => setCopiedMessageId(null), 1200)
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' })
    }
  }, [toast])

  const handleBack = useCallback(() => {
    router.push('/')
  }, [router])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setCurrentChatId(null)
    setSessionId(null) // Reset sessionId for new conversation
    localStorage.removeItem('legalChatSessionId') // Clear from localStorage
    localStorage.removeItem('legalChatMessages') // Clear messages too
    setInputMessage('')
    console.log('Started new chat - cleared sessionId')
  }, [])

  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
    setIsSidebarOpen(false)
  }, [])

  const handleLoadChatHistory = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${chatId}`)
      if (!response.ok) {
        throw new Error('Failed to load chat history')
      }
      const data = await response.json()
      
      if (data.messages && Array.isArray(data.messages)) {
        const loadedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.createdAt || msg.timestamp)
        }))
        setMessages(loadedMessages)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      toast({
        title: 'Failed to load chat',
        description: 'Could not load chat history',
        variant: 'destructive'
      })
    }
  }, [toast])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen)
  }, [isSidebarOpen])

  return (
    <>
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
                transition={{ type: 'tween', duration: 0.2 }}
                className="fixed lg:relative top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 flex flex-col"
              >
                <ChatSidebar
                  onNewChat={handleNewChat}
                  onSelectChat={handleSelectChat}
                  onLoadChatHistory={handleLoadChatHistory}
                  currentChatId={currentChatId || undefined}
                  chatType="general"
                />
                
                {/* Professional Info Sidebar Section */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" style={{ color: colors.primary[700] }} />
                    Consultation Type
                  </h3>
                  <div className="space-y-2">
                    {['General Legal', 'Corporate Law', 'Family Law', 'Real Estate', 'Criminal Defense'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedConsultationType(type)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedConsultationType === type
                            ? 'bg-blue-50 text-blue-900 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Professional Header */}
          <div className="flex-shrink-0 bg-white border-b shadow-sm" style={{ borderColor: colors.secondary[200] }}>
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
                  <div className="hidden lg:block p-2 rounded-lg" style={{ backgroundColor: colors.primary[50] }}>
                    <Image 
                      src="/images/logo_icon.png" 
                      alt="AI Wizard Logo" 
                      width={20} 
                      height={20}
                    />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-semibold" style={{ color: colors.text }}>
                      Professional Legal Consultation
                    </h1>
                    <p className="text-xs sm:text-sm" style={{ color: colors.secondary[500] }}>
                      {selectedConsultationType} • AI-Powered Legal Analysis
                      {sessionId && (
                        <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                          • <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Context Active
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-4">
                  {isAttorney && (
                    <Badge variant="outline" className="border-amber-200" style={{ color: colors.accent[700], backgroundColor: colors.accent[50] }}>
                      <Shield className="w-3 h-3 mr-1" />
                      Attorney Access
                    </Badge>
                  )}
                  {session?.user && (
                    <div className="flex items-center space-x-2 text-sm" style={{ color: colors.secondary[600] }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success[500] }} />
                      <span>Online</span>
                    </div>
                  )}
                  <TokenUsageIndicator 
                    used={tokenUsage.used} 
                    limit={tokenUsage.limit}
                    className="min-w-[200px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              isClient={isClient}
              remainingChats={999}
              showScrollDown={showScrollDown}
              scrollAreaRef={scrollAreaRef}
              messagesEndRef={messagesEndRef}
              copiedMessageId={copiedMessageId}
              onCopy={handleCopy}
              onScrollToBottom={scrollToBottom}
            />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t bg-white py-4" style={{ borderColor: colors.secondary[200] }}>
            <ChatInput
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendMessage={sendMessage}
              onKeyPress={handleKeyPress}
              isLoading={isLoading}
              isClient={isClient}
              isLimitReached={false}
              onUpgrade={() => {}}
            />
            
            {/* Modern Legal Disclaimer */}
            <div className="mt-3 px-4 max-w-5xl mx-auto">
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
              </div>
            </div>
          </div>
        </div>

        {/* Professional Features Sidebar (Desktop Only) */}
        {messages.length === 0 && (
          <div className="hidden xl:block w-80 border-l bg-white" style={{ borderColor: colors.secondary[200] }}>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                  Professional Legal Services
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: MessageSquare, title: 'Secure Consultation', desc: 'Confidential legal discussions' },
                    { icon: FileText, title: 'Document Analysis', desc: 'AI-powered contract review' },
                    { icon: 'logo', title: 'Legal Research', desc: 'Case law and precedent analysis' },
                    { icon: CheckCircle, title: 'Expert Guidance', desc: 'Professional legal insights' },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="p-2 rounded" style={{ backgroundColor: colors.primary[50] }}>
                        {feature.icon === 'logo' ? (
                          <Image 
                            src="/images/logo_icon.png" 
                            alt="AI Wizard Logo" 
                            width={16} 
                            height={16}
                          />
                        ) : (
                          <feature.icon className="w-4 h-4" style={{ color: colors.primary[700] }} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium" style={{ color: colors.text }}>{feature.title}</h4>
                        <p className="text-xs" style={{ color: colors.secondary[600] }}>{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.primary[50], borderColor: colors.primary[200] }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: colors.primary[900] }}>
                  Need Immediate Legal Assistance?
                </h4>
                <p className="text-xs mb-3" style={{ color: colors.primary[800] }}>
                  Connect with a qualified attorney for personalized legal guidance.
                </p>
                <Button 
                  size="sm" 
                  className="w-full" 
                  style={{ backgroundColor: colors.primary[700] }}
                  onClick={() => router.push('/directory')}
                >
                  Find an Attorney
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={tokenUsage.used}
        limit={tokenUsage.limit}
        feature="home"
      />
    </>
  )
}

