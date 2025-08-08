'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Loader2, RefreshCw, Crown, AlertTriangle } from 'lucide-react'
import { canUserChat, getCurrentUsage, incrementChatCount, FREE_CHAT_LIMIT } from '@/lib/pricing'
import UpgradeModal from '@/components/UpgradeModal'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
  }, [messages.length])

  const sendMessageWithText = async (messageText: string) => {
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
  }

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

  const remainingChats = FREE_CHAT_LIMIT - currentUsage
  const isLimitReached = isClient && remainingChats <= 0

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chat with Grok</h1>
          <p className="text-sm text-gray-600">Ask me anything about legal matters</p>
                     <div className="flex items-center gap-2 mt-1">
             {isClient && (
               <>
                 <Badge variant={isLimitReached ? "destructive" : "secondary"} className="text-xs">
                   {remainingChats} free chats remaining
                 </Badge>
                 {isLimitReached && (
                   <Badge variant="destructive" className="text-xs flex items-center gap-1">
                     <AlertTriangle className="w-3 h-3" />
                     Limit reached
                   </Badge>
                 )}
               </>
             )}
           </div>
        </div>
                 <div className="flex items-center gap-2">
           {isClient && isLimitReached && (
             <Button
               onClick={() => setShowUpgradeModal(true)}
               variant="default"
               size="sm"
               className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
             >
               <Crown className="w-4 h-4" />
               Upgrade
             </Button>
           )}
          <Button
            onClick={clearChat}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-gray-600 max-w-md">
              Ask me about legal issues, get advice, or discuss any legal matters. I'm here to help!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <Card className={`${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Grok is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

                 {/* Chat limit warning */}
         {isClient && remainingChats <= 2 && remainingChats > 0 && (
           <div className="flex justify-center">
             <Card className="bg-yellow-50 border-yellow-200 max-w-md">
               <CardContent className="p-3">
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
           </div>
         )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={currentUsage}
      />

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
                     <Textarea
             value={inputMessage}
             onChange={(e) => setInputMessage(e.target.value)}
             onKeyPress={handleKeyPress}
             placeholder={isClient && isLimitReached ? "Upgrade to continue chatting..." : "Type your message here..."}
             className="min-h-[60px] max-h-[120px] resize-none"
             disabled={isLoading || (isClient && isLimitReached)}
           />
           <Button
             onClick={isClient && isLimitReached ? () => setShowUpgradeModal(true) : sendMessage}
             disabled={(!inputMessage.trim() && !(isClient && isLimitReached)) || isLoading}
             className={`px-4 self-end ${isClient && isLimitReached ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}
           >
             {isClient && isLimitReached ? <Crown className="w-4 h-4" /> : <Send className="w-4 h-4" />}
           </Button>
        </div>
      </div>
    </div>
  )
}
