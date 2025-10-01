import { Play, Loader2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { Textarea } from '../../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { motion } from 'framer-motion'

interface AnalysisInputProps {
  userPrompt: string
  onPromptChange: (value: string) => void
  onSubmit: () => void
  isProcessing: boolean
}

export const AnalysisInput = ({
  userPrompt,
  onPromptChange,
  onSubmit,
  isProcessing
}: AnalysisInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !isProcessing) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>AI Document Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              What would you like to analyze?
            </label>
            <Textarea
              value={userPrompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe what you want to analyze or ask a question about your documents..."
              rows={4}
              className="text-base resize-none border-2 border-gray-200 focus:border-blue-500 rounded-xl p-3 sm:p-4 shadow-sm"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500">
              Press Ctrl+Enter to submit
            </p>
          </div>

          <Button
            onClick={onSubmit}
            disabled={isProcessing || !userPrompt.trim()}
            className="w-full h-12 sm:h-14 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-3" />
                Start Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

