'use client'

import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Bot, Loader2, AlertTriangle, ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatMessage from './ChatMessage'
import { Message } from './types'
import { isSubscriptionActive } from '@/app/lib/subscription'

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
  const hasSubscription = isClient ? isSubscriptionActive() : false
  return (
    <div ref={scrollAreaRef} className="relative flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/30 custom-scrollbar">
      {messages.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center h-full text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Bot className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mb-6" />
          </motion.div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Start a conversation</h3>
          <p className="text-gray-600 max-w-md leading-relaxed text-sm sm:text-base">
            Ask me about legal issues, get advice, or discuss any legal matters. I&apos;m here to help!
          </p>
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
      
      {isLoading && (
        <motion.div 
          className="flex justify-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <Card className="bg-white shadow-md border border-gray-100">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <div className="flex items-center gap-1">
                    {[0,1,2].map((i) => (
                      <motion.span
                        key={i}
                        className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Chat limit warning */}
      {isClient && !hasSubscription && remainingChats <= 2 && remainingChats > 0 && (
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 max-w-md shadow-md">
            <CardContent className="p-4">
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
        </motion.div>
      )}
      
      <div ref={messagesEndRef} />

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6"
          >
            <Button
              size="sm"
              className="shadow-md bg-white text-gray-800 hover:bg-gray-50 border"
              onClick={onScrollToBottom}
            >
              <ArrowDown className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">New messages</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
