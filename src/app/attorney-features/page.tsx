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
import { colors, badgeTypes, practiceAreas } from '@/app/lib/designSystem'
import { 
  Scale, 
  FileText, 
  Search, 
  Shield, 
  Users, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  Gavel,
  Briefcase,
  BarChart3,
  Award,
  AlertCircle,
  Building,
  BookOpen
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
      <div className="h-screen bg-white overflow-hidden">
        <div className="flex h-full">
          {/* Fixed Sidebar - All Features */}
          <div className="w-64 bg-white border-r flex flex-col overflow-hidden shadow-sm" style={{ borderColor: colors.secondary[200] }}>
            {/* Sidebar Header */}
            <div className="p-4 border-b" style={{ borderColor: colors.secondary[200], backgroundColor: colors.primary[50] }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary[700] }}>
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold" style={{ color: colors.text }}>Professional Services</h1>
                  <p className="text-xs" style={{ color: colors.secondary[600] }}>Attorney-Grade AI Tools</p>
                </div>
              </div>
            </div>

            {/* All Features Navigation */}
            <div className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
              <nav className="space-y-1">
                {attorneyFeatures.map((feature) => {
                  const Icon = feature.icon
                  const isActive = selectedFeature?.id === feature.id
                  
                  return (
                    <button
                      key={feature.id}
                      onClick={() => handleFeatureClick(feature)}
                      title={feature.tooltip}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left group relative transition-all ${
                        isActive
                          ? 'shadow-sm'
                          : 'hover:bg-gray-50'
                      }`}
                      style={isActive ? {
                        backgroundColor: colors.primary[50],
                        borderLeft: `3px solid ${colors.primary[700]}`,
                        color: colors.primary[900]
                      } : {}}
                    >
                      <div className={`p-1.5 rounded`} style={{
                        backgroundColor: feature.category === 'premium' ? colors.accent[100] :
                          feature.category === 'advanced' ? colors.primary[100] :
                          colors.primary[100]
                      }}>
                        <span style={{
                          color: feature.category === 'premium' ? colors.accent[700] :
                            feature.category === 'advanced' ? colors.primary[700] :
                            colors.primary[700]
                        }}>
                          <Icon className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate text-sm">{feature.name}</span>
                          {session && (session.user?.role === 'ATTORNEY' || session.user?.role === 'LAWYER') && (
                            <Shield className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent[600] }} />
                          )}
                        </div>
                        <p className="text-xs truncate mt-0.5" style={{ color: colors.secondary[500] }}>{feature.description}</p>
                      </div>
                      
                      {/* Professional Tooltip */}
                      <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-white text-xs rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] max-w-xs whitespace-normal shadow-lg border" style={{ 
                        color: colors.text,
                        borderColor: colors.secondary[200]
                      }}>
                        <div>
                          <p className="font-semibold mb-1" style={{ color: colors.primary[700] }}>{feature.name}</p>
                          <p className="leading-relaxed" style={{ color: colors.secondary[600] }}>{feature.tooltip}</p>
                        </div>
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent" style={{ borderRightColor: colors.secondary[200] }}></div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Professional Footer */}
            <div className="p-4 border-t" style={{ borderColor: colors.secondary[200], backgroundColor: colors.secondary[50] }}>
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-4 h-4" style={{ color: colors.accent[600] }} />
                <span className="text-xs font-semibold" style={{ color: colors.text }}>Bar Association Certified</span>
              </div>
              <p className="text-xs" style={{ color: colors.secondary[600] }}>
                Professional-grade legal AI tools designed for licensed attorneys and law firms.
              </p>
            </div>
          </div>

          {/* Main Content - Selected Feature */}
          <div className="flex-1 overflow-hidden" style={{ backgroundColor: colors.secondary[50] }}>
            <div className="h-full p-6">
              {selectedFeature ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto"
                >
                  {/* Professional Feature Header */}
                  <div className="mb-6 pb-6 border-b" style={{ borderColor: colors.secondary[200] }}>
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="p-3 rounded-lg shadow-sm" style={{
                        backgroundColor: selectedFeature.category === 'premium' ? colors.accent[50] :
                          selectedFeature.category === 'advanced' ? colors.primary[50] :
                          colors.primary[50]
                      }}>
                        <span style={{
                          color: selectedFeature.category === 'premium' ? colors.accent[700] :
                            selectedFeature.category === 'advanced' ? colors.primary[700] :
                            colors.primary[700]
                        }}>
                          <selectedFeature.icon className="w-8 h-8" />
                        </span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>{selectedFeature.name}</h2>
                        <p className="text-base" style={{ color: colors.secondary[600] }}>{selectedFeature.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {session && (session.user?.role === 'ATTORNEY' || session.user?.role === 'LAWYER') && (
                        <Badge 
                          variant="outline" 
                          className="border-amber-200"
                          style={{ color: colors.accent[700], backgroundColor: colors.accent[50] }}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Attorney Access
                        </Badge>
                      )}
                      {selectedFeature.category === 'premium' && (
                        <Badge 
                          variant="outline"
                          style={{ color: colors.accent[700], backgroundColor: colors.accent[50], borderColor: colors.accent[200] }}
                        >
                          <Award className="w-3 h-3 mr-1" />
                          Premium Service
                        </Badge>
                      )}
                      <Badge 
                        variant="outline"
                        style={{ color: colors.primary[700], backgroundColor: colors.primary[50], borderColor: colors.primary[200] }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Bar Certified
                      </Badge>
                    </div>
                  </div>

                  {/* Feature Content */}
                  <div className="max-w-4xl">
                    <div className="space-y-6">
                        {/* Professional Feature Details Card */}
                        <Card className="shadow-sm" style={{ borderColor: colors.secondary[200] }}>
                          <CardHeader>
                            <CardTitle style={{ color: colors.text }}>Professional Capabilities</CardTitle>
                            <CardDescription style={{ color: colors.secondary[600] }}>
                              Comprehensive tools designed for legal professionals to enhance practice efficiency and client service delivery.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-5">
                              <div>
                                <h4 className="font-semibold mb-3" style={{ color: colors.text }}>Key Features & Capabilities:</h4>
                                <ul className="space-y-2.5">
                                  {selectedFeature.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 transition-colors">
                                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.success[600] }} />
                                      <span className="text-sm" style={{ color: colors.secondary[700] }}>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {selectedFeature.pricing && (
                                <div className="pt-4 border-t" style={{ borderColor: colors.secondary[200] }}>
                                  <h4 className="font-semibold mb-3" style={{ color: colors.text }}>Service Tiers:</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg border" style={{ 
                                      backgroundColor: colors.secondary[50],
                                      borderColor: colors.secondary[200]
                                    }}>
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Building className="w-4 h-4" style={{ color: colors.secondary[600] }} />
                                        <span className="text-sm font-medium" style={{ color: colors.secondary[700] }}>Standard Access</span>
                                      </div>
                                      <p className="text-sm" style={{ color: colors.secondary[600] }}>{selectedFeature.pricing.free}</p>
                                    </div>
                                    <div className="p-4 rounded-lg border" style={{ 
                                      backgroundColor: colors.primary[50],
                                      borderColor: colors.primary[200]
                                    }}>
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Award className="w-4 h-4" style={{ color: colors.primary[700] }} />
                                        <span className="text-sm font-medium" style={{ color: colors.primary[900] }}>Attorney Tier</span>
                                      </div>
                                      <p className="text-sm font-semibold" style={{ color: colors.primary[800] }}>{selectedFeature.pricing.paid}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Professional CTA */}
                              <div className="pt-4">
                                <Button
                                  onClick={() => handleTryFeature(selectedFeature)}
                                  className="w-full shadow-sm"
                                  size="lg"
                                  style={{ backgroundColor: colors.primary[700] }}
                                >
                                  <BookOpen className="w-5 h-5 mr-2" />
                                  Explore Interactive Demo
                                  <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Professional Benefits Card */}
                        <Card className="shadow-sm" style={{ borderColor: colors.secondary[200] }}>
                          <CardHeader>
                            <CardTitle style={{ color: colors.text }}>Professional Benefits</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                              {[
                                { icon: Scale, title: 'Bar Compliance', desc: 'Meets professional standards and ethical guidelines' },
                                { icon: Shield, title: 'Secure & Confidential', desc: 'Enterprise-grade security for client data' },
                                { icon: BarChart3, title: 'Practice Analytics', desc: 'Track efficiency and case outcomes' },
                                { icon: Users, title: 'Client Management', desc: 'Streamlined client communication tools' },
                              ].map((benefit, idx) => (
                                <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: colors.secondary[50] }}>
                                  <div className="p-2 rounded" style={{ backgroundColor: colors.primary[100] }}>
                                    <benefit.icon className="w-4 h-4" style={{ color: colors.primary[700] }} />
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-semibold mb-1" style={{ color: colors.text }}>{benefit.title}</h5>
                                    <p className="text-xs" style={{ color: colors.secondary[600] }}>{benefit.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Professional Welcome State */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col justify-center items-center px-8"
                >
                  {/* Professional Hero Section */}
                  <div className="text-center max-w-2xl">
                    {/* Professional Icon */}
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ backgroundColor: colors.primary[700] }}>
                      <Scale className="w-10 h-10 text-white" />
                    </div>
                    
                    {/* Professional Headline */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.text }}>
                      Professional Legal Services
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-lg mb-6" style={{ color: colors.secondary[600] }}>
                      Attorney-grade AI tools designed to enhance legal practice efficiency, client service, and professional excellence.
                    </p>

                    {/* Professional Features Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
                      {[
                        { icon: Shield, label: 'Bar Certified' },
                        { icon: Award, label: 'Professional Grade' },
                        { icon: Lock, label: 'Secure & Confidential' },
                        { icon: BarChart3, label: 'Practice Analytics' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg border text-center" style={{ 
                          backgroundColor: colors.secondary[50],
                          borderColor: colors.secondary[200]
                        }}>
                          <item.icon className="w-5 h-5 mx-auto mb-2" style={{ color: colors.primary[700] }} />
                          <span className="text-xs font-medium" style={{ color: colors.text }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Professional CTA */}
                    {!session ? (
                      <Button 
                        size="lg"
                        onClick={() => signIn()}
                        className="px-8 py-6 text-lg shadow-sm"
                        style={{ backgroundColor: colors.primary[700] }}
                      >
                        <Shield className="w-5 h-5 mr-2" />
                        Access Professional Services
                      </Button>
                    ) : session.user?.role !== 'ATTORNEY' && session.user?.role !== 'LAWYER' ? (
                      <div className="border rounded-xl p-6 max-w-md mx-auto" style={{ 
                        backgroundColor: colors.accent[50],
                        borderColor: colors.accent[200]
                      }}>
                        <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: colors.accent[700] }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Attorney Credentials Required</h3>
                        <p className="text-sm" style={{ color: colors.secondary[700] }}>
                          These professional services are exclusively available to licensed attorneys and verified legal professionals.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2" style={{ color: colors.secondary[500] }}>
                        <ArrowRight className="w-5 h-5" />
                        <p className="text-base">Select a professional service from the sidebar to begin</p>
                      </div>
                    )}
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
