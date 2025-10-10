'use client'

import { Button } from '@/app/components/ui/button'
import { Bot, User, Copy, Check } from 'lucide-react'
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
      className={`group w-full py-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
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
      <div className={`flex items-start gap-3 px-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-gray-700 text-white' 
            : 'bg-gray-200 text-gray-700'
        }`}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Message content */}
        <div className="flex flex-col min-w-0">
          {/* Message bubble */}
          <div className={`relative rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            
            {/* Content */}
            <div className="text-base leading-relaxed break-words overflow-hidden">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => (
                    <div className="mb-4 mt-4 first:mt-0">
                      <h1 className={`text-2xl font-bold mb-2 break-words ${
                        isUser ? 'text-white' : 'text-gray-900'
                      }`}>
                        {children}
                      </h1>
                      <div className={`h-px ${
                        isUser ? 'bg-gray-600' : 'bg-gray-300'
                      }`} />
                    </div>
                  ),
                  h2: ({ children }) => (
                    <div className="mb-3 mt-4 first:mt-0">
                      <h2 className={`text-xl font-bold mb-2 break-words ${
                        isUser ? 'text-white' : 'text-gray-900'
                      }`}>
                        {children}
                      </h2>
                      <div className={`h-px ${
                        isUser ? 'bg-gray-600' : 'bg-gray-300'
                      }`} />
                    </div>
                  ),
                  h3: ({ children }) => (
                    <h3 className={`text-lg font-semibold mb-2 mt-3 break-words ${
                      isUser ? 'text-white' : 'text-gray-900'
                    }`}>
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className={`text-base font-semibold mb-2 mt-2 break-words ${
                      isUser ? 'text-white' : 'text-gray-800'
                    }`}>
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className={`mb-4 last:mb-0 leading-7 break-words ${
                      isUser ? 'text-white' : 'text-gray-800'
                    }`}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className={`mb-4 space-y-2 ml-1 break-words ${
                      isUser ? 'text-white' : 'text-gray-800'
                    }`}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className={`mb-4 space-y-2 ml-1 break-words ${
                      isUser ? 'text-white' : 'text-gray-800'
                    }`}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2 text-base break-words">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${
                        isUser ? 'bg-gray-400' : 'bg-gray-500'
                      }`} />
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className={`font-bold ${
                      isUser ? 'text-white' : 'text-gray-900'
                    }`}>
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => (
                    <code className={`px-2 py-0.5 rounded-md text-sm font-mono break-all ${
                      isUser 
                        ? 'bg-gray-700 text-gray-100 border border-gray-600' 
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className={`p-4 rounded-lg text-sm overflow-x-auto mb-4 font-mono shadow-sm ${
                      isUser 
                        ? 'bg-gray-900 text-gray-100 border border-gray-700' 
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className={`border-l-4 pl-4 py-2 my-4 italic rounded-r ${
                      isUser 
                        ? 'border-gray-500 bg-gray-700/30 text-gray-200' 
                        : 'border-blue-400 bg-blue-50/50 text-gray-700'
                    }`}>
                      {children}
                    </blockquote>
                  ),
                  hr: () => (
                    <div className="my-6">
                      <hr className={`border-t-2 ${
                        isUser 
                          ? 'border-gray-600' 
                          : 'border-gray-300'
                      }`} />
                    </div>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-lg border shadow-sm">
                      <table className={`min-w-full text-sm divide-y ${
                        isUser 
                          ? 'divide-gray-600 border-gray-600' 
                          : 'divide-gray-200 border-gray-200'
                      }`}>
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                      isUser 
                        ? 'bg-gray-700 text-gray-200 border-gray-600' 
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className={`px-4 py-3 break-words ${
                      isUser 
                        ? 'text-gray-200 border-gray-600' 
                        : 'text-gray-800 border-gray-200'
                    }`}>
                      {children}
                    </td>
                  ),
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`underline underline-offset-2 hover:no-underline font-medium ${
                        isUser 
                          ? 'text-blue-300 hover:text-blue-200' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Copy button - only for assistant messages */}
            {!isUser && isHovered && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-7 px-2 text-xs ${
                    isCopied 
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                  onClick={() => onCopy(message.content, message.id)}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
