'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FooterProps } from '../types/landing.types';
import { Heart, Shield, Globe, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC<FooterProps> = ({ links }) => {
  return (
    <footer className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 border-t border-gray-200 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 via-blue-50/50 to-purple-50/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-200/20 to-transparent"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-400/10 to-pink-400/10 rounded-full translate-x-12 translate-y-12"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Law Wizard
              </h3>
            </div>
            <p className="text-gray-600 mb-6 max-w-md drop-shadow-sm" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>
              Empowering legal professionals and clients with cutting-edge AI technology. 
              Experience the future of legal assistance today.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                <span>contact@ailawwizard.com</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-blue-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
              Quick Links
            </h4>
            <nav className="space-y-3">
              {links.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 flex items-center group cursor-pointer">
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </nav>
          </motion.div>
          
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
              Features
            </h4>
            <div className="space-y-3">
              {[
                'AI Legal Analysis',
                'Document Processing',
                '3D Miniverse™',
                'Expert Consultation'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center text-gray-600"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 pt-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center text-sm text-gray-600">
              <span>© 2025 AI Law Wizard. All rights reserved.</span>
              <motion.div
                className="mx-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-4 h-4 text-red-500" />
              </motion.div>
              <span>Made with passion</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                <span>Secure & Compliant</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-2 text-blue-500" />
                <span>Global Access</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
