'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Check, Zap, Crown, Users, ArrowRight } from 'lucide-react'
import { colors } from '@/app/lib/designSystem'
import { Button } from '@/app/components/ui/button'

export function PricingSection() {
  const router = useRouter()

  const pricingPlans = [
    {
      name: 'Free Tier',
      description: 'Get started with basic AI assistance',
      price: '$0',
      period: 'forever',
      icon: Users,
      features: [
        'Basic AI legal assistant',
        '5 free queries per month',
        'Community access',
        'Legal blog resources',
        'Email support',
      ],
      cta: 'Start Free',
      popular: false,
      gradient: 'from-gray-500 to-gray-600',
    },
    {
      name: 'Token Packages',
      description: 'Pay as you go with flexible credits',
      price: 'From $10',
      period: 'one-time',
      icon: Zap,
      features: [
        'Advanced AI analysis',
        'Document processing',
        'Priority support',
        'No expiration',
        'Volume discounts',
      ],
      cta: 'View Packages',
      popular: true,
      gradient: 'from-blue-600 to-blue-700',
    },
    {
      name: 'Attorney Plan',
      description: 'Professional tools for legal practice',
      price: 'Custom',
      period: 'per month',
      icon: Crown,
      features: [
        'Unlimited AI analysis',
        'Client management',
        'Advanced document tools',
        'Priority support',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-purple-600 to-purple-700',
    },
  ]

  return (
    <section 
      data-section="pricing"
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: 'white' }}
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
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.secondary[600] }}>
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl backdrop-blur-md transition-all hover:shadow-2xl ${
                  plan.popular ? 'scale-105 shadow-xl' : 'shadow-lg'
                }`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: plan.popular 
                    ? `2px solid ${colors.primary[500]}` 
                    : `1px solid ${colors.secondary[200]}`,
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
                    style={{ backgroundColor: colors.primary[600] }}
                  >
                    MOST POPULAR
                  </div>
                )}

                {/* Icon */}
                <div 
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 bg-gradient-to-r ${plan.gradient}`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Plan Details */}
                <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                  {plan.name}
                </h3>
                <p className="text-sm mb-6" style={{ color: colors.secondary[600] }}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: colors.text }}>
                    {plan.price}
                  </span>
                  <span className="text-sm ml-2" style={{ color: colors.secondary[600] }}>
                    {plan.period}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 flex-shrink-0 mr-3 mt-0.5" style={{ color: colors.success[600] }} />
                      <span className="text-sm" style={{ color: colors.text }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full ${
                    plan.popular 
                      ? `bg-gradient-to-r ${plan.gradient} text-white shadow-md hover:shadow-lg` 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => router.push('/auth')}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm" style={{ color: colors.secondary[600] }}>
            💳 No credit card required for free tier • ✨ Tokens never expire • 🔒 Secure payments
          </p>
        </motion.div>
      </div>
    </section>
  )
}

