'use client'

import React from 'react'
import { Progress } from './progress'
import { Zap } from 'lucide-react'

interface TokenUsageIndicatorProps {
  used: number
  limit: number
  className?: string
}

export function TokenUsageIndicator({ used, limit, className = '' }: TokenUsageIndicatorProps) {
  const percentage = (used / limit) * 100
  const remaining = Math.max(0, limit - used)

  const getColorClass = () => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Zap className={`w-4 h-4 ${getColorClass()}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">Tokens</span>
          <span className={`font-medium ${getColorClass()}`}>
            {used.toLocaleString()}/{limit.toLocaleString()}
          </span>
        </div>
        <Progress 
          value={percentage} 
          className="h-1.5"
          indicatorClassName={getProgressColor()}
        />
      </div>
    </div>
  )
}

