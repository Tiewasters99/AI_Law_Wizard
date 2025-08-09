'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { canUserChat, getCurrentUsage, incrementChatCount, FREE_CHAT_LIMIT } from '@/lib/pricing'
import UpgradeModal from '@/components/UpgradeModal'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import ChatHeader from '@/components/chat/ChatHeader'
import QuickPrompts from '@/components/chat/QuickPrompts'
import ChatMessages from '@/components/chat/ChatMessages'
import ChatInput from '@/components/chat/ChatInput'
import { Message } from '@/components/chat/types'

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
        <ChatHeader
          isClient={isClient}
          onUpgrade={() => setShowUpgradeModal(true)}
        />

        {/* Quick prompts */}
        <QuickPrompts
          prompts={quickPrompts}
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
    </div>
  )
}
