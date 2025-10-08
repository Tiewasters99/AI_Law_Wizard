'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// Header removed - using Layout header instead
import { Hero } from './sections/Hero';
import { RoleSelection } from './sections/RoleSelection';
import { Features } from './sections/Features';
import { FeatureComparison } from './sections/FeatureComparison';
import { Footer } from './sections/Footer';
import { LandingPageProps } from './types/landing.types';
import { 
  FileText, 
  MessageSquare, 
  Search, 
  Brain, 
  Database, 
  Shield, 
  Zap, 
  Globe,
  Users,
  BarChart3,
  Lock,
  Sparkles,
  ArrowRight,
  Star,
  Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const router = useRouter();

  const handleRoleSelect = (role: 'client' | 'attorney') => {
    // Navigate to auth page with role parameter
    const roleParam = role === 'attorney' ? 'attorney' : 'client';
    router.push(`/auth?role=${roleParam}`);
  };

  const featureTabs = [
    { name: 'Apprentice', href: '/apprentice', description: 'Learn the basics', icon: '🎓' },
    { name: 'Wizard', href: '/wizard', description: 'Advanced tools', icon: '🧙‍♂️' },
    { name: 'Grand Wizard', href: '/grand-wizard', description: 'Expert features', icon: '👑' },
    { name: 'Miniverse™', href: '/miniverse', description: '3D experience', icon: '🌍' }
  ];

  const footerLinks = [
    { text: 'Privacy', href: '/privacy' },
    { text: 'Help', href: '/help' }
  ];

  const journeySteps = [
    {
      step: 1,
      title: "Ask Your Legal Question",
      description: "Simply describe your legal situation or question to our AI Law Wizard. Our intelligent system understands complex legal scenarios and provides instant guidance.",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: 2,
      title: "AI Analysis & Processing",
      description: "Our advanced AI analyzes your query using cutting-edge legal knowledge, document processing, and case law databases to provide comprehensive insights.",
      icon: Brain,
      color: "from-purple-500 to-pink-500"
    },
    {
      step: 3,
      title: "Get Instant Guidance",
      description: "Receive detailed legal analysis, key points, recommendations, and next steps tailored to your specific situation - all powered by AI precision.",
      icon: Star,
      color: "from-green-500 to-emerald-500"
    },
    {
      step: 4,
      title: "Connect with Experts",
      description: "When needed, connect with qualified legal professionals in our network who specialize in your area of law for personalized consultation.",
      icon: Users,
      color: "from-orange-500 to-red-500"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Legal Analysis",
      description: "Get instant legal guidance with our advanced AI that understands complex legal scenarios and provides comprehensive analysis.",
      capabilities: ["Legal Document Analysis", "Contract Review", "Case Law Research", "Risk Assessment"]
    },
    {
      icon: FileText,
      title: "Document Processing & Management",
      description: "Upload and process legal documents with intelligent text extraction, analysis, and organization for easy access.",
      capabilities: ["PDF & Word Processing", "Text Extraction", "Document Organization", "Smart Search"]
    },
    {
      icon: MessageSquare,
      title: "Intelligent Legal Assistant",
      description: "Chat with our AI Law Wizard across multiple expertise levels - from Apprentice to Grand Wizard - for all your legal needs.",
      capabilities: ["Real-time Legal Chat", "Case Guidance", "Legal Q&A", "Expert Consultation"]
    },
    {
      icon: Search,
      title: "Advanced Legal Search",
      description: "Find relevant legal information across your documents and our knowledge base with semantic search capabilities.",
      capabilities: ["Vector-based Search", "Semantic Analysis", "Document Retrieval", "Case Matching"]
    },
    {
      icon: Database,
      title: "Legal Knowledge Base",
      description: "Organize and manage your legal knowledge with intelligent categorization and easy access to case histories.",
      capabilities: ["Case Management", "Document Organization", "Legal Database", "Knowledge Sharing"]
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with full compliance features designed specifically for legal professionals and sensitive data.",
      capabilities: ["Data Encryption", "Access Control", "Audit Trails", "Compliance Reporting"]
    },
    {
      icon: Globe,
      title: "3D Miniverse™ Experience",
      description: "Step into our immersive 3D law office environment for interactive legal consultation and virtual meetings.",
      capabilities: ["3D Virtual Office", "Interactive Consultation", "Virtual Meetings", "Immersive Experience"]
    },
    {
      icon: BarChart3,
      title: "Legal Practice Analytics",
      description: "Track your legal practice performance with comprehensive analytics and insights on case outcomes and efficiency.",
      capabilities: ["Performance Metrics", "Case Analytics", "Time Tracking", "Success Rates"]
    }
  ];

  const stats = [
    { label: "Documents Processed", value: "10K+", icon: FileText },
    { label: "Legal Questions Answered", value: "50K+", icon: MessageSquare },
    { label: "Happy Clients", value: "5K+", icon: Users },
    { label: "Success Rate", value: "98%", icon: Award }
  ];

  return (
    <div className="relative overflow-hidden">
      
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        <main>
          {/* Use the enhanced Hero component with 3D background */}
          <Hero 
            headline="The Future Awaits"
            subtext="Get instant legal guidance, manage and manipulate your documents with AI agents, generate and read custom blogs, create your own legal Miniverse™ — tomorrow today!"
            stats={stats}
          />
          
          {/* Role Selection Section - 2nd */}
          <div data-section="roles">
            <RoleSelection onRoleSelect={handleRoleSelect} />
          </div>
          
          {/* Legal Journey Section - 3rd */}
          <motion.section 
            data-section="journey"
            className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  How AI Law Wizard Works
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                  Experience the future of legal assistance through our intelligent, step-by-step process designed for both lawyers and clients.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {journeySteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className="relative group"
                    >
                      {/* Card */}
                      <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full relative overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className={`absolute top-0 ${index % 2 === 0 ? 'right-0' : 'left-0'} w-16 h-16 bg-gradient-to-br ${step.color} opacity-10 rounded-full -translate-y-8 ${index % 2 === 0 ? 'translate-x-8' : '-translate-x-8'}`}></div>
                        
                        {/* Icon */}
                        <div className="relative z-10 text-center mb-6">
                          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                          <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                          <p className="text-gray-600 text-sm lg:text-base leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                      
                      {/* Connector Line */}
                      {index < journeySteps.length - 1 && (
                        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transform -translate-y-1/2 z-20" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
          
          {/* Comprehensive Features Section */}
          <motion.section 
            data-section="features"
            className="py-20 bg-white/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Powerful Features
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  AI-Powered Legal Tools
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                  Discover the comprehensive suite of AI-powered tools designed to revolutionize how lawyers and clients work together.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>{feature.title}</h3>
                      <p className="text-gray-700 mb-6 drop-shadow-sm" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>{feature.description}</p>
                      
                      <div className="space-y-2">
                        {feature.capabilities.map((capability, capIndex) => (
                                <motion.div 
                                  key={capIndex} 
                                  className="flex items-center text-sm text-gray-600"
                                  initial={{ opacity: 0, x: -10 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.4, delay: capIndex * 0.1 }}
                                  viewport={{ once: true }}
                                >
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
                                  {capability}
                                </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
          
          {/* Feature Comparison Section */}
          <div data-section="comparison">
            <FeatureComparison />
          </div>
          
          {/* Features Section */}
          <div data-section="experience">
            <Features 
              title="Choose Your AI Expertise Level"
              tabs={featureTabs}
              caption="Explore each expertise level when you log in and discover your perfect AI legal assistant journey."
            />
          </div>
        </main>
        
        <Footer links={footerLinks} />
      </div>
    </div>
  );
};
