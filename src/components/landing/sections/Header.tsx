'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeaderProps } from '../types/landing.types';

export const Header: React.FC<HeaderProps> = ({ onSignInClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
      {/* Glassmorphic Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Brand */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3 hover:opacity-90 transition-all duration-300 group cursor-pointer">
              <div className="relative w-8 h-8 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block drop-shadow-sm">
                AI Law Wizard
              </span>
            </div>
          </motion.div>

          {/* Right side - Sign In Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={onSignInClick}
              className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
