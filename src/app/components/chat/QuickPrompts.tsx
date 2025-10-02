'use client'

import { Button } from '@/app/components/ui/button'
import { motion } from 'framer-motion'

interface QuickPromptsProps {
  prompts: string[]
  onSelectPrompt: (prompt: string) => void
}

export default function QuickPrompts({ prompts, onSelectPrompt }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt, index) => (
        <motion.div
          key={prompt}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: index * 0.05, 
            duration: 0.2,
            ease: 'easeOut'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap text-sm bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-200 rounded-full px-3 py-2"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </Button>
        </motion.div>
      ))}
    </div>
  )
}
