'use client'

import { motion } from 'framer-motion'
import Layout from '@/app/components/Layout'
import { Crown, Sparkles, Lock } from 'lucide-react'

export default function GrandWizardPage() {
  return (
    <Layout>
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-white/90 backdrop-blur-sm shadow-2xl rounded-lg mx-auto max-w-4xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Grand Wizard Icon */}
        <div className="relative mb-8">
          <div className="p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full">
            <Crown className="w-16 h-16 text-purple-600" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Grand Wizard
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
          The ultimate legal AI experience awaits. Advanced features and premium capabilities coming soon.
        </p>

        {/* Placeholder Content */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 w-full max-w-2xl border border-purple-200">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Coming Soon</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Advanced legal document analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Complex case research and strategy</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Multi-jurisdiction legal guidance</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Premium AI models and features</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Priority support and consultation</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full border border-purple-200">
          <span className="text-purple-700 font-medium">🚀 In Development</span>
        </div>
      </motion.div>
    </Layout>
  )
}
