import { motion, AnimatePresence } from 'framer-motion'
import { X, Brain } from 'lucide-react'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { ContinueChatInterface } from '../ContinueChatInterface'
import type { ProcessedFileInfo } from '../../../stores/documentProcessingStore'

interface ChatSectionProps {
  show: boolean
  onClose: () => void
  sessionId: string | null
  processedFiles: ProcessedFileInfo[]
  onSessionCreate?: (sessionId: string) => void
}

export const ChatSection = ({
  show,
  onClose,
  sessionId,
  processedFiles,
  onSessionCreate
}: ChatSectionProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  Ask follow-up questions
                </span>
              </div>
              {sessionId && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Brain className="w-3 h-3 text-blue-500" />
                  <span>Context maintained from original analysis</span>
                  {processedFiles.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs py-0 px-1.5">
                      {processedFiles.length} {processedFiles.length === 1 ? 'document' : 'documents'}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Interface */}
          <div className="relative">
            <ContinueChatInterface
              sessionId={sessionId || undefined}
              onSessionCreate={onSessionCreate}
              className="min-h-[300px] max-h-[500px]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

