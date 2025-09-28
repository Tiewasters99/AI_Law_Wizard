'use client'

import React, { useState } from 'react'
import { QueryHistoryList } from './QueryHistoryList'
import { QueryAnalyticsDashboard } from './QueryAnalyticsDashboard'
import { QueryDetailsModal } from './QueryDetailsModal'
import { DocumentQuery } from '../../hooks/useQueryHistory'
import { useRouter } from 'next/navigation'
import { 
  ChartBarIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export const QueryHistoryDashboard: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard')
  const [selectedQuery, setSelectedQuery] = useState<DocumentQuery | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleQuerySelect = (query: DocumentQuery) => {
    setSelectedQuery(query)
    setIsModalOpen(true)
  }

  const tabs = [
    {
      id: 'dashboard' as const,
      name: 'Dashboard',
      icon: Squares2X2Icon,
      description: 'Recent queries and statistics'
    },
    {
      id: 'history' as const,
      name: 'Full History',
      icon: ListBulletIcon,
      description: 'Complete query history with search and filters'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/wizard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Back to Wizard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Query History</h1>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Home</span>
            </button>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-600">
              Review your document processing queries and responses
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {activeTab === 'dashboard' && (
          <QueryAnalyticsDashboard 
            onViewAllHistory={() => setActiveTab('history')}
          />
        )}
        
        {activeTab === 'history' && (
            <QueryHistoryList
            onSelectQuery={handleQuerySelect}
            showStats={false}
          />
        )}
      </div>
      </div>

      {/* Query Detail Modal */}
        <QueryDetailsModal
        query={selectedQuery}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedQuery(null)
        }}
      />
    </div>
  )
}
