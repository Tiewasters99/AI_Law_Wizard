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
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: '#1e293b' }}>
            {title}
          </h2>
          
          <p className="text-xl max-w-3xl mx-auto" style={{ color: '#475569' }}>
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
              <div 
                className="backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full relative"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(226, 232, 240, 0.5)',
                }}
              >
                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: 'linear-gradient(to right, #2563eb, #1e40af)',
                    }}
                  >
                    <span className="text-2xl">
                      {tab.name === 'Apprentice' && '🎓'}
                      {tab.name === 'Wizard' && '🧙‍♂️'}
                      {tab.name === 'Grand Wizard' && '👑'}
                      {tab.name === 'Miniverse™' && '🌍'}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold mb-4 transition-colors" style={{ color: '#1e293b' }}>
                    {tab.name}
                  </h3>
                  
                  {/* Description */}
                  {tab.description && (
                    <p className="mb-6" style={{ color: '#475569' }}>
                      {tab.description}
                    </p>
                  )}
                  
                  {/* Action Indicator */}
                  <div className="flex items-center justify-center transition-colors" style={{ color: '#2563eb' }}>
                    <span className="text-sm font-medium mr-2">Explore</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Enhanced Footer */}
        <div className="text-center mt-16">
          <p className="text-lg" style={{ color: '#64748b' }}>
            Choose your expertise level to get started with AI-powered legal assistance
          </p>
        </div>
      </div>
    </section>
  );
};