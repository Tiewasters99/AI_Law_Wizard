'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signIn } from 'next-auth/react'
import Layout from '@/app/components/Layout'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { FeaturePreview } from './components/FeaturePreview'
import { IntegrationPreview } from './components/IntegrationPreview'
import { 
  Scale, 
  FileText, 
  Search, 
  MessageSquare, 
  Crown, 
  Wand2, 
  Shield, 
  Users, 
  Zap, 
  Lock, 
  CheckCircle, 
  Star,
  ArrowRight,
  Menu,
  X,
  Gavel,
  Briefcase,
  Globe,
  BarChart3,
  Clock,
  DollarSign,
  List,
  Grid3X3
} from 'lucide-react'
import Link from 'next/link'

interface Feature {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'core' | 'advanced' | 'premium' | 'integration'
  isFree: boolean
  isLimited: boolean
  features: string[]
  pricing?: {
    free: string
    paid: string
  }
  tooltip: string
}

const attorneyFeatures: Feature[] = [
  {
    id: 'legal-wizard',
    name: 'Legal Wizard',
    description: 'AI-powered legal consultation and document analysis',
    icon: Wand2,
    category: 'core',
    isFree: true,
    isLimited: true,
    features: [
      'Basic legal consultation',
      'Document analysis (limited)',
      'Legal research assistance',
      'Case law references'
    ],
    pricing: {
      free: '3 queries per day',
      paid: 'Unlimited access'
    },
    tooltip: 'Get instant AI-powered legal advice, document analysis, and research assistance. Perfect for quick legal questions and preliminary case analysis.'
  },
  {
    id: 'grand-wizard',
    name: 'Grand Wizard',
    description: 'Advanced AI legal analysis with comprehensive document processing',
    icon: Crown,
    category: 'premium',
    isFree: false,
    isLimited: false,
    features: [
      'Advanced document analysis',
      'Comprehensive legal research',
      'Case strategy development',
      'Legal brief generation',
      'Contract analysis and drafting',
      'Legal opinion generation'
    ],
    pricing: {
      free: 'Not available',
      paid: 'Premium subscription required'
    },
    tooltip: 'Premium AI legal analysis with advanced document processing, comprehensive research, case strategy development, and legal brief generation. Unlock unlimited access to our most powerful legal AI tools.'
  },
  {
    id: 'document-analysis',
    name: 'Document Analysis',
    description: 'AI-powered analysis of legal documents and contracts',
    icon: FileText,
    category: 'core',
    isFree: true,
    isLimited: true,
    features: [
      'Contract review',
      'Legal document analysis',
      'Risk assessment',
      'Compliance checking'
    ],
    pricing: {
      free: '2 documents per day',
      paid: 'Unlimited documents'
    },
    tooltip: 'Upload and analyze legal documents, contracts, and agreements. Get instant insights on key terms, risks, compliance issues, and recommendations for improvements.'
  },
  {
    id: 'legal-research',
    name: 'Legal Research',
    description: 'Comprehensive legal research and case law analysis',
    icon: Search,
    category: 'advanced',
    isFree: true,
    isLimited: true,
    features: [
      'Case law search',
      'Statute research',
      'Legal precedent analysis',
      'Citation tracking'
    ],
    pricing: {
      free: '5 searches per day',
      paid: 'Unlimited research'
    },
    tooltip: 'Comprehensive legal research with AI-powered case law search, statute analysis, precedent tracking, and citation management. Find relevant cases and legal authorities quickly.'
  },
  {
    id: 'chat-consultation',
    name: 'AI Chat Consultation',
    description: 'Real-time AI legal consultation and guidance',
    icon: MessageSquare,
    category: 'core',
    isFree: true,
    isLimited: true,
    features: [
      'Real-time legal advice',
      'Case strategy discussion',
      'Legal question answering',
      'Client consultation support'
    ],
    pricing: {
      free: '10 messages per day',
      paid: 'Unlimited chat'
    },
    tooltip: 'Real-time AI legal consultation for instant answers to legal questions, case strategy discussions, and client consultation support. Get expert legal guidance on-demand.'
  },
  {
    id: 'case-management',
    name: 'Case Management',
    description: 'Comprehensive case tracking and management tools',
    icon: Briefcase,
    category: 'advanced',
    isFree: false,
    isLimited: false,
    features: [
      'Case timeline tracking',
      'Document organization',
      'Client communication logs',
      'Deadline management',
      'Case status updates'
    ],
    pricing: {
      free: 'Not available',
      paid: 'Full access with subscription'
    },
    tooltip: 'Complete case management system with timeline tracking, document organization, client communication logs, deadline management, and case status updates. Streamline your legal practice workflow.'
  },
  {
    id: 'contract-drafting',
    name: 'Contract Drafting',
    description: 'AI-assisted contract creation and review',
    icon: Gavel,
    category: 'premium',
    isFree: false,
    isLimited: false,
    features: [
      'Contract templates',
      'AI-assisted drafting',
      'Risk assessment',
      'Compliance verification',
      'Negotiation support'
    ],
    pricing: {
      free: 'Not available',
      paid: 'Premium feature'
    },
    tooltip: 'AI-powered contract drafting with templates, risk assessment, compliance verification, and negotiation support. Create professional contracts with intelligent assistance and risk analysis.'
  },
  {
    id: 'legal-analytics',
    name: 'Legal Analytics',
    description: 'Data-driven insights for legal practice',
    icon: BarChart3,
    category: 'premium',
    isFree: false,
    isLimited: false,
    features: [
      'Case outcome predictions',
      'Legal trend analysis',
      'Performance metrics',
      'Client satisfaction tracking'
    ],
    pricing: {
      free: 'Not available',
      paid: 'Advanced analytics'
    },
    tooltip: 'Advanced legal analytics with case outcome predictions, trend analysis, performance metrics, and client satisfaction tracking. Make data-driven decisions for your legal practice.'
  },
  {
    id: 'integration-tools',
    name: 'Integration Tools',
    description: 'Connect with external legal databases and tools',
    icon: Globe,
    category: 'integration',
    isFree: true,
    isLimited: true,
    features: [
      'OneDrive integration',
      'Document cloud storage',
      'Calendar synchronization',
      'Email integration'
    ],
    pricing: {
      free: 'Basic integrations',
      paid: 'Full integration suite'
    },
    tooltip: 'Seamlessly integrate with OneDrive, cloud storage, calendar systems, and email platforms. Connect your existing legal tools and databases for enhanced workflow efficiency.'
  }
]

