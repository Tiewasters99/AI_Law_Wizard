'use client';

import React from 'react';
import { FeaturePreviewProps } from '../types/landing.types';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Features: React.FC<FeaturePreviewProps> = ({ title, tabs, caption }) => {

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Expertise Levels
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            {title}
          </h2>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
            {caption}
          </p>
        </div>
        
        {/* Enhanced Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full translate-y-8 -translate-x-8"></div>
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">
                      {tab.name === 'Apprentice' && '🎓'}
                      {tab.name === 'Wizard' && '🧙‍♂️'}
                      {tab.name === 'Grand Wizard' && '👑'}
                      {tab.name === 'Miniverse™' && '🌍'}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                    {tab.name}
                  </h3>
                  
                  {/* Description */}
                  {tab.description && (
                    <p className="text-gray-600 mb-6 drop-shadow-sm" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>
                      {tab.description}
                    </p>
                  )}
                  
                  {/* Action Indicator */}
                  <div className="flex items-center justify-center text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    <span className="text-sm font-medium mr-2">Explore</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>
                
                {/* Hover Effect Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Enhanced Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-600 text-lg drop-shadow-sm" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>
            Choose your expertise level to get started with AI-powered legal assistance
          </p>
        </div>
      </div>
    </section>
  );
};