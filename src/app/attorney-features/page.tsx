'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signIn } from 'next-auth/react'
import Layout from '@/app/components/Layout'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { InteractiveFeaturePanel } from './components/InteractiveFeaturePanel'
import { 
  DocumentAnalysisDemo,
  LegalResearchDemo,
  PremiumFeatureDemo
} from './components/FeatureDemos'
import { 
  Scale, 
  FileText, 
  Search, 
  Shield, 
  Users, 
  Zap, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  Gavel,
  Briefcase,
  BarChart3,
  DollarSign,
  AlertCircle
} from 'lucide-react'

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
    id: 'document-analysis',
    name: 'Advanced Document Analysis',
    description: 'Professional AI-powered document processing and analysis interface',
    icon: FileText,
    category: 'core',
    isFree: false,
    isLimited: false,
    features: [
      'Advanced document processing interface',
      'Multi-file analysis and comparison',
      'Intelligent search across documents',
      'File management with OneDrive integration',
      'Query history and analytics',
      'Real-time processing status',
      'Comprehensive legal insights',
      'Export and reporting capabilities'
    ],
    pricing: {
      free: 'Not available for guests',
      paid: 'Lawyer subscription required'
    },
    tooltip: 'Professional-grade document analysis interface exclusively for lawyers. Process multiple documents, search across files, track query history, and get comprehensive legal insights with our advanced AI-powered analysis tools.'
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
      'Case status updates',
      'Task automation',
      'Team collaboration tools'
    ],
    pricing: {
      free: 'Not available for guests',
      paid: 'Lawyer subscription required'
    },
    tooltip: 'Complete case management system with timeline tracking, document organization, client communication logs, deadline management, and case status updates. Streamline your legal practice workflow with professional tools.'
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
      'Professional contract templates',
      'AI-assisted drafting',
      'Advanced risk assessment',
      'Compliance verification',
      'Negotiation support',
      'Clause library and suggestions',
      'Version control and tracking'
    ],
    pricing: {
      free: 'Not available for guests',
      paid: 'Lawyer subscription required'
    },
    tooltip: 'AI-powered contract drafting exclusively for lawyers. Access professional templates, get intelligent drafting assistance, perform risk assessments, verify compliance, and receive negotiation support to create superior contracts.'
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
      'Client satisfaction tracking',
      'Practice area insights',
      'Financial analytics',
      'Competitive intelligence'
    ],
    pricing: {
      free: 'Not available for guests',
      paid: 'Lawyer subscription required'
    },
    tooltip: 'Advanced legal analytics exclusively for lawyers. Get case outcome predictions, trend analysis, performance metrics, and client satisfaction tracking. Make data-driven decisions for your legal practice with professional analytics tools.'
  },
  {
    id: 'legal-research',
    name: 'Advanced Legal Research',
    description: 'Professional legal research and case law analysis',
    icon: Search,
    category: 'advanced',
    isFree: false,
    isLimited: false,
    features: [
      'Comprehensive case law search',
      'Advanced statute research',
      'Legal precedent analysis',
      'Citation tracking and verification',
      'Jurisdiction-specific research',
      'Research history tracking',
      'Collaborative research tools'
    ],
    pricing: {
      free: 'Not available for guests',
      paid: 'Lawyer subscription required'
    },
    tooltip: 'Professional legal research tools exclusively for lawyers. Comprehensive case law search, statute analysis, precedent tracking, and citation management. Access advanced research capabilities to find relevant cases and legal authorities quickly and efficiently.'
  }
]

// No categories needed - direct feature access

