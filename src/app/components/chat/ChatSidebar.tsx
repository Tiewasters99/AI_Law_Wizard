'use client'

import { Button } from '@/app/components/ui/button'
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  lastActivity: Date
  messageCount: number
  metadata?: any
}

interface ChatSidebarProps {
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onLoadChatHistory?: (chatId: string) => Promise<void>
  currentChatId?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  chatType?: 'general' | 'apprentice' | 'wizard' | 'grand-wizard'
}

export default function ChatSidebar({
  onNewChat,
  onSelectChat,
  onLoadChatHistory,
  currentChatId,
  isCollapsed = false,
  onToggleCollapse,
  chatType = 'general'
}: ChatSidebarProps) {
  const { data: session } = useSession()
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null)

  // Fetch chat history from API
  const fetchChatHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Only fetch chat history for authenticated users
      if (!session?.user) {
        setChatHistory([])
        setIsLoading(false)
        return
      }
      
      const response = await fetch('/api/chat/sessions')
      if (!response.ok) {
        throw new Error('Failed to fetch chat history')
      }
      
      const data = await response.json()
      setChatHistory(data.sessions || [])
    } catch (err) {
      console.error('Error fetching chat history:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chat history')
    } finally {
      setIsLoading(false)
    }
  }

  // Load chat history on component mount and when session changes
  useEffect(() => {
    fetchChatHistory()
  }, [session?.user])

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return dateObj.toLocaleDateString()
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/chat/sessions/${chatId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete chat')
      }
      
      // Refresh chat history
      fetchChatHistory()
    } catch (err) {
      console.error('Error deleting chat:', err)
    }
  }

  const handleNewChat = () => {
    onNewChat()
    // Optionally refresh history to show the new chat
    fetchChatHistory()
  }

  const handleSelectChat = async (chatId: string) => {
    onSelectChat(chatId)
    
    // Load chat history if callback is provided
    if (onLoadChatHistory) {
      try {
        setLoadingChatId(chatId)
        await onLoadChatHistory(chatId)
      } catch (error) {
        console.error('Error loading chat history:', error)
      } finally {
        setLoadingChatId(null)
      }
    }
  }

  return (
    <div 
      className="bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden w-64 lg:relative fixed lg:translate-x-0 translate-x-0 z-50 lg:z-auto"
    >
      {/* Header with New Chat Button */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <Button
          onClick={handleNewChat}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

             {/* Chat History */}
             <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
               <h3 className="text-sm font-medium text-gray-500 mb-3">
                 Recent Chats
               </h3>

               {/* Loading state */}
               {isLoading && (
                 <div className="text-center py-8">
                   <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                   <p className="text-sm text-gray-500">Loading chats...</p>
                 </div>
               )}

               {/* Error state */}
               {error && (
                 <div className="text-center py-8">
                   <MessageSquare className="w-12 h-12 text-red-300 mx-auto mb-3" />
                   <p className="text-sm text-red-500">{error}</p>
                   <Button
                     variant="outline"
                     size="sm"
                     className="mt-2"
                     onClick={fetchChatHistory}
                   >
                     Retry
                   </Button>
                 </div>
               )}

               {/* Chat history list */}
               {!isLoading && !error && chatHistory.map((chat) => (
                 <motion.div
                   key={chat.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`group relative rounded-lg cursor-pointer transition-all duration-200 p-3 ${
                     currentChatId === chat.id
                       ? 'bg-indigo-100 border border-indigo-200'
                       : 'bg-white hover:bg-gray-100 border border-transparent'
                   } ${loadingChatId === chat.id ? 'opacity-50 cursor-wait' : ''}`}
                   onClick={() => handleSelectChat(chat.id)}
                 >
                   <div className="flex items-start justify-between">
                     <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-medium text-gray-900 truncate">
                         {chat.title}
                       </h4>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs text-gray-500">{formatTime(chat.lastActivity)}</span>
                         <span className="text-xs text-gray-400">•</span>
                         <span className="text-xs text-gray-500">{chat.messageCount} messages</span>
                       </div>
                       {chat.lastMessage && (
                         <p className="text-xs text-gray-400 mt-1 truncate">
                           {chat.lastMessage}
                         </p>
                       )}
                       {loadingChatId === chat.id && (
                         <div className="absolute top-2 right-2">
                           <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                       )}
                     </div>

                     {/* Action buttons */}
                     <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                       <Button
                         size="icon"
                         variant="ghost"
                         className="h-6 w-6 text-gray-400 hover:text-red-600"
                         onClick={(e) => handleDeleteChat(chat.id, e)}
                       >
                         <Trash2 className="w-3 h-3" />
                       </Button>
                     </div>
                   </div>
                 </motion.div>
               ))}

               {/* Empty state */}
               {!isLoading && !error && chatHistory.length === 0 && (
                 <div className="text-center py-8">
                   <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   {session?.user ? (
                     <>
                       <p className="text-sm text-gray-500">No chat history yet</p>
                       <p className="text-xs text-gray-400 mt-1">Start a new conversation to see it here</p>
                     </>
                   ) : (
                     <>
                       <p className="text-sm text-gray-500">Sign in to save your chat history</p>
                       <p className="text-xs text-gray-400 mt-1">Your conversations will be saved when you're logged in</p>
                     </>
                   )}
                 </div>
               )}
             </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          AI Legal Assistant
        </div>
      </div>
    </div>
  )
}