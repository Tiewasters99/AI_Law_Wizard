'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle, Lock, FileCheck, Users, Clock, Sparkles, Award } from 'lucide-react'
import { colors } from '@/app/lib/designSystem'

export function TrustSection() {
  const securityFeatures = [
    { 
      icon: Shield, 
      label: 'Data Protection', 
      description: 'Bank-level AES-256 encryption for all your legal documents and communications'
    },
    { 
      icon: Lock, 
      label: 'Privacy First', 
      description: 'GDPR compliant with strict privacy controls and data ownership guarantees'
    },
    { 
      icon: CheckCircle, 
      label: 'Secure Infrastructure', 
      description: 'SOC 2 Type II certified infrastructure with regular security audits'
    },
    { 
      icon: FileCheck, 
      label: 'Document Security', 
      description: 'End-to-end encryption for document storage and processing'
    },
    { 
      icon: Users, 
      label: 'Access Control', 
      description: 'Role-based permissions and multi-factor authentication support'
    },
    { 
      icon: Clock, 
      label: 'Audit Trails', 
      description: 'Complete activity logs and compliance reporting for all operations'
    }
  ]

  const platformHighlights = [
    {
      icon: Sparkles,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI models trained on legal knowledge for accurate analysis and insights',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Attorney Network',
      description: 'Connect with qualified legal professionals through our integrated directory',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Award,
      title: 'Professional Grade',
      description: 'Built for both attorneys and clients with enterprise-level features',
      color: 'from-green-500 to-green-600'
    }
  ]

  return (
    <section 
      data-section="trust"
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: colors.text }}>
            Built for Security & Trust
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.secondary[600] }}>
            Enterprise-grade security and compliance features designed specifically for legal professionals and their clients.
          </p>
        </motion.div>

        {/* Platform Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {platformHighlights.map((highlight, index) => {
            const Icon = highlight.icon
            return (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl backdrop-blur-md hover:shadow-xl transition-all group"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${colors.secondary[200]}`,
                }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 bg-gradient-to-r ${highlight.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
                  {highlight.title}
                </h3>
                <p className="leading-relaxed" style={{ color: colors.secondary[600] }}>
                  {highlight.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Security Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="p-8 lg:p-12 rounded-2xl backdrop-blur-lg"
          style={{
            backgroundColor: 'rgba(239, 246, 255, 0.7)',
            border: `1px solid ${colors.primary[200]}`,
          }}
        >
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: colors.text }}>
            Enterprise-Grade Security & Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center"
                >
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
                    style={{ backgroundColor: colors.primary[100] }}
                  >
                    <Icon className="w-8 h-8" style={{ color: colors.primary[700] }} />
                  </div>
                  <div className="font-bold text-lg mb-2" style={{ color: colors.text }}>
                    {feature.label}
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: colors.secondary[600] }}>
                    {feature.description}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

