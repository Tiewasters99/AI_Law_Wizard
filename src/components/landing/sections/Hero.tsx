'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeroProps } from '../types/landing.types';
import { Sparkles, ArrowDown } from 'lucide-react';

export const Hero: React.FC<HeroProps> = ({ headline, subtext, stats }) => {
  return (
    <motion.section 
      data-section="hero"
      className="text-center py-8 sm:py-12 lg:py-16 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-cyan-50/80"></div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-8 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
          </motion.div>
          Next-Generation Legal AI Platform
        </motion.div>

        {/* Enhanced Main Headline */}
        <motion.h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 bg-clip-text text-transparent">
            {headline}
          </span>
        </motion.h1>

        {/* Enhanced Subtext */}
        <motion.p 
          className="text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ color: '#475569' }}
        >
          {subtext}
        </motion.p>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat: any, index: number) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="backdrop-blur-md p-6 rounded-2xl transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                  }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1" style={{ color: '#1e40af' }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: '#475569' }}>{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Enhanced Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col items-center text-gray-400 group cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          <motion.span 
            className="text-sm mb-2 group-hover:text-gray-600 transition-colors duration-300"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Scroll to explore
          </motion.span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="group-hover:text-gray-600 transition-colors duration-300"
          >
            <ArrowDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};