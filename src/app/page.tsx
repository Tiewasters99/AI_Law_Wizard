'use client'

import { useAuth } from '@/app/stores/authStore'
import { LawyerDashboard } from '@/app/components/role-based/LawyerDashboard'
import Layout from '@/app/components/Layout'
import Home from '@/app/components/Home'

export default function Page() {
  const { isAuthenticated, isLawyer, isCustomer, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show appropriate dashboard for authenticated users
  if (isAuthenticated && isLawyer) {
    return <LawyerDashboard />
  }

  // Home page for all users (authenticated and guest)
  return (
    <Layout>
      <Home />
    </Layout>
  )
}
