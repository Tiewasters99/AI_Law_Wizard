'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/stores/authStore';
import { Loader2 } from 'lucide-react';
import { OAuthRoleSelection } from '@/app/components/auth/OAuthRoleSelection';

export default function ProfileSetupPage() {
  const { data: session, status, update } = useSession();
  const { checkAuthStatus } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === 'loading') return;

      if (!session) {
        router.push('/auth');
        return;
      }

      // Check if user already has a complete profile
      // Credential users complete their profile during registration
      // Only OAuth users without complete profile need this page
      if (session.user?.profileComplete) {
        console.log('Profile already complete, redirecting to home');
        router.push('/');
        return;
      }

      // If user doesn't have a complete profile, show role selection
      // This happens for OAuth users only
      console.log('Profile incomplete, showing role selection for OAuth user');
      setShowRoleSelection(true);
      setIsChecking(false);
    };

    checkUserStatus();
  }, [session, status, router]);

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
    return null; // Will redirect to auth
  }

  if (showRoleSelection) {
    return <OAuthRoleSelection onComplete={() => router.push('/')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h2>
        <p className="text-gray-600">Taking you to your dashboard.</p>
      </div>
    </div>
  );
}
