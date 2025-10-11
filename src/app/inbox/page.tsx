'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/app/components/Layout'
import { ConversationView } from '@/app/components/consultation/ConversationView'
import { colors } from '@/app/lib/designSystem'
import { 
  MessageSquare, 
  Loader2, 
  AlertCircle, 
  User,
  FileText,
  Clock,
  Mail
} from 'lucide-react'
import { Badge } from '@/app/components/ui/badge'

interface Conversation {
  id: string
  consultationRequestId: string
  otherParty: {
    id: string
    name: string | null
    image: string | null
    customerProfile?: {
      companyName: string | null
    } | null
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
  lastMessage: {
    id: string
    content: string
    createdAt: string
    senderId: string
  } | null
  unreadCount: number
  lastMessageAt: string
}

function InboxPageContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('conversationId')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationIdParam)

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth')
      return
    }

    fetchConversations()

    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [session])

  useEffect(() => {
    if (conversationIdParam) {
      setSelectedConversationId(conversationIdParam)
    }
  }, [conversationIdParam])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()

      if (response.ok) {
        setConversations(data.conversations)
        setError(null)
      } else {
        setError(data.error || 'Failed to load conversations')
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b shadow-sm py-4 sm:py-6" style={{ 
          backgroundColor: colors.secondary[50],
          borderColor: colors.secondary[200]
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 sm:space-x-4"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: colors.primary[700] }}>
                <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight truncate" style={{ color: colors.text }}>
                  Inbox
                </h1>
                <p className="text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block" style={{ color: colors.secondary[600] }}>
                  Manage your consultation conversations
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div 
            className={`w-full md:w-80 lg:w-96 border-r overflow-y-auto flex-shrink-0 ${selectedConversationId ? 'hidden md:block' : 'block'}`}
            style={{ borderColor: colors.secondary[200] }}
          >
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary[600] }} />
              </div>
            )}

            {error && !loading && (
              <div className="p-4 sm:p-6 text-center">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3" style={{ color: colors.error[500] }} />
                <p className="text-sm" style={{ color: colors.error[700] }}>{error}</p>
              </div>
            )}

            {!loading && !error && conversations.length === 0 && (
              <div className="p-4 sm:p-6 text-center py-12">
                <Mail className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: colors.secondary[400] }} />
                <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: colors.text }}>No Conversations Yet</h3>
                <p className="text-xs sm:text-sm px-4" style={{ color: colors.secondary[600] }}>
                  Your consultation conversations will appear here
                </p>
              </div>
            )}

            {!loading && !error && conversations.length > 0 && (
              <div className="divide-y" style={{ borderColor: colors.secondary[200] }}>
                {conversations.map((conversation) => {
                  const isSelected = selectedConversationId === conversation.id
                  const otherParty = conversation.otherParty
                  const profile = otherParty.lawyerProfile || otherParty.customerProfile
                  const profileName = profile && 'firmName' in profile 
                    ? profile.firmName 
                    : profile && 'companyName' in profile 
                      ? profile.companyName 
                      : 'Professional'

                  return (
                    <motion.button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full p-3 sm:p-4 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                      style={{
                        borderLeftWidth: isSelected ? '4px' : '0px',
                        borderLeftColor: isSelected ? colors.primary[700] : 'transparent'
                      }}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primary[100] }}>
                            {otherParty.image ? (
                              <img src={otherParty.image} alt={otherParty.name || 'User'} className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              <User className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.primary[700] }} />
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: colors.error[500] }}>
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm truncate pr-2" style={{ color: colors.text }}>
                              {otherParty.name || 'Anonymous User'}
                            </h4>
                            <span className="text-xs flex-shrink-0" style={{ color: colors.secondary[500] }}>
                              {new Date(conversation.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs mb-2 truncate" style={{ color: colors.secondary[600] }}>
                            {profileName}
                          </p>
                          <div className="flex items-center mb-2">
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-0.5 truncate max-w-full"
                              style={{
                                backgroundColor: colors.primary[50],
                                color: colors.primary[700],
                                borderColor: colors.primary[200]
                              }}
                            >
                              {conversation.consultationRequest.caseType}
                            </Badge>
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-xs line-clamp-2" style={{ color: colors.secondary[600] }}>
                              {conversation.lastMessage.senderId === session.user.id ? 'You: ' : ''}{conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Desktop Conversation View */}
          <div className={`flex-1 ${selectedConversationId ? '' : 'hidden md:flex'}`}>
            {selectedConversationId ? (
              <ConversationView
                conversationId={selectedConversationId}
                currentUserId={session.user.id}
                onClose={() => setSelectedConversationId(null)}
              />
            ) : (
              <div className="flex items-center justify-center w-full p-4">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: colors.secondary[400] }} />
                  <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: colors.text }}>Select a Conversation</h3>
                  <p className="text-xs sm:text-sm px-4" style={{ color: colors.secondary[600] }}>
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

export default function InboxPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    }>
      <InboxPageContent />
    </Suspense>
  )
}

