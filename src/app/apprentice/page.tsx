'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/app/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import Layout from '@/app/components/Layout'
import ChatSidebar from '@/app/components/chat/ChatSidebar'
import QuickPrompts from '@/app/components/chat/QuickPrompts'
import ChatMessages from '@/app/components/chat/ChatMessages'
import ChatInput from '@/app/components/chat/ChatInput'
import { Message } from '@/app/components/chat/types'

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(isMobileDevice)
      // Keep sidebar collapsed on mobile, expanded on desktop
      if (isMobileDevice) {
        setIsSidebarCollapsed(true) // Start collapsed on mobile
      } else {
        setIsSidebarCollapsed(false) // Start expanded on desktop
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
    setIsSidebarCollapsed(!isSidebarCollapsed)
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
    <Layout>
      <div className="h-[calc(100vh-120px)] bg-gray-100 flex overflow-hidden rounded-lg shadow-lg">
        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="lg:hidden fixed top-4 right-4 z-50">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

          {/* Sidebar - Fixed, always visible on desktop */}
          <div className="hidden lg:block">
            <ChatSidebar
              onNewChat={handleNewChat}
              onSelectChat={handleSelectChat}
              onLoadChatHistory={handleLoadChatHistory}
              currentChatId={currentChatId}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              chatType="apprentice"
            />
          </div>

          {/* Mobile Sidebar - Overlay when needed */}
          <div className={`lg:hidden ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            <ChatSidebar
              onNewChat={handleNewChat}
              onSelectChat={handleSelectChat}
              onLoadChatHistory={handleLoadChatHistory}
              currentChatId={currentChatId}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              chatType="apprentice"
            />
          </div>

          {/* Mobile Overlay - Only on mobile when sidebar is open */}
          {!isSidebarCollapsed && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleSidebar}
            />
          )}

          {/* Main Chat Panel */}
          <div className="flex-1 flex flex-col bg-white min-h-0 relative">
          {/* User Status Indicator */}
          {!session?.user && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-700">
              <div className="flex items-center justify-between">
                <span>You're using the free apprentice tier. Sign in to save your chat history.</span>
                <a 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Sign In
                </a>
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

          {/* Quick Prompts - Only show when no messages */}
          {messages.length === 0 && (
            <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
              <QuickPrompts
                prompts={apprenticePrompts}
                onSelectPrompt={(prompt) => {
                  setInputMessage(prompt)
                  setTimeout(() => sendMessageWithText(prompt), 100)
                }}
              />
            </div>
          )}

          {/* Input Area */}
          <div className="flex-shrink-0">
            <ChatInput
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendMessage={sendMessage}
              onKeyPress={handleKeyPress}
              isLoading={isLoading}
              isClient={isClient}
              isLimitReached={false} // Apprentice tier is free
              onUpgrade={() => {}} // No upgrade needed for free tier
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}
