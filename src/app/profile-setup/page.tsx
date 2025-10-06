'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/stores/authStore';
import { Loader2 } from 'lucide-react';

export default function ProfileSetupPage() {
  const { data: session, status, update } = useSession();
  const { checkAuthStatus } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === 'loading') return;

      if (!session) {
        router.push('/login');
        return;
      }

      // Check if user already has a role and complete profile
      if (session.user?.role && session.user?.profileComplete) {
        // Redirect based on role
        if (session.user.role === 'LAWYER') {
          router.push('/'); // Main page shows LawyerDashboard for lawyers
        } else {
          router.push('/'); // Main page shows Home component for customers
        }
        return;
      }

      // If user has a role but profile is not complete, redirect them
      if (session.user?.role && !session.user?.profileComplete) {
        // For users with role but incomplete profile, redirect based on role
        if (session.user.role === 'LAWYER') {
          router.push('/'); // Main page shows LawyerDashboard for lawyers
        } else {
          router.push('/'); // Main page shows Home component for customers
        }
        return;
      }

      // If no role is set, redirect to home (shouldn't happen with new flow)
      router.push('/');
    };

    checkUserStatus();
  }, [session, status, router]);

  // const handleRoleSelected = async (role: 'LAWYER' | 'CUSTOMER') => {
  //   console.log('handleRoleSelected called with role:', role);
  //   // The redirect is now handled in the RoleSelection component
  //   // This callback is kept for any additional logic if needed
  // };

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h2>
        <p className="text-gray-600">Taking you to your dashboard based on your role.</p>
      </div>
    </div>
  );
}
