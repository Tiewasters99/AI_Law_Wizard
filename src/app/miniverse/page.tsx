'use client'

import { motion } from 'framer-motion'
import Layout from '@/app/components/Layout'
import { EarthIcon, Box, Zap, Sparkles } from 'lucide-react'

export default function MiniversePage() {
  return (
    <Layout>
      <motion.div 
        className="min-h-[calc(100vh-200px)] bg-white/90 backdrop-blur-sm shadow-2xl rounded-lg mx-auto max-w-6xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full relative">
              <EarthIcon className="w-16 h-16 text-purple-600" />
              <div className="absolute -top-2 -right-2">
                <Box className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Miniverse™
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Step into the future of legal technology with our immersive 3D virtual world where AI and legal expertise converge in an unprecedented digital ecosystem.
          </p>
        </div>

        {/* 3D Miniverse Preview */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 border border-purple-200 mb-12">
          <div className="text-center">
            <div className="relative mb-8">
              {/* 3D Visual Representation */}
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <Box className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-bounce" />
                  <div className="text-2xl font-bold text-purple-800">3D</div>
                  <div className="text-sm text-purple-600">Miniverse</div>
                </div>
                {/* Floating Elements */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                <div className="absolute top-8 right-8 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 left-8 w-4 h-4 bg-blue-300 rounded-full animate-bounce"></div>
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-300 rounded-full animate-ping"></div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">3D Miniverse Coming Soon</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
              Experience legal technology like never before in our revolutionary 3D virtual environment. 
              Navigate through immersive legal landscapes, interact with AI assistants in 3D space, and collaborate with legal professionals in a completely new dimension.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="px-6 py-3 bg-white rounded-full border border-purple-200 text-purple-700 font-medium shadow-sm">
                🎮 3D Virtual World
              </div>
              <div className="px-6 py-3 bg-white rounded-full border border-blue-200 text-blue-700 font-medium shadow-sm">
                🤖 AI Avatars
              </div>
              <div className="px-6 py-3 bg-white rounded-full border border-purple-200 text-purple-700 font-medium shadow-sm">
                🌐 Immersive Experience
              </div>
              <div className="px-6 py-3 bg-white rounded-full border border-blue-200 text-blue-700 font-medium shadow-sm">
                ⚡ Real-time Collaboration
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Development Progress</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 2, delay: 0.5 }}
                ></motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg w-fit mb-4">
              <Box className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Legal Spaces</h3>
            <p className="text-gray-600">Navigate through virtual courtrooms, law libraries, and collaborative workspaces in stunning 3D environments.</p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg w-fit mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Avatars</h3>
            <p className="text-gray-600">Interact with intelligent AI assistants that guide you through complex legal processes in an immersive 3D experience.</p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg w-fit mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Immersive Learning</h3>
            <p className="text-gray-600">Learn legal concepts through interactive 3D simulations and hands-on virtual experiences.</p>
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Be the First to Enter the Miniverse</h3>
          <p className="text-gray-600 mb-8">Get exclusive early access when our 3D legal world launches</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium">
              Get Early Access
            </button>
          </div>
        </div>
      </motion.div>
    </Layout>
  )
}
