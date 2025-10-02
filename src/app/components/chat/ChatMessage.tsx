'use client'

import { Button } from '@/app/components/ui/button'
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react'
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
  const [isHovered, setIsHovered] = useState(false)

  const isUser = message.role === 'user'
  const isCopied = copiedMessageId === message.id

  return (
    <motion.div
      className={`group w-full ${isUser ? 'flex justify-end' : 'flex justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.03, 
        duration: 0.2,
        ease: 'easeOut'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-start gap-4 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-gray-800 text-white' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 relative max-w-[80%]">
          {/* Message content */}
          <div className={`relative ${
            isUser 
              ? 'bg-gray-800 text-white rounded-2xl px-4 py-3' 
              : 'text-gray-900'
          }`}>
            
            {/* Content */}
            <div className="text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-semibold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-sm font-medium mb-1">{children}</h4>,
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => (
                    <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                      isUser 
                        ? 'bg-gray-700 text-gray-200' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className={`p-3 rounded-lg text-xs overflow-x-auto mb-2 ${
                      isUser 
                        ? 'bg-gray-700 text-gray-200' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className={`border-l-2 pl-3 italic mb-2 ${
                      isUser 
                        ? 'border-gray-600 text-gray-300' 
                        : 'border-gray-300 text-gray-600'
                    }`}>
                      {children}
                    </blockquote>
                  ),
                  hr: () => (
                    <hr className={`my-2 ${
                      isUser 
                        ? 'border-gray-600' 
                        : 'border-gray-300'
                    }`} />
                  ),
                  table: ({ children }) => (
                    <table className={`border-collapse w-full text-xs mb-2 ${
                      isUser 
                        ? 'border-gray-600' 
                        : 'border-gray-300'
                    }`}>
                      {children}
                    </table>
                  ),
                  th: ({ children }) => (
                    <th className={`border px-2 py-1 text-left font-semibold ${
                      isUser 
                        ? 'border-gray-600 bg-gray-700' 
                        : 'border-gray-300 bg-gray-100'
                    }`}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className={`border px-2 py-1 ${
                      isUser 
                        ? 'border-gray-600' 
                        : 'border-gray-300'
                    }`}>
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Copy button - only for assistant messages */}
            {!isUser && (
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -right-2 -top-2"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-7 w-7 rounded-full ${
                        isCopied 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-sm border border-gray-200'
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
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