// No categories needed - direct feature access

export default function AttorneyFeaturesPage() {
  const { data: session } = useSession()
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleFeatureClick = (feature: Feature) => {
    if (!session && !feature.isFree) {
      // Show login prompt for premium features
      return
    }
    setSelectedFeature(feature)
  }

  const handleUpgrade = () => {
    if (!session) {
      signIn()
    } else {
      // Redirect to tokens page
      window.location.href = '/tokens'
    }
  }

  return (
    <Layout>
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
        <div className="flex h-full">
          {/* Fixed Sidebar - All Features */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Scale className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Attorney Features</h1>
                  <p className="text-sm text-gray-600">AI-powered legal tools</p>
                </div>
              </div>
            </div>

            {/* All Features Navigation */}
            <div className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
              <nav className="space-y-2">
                {attorneyFeatures.map((feature) => {
                  const Icon = feature.icon
                  const isActive = selectedFeature?.id === feature.id
                  const isLocked = !session && !feature.isFree
                  
                  return (
                    <button
                      key={feature.id}
                      onClick={() => handleFeatureClick(feature)}
                      title={feature.tooltip}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-left group relative ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${isLocked ? 'opacity-60' : ''}`}
                    >
                      <div className={`p-1 rounded ${
                        feature.category === 'premium' ? 'bg-yellow-100' :
                        feature.category === 'advanced' ? 'bg-purple-100' :
                        feature.category === 'core' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <Icon className={`w-3 h-3 ${
                          feature.category === 'premium' ? 'text-yellow-600' :
                          feature.category === 'advanced' ? 'text-purple-600' :
                          feature.category === 'core' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate text-sm">{feature.name}</span>
                          {feature.isFree ? (
                            <Badge variant="secondary" className="text-green-600 bg-green-50 text-xs flex-shrink-0">
                              Free
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs flex-shrink-0">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">{feature.description}</p>
                      </div>
                      {isLocked && <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                      
                      {/* Custom Tooltip - Glassmorphic Design - Side Position */}
                      <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-md text-gray-800 text-xs rounded-xl px-4 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[9999] max-w-xs whitespace-normal shadow-2xl border border-white/20">
                        <div>
                          <p className="font-medium mb-1">{feature.name}</p>
                          <p className="text-gray-600 leading-relaxed">{feature.tooltip}</p>
                        </div>
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white/90"></div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>

          </div>

          {/* Main Content - Selected Feature */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full p-4">
              {selectedFeature ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Feature Header */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-3 rounded-lg ${
                        selectedFeature.category === 'premium' ? 'bg-yellow-100' :
                        selectedFeature.category === 'advanced' ? 'bg-purple-100' :
                        selectedFeature.category === 'core' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <selectedFeature.icon className={`w-8 h-8 ${
                          selectedFeature.category === 'premium' ? 'text-yellow-600' :
                          selectedFeature.category === 'advanced' ? 'text-purple-600' :
                          selectedFeature.category === 'core' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{selectedFeature.name}</h2>
                        <p className="text-lg text-gray-600">{selectedFeature.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {selectedFeature.isFree ? (
                        <Badge variant="secondary" className="text-green-600 bg-green-50">
                          Free Preview Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                          Premium Feature
                        </Badge>
                      )}
                      {selectedFeature.isLimited && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          Limited Usage
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Feature Content */}
                  <div className="max-w-4xl">
                    {selectedFeature.id === 'integration-tools' ? (
                      <IntegrationPreview onUpgrade={handleUpgrade} />
                    ) : (
                      <FeaturePreview
                        featureId={selectedFeature.id}
                        featureName={selectedFeature.name}
                        featureDescription={selectedFeature.description}
                        icon={selectedFeature.icon}
                        isFree={selectedFeature.isFree}
                        isLimited={selectedFeature.isLimited}
                        onUpgrade={handleUpgrade}
                      />
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Welcome State - Non-scrollable, modern layout */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col justify-center items-center px-4 overflow-hidden"
                >
                  {/* Hero Section */}
                  <div className="text-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <Scale className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 mb-1">
                      AI-Powered Legal Tools
                    </h1>
                    <p className="text-sm text-gray-600 max-w-xl mx-auto">
                      Select a feature from the sidebar to explore our comprehensive suite of AI-powered legal tools.
                    </p>
                  </div>

                  {/* Feature Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-w-3xl w-full mb-3">
                    {/* Free Features */}
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Free Features</h3>
                          <p className="text-xs text-gray-500">Try with limited usage</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs">
                        Experience our core legal tools with daily limits.
                      </p>
                    </div>

                    {/* Premium Tools */}
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                          <Crown className="w-3 h-3 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Premium Tools</h3>
                          <p className="text-xs text-gray-500">Advanced AI analysis</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs">
                        Unlock unlimited access to advanced AI models.
                      </p>
                    </div>

                    {/* Integrations */}
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                          <Globe className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Integrations</h3>
                          <p className="text-xs text-gray-500">Connect & collaborate</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs">
                        Seamlessly connect with OneDrive and cloud storage.
                      </p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  {!session && (
                    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-lg p-3 max-w-lg w-full border border-blue-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Crown className="w-4 h-4 text-yellow-600 mr-1" />
                          <h3 className="text-sm font-bold text-gray-900">Unlock Full Access</h3>
                        </div>
                        <p className="text-gray-600 mb-2 text-xs">
                          Sign in to access all premium features and unlimited usage.
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            size="sm" 
                            onClick={() => signIn()}
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg text-xs px-3 py-1"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Sign In
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = '/tokens'}
                            className="border-blue-200 hover:bg-blue-50 text-xs px-3 py-1"
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Pricing
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Start Hint */}
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 mr-1" />
                      Choose a feature from the sidebar to get started
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
