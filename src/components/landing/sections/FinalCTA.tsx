'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight, Users, Sparkles } from 'lucide-react'
import { colors } from '@/app/lib/designSystem'
import { Button } from '@/app/components/ui/button'

export function FinalCTA() {
  const router = useRouter()

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 -translate-y-48 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48 blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your Legal Experience?
          </h2>

          {/* Subtext */}
          <p className="text-xl mb-10 text-white/90 max-w-3xl mx-auto">
            Join thousands of clients and attorneys who are already using AI Law Wizard to streamline their legal processes and get instant guidance.
          </p>

          {/* Role Selection Mini Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-2xl backdrop-blur-lg cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
              onClick={() => router.push('/auth?role=client')}
            >
              <Users className="w-10 h-10 mx-auto mb-4 text-white" />
              <h3 className="text-xl font-bold mb-2">I Need Legal Help</h3>
              <p className="text-sm text-white/80 mb-4">
                Connect with attorneys and get AI-powered legal guidance
              </p>
              <div className="flex items-center justify-center text-sm font-medium">
                Start as Client
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-2xl backdrop-blur-lg cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
              onClick={() => router.push('/auth?role=attorney')}
            >
              <Image 
                src="/logo_icon.png" 
                alt="AI Wizard Logo" 
                width={40} 
                height={40}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-bold mb-2">I'm a Legal Professional</h3>
              <p className="text-sm text-white/80 mb-4">
                Access advanced AI tools and manage your legal practice
              </p>
              <div className="flex items-center justify-center text-sm font-medium">
                Start as Attorney
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </motion.div>
          </div>

          {/* Primary CTA */}
          <Button
            size="lg"
            onClick={() => router.push('/auth')}
            className="bg-white text-blue-700 hover:bg-gray-50 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all"
          >
            Get Started Free - No Credit Card Required
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Trust Indicators */}
          <div className="mt-8 text-sm text-white/80">
            ✨ Free trial • 🔒 Secure & private • 💯 Cancel anytime
          </div>
        </motion.div>
      </div>
    </section>
  )
}