export default function AttorneyFeaturesPage() {
  const { data: session } = useSession()
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showInteractivePanel, setShowInteractivePanel] = useState(false)

  const handleFeatureClick = (feature: Feature) => {
    // Allow all users to explore features
    setSelectedFeature(feature)
  }

  const handleTryFeature = (feature: Feature) => {
    setSelectedFeature(feature)
    setShowInteractivePanel(true)
  }

  const getFeatureDemo = (featureId: string) => {
    switch (featureId) {
      case 'document-analysis':
        return <DocumentAnalysisDemo />
      case 'legal-research':
        return <LegalResearchDemo />
      case 'case-management':
      case 'contract-drafting':
      case 'legal-analytics':
        return <PremiumFeatureDemo featureName={selectedFeature?.name || ''} />
      default:
        return null
    }
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
                  
                  return (
                    <button
                      key={feature.id}
                      onClick={() => handleFeatureClick(feature)}
                      title={feature.tooltip}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-left group relative ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-1 rounded ${
                        feature.category === 'premium' ? 'bg-purple-100' :
                        feature.category === 'advanced' ? 'bg-blue-100' :
                        'bg-blue-100'
                      }`}>
                        <Icon className={`w-3 h-3 ${
                          feature.category === 'premium' ? 'text-purple-600' :
                          feature.category === 'advanced' ? 'text-blue-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate text-sm">{feature.name}</span>
                          {!session && (
                            <Badge variant="outline" className="text-green-600 border-green-200 text-xs flex-shrink-0">
                              Try Free
                            </Badge>
                          )}
                          {session && session.user?.role === 'LAWYER' && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs flex-shrink-0">
                              Full Access
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">{feature.description}</p>
                      </div>
                      
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
                        selectedFeature.category === 'premium' ? 'bg-purple-100' :
                        selectedFeature.category === 'advanced' ? 'bg-blue-100' :
                        'bg-blue-100'
                      }`}>
                        <selectedFeature.icon className={`w-8 h-8 ${
                          selectedFeature.category === 'premium' ? 'text-purple-600' :
                          selectedFeature.category === 'advanced' ? 'text-blue-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{selectedFeature.name}</h2>
                        <p className="text-lg text-gray-600">{selectedFeature.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {!session && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Try Free Once
                        </Badge>
                      )}
                      {session && session.user?.role === 'LAWYER' && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Unlimited Access
                        </Badge>
                      )}
                      {selectedFeature.category === 'premium' && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Feature Content */}
                  <div className="max-w-4xl">
                    <div className="space-y-6">
                        {/* Feature Details Card */}
                        <Card>
                          <CardHeader>
                            <CardTitle>About This Feature</CardTitle>
                            <CardDescription>
                              {selectedFeature.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                                <ul className="space-y-2">
                                  {selectedFeature.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start space-x-2">
                                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {selectedFeature.pricing && (
                                <div className="pt-4 border-t">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <span className="text-sm text-gray-600">Free Tier</span>
                                      <p className="font-semibold text-gray-900">{selectedFeature.pricing.free}</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <span className="text-sm text-blue-600">Premium Tier</span>
                                      <p className="font-semibold text-blue-900">{selectedFeature.pricing.paid}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Try It Button */}
                              <div className="pt-4">
                                <Button
                                  onClick={() => handleTryFeature(selectedFeature)}
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                                  size="lg"
                                >
                                  <Zap className="w-5 h-5 mr-2" />
                                  Try It Now - Interactive Demo
                                  <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    </div>
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
                      Professional Legal Tools for Lawyers
                    </h1>
                    <p className="text-sm text-gray-600 max-w-xl mx-auto">
                      Select a feature from the sidebar to explore our exclusive lawyer-only AI-powered professional tools.
                    </p>
                  </div>

                  {/* Feature Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl w-full mb-3">
                    {/* Core Tools */}
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                          <FileText className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Core Professional Tools</h3>
                          <p className="text-xs text-gray-500">Document analysis & research</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs">
                        Advanced document processing and legal research tools exclusively for lawyers.
                      </p>
                    </div>

                    {/* Practice Management */}
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                          <Briefcase className="w-3 h-3 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Practice Management</h3>
                          <p className="text-xs text-gray-500">Case & contract tools</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs">
                        Case management, contract drafting, and analytics for professional practice.
                      </p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  {!session && (
                    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-lg p-3 max-w-lg w-full border border-blue-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Shield className="w-4 h-4 text-blue-600 mr-1" />
                          <h3 className="text-sm font-bold text-gray-900">Try Free or Sign In</h3>
                        </div>
                        <p className="text-gray-600 mb-2 text-xs">
                          Try features once for free, or sign in as a lawyer for unlimited access.
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            size="sm" 
                            onClick={() => signIn()}
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg text-xs px-3 py-1"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Sign In to Continue
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = '/tokens'}
                            className="border-blue-200 hover:bg-blue-50 text-xs px-3 py-1"
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            View Pricing
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {session && session.user?.role !== 'LAWYER' && (
                    <div className="bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 rounded-lg p-3 max-w-lg w-full border border-orange-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <AlertCircle className="w-4 h-4 text-orange-600 mr-1" />
                          <h3 className="text-sm font-bold text-gray-900">Lawyer Account Required</h3>
                        </div>
                        <p className="text-gray-600 mb-2 text-xs">
                          These features are exclusively available to lawyers. Please contact support to upgrade your account.
                        </p>
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

      {/* Interactive Feature Panel */}
      {selectedFeature && (
        <InteractiveFeaturePanel
          isOpen={showInteractivePanel}
          onClose={() => setShowInteractivePanel(false)}
          featureId={selectedFeature.id}
          featureName={selectedFeature.name}
          featureDescription={selectedFeature.description}
          icon={selectedFeature.icon}
          isFree={selectedFeature.isFree}
          isLimited={selectedFeature.isLimited}
          onUpgrade={handleUpgrade}
        >
          {getFeatureDemo(selectedFeature.id)}
        </InteractiveFeaturePanel>
      )}
    </Layout>
  )
}
