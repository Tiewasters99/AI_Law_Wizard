'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RoleCardsProps } from '../types/landing.types';
import { Users, Shield, ArrowRight, Sparkles } from 'lucide-react';

export const RoleSelection: React.FC<RoleCardsProps> = ({ onRoleSelect }) => {
  const roleCards = [
    {
      emoji: '👤',
      title: 'Client',
      subtitle: 'For Individuals Seeking Legal Guidance',
      features: [
        'Ask legal questions with AI assistance',
        'Explore AI-powered guidance tools',
        'Access the immersive Miniverse experience',
        'Get personalized legal recommendations'
      ],
      buttonText: 'Start as Client',
      buttonColor: 'blue' as const,
      role: 'client' as const,
      gradient: 'from-blue-500 to-cyan-500',
      icon: Users,
      description: 'Perfect for individuals who need legal guidance and want to explore AI-powered legal assistance.'
    },
    {
      emoji: '⚖️',
      title: 'Attorney',
      subtitle: 'For Legal Professionals & Firms',
      features: [
        'Manage client cases efficiently',
        'Access advanced AI legal tools',
        'Provide expert legal consultation',
        'Utilize comprehensive analytics'
      ],
      buttonText: 'Start as Attorney',
      buttonColor: 'green' as const,
      role: 'attorney' as const,
      gradient: 'from-green-500 to-emerald-500',
      icon: Shield,
      description: 'Designed for legal professionals who want to enhance their practice with cutting-edge AI technology.'
    }
  ];

  return (
    <motion.section 
      className="py-20 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Enhanced Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 via-purple-100/30 to-pink-100/30"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-400/10 to-pink-400/10 rounded-full translate-x-40 translate-y-40"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full -translate-x-32 -translate-y-32"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Choose Your Path
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Select Your Role to Get Started
          </h2>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
            Whether you&apos;re seeking legal guidance or providing professional services, 
            we have the perfect AI-powered solution for your needs.
          </p>
        </motion.div>

        {/* Enhanced Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {roleCards.map((roleCard, index) => {
            const Icon = roleCard.icon;
            return (
              <motion.div
                key={roleCard.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${roleCard.gradient} rounded-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Main Card */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-100 overflow-hidden">
                  {/* Decorative Elements */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${roleCard.gradient} rounded-full -translate-y-16 translate-x-16 opacity-10`} />
                  <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${roleCard.gradient} rounded-full translate-y-12 -translate-x-12 opacity-10`} />
                  
                  {/* Header */}
                  <div className="relative z-10 text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg mb-6">
                      <span className="text-4xl">{roleCard.emoji}</span>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{roleCard.title}</h3>
                    <p className="text-lg text-gray-600 mb-4">{roleCard.subtitle}</p>
                    
                    <div className="flex items-center justify-center text-gray-500 mb-6">
                      <Icon className="w-5 h-5 mr-2" />
                      <span className="text-sm">{roleCard.description}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="relative z-10 mb-8">
                    <div className="space-y-4">
                      {roleCard.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-center text-gray-700"
                        >
                          <div className={`w-2 h-2 bg-gradient-to-r ${roleCard.gradient} rounded-full mr-4 flex-shrink-0`} />
                          <span className="text-base">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Action Button */}
                  <motion.button
                    onClick={() => onRoleSelect(roleCard.role)}
                    className={`relative w-full bg-gradient-to-r ${roleCard.gradient} text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 overflow-hidden`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    {/* Ripple Effect Background */}
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-2xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Button Content */}
                    <span className="relative flex items-center justify-center z-10">
                      {roleCard.buttonText}
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </span>
                    
                    {/* Shimmer Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-500 text-lg">
            Not sure which role to choose? 
            <span className="text-indigo-600 font-medium ml-1">Both roles can be switched anytime after registration.</span>
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
