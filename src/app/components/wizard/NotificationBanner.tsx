'use client'

import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface NotificationBannerProps {
  type: 'success' | 'error'
  title: string
  message: string
  onClose: () => void
}

export const NotificationBanner = ({ type, title, message, onClose }: NotificationBannerProps) => {
  const isSuccess = type === 'success'
  
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
      <Card className={`border-2 ${isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
              {isSuccess ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-lg ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>
                {title}
              </h4>
              <p className={`text-base ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                {message}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className={`flex-shrink-0 ${isSuccess ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'}`}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
