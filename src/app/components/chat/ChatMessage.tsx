'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, User, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Message } from './types'

interface ChatMessageProps {
  message: Message
  index: number
  copiedMessageId: string | null
  onCopy: (content: string, id: string) => void
}

export default function ChatMessage({ message, index, copiedMessageId, onCopy }: ChatMessageProps) {
  return (
    <motion.div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.06, 
        duration: 0.35,
        ease: 'easeOut'
      }}
    >
      <div className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <motion.div 
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.role === 'user' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
          }`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {message.role === 'user' ? (
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.25 }}
          className="flex-1"
        >
          <div className="relative">
            <Card className={`${message.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white shadow-md border border-gray-100'}`}>
              <CardContent className="p-3 sm:p-4">
                <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 sm:mt-3 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
            {/* Message actions */}
            <div className={`absolute top-2 ${message.role === 'user' ? 'left-2' : 'right-2'} flex items-center gap-1`}>
              <Button
                size="icon"
                variant={message.role === 'user' ? 'secondary' : 'ghost'}
                className="h-6 w-6 sm:h-7 sm:w-7"
                onClick={() => onCopy(message.content, message.id)}
                title="Copy"
              >
                {copiedMessageId === message.id ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
