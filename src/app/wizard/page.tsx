'use client'

import { Suspense } from 'react'
import Layout from '../components/Layout'
import { WizardContainer } from '../components/wizard/WizardContainer'

// Disable static optimization for this page
export const dynamic = 'force-dynamic'

const WizardPage = () => {
  return (
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <WizardContainer />
      </Suspense>
    </Layout>
  )
}

export default WizardPage