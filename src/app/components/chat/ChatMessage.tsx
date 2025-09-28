'use client'

import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Bot, User, Copy, Check, MoreVertical, ThumbsUp, ThumbsDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from './types'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface ChatMessageProps {
  message: Message
  index: number
  copiedMessageId: string | null
  onCopy: (content: string, id: string) => void
}

export default function ChatMessage({ message, index, copiedMessageId, onCopy }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isUser = message.role === 'user'
  const isCopied = copiedMessageId === message.id

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.06, 
        duration: 0.35,
        ease: 'easeOut'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <motion.div 
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
            isUser 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
              : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700'
          }`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {isUser ? (
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </motion.div>

        {/* Message content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.25 }}
          className="flex-1 relative group"
        >
          <Card className={`relative overflow-hidden ${
            isUser 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border-0' 
              : 'bg-white shadow-md border border-gray-100 hover:border-indigo-200'
          }`}>
            {/* Subtle background pattern for assistant messages */}
            {!isUser && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/2 via-transparent to-purple-500/2 pointer-events-none" />
            )}
            
            <CardContent className="relative p-3 sm:p-4">
              <div className="text-sm sm:text-base leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold text-gray-900 mb-1">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-semibold text-gray-900 mb-1">{children}</h4>,
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">{children}</pre>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">{children}</blockquote>,
                    hr: () => <hr className="border-gray-200 my-2" />,
                    table: ({ children }) => <table className="border-collapse border border-gray-300 w-full text-xs mb-2">{children}</table>,
                    th: ({ children }) => <th className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold">{children}</th>,
                    td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              
              <div className={`flex items-center justify-between mt-2 sm:mt-3 ${
                isUser ? 'text-indigo-100' : 'text-gray-500'
              }`}>
                <span className="text-xs">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                
                {/* Message actions for assistant messages */}
                {!isUser && (
                  <motion.div 
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      title="Like"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      title="Dislike"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Copy button */}
          <AnimatePresence>
            {(isHovered || isCopied) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                className={`absolute top-2 ${isUser ? 'left-2' : 'right-2'} z-10`}
              >
                <Button
                  size="icon"
                  variant={isUser ? 'secondary' : 'ghost'}
                  className={`h-7 w-7 transition-all duration-200 ${
                    isCopied 
                      ? 'bg-green-100 text-green-600 border-green-200' 
                      : isUser 
                        ? 'bg-white/20 text-white hover:bg-white/30' 
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-800 shadow-sm'
                  }`}
                  onClick={() => onCopy(message.content, message.id)}
                  title={isCopied ? 'Copied!' : 'Copy message'}
                >
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                      >
                        <Copy className="w-3 h-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle border highlight for assistant messages */}
          {!isUser && isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-lg border border-indigo-200 pointer-events-none"
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
