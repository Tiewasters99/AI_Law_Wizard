'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeroProps } from '../types/landing.types';
import { Sparkles } from 'lucide-react';

export const Hero: React.FC<HeroProps> = ({ headline, subtext }) => {
  return (
    <section 
      data-section="hero"
      className="text-center py-8 sm:py-12 lg:py-20 relative overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-cyan-50/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Badge with Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.1,
            type: "spring",
            stiffness: 100
          }}
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

        {/* Enhanced Main Headline with Staggered Animation */}
        <motion.h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          style={{ color: '#0f172a', fontWeight: '800' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {headline}
        </motion.h1>

        {/* Enhanced Subtext with Animation */}
        <motion.p 
          className="text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed mb-12"
          style={{ color: '#475569' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {subtext}
        </motion.p>

        {/* Floating Action Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.div
            animate={{ 
              y: [0, 10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-1 h-12 bg-gradient-to-b from-blue-500 to-transparent rounded-full mx-auto opacity-50"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};