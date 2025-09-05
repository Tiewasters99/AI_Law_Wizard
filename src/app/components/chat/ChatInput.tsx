'use client'

import { Button } from '@/app/components/ui/button'
import { Textarea } from '@/app/components/ui/textarea'
import { Send, Crown, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { isSubscriptionActive } from '@/app/lib/subscription'

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
  const hasSubscription = isClient ? isSubscriptionActive() : false
  return (
    <motion.div 
      className="p-4 sm:p-6 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.45 }}
    >
      <div className="flex items-end gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-gray-600" title="Attach file">
            <FileText className="w-4 h-4" />
          </Button>
          {/* {isClient && !hasSubscription && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
              onClick={onUpgrade}
            >
              <Crown className="w-3 h-3" />
              <span>Upgrade</span>
            </Button>
          )} */}
        </div>
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={isClient && isLimitReached && !hasSubscription ? 'Upgrade to continue chatting...' : 'Type your message here...'}
          className="min-h-[50px] sm:min-h-[60px] max-h-[120px] sm:max-h-[160px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 flex-1 text-sm sm:text-base"
          disabled={isLoading || (isClient && isLimitReached && !hasSubscription)}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={isClient && isLimitReached && !hasSubscription ? onUpgrade : onSendMessage}
            disabled={(!inputMessage.trim() && !(isClient && isLimitReached && !hasSubscription)) || isLoading}
            className={`px-4 sm:px-6 self-end h-[44px] sm:h-[60px] ${
              isClient && isLimitReached && !hasSubscription
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700'
            }`}
          >
            {isClient && isLimitReached && !hasSubscription ? <Crown className="w-4 h-4 sm:w-5 sm:h-5" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
        </motion.div>
      </div>
      <div className="mt-2 text-right text-xs text-gray-500">
        {inputMessage.length} characters
      </div>
    </motion.div>
  )
}
