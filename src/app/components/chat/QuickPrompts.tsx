'use client'

import { Button } from '@/app/components/ui/button'
import { motion } from 'framer-motion'

interface QuickPromptsProps {
  prompts: string[]
  onSelectPrompt: (prompt: string) => void
}

export default function QuickPrompts({ prompts, onSelectPrompt }: QuickPromptsProps) {
  return (
    <motion.div 
      className="px-3 sm:px-6 py-2 sm:py-3 bg-white/50 backdrop-blur-sm border-b border-gray-100/30"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
        {prompts.map((prompt, index) => (
          <motion.div
            key={prompt}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.3 + index * 0.05, 
              duration: 0.3,
              ease: 'easeOut'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-xs sm:text-sm bg-white/90 hover:bg-indigo-50 border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all duration-200 rounded-full px-2 sm:px-3 py-1 sm:py-2"
              onClick={() => onSelectPrompt(prompt)}
            >
              {prompt}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
