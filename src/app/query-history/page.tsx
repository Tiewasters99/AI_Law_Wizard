'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'

const QueryHistoryPage = dynamic(
  () => import('../components/document-processing/QueryHistoryDashboard').then(mod => ({ default: mod.QueryHistoryDashboard })),
  { 
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading query history...</p>
        </div>
      </div>
    )
  }
)

export default function QueryHistoryPageRoute() {
  useEffect(() => {
    document.title = 'Query History - AI Law Wizard'
  }, [])

  return <QueryHistoryPage />
}

