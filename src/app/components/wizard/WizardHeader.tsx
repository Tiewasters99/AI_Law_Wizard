'use client'

import { Brain } from 'lucide-react'

export const WizardHeader = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          AI Document Wizard
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your documents into actionable insights with AI analysis
        </p>
      </div>
    </div>
  )
}
