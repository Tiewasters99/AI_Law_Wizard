'use client'

import { motion } from 'framer-motion'
import { Shield, Award, Users, Star, CheckCircle, Lock } from 'lucide-react'
import { colors } from '@/app/lib/designSystem'

export function TrustSection() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content: 'AI Law Wizard helped me navigate complex contract negotiations with confidence. The AI analysis was spot-on, and connecting with an attorney was seamless.',
      rating: 5,
      avatar: '👩‍💼',
    },
    {
      name: 'Michael Chen',
      role: 'Corporate Attorney',
      content: 'As a practicing attorney, this platform has revolutionized my document review process. The AI-powered analysis saves me hours every week.',
      rating: 5,
      avatar: '👨‍⚖️',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Startup Founder',
      content: 'From basic legal questions to complex compliance issues, AI Law Wizard has been my go-to resource. The 24/7 AI assistant is invaluable.',
      rating: 5,
      avatar: '👩‍💻',
    },
  ]

  const securityBadges = [
    { icon: Shield, label: 'Bank-Level Encryption', description: 'AES-256 encryption' },
    { icon: Lock, label: 'GDPR Compliant', description: 'Privacy protected' },
    { icon: CheckCircle, label: 'SOC 2 Certified', description: 'Security audited' },
    { icon: Award, label: 'Bar Certified', description: 'Legal standards' },
  ]

  const statistics = [
    { value: '10,000+', label: 'Documents Analyzed', icon: '📄' },
    { value: '50,000+', label: 'Legal Questions Answered', icon: '💬' },
    { value: '5,000+', label: 'Satisfied Clients', icon: '👥' },
    { value: '98%', label: 'Success Rate', icon: '⭐' },
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
            Trusted by Thousands of Legal Professionals
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.secondary[600] }}>
            Join the community of attorneys and clients who trust AI Law Wizard for their legal needs.
          </p>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {statistics.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-2xl backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: `1px solid ${colors.secondary[200]}`,
              }}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold mb-2" style={{ color: colors.primary[700] }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: colors.secondary[600] }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl backdrop-blur-md hover:shadow-xl transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${colors.secondary[200]}`,
              }}
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="text-3xl mr-3">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold" style={{ color: colors.text }}>
                    {testimonial.name}
                  </div>
                  <div className="text-sm" style={{ color: colors.secondary[600] }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl backdrop-blur-lg"
          style={{
            backgroundColor: 'rgba(239, 246, 255, 0.7)',
            border: `1px solid ${colors.primary[200]}`,
          }}
        >
          <h3 className="text-2xl font-bold text-center mb-8" style={{ color: colors.text }}>
            Enterprise-Grade Security & Compliance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {securityBadges.map((badge, index) => {
              const Icon = badge.icon
              return (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-3"
                    style={{ backgroundColor: colors.primary[100] }}
                  >
                    <Icon className="w-8 h-8" style={{ color: colors.primary[700] }} />
                  </div>
                  <div className="font-semibold text-sm mb-1" style={{ color: colors.text }}>
                    {badge.label}
                  </div>
                  <div className="text-xs" style={{ color: colors.secondary[600] }}>
                    {badge.description}
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

