'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import {
  Clock,
  Search,
  FileText,
  User,
  TrendingUp,
  DollarSign,
  Hash,
  History,
  Play,
  Lock,
  Unlock,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { PacerSearchQuery } from '@/types/pacer'

interface RecentSearch {
  id: string
  query: PacerSearchQuery
  timestamp: Date
  resultCount: number
}

interface DocketDashboardProps {
  isAuthenticated: boolean
  username: string | null
  expiresAt: Date | null
  sessionCost: number
  searchesCount: number
  casesViewedCount: number
  documentsDownloadedCount: number
  recentSearches: RecentSearch[]
  onConnect: () => void
  onQuickSearch: (query: PacerSearchQuery) => void
  onRerunSearch: (query: PacerSearchQuery) => void
}

export function DocketDashboard({
  isAuthenticated,
  username,
  expiresAt,
  sessionCost,
  searchesCount,
  casesViewedCount,
  documentsDownloadedCount,
  recentSearches,
  onConnect,
  onQuickSearch,
  onRerunSearch,
}: DocketDashboardProps) {
  const [quickSearchType, setQuickSearchType] = useState<'caseNumber' | 'party' | 'attorney'>('caseNumber')
  const [quickSearchValue, setQuickSearchValue] = useState('')

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!expiresAt || !isAuthenticated) return null

    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const timeRemaining = getTimeRemaining()

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickSearchValue.trim()) return

    const query: PacerSearchQuery = {}
    
    switch (quickSearchType) {
      case 'caseNumber':
        query.caseNumber = quickSearchValue
        break
      case 'party':
        query.partyName = quickSearchValue
        break
      case 'attorney':
        query.attorneyName = quickSearchValue
        break
    }

    onQuickSearch(query)
  }

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-xl p-8 text-white"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Docket Genie</h2>
              <p className="text-blue-100 mb-6">
                Search federal court records, view dockets, and download documents directly from PACER.
              </p>
              <Button
                onClick={onConnect}
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
              >
                <Lock className="w-5 h-5 mr-2" />
                Connect to PACER
              </Button>
            </div>
            <div className="hidden lg:block w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Search className="w-6 h-6" />}
            title="Search Cases"
            description="Find cases by number, party name, attorney, or title"
            color="blue"
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="View Dockets"
            description="Access full docket reports with all case entries"
            color="purple"
          />
          <FeatureCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Track Costs"
            description="Monitor PACER fees in real-time during your session"
            color="amber"
          />
        </div>
      </div>
    )
  }

  // Authenticated dashboard view
  return (
    <div className="space-y-6">
      {/* Session Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <Unlock className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900 mb-1">Connected to PACER</h3>
              <p className="text-sm text-green-700">Logged in as: <strong>{username}</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Time Remaining</span>
              </div>
              <div className="text-2xl font-bold font-mono text-green-900">
                {timeRemaining || 'Active'}
              </div>
            </div>
            <div className="text-center border-l border-green-300 pl-6">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Session Cost</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                ${sessionCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={<Search className="w-5 h-5" />}
          label="Searches Today"
          value={searchesCount}
          color="blue"
          delay={0.1}
        />
        <StatsCard
          icon={<FileText className="w-5 h-5" />}
          label="Cases Viewed"
          value={casesViewedCount}
          color="purple"
          delay={0.2}
        />
        <StatsCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Documents"
          value={documentsDownloadedCount}
          color="amber"
          delay={0.3}
        />
      </div>

      {/* Quick Search Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Search</h3>
        <form onSubmit={handleQuickSearch} className="space-y-4">
          {/* Search Type Selector */}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={quickSearchType === 'caseNumber' ? 'default' : 'outline'}
              onClick={() => setQuickSearchType('caseNumber')}
              className="flex-1"
            >
              <Hash className="w-4 h-4 mr-2" />
              Case Number
            </Button>
            <Button
              type="button"
              size="sm"
              variant={quickSearchType === 'party' ? 'default' : 'outline'}
              onClick={() => setQuickSearchType('party')}
              className="flex-1"
            >
              <User className="w-4 h-4 mr-2" />
              Party Name
            </Button>
            <Button
              type="button"
              size="sm"
              variant={quickSearchType === 'attorney' ? 'default' : 'outline'}
              onClick={() => setQuickSearchType('attorney')}
              className="flex-1"
            >
              <User className="w-4 h-4 mr-2" />
              Attorney
            </Button>
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={quickSearchValue}
              onChange={(e) => setQuickSearchValue(e.target.value)}
              placeholder={
                quickSearchType === 'caseNumber'
                  ? 'e.g., 1:23-cv-12345'
                  : quickSearchType === 'party'
                  ? 'Enter party name'
                  : 'Enter attorney name'
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button type="submit" disabled={!quickSearchValue.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Searches
            </h3>
          </div>
          <div className="space-y-2">
            {recentSearches.slice(0, 5).map((search, index) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {search.query.caseNumber && (
                      <span className="text-sm font-medium text-gray-900">
                        Case: {search.query.caseNumber}
                      </span>
                    )}
                    {search.query.partyName && (
                      <span className="text-sm font-medium text-gray-900">
                        Party: {search.query.partyName}
                      </span>
                    )}
                    {search.query.attorneyName && (
                      <span className="text-sm font-medium text-gray-900">
                        Attorney: {search.query.attorneyName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{new Date(search.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span>{search.resultCount} results</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRerunSearch(search.query)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Helper Components

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <div className={`border rounded-xl p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  )
}

function StatsCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  delay: number
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white border border-gray-200 rounded-xl p-4"
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

