import { motion } from 'framer-motion'
import { X, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
}

export const ErrorDisplay = ({ error, onRetry, onDismiss }: ErrorDisplayProps) => {
  // Filter out connection errors (handled internally)
  const shouldShowError = !error.includes('Connection failed') &&
    !error.includes('Connection timeout') &&
    !error.includes('Maximum connection attempts') &&
    !error.includes('fetch') &&
    !error.includes('Invalid request') &&
    !error.includes('User prompt is required')

  if (!shouldShowError) return null

  let errorTitle = 'Analysis Failed'
  let errorDescription = error

  if (error.includes('No relevant documents found')) {
    errorTitle = 'No Documents Found'
    errorDescription = 'No relevant documents found for your query. Try rephrasing your request or upload more documents.'
  } else if (error.includes('Processing timeout')) {
    errorTitle = 'Processing Timeout'
    errorDescription = 'The analysis took too long to complete. Please try with a simpler request.'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-red-50 border-2 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-red-900 mb-2">
                {errorTitle}
              </h3>
              <div className="bg-white p-4 rounded-xl border border-red-200">
                <p className="text-red-800">{errorDescription}</p>
              </div>
            </div>
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

