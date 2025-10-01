import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'

interface ProcessingIndicatorProps {
  currentStep?: number
  totalSteps?: number
  message?: string
}

export const ProcessingIndicator = ({
  currentStep = 0,
  totalSteps = 1,
  message = 'Processing your request...'
}: ProcessingIndicatorProps) => {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardContent className="py-8 px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <Loader2 className="w-12 h-12 text-blue-600" />
            </motion.div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-blue-900">{message}</h3>
              {totalSteps > 1 && (
                <p className="text-blue-700">
                  Step {currentStep} of {totalSteps}
                </p>
              )}
            </div>

            {totalSteps > 1 && (
              <div className="w-full max-w-md">
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

