'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/app/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import Layout from '@/app/components/Layout'
import ChatSidebar from '@/app/components/chat/ChatSidebar'
import QuickPrompts from '@/app/components/chat/QuickPrompts'
import ChatMessages from '@/app/components/chat/ChatMessages'
import ChatInput from '@/app/components/chat/ChatInput'
import { Message } from '@/app/components/chat/types'
import { Button } from '@/app/components/ui/button'
import { Menu, X, MessageSquare, Sparkles, Users, BookOpen, Scale, Shield, Crown } from 'lucide-react'
import { DocumentAnalysisInterface } from '@/app/components/document-processing/DocumentAnalysisInterface'
import { TokenGuard } from '@/app/components/auth/TokenGuard'
import { TOKEN_REQUIREMENTS } from '@/app/hooks/useTokenAccess'
import { colors } from '@/app/lib/designSystem'
import Link from 'next/link'

export default function GrandWizardPage() {
  const { data: session } = useSession()
  
  // Check if user is an attorney
  const isLawyer = session?.user?.role === 'ATTORNEY' || session?.user?.role === 'LAWYER'
  
  // Chat interface state (for clients)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string>('current')
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('Legal Grand Wizard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and manage sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(isMobileDevice)
      // Close sidebar on mobile by default, open on desktop
      if (isMobileDevice) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle scroll events to show/hide scroll down button
  const handleScroll = useCallback(() => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100
      setShowScrollDown(!isNearBottom && messages.length > 0)
    }
  }, [messages.length])

  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll)
      return () => scrollArea.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const handleNewChat = () => {
    setMessages([])
    setCurrentChatId('current')
    setCurrentChatTitle('Legal Grand Wizard')
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    // Title will be loaded from the chat data
  }

  const handleLoadChatHistory = async () => {
    // This would load chat history from the API
    // For now, we'll keep it simple
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const messageToSend = inputMessage.trim()

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: currentChatId === 'current' ? undefined : currentChatId,
          chatType: 'grand-wizard', // Use grand-wizard chat type
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Update current chat ID if a new session was created
      if (data.sessionId && currentChatId === 'current') {
        setCurrentChatId(data.sessionId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt)
  }

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedMessageId(id)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const quickPrompts = [
    "What are the key elements of a contract?",
    "How do I file a lawsuit?",
    "What is intellectual property law?",
    "Explain liability in business law",
  ]

  // If user is a lawyer, show enhanced document analysis interface
  if (isLawyer) {
    return (
      <TokenGuard 
        requiredTokens={TOKEN_REQUIREMENTS.GRAND_WIZARD}
        featureName="Legal Grand Wizard"
        featureIcon={<Crown className="w-10 h-10 text-yellow-600" />}
        featureDescription="Access the ultimate AI-powered legal analysis with advanced document processing, comprehensive file management, and premium legal insights."
      >
        <div className="bg-white h-full overflow-hidden">
          <DocumentAnalysisInterface />
        </div>
      </TokenGuard>
    )
  }

  // Client interface - chat only
  return (
    <TokenGuard 
      requiredTokens={TOKEN_REQUIREMENTS.GRAND_WIZARD}
      featureName="Legal Grand Wizard"
      featureIcon={<Crown className="w-10 h-10 text-yellow-600" />}
      featureDescription="Access the ultimate AI-powered legal chat with the most sophisticated legal guidance and premium features."
    >
    <div className="min-h-screen bg-white">
      <Layout>
        <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden -mt-2 sm:-mt-4">
          {/* Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ x: isMobile ? -288 : 0, opacity: isMobile ? 0 : 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: isMobile ? -288 : 0, opacity: isMobile ? 0 : 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`${
                  isMobile 
                    ? 'fixed inset-y-0 left-0 z-40 w-72' 
                    : 'relative w-72'
                } bg-gray-50`}
              >
                <ChatSidebar
                  onNewChat={handleNewChat}
                  onSelectChat={handleSelectChat}
                  onLoadChatHistory={handleLoadChatHistory}
                  currentChatId={currentChatId}
                  isCollapsed={false}
                  onToggleCollapse={() => {}}
                  chatType="grand-wizard"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Overlay */}
          <AnimatePresence>
            {isMobile && isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/20 z-30"
                onClick={toggleSidebar}
              />
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {/* Header - Only show when there are messages */}
            {messages.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Crown className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Legal Grand Wizard</h1>
                    <p className="text-sm text-gray-500">Premium AI-powered legal assistance</p>
                  </div>
                </div>
              </div>
            )}

            {/* User Status Banner - Only show when there are messages */}
            {messages.length > 0 && !session?.user && (
              <div className="bg-blue-50 px-6 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      Sign in to save your conversations
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => window.location.href = '/login'}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            )}
            
            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                isClient={isClient}
                remainingChats={999} // Grand Wizard tier is free
                showScrollDown={showScrollDown}
                scrollAreaRef={scrollAreaRef}
                messagesEndRef={messagesEndRef}
                copiedMessageId={copiedMessageId}
                onCopy={handleCopy}
                onScrollToBottom={scrollToBottom}
              />
            </div>

            {/* Quick Prompts - Only show when no messages */}
            {messages.length === 0 && (
              <div className="px-6 py-4">
                <QuickPrompts prompts={quickPrompts} onSelectPrompt={handleQuickPrompt} />
              </div>
            )}

            {/* Input Area */}
            <div className={`${messages.length > 0 ? 'px-6 py-4' : 'px-6 py-8'}`}>
              {messages.length === 0 ? (
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Legal Grand Wizard</h2>
                    <p className="text-gray-600 mb-4">
                      Experience the ultimate AI-powered legal assistance. Get the most sophisticated legal insights and guidance with our premium AI Wizard technology.
                    </p>
                    <div className="mb-6 p-3 rounded-lg border" style={{ 
                      backgroundColor: colors.primary[50],
                      borderColor: colors.primary[200]
                    }}>
                      <p className="text-xs" style={{ color: colors.primary[900] }}>
                        💡 For personalized legal representation, {' '}
                        <Link 
                          href="/directory" 
                          className="font-semibold underline hover:no-underline transition-all"
                          style={{ color: colors.primary[700] }}
                        >
                          find an attorney
                        </Link>
                        {' '} to handle your case directly.
                      </p>
                    </div>
                  </div>
                  <ChatInput
                    inputMessage={inputMessage}
                    setInputMessage={setInputMessage}
                    onSendMessage={handleSendMessage}
                    onKeyPress={handleKeyPress}
                    isLoading={isLoading}
                    isClient={isClient}
                    isLimitReached={false}
                    onUpgrade={() => {}}
                  />
                </div>
              ) : (
                <ChatInput
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  onSendMessage={handleSendMessage}
                  onKeyPress={handleKeyPress}
                  isLoading={isLoading}
                  isClient={isClient}
                  isLimitReached={false}
                  onUpgrade={() => {}}
                />
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="fixed top-20 left-4 z-50 lg:hidden"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </Layout>
    </div>
    </TokenGuard>
  )
}