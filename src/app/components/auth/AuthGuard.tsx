'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'LAWYER' | 'CUSTOMER';
  fallbackUrl?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole, 
  fallbackUrl = '/login' 
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      if (status === 'loading') return;

      if (!session) {
        router.push(fallbackUrl);
        return;
      }

      // Check if user needs to complete profile setup
      if (!session.user?.role || !session.user?.profileComplete) {
        router.push('/profile-setup');
        return;
      }

      // Check role-based access
      if (requiredRole && session.user.role !== requiredRole) {
        // Redirect based on user's actual role
        if (session.user.role === 'LAWYER') {
          router.push('/wizard');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [session, status, router, requiredRole, fallbackUrl]);

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
};

// Higher-order component for easier usage
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'LAWYER' | 'CUSTOMER',
  fallbackUrl?: string
) => {
  const WrappedComponent = (props: P) => (
    <AuthGuard requiredRole={requiredRole} fallbackUrl={fallbackUrl}>
      <Component {...props} />
    </AuthGuard>
  );

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
