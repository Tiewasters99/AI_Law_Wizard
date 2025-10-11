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
import { Menu, X, MessageSquare, Users, BookOpen, Scale, Shield, Brain, FileSearch, Gavel } from 'lucide-react'
import { DocumentAnalysisInterface } from '@/app/components/document-processing/DocumentAnalysisInterface'
import { TokenGuard } from '@/app/components/auth/TokenGuard'
import { TOKEN_REQUIREMENTS } from '@/app/hooks/useTokenAccess'
import { colors } from '@/app/lib/designSystem'
import Link from 'next/link'

export default function WizardPage() {
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
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('Legal Wizard')
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
    setCurrentChatTitle('Legal Wizard')
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
          chatType: 'wizard', // Use wizard chat type
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

  // If user is a lawyer, show professional document analysis interface
  if (isLawyer) {
    return (
      <TokenGuard 
        requiredTokens={TOKEN_REQUIREMENTS.WIZARD}
        featureName="Advanced Legal Analysis"
        featureIcon={<Brain className="w-10 h-10" style={{ color: colors.primary[700] }} />}
        featureDescription="Professional AI-powered legal analysis platform with comprehensive document processing, case law research, and intelligent legal insights for attorneys."
      >
        <div className="bg-white h-full overflow-hidden">
          <DocumentAnalysisInterface />
        </div>
      </TokenGuard>
    )
  }

  // Client interface - professional chat
  return (
    <TokenGuard 
      requiredTokens={TOKEN_REQUIREMENTS.WIZARD}
      featureName="Advanced Legal Consultation"
      featureIcon={<Gavel className="w-10 h-10" style={{ color: colors.primary[700] }} />}
      featureDescription="Professional AI-powered legal consultation with intelligent analysis and comprehensive legal guidance from advanced AI systems."
    >
    <div className="min-h-screen bg-white">
      <Layout>
        <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden -mt-2 sm:-mt-4" style={{ backgroundColor: colors.background }}>
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
                  chatType="wizard"
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
            {/* Professional Header */}
            {messages.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: colors.secondary[200] }}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary[100] }}>
                    <Brain className="w-4 h-4" style={{ color: colors.primary[700] }} />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold" style={{ color: colors.text }}>Advanced Legal Analysis</h1>
                    <p className="text-sm" style={{ color: colors.secondary[600] }}>Professional AI-Powered Legal Consultation</p>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Status Banner */}
            {messages.length > 0 && !session?.user && (
              <div className="bg-gray-50 px-6 py-2 border-b" style={{ borderColor: colors.secondary[200] }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" style={{ color: colors.primary[700] }} />
                    <span className="text-sm font-medium" style={{ color: colors.text }}>
                      Sign in for secure legal analysis and document processing
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border"
                    style={{ borderColor: colors.primary[300], color: colors.primary[700] }}
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
                remainingChats={999} // Wizard tier is free
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
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm" style={{ backgroundColor: colors.primary[700] }}>
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2" style={{ color: colors.text }}>Advanced Legal Analysis System</h2>
                    <p className="mb-4" style={{ color: colors.secondary[600] }}>
                      Professional AI-powered legal consultation platform. Receive comprehensive legal analysis, case law research, and expert-level guidance from our advanced legal AI system.
                    </p>
                    <div className="mb-6 p-3 rounded-lg border" style={{ 
                      backgroundColor: colors.primary[50],
                      borderColor: colors.primary[200]
                    }}>
                      <p className="text-xs" style={{ color: colors.primary[900] }}>
                        💡 Need personalized legal advice? {' '}
                        <Link 
                          href="/directory" 
                          className="font-semibold underline hover:no-underline transition-all"
                          style={{ color: colors.primary[700] }}
                        >
                          Find an attorney
                        </Link>
                        {' '} for one-on-one consultation.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
                      {[
                        { icon: Scale, label: 'Case Analysis' },
                        { icon: FileSearch, label: 'Legal Research' },
                        { icon: Shield, label: 'Confidential' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg border text-center" style={{ 
                          backgroundColor: colors.secondary[50],
                          borderColor: colors.secondary[200]
                        }}>
                          <item.icon className="w-5 h-5 mx-auto mb-1" style={{ color: colors.primary[700] }} />
                          <span className="text-xs font-medium" style={{ color: colors.text }}>{item.label}</span>
                        </div>
                      ))}
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