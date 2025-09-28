'use client'

import { Button } from '@/app/components/ui/button'
import { Textarea } from '@/app/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect } from 'react'

interface ChatInputProps {
  inputMessage: string
  setInputMessage: (message: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  isClient: boolean
  isLimitReached: boolean
  onUpgrade: () => void
}

export default function ChatInput({
  inputMessage,
  setInputMessage,
  onSendMessage,
  onKeyPress,
  isLoading,
  isClient,
  isLimitReached,
  onUpgrade
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputMessage])

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return
    onSendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div 
      className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100/50 bg-white/80 backdrop-blur-sm"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.4 }}
    >
      <div className="flex items-end gap-2 sm:gap-3">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about legal matters..."
            className="min-h-[44px] sm:min-h-[50px] max-h-[100px] sm:max-h-[120px] resize-none border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 text-sm bg-white transition-all duration-200 placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading}
          className={`px-3 sm:px-6 h-[44px] sm:h-[50px] transition-all duration-200 ${
            inputMessage.trim() && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  )
}
