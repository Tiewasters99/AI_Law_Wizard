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
    <div className="flex items-end gap-2 px-4 max-w-5xl mx-auto">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me..."
          className="min-h-[48px] max-h-[200px] resize-none border border-gray-300 focus:border-gray-400 focus:ring-0 text-sm bg-white rounded-lg px-3 py-2.5 placeholder:text-gray-400"
          disabled={isLoading}
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={!inputMessage.trim() || isLoading}
        className={`h-[48px] w-[48px] rounded-lg flex-shrink-0 ${
          inputMessage.trim() && !isLoading
            ? 'bg-gray-800 hover:bg-gray-900'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}
