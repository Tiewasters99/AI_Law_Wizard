'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Crown, 
  GraduationCap, 
  Check,
  X,
  Sparkles,
  WandSparkles
} from 'lucide-react';

export const FeatureComparison: React.FC = () => {
  const featureComparisonData = [
    { feature: 'AI Apprentice Chat', guest: true, client: true, lawyer: true },
    { feature: 'Blog Reading', guest: true, client: true, lawyer: true },
    { feature: 'Miniverse™ Exploration', guest: true, client: true, lawyer: true },
    { feature: 'AI Wizard Chat', guest: false, client: true, lawyer: true },
    { feature: 'Grand Wizard AI', guest: false, client: false, lawyer: true },
    { feature: 'Document Analysis', guest: false, client: false, lawyer: true },
    { feature: 'Blog Management', guest: false, client: false, lawyer: true },
    { feature: 'Token System', guest: false, client: false, lawyer: true },
    { feature: 'Integration Tools', guest: false, client: false, lawyer: true },
  ];

  const roleDetails = [
    {
      role: 'guest',
      title: 'Guest Access',
      subtitle: 'No login required',
      icon: GraduationCap,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      features: [
        'AI Legal Apprentice Chat',
        'Basic legal questions',
        'General legal guidance',
        'Legal blog reading & exploration',
        'Browse legal articles',
        'Read published blogs',
        'Basic consultation form',
        'Miniverse™ exploration & discovery'
      ]
    },
    {
      role: 'client',
      title: 'Client Role',
      subtitle: 'For individuals seeking legal help',
      icon: User,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      features: [
        'All Free Features',
        'Advanced AI Legal Wizard',
        'Legal consultation history',
        'Personalized legal guidance',
        'Case progress tracking',
        'Miniverse™ full access',
        'Priority support'
      ]
    },
    {
      role: 'lawyer',
      title: 'Lawyer Role',
      subtitle: 'For legal professionals',
      icon: Crown,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      features: [
        'All Client Features',
        'Grand Wizard AI Assistant',
        'Advanced document processing',
        'Legal research tools',
        'Case management system',
        'Client consultation tools',
        'Blog creation & management',
        'Miniverse™ advanced features',
        'Token-based pricing',
        'Integration capabilities'
      ]
    }
  ];

  return (
    <motion.section 
      data-section="feature-comparison"
      className="py-20 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-blue-400/10 to-cyan-400/10 rounded-full translate-x-40 translate-y-40"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-sm font-medium mb-6">
            <WandSparkles className="w-4 h-4 mr-2" />
            Choose Your AI Legal Assistant
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Feature Comparison
          </h2>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
            Unlock the power of AI-driven legal assistance with the perfect plan for your needs
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {roleDetails.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Background Card */}
                <div className={`relative bg-gradient-to-br ${role.bgGradient} border border-${role.color}-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden`}>
                  {/* Glassmorphic overlay */}
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-r ${role.gradient} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold text-${role.color}-800`}>{role.title}</h3>
                        <p className={`text-sm text-${role.color}-600`}>{role.subtitle}</p>
                      </div>
                    </div>
                    
                    {/* Features List */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 mb-3 text-base">Included Features:</h4>
                      <ul className="space-y-2">
                        {role.features.map((feature, featureIndex) => (
                          <motion.li 
                            key={featureIndex} 
                            className="flex items-center space-x-2 text-sm text-gray-600"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: featureIndex * 0.05 }}
                            viewport={{ once: true }}
                          >
                            <Check className={`w-3 h-3 text-${role.color}-500 flex-shrink-0`} />
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Feature Comparison</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-green-600">
                    <div className="flex flex-col items-center">
                      <GraduationCap className="w-5 h-5 mb-1" />
                      <span>Guest</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-blue-600">
                    <div className="flex flex-col items-center">
                      <User className="w-5 h-5 mb-1" />
                      <span>Client</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-purple-600">
                    <div className="flex flex-col items-center">
                      <Crown className="w-5 h-5 mb-1" />
                      <span>Lawyer</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureComparisonData.map((row, index) => (
                  <motion.tr 
                    key={index} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <td className="py-4 px-4 font-medium text-gray-700">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.guest ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.client ? (
                        <Check className="w-5 h-5 text-blue-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.lawyer ? (
                        <Check className="w-5 h-5 text-purple-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottom Note */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 text-lg">
            <span className="inline-flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
              All plans include secure data encryption and compliance features
            </span>
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

