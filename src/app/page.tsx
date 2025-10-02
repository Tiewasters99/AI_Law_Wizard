'use client'

import Layout from '@/app/components/Layout'
import Home from '@/app/components/Home'
import { LawyerDashboard } from '@/app/components/role-based/LawyerDashboard'
import { useAuth } from '@/app/stores/authStore'

export default function Page() {
  const { isLawyer } = useAuth()

  // Show lawyer dashboard for lawyers, regular home for everyone else
  if (isLawyer) {
    return <LawyerDashboard />
  }

  // Regular home page for clients and others
  return (
    <Layout>
      <Home />
    </Layout>
  )
}
