'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, AlertCircle, User, FileText, ArrowLeft, X } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { colors } from '@/app/lib/designSystem'
import { Badge } from '@/app/components/ui/badge'

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  isRead: boolean
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Conversation {
  id: string
  client: {
    id: string
    name: string | null
    image: string | null
    customerProfile?: {
      companyName: string | null
    } | null
  }
  attorney: {
    id: string
    name: string | null
    image: string | null
    lawyerProfile?: {
      firmName: string | null
      specialty: string | null
    } | null
  }
  consultationRequest: {
    id: string
    caseType: string
    status: string
    urgency: string
  }
  messages: Message[]
}

interface ConversationViewProps {
  conversationId: string
  currentUserId: string
  onClose?: () => void
}

export function ConversationView({ conversationId, currentUserId, onClose }: ConversationViewProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      const data = await response.json()

      if (response.ok) {
        setConversation(data.conversation)
        setError(null)
      } else {
        setError(data.error || 'Failed to load conversation')
      }
    } catch (err) {
      console.error('Error fetching conversation:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversation()

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversation, 5000)
    return () => clearInterval(interval)
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return

    setSending(true)
    setError(null)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          content: message.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('')
        // Refresh conversation to show new message
        await fetchConversation()
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary[600] }} />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: colors.error[500] }} />
          <p style={{ color: colors.error[700] }}>Failed to load conversation</p>
        </div>
      </div>
    )
  }

  const otherParty = conversation.client.id === currentUserId ? conversation.attorney : conversation.client
  const otherPartyProfile = conversation.client.id === currentUserId 
    ? conversation.attorney.lawyerProfile 
    : conversation.client.customerProfile
  
  const profileName = otherPartyProfile && 'firmName' in otherPartyProfile 
    ? otherPartyProfile.firmName 
    : otherPartyProfile && 'companyName' in otherPartyProfile 
      ? otherPartyProfile.companyName 
      : 'Professional'

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center space-x-2 sm:space-x-3" style={{ borderColor: colors.secondary[200] }}>
        {/* Back Button for Mobile */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden flex-shrink-0 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        {/* User Info */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primary[100] }}>
            {otherParty.image ? (
              <img src={otherParty.image} alt={otherParty.name || 'User'} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <User className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.primary[700] }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base lg:text-lg truncate" style={{ color: colors.text }}>
              {otherParty.name || 'Anonymous User'}
            </h3>
            <p className="text-xs sm:text-sm truncate" style={{ color: colors.secondary[600] }}>
              {profileName}
            </p>
          </div>
        </div>
        
        {/* Badges */}
        <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
          <Badge
            variant="outline"
            className="text-xs font-semibold"
            style={{
              backgroundColor: colors.primary[50],
              color: colors.primary[700],
              borderColor: colors.primary[200]
            }}
          >
            {conversation.consultationRequest.caseType}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs font-semibold"
            style={{
              backgroundColor: colors.secondary[50],
              color: colors.secondary[700],
              borderColor: colors.secondary[200]
            }}
          >
            {conversation.consultationRequest.status.replace('_', ' ')}
          </Badge>
        </div>
        
        {/* Mobile badges - show in a more compact way */}
        <div className="sm:hidden flex flex-col space-y-1 flex-shrink-0">
          <Badge
            variant="outline"
            className="text-xs font-semibold px-2 py-0.5"
            style={{
              backgroundColor: colors.primary[50],
              color: colors.primary[700],
              borderColor: colors.primary[200]
            }}
          >
            {conversation.consultationRequest.caseType}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3" style={{ color: colors.secondary[400] }} />
            <p className="text-xs sm:text-sm px-4" style={{ color: colors.secondary[600] }}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {conversation.messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === currentUserId
              const showAvatar = index === 0 || conversation.messages[index - 1].senderId !== msg.senderId

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full`}>
                    <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[80%]`}>
                      {showAvatar && (
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: colors.primary[100] }}>
                          {msg.sender.image ? (
                            <img src={msg.sender.image} alt={msg.sender.name || 'User'} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: colors.primary[700] }} />
                          )}
                        </div>
                      )}
                      {!showAvatar && <div className="w-7 sm:w-8" />}
                      <div className="flex flex-col">
                        <div
                          className="px-3 py-2 sm:px-4 sm:py-3 rounded-2xl"
                          style={{
                            backgroundColor: isCurrentUser ? colors.primary[700] : colors.secondary[100],
                            color: isCurrentUser ? 'white' : colors.text
                          }}
                        >
                          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`} style={{ color: colors.secondary[500] }}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex-shrink-0 px-3 sm:px-4 lg:px-6 py-2">
          <div className="p-2 sm:p-3 rounded-lg border flex items-center space-x-2"
            style={{
              backgroundColor: colors.error[50],
              borderColor: colors.error[200]
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: colors.error[600] }} />
            <p className="text-xs" style={{ color: colors.error[900] }}>{error}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t px-3 sm:px-4 lg:px-6 py-3 sm:py-4" style={{ borderColor: colors.secondary[200] }}>
        <div className="flex items-end space-x-2 sm:space-x-3">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              // Auto-resize textarea
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border resize-none text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: colors.secondary[300],
              maxHeight: '120px',
              minHeight: '44px'
            }}
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            className="text-white h-11 sm:h-12 px-4 sm:px-6 flex-shrink-0"
            style={{ 
              backgroundColor: !message.trim() || sending ? colors.secondary[400] : colors.primary[700],
              cursor: !message.trim() || sending ? 'not-allowed' : 'pointer'
            }}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs mt-2 hidden sm:block" style={{ color: colors.secondary[500] }}>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

