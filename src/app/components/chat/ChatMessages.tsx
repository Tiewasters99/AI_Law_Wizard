'use client'

import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Bot, Loader2, AlertTriangle, ArrowDown, Sparkles, MessageSquare, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatMessage from './ChatMessage'
import { Message } from './types'

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  isClient: boolean
  remainingChats: number
  showScrollDown: boolean
  scrollAreaRef: React.RefObject<HTMLDivElement | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  copiedMessageId: string | null
  onCopy: (content: string, id: string) => void
  onScrollToBottom: () => void
}

export default function ChatMessages({
  messages,
  isLoading,
  isClient,
  remainingChats,
  showScrollDown,
  scrollAreaRef,
  messagesEndRef,
  copiedMessageId,
  onCopy,
  onScrollToBottom
}: ChatMessagesProps) {
  return (
    <div ref={scrollAreaRef} className="relative h-full overflow-y-auto bg-gradient-to-b from-gray-50/50 via-white/80 to-gray-50/50 custom-scrollbar">
      {/* Messages container with padding */}
      <div className="p-4 sm:p-6 space-y-4 h-full">
        {messages.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className="relative mb-4 sm:mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400" />
            </motion.div>

            <div className="max-w-sm space-y-2 sm:space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Start a conversation
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Ask me anything about legal matters. I'm here to help!
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                index={index}
                copiedMessageId={copiedMessageId}
                onCopy={onCopy}
              />
            ))}
          </AnimatePresence>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div 
            className="flex justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              
              <Card className="bg-white shadow-md border border-gray-100">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4"
          >
            <Button
              size="sm"
              className="shadow-md bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 w-8 h-8 sm:w-auto sm:h-auto"
              onClick={onScrollToBottom}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
