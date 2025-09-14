'use client'

import Layout from '../components/Layout'
import { WizardContainer } from '../components/wizard/WizardContainer'

// Disable static optimization for this page
export const dynamic = 'force-dynamic'

const WizardPage = () => {
  return (
    <Layout>
      <WizardContainer />
    </Layout>
  )
}

export default WizardPage