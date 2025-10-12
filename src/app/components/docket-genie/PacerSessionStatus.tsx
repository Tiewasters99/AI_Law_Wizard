'use client'

import { useEffect, useState } from 'react'
import { Clock, DollarSign, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

interface PacerSessionStatusProps {
  expiresAt: Date | null
  isAuthenticated: boolean
  onReconnect: () => void
}

export function PacerSessionStatus({
  expiresAt,
  isAuthenticated,
  onReconnect,
}: PacerSessionStatusProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!expiresAt || !isAuthenticated) {
      setTimeRemaining('')
      return
    }

    const updateTimer = () => {
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()

      if (diff <= 0) {
        setIsExpired(true)
        setTimeRemaining('Expired')
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      setIsExpired(false)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`sticky top-4 z-10 rounded-lg border p-4 ${
        isExpired
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* Active Indicator */}
          <div className="flex items-center gap-2">
            <div className={`relative flex h-3 w-3`}>
              {!isExpired && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isExpired ? 'bg-red-500' : 'bg-green-500'
                }`}
              />
            </div>
            <span className={`text-sm font-medium ${
              isExpired ? 'text-red-700' : 'text-gray-900'
            }`}>
              {isExpired ? 'Session Expired' : 'PACER Session Active'}
            </span>
          </div>

          {/* Time Remaining */}
          {timeRemaining && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {isExpired ? 'Expired' : `${timeRemaining} remaining`}
              </span>
            </div>
          )}
        </div>

        {/* Reconnect Button */}
        {isExpired && (
          <button
            onClick={onReconnect}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Reconnect
          </button>
        )}
      </div>
    </motion.div>
  )
}

