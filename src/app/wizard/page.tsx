'use client'

import { Suspense } from 'react'
import Layout from '../components/Layout'
import { DocumentAnalysisInterface } from '../components/document-processing/DocumentAnalysisInterface'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Disable static optimization for this page
export const dynamic = 'force-dynamic'

const WizardPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (!session?.user) {
    return null // Will redirect to login
  }

  return (
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <DocumentAnalysisInterface />
      </Suspense>
    </Layout>
  )
}

export default WizardPage