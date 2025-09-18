'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { canUserChat, getCurrentUsage, incrementChatCount, FREE_CHAT_LIMIT } from '@/app/lib/pricing'
import UpgradeModal from '@/app/components/UpgradeModal'
import { motion } from 'framer-motion'
import { useToast } from '@/app/components/ui/use-toast'
import Layout from '@/app/components/Layout'
import QuickPrompts from '@/app/components/chat/QuickPrompts'
import ChatMessages from '@/app/components/chat/ChatMessages'
import ChatInput from '@/app/components/chat/ChatInput'
import { Message } from '@/app/components/chat/types'
import { GraduationCap, BookOpen, Lightbulb } from 'lucide-react'

export default function ApprenticePage() {
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
      <motion.div 
        className="flex flex-col h-[calc(100vh-100px)] bg-white/90 backdrop-blur-sm shadow-2xl rounded-lg mx-auto max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Apprentice Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Legal Apprentice</h1>
              <p className="text-sm text-gray-600">Learn the fundamentals of law with AI guidance</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span>Learning Mode</span>
            </div>
            {isClient && (
              <div className="text-sm text-gray-600">
                {remainingChats} questions remaining
              </div>
            )}
          </div>
        </div>

        {/* Learning Tips */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">Learning Tips:</p>
              <p>Ask questions about legal concepts, terminology, and basic procedures. This is your space to build foundational legal knowledge!</p>
            </div>
          </div>
        </div>

        {/* Quick prompts */}
        <QuickPrompts
          prompts={apprenticePrompts}
          onSelectPrompt={setInputMessage}
        />

        {/* Messages */}
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          isClient={isClient}
          remainingChats={remainingChats}
          showScrollDown={showScrollDown}
          scrollAreaRef={scrollAreaRef}
          messagesEndRef={messagesEndRef}
          copiedMessageId={copiedMessageId}
          onCopy={handleCopy}
          onScrollToBottom={scrollToBottom}
        />

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentUsage={currentUsage}
        />

        {/* Input */}
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={sendMessage}
          onKeyPress={handleKeyPress}
          isLoading={isLoading}
          isClient={isClient}
          isLimitReached={isLimitReached}
          onUpgrade={() => setShowUpgradeModal(true)}
        />
      </motion.div>
    </Layout>
  )
}
