'use client'

import { Button } from '@/app/components/ui/button'
import { 
  User, 
  Crown, 
  GraduationCap, 
  WandSparkles, 
  X,
  Check
} from 'lucide-react'

interface PremiumFeaturesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PremiumFeaturesModal({ isOpen, onClose }: PremiumFeaturesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Proper Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Clean Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <WandSparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Choose Your AI Legal Assistant
                </h2>
                <p className="text-gray-600 mt-1">Unlock the power of AI-driven legal assistance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Free Features Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">Free Features</h3>
                  <p className="text-sm text-green-600">No login required - start exploring today!</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 text-base">Basic Legal Assistance</h4>
                  <ul className="space-y-1">
                    {[
                      'AI Legal Apprentice Chat',
                      'Basic legal questions',
                      'General legal guidance',
                      'Legal blog reading & exploration'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-green-600">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 text-base">Public Access</h4>
                  <ul className="space-y-1">
                    {[
                      'Browse legal articles',
                      'Read published blogs',
                      'Basic consultation form',
                      'Miniverse™ exploration & discovery'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-green-600">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Role */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group flex flex-col">
                {/* Glassmorphic overlay */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-800">Client Role</h3>
                      <p className="text-sm text-blue-600">For individuals seeking legal help</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-3 text-base">Included Features:</h4>
                      <ul className="space-y-2">
                        {[
                          'All Free Features',
                          'Advanced AI Legal Wizard',
                          'Legal consultation history',
                          'Personalized legal guidance',
                          'Case progress tracking',
                          'Miniverse™ full access',
                          'Priority support'
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <Check className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-blue-200/50 mt-auto">
                      <Button 
                        onClick={() => {
                          onClose()
                          window.location.href = '/auth?role=client'
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                      >
                        Continue as Client
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lawyer Role */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group flex flex-col">
                {/* Glassmorphic overlay */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-800">Lawyer Role</h3>
                      <p className="text-sm text-purple-600">For legal professionals</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-3 text-base">Premium Features:</h4>
                      <ul className="space-y-2">
                        {[
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
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <Check className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-purple-200/50 mt-auto">
                      <Button 
                        onClick={() => {
                          onClose()
                          window.location.href = '/auth?role=attorney'
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                      >
                        Continue as Lawyer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Feature Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200/50">
                      <th className="text-left py-3 font-semibold text-gray-700">Feature</th>
                      <th className="text-center py-3 font-semibold text-green-600">Guest</th>
                      <th className="text-center py-3 font-semibold text-blue-600">Client</th>
                      <th className="text-center py-3 font-semibold text-purple-600">Lawyer</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {[
                      { feature: 'AI Apprentice Chat', guest: '✓', client: '✓', lawyer: '✓' },
                      { feature: 'Blog Reading', guest: '✓', client: '✓', lawyer: '✓' },
                      { feature: 'Miniverse™ Exploration', guest: '✓', client: '✓', lawyer: '✓' },
                      { feature: 'AI Wizard Chat', guest: '✗', client: '✓', lawyer: '✓' },
                      { feature: 'Grand Wizard AI', guest: '✗', client: '✗', lawyer: '✓' },
                      { feature: 'Document Analysis', guest: '✗', client: '✗', lawyer: '✓' },
                      { feature: 'Blog Management', guest: '✗', client: '✗', lawyer: '✓' },
                      { feature: 'Token System', guest: '✗', client: '✗', lawyer: '✓' },
                      { feature: 'Integration Tools', guest: '✗', client: '✗', lawyer: '✓' },
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-gray-200/30 hover:bg-white/20 transition-colors">
                        <td className="py-3 font-medium text-gray-700">{row.feature}</td>
                        <td className="text-center py-3">
                          <span className={row.guest === '✓' ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                            {row.guest}
                          </span>
                        </td>
                        <td className="text-center py-3">
                          <span className={row.client === '✓' ? 'text-blue-600 font-semibold' : 'text-gray-400'}>
                            {row.client}
                          </span>
                        </td>
                        <td className="text-center py-3">
                          <span className={row.lawyer === '✓' ? 'text-purple-600 font-semibold' : 'text-gray-400'}>
                            {row.lawyer}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}