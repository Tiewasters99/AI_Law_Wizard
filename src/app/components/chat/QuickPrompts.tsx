'use client'

import { Button } from '@/components/ui/button'

interface QuickPromptsProps {
  prompts: string[]
  onSelectPrompt: (prompt: string) => void
}

export default function QuickPrompts({ prompts, onSelectPrompt }: QuickPromptsProps) {
  return (
    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          variant="outline"
          size="sm"
          className="whitespace-nowrap text-xs sm:text-sm"
          onClick={() => onSelectPrompt(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  )
}
