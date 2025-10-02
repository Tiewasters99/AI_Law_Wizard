'use client'

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
    <div ref={scrollAreaRef} className="relative h-full overflow-y-auto bg-white">
      {/* Messages container */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
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
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div 
            className="flex justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-4 max-w-[80%]">
              {/* Bot avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>

              {/* Loading bubble */}
              <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center space-x-3">
                <div className="flex space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll down button */}
      {showScrollDown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-24 right-6 z-30"
        >
          <Button
            onClick={onScrollToBottom}
            className="rounded-full shadow-lg bg-white hover:bg-gray-50 border border-gray-200"
            size="icon"
          >
            <ArrowDown className="w-4 h-4 text-gray-600" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
