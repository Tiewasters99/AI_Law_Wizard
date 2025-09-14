'use client'

import { CheckCircle, Circle, Lock } from 'lucide-react'
import { Button } from '../ui/button'

export interface Step {
  id: string
  title: string
  description: string
}

interface StepIndicatorProps {
  steps: readonly Step[]
  currentStep: string
  onStepClick: (stepId: string) => void
  canProceed: Record<string, boolean>
}

export const StepIndicator = ({ steps, currentStep, onStepClick, canProceed }: StepIndicatorProps) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep)

  const getStepStatus = (index: number, stepId: string) => {
    if (index < currentIndex) return 'completed'
    if (index === currentIndex) return 'current'
    if (canProceed[stepId]) return 'available'
    return 'locked'
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'current':
        return <Circle className="w-5 h-5 text-blue-600 fill-current" />
      case 'available':
        return <Circle className="w-5 h-5 text-gray-400" />
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-300" />
      default:
        return <Circle className="w-5 h-5 text-gray-300" />
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => {
        const status = getStepStatus(index, step.id)
        const isClickable = status === 'completed' || status === 'available'
        
        return (
          <div key={step.id} className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex items-center space-x-2 px-3 py-2 h-auto ${
                status === 'current'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isClickable
                  ? 'hover:bg-gray-50'
                  : 'cursor-not-allowed opacity-50'
              }`}
            >
              {getStepIcon(status)}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </Button>
            
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-200 mx-2" />
            )}
          </div>
        )
      })}
    </div>
  )
}
