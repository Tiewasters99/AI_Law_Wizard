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
import { Menu, X, MessageSquare, Sparkles, Users, BookOpen, Scale, Shield, GraduationCap } from 'lucide-react'

export default function ApprenticePage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string>('current')
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('Legal Apprentice')
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

    // Apprentice tier is now completely free - no usage limits

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Call Grok 3 API
         const response = await fetch('/api/chat', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({
             message: userMessage.content,
             sessionId: currentChatId !== 'current' ? currentChatId : null,
             chatType: 'apprentice'
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

             // Update session ID if this was a new session
             if (data.sessionId && currentChatId === 'current') {
               setCurrentChatId(data.sessionId)
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
  }, [isLoading, currentChatId])

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
    
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

  const handleNewChat = () => {
    setMessages([])
    setCurrentChatId('current')
    setCurrentChatTitle('Legal Apprentice')
    setInputMessage('')
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    setCurrentChatTitle('Legal Apprentice')
  }

  const handleLoadChatHistory = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${chatId}`)
      if (!response.ok) {
        throw new Error('Failed to load chat history')
      }
      
      const data = await response.json()
      const chatMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        timestamp: new Date(msg.createdAt)
      }))
      
      setMessages(chatMessages)
      
      // Update chat title from the session
      const selectedChat = data.session
      if (selectedChat && selectedChat.title) {
        setCurrentChatTitle(selectedChat.title)
      }
      
    } catch (error) {
      console.error('Error loading chat history:', error)
      toast({ 
        title: 'Error loading chat', 
        description: 'Failed to load chat history. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const apprenticePrompts = [
    'Explain basic contract law concepts',
    'What is the difference between civil and criminal law?',
    'How do I read a legal document?',
    'What are my basic rights as a tenant?',
    'Explain the court system structure',
    'What is due process?',
  ]

  return (
    <div className="min-h-screen bg-white">
      <Layout>
        <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden -mt-2 sm:-mt-4">
        {/* Mobile Sidebar Toggle Button - Only show for authenticated users */}
        {session?.user && (
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg border-gray-200"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        )}

        {/* Sidebar - Only show for authenticated users */}
        {session?.user && (
          <AnimatePresence>
            {(isSidebarOpen || !isMobile) && (
              <motion.div
                initial={{ x: isMobile ? -288 : 0, opacity: isMobile ? 0 : 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: isMobile ? -288 : 0, opacity: isMobile ? 0 : 1 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
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
                  chatType="apprentice"
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Mobile Overlay - Only show for authenticated users */}
        {session?.user && (
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
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white min-h-0 relative">
          {/* Header - Only show when there are messages */}
          {messages.length > 0 && (
            <div className="flex-shrink-0 px-6 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Legal Apprentice</h1>
                  <p className="text-sm text-gray-500">AI-powered legal assistance</p>
                </div>
              </div>
            </div>
          )}

          
          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              isClient={isClient}
              remainingChats={999} // Apprentice tier is free
              showScrollDown={showScrollDown}
              scrollAreaRef={scrollAreaRef}
              messagesEndRef={messagesEndRef}
              copiedMessageId={copiedMessageId}
              onCopy={handleCopy}
              onScrollToBottom={scrollToBottom}
            />
          </div>

          {/* Input Area - Centered when no messages, bottom when chatting */}
          <div className={`flex-shrink-0 ${
            messages.length === 0 
              ? 'flex-1 flex items-center justify-center px-6' 
              : 'px-6 py-4'
          }`}>
            {messages.length === 0 ? (
              /* Centered Welcome Section */
              <div className="w-full max-w-2xl mx-auto space-y-8">
                {/* Welcome Header */}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <GraduationCap className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Legal Apprentice</h1>
                    <p className="text-gray-500 mt-2">How can I help you with your legal questions today?</p>
                    {!session?.user && (
                      <p className="text-xs text-gray-400 mt-2">
                        💡 Sign in to save your conversation history
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 text-center">Quick Start</h3>
                  <QuickPrompts
                    prompts={apprenticePrompts}
                    onSelectPrompt={(prompt) => {
                      setInputMessage(prompt)
                      setTimeout(() => sendMessageWithText(prompt), 100)
                    }}
                  />
                </div>

                {/* Input Section */}
                <div className="space-y-4">
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
                  
                </div>
              </div>
            ) : (
              /* Bottom Input Section */
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
            )}
          </div>
        </div>
      </div>
      </Layout>
    </div>
  )
}
