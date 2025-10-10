'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/app/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'
import ChatMessages from '@/app/components/chat/ChatMessages'
import ChatInput from '@/app/components/chat/ChatInput'
import ChatSidebar from '@/app/components/chat/ChatSidebar'
import { Message } from '@/app/components/chat/types'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Scale, Sparkles, Menu, Settings } from 'lucide-react'

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

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
    
    // Load initial messages from localStorage
    const storedMessages = localStorage.getItem('legalChatMessages')
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages)
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
        // Clear after loading
        localStorage.removeItem('legalChatMessages')
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }
  }, [])

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

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return

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
      const response = await fetch('/api/legal-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIssue: userMessage.content
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

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
  }, [inputMessage, isLoading])

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

  const handleBack = () => {
    router.push('/')
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setInputMessage('')
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    setIsSidebarOpen(false)
  }

  const handleLoadChatHistory = async (chatId: string) => {
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
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden">
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
                className="fixed lg:relative top-0 left-0 h-full w-72 bg-gray-50 border-r border-gray-200 z-50 flex flex-col"
              >
                <ChatSidebar
                  onNewChat={handleNewChat}
                  onSelectChat={handleSelectChat}
                  onLoadChatHistory={handleLoadChatHistory}
                  currentChatId={currentChatId || undefined}
                  chatType="general"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="hover:bg-gray-100"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <div className="hidden sm:block w-px h-6 bg-gray-300" />
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                    Legal Analysis Chat
                  </h1>
                </div>
                {session?.user && (
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Online</span>
                  </div>
                )}
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
          <div className="flex-shrink-0 border-t border-gray-200 bg-white py-4">
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
            <p className="text-xs text-gray-500 mt-3 text-center max-w-5xl mx-auto px-4">
              AI-generated legal information. Always consult a qualified attorney for legal advice.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

