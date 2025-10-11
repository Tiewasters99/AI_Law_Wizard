'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/stores/authStore';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/app/components/ui/use-toast';
import { motion } from 'framer-motion';
import { TokenTracker } from '@/app/lib/tokenTracker';

interface OAuthRoleSelectionProps {
  onComplete?: () => void;
}

export function OAuthRoleSelection({ onComplete }: OAuthRoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'ATTORNEY' | 'CUSTOMER' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feature, setFeature] = useState<'home' | 'directory' | 'attorney-features' | null>(null);
  const [showOnlyAttorney, setShowOnlyAttorney] = useState(false);
  const { updateUserRole, user } = useAuth();
  const { toast } = useToast();

  // Check for pre-selected role and feature from upgrade flow
  useEffect(() => {
    const storedFeature = localStorage.getItem('auth_feature');
    const storedRole = localStorage.getItem('auth_preselected_role');
    
    if (storedFeature) {
      setFeature(storedFeature as 'home' | 'directory' | 'attorney-features');
      // Attorney features only show ATTORNEY option
      if (storedFeature === 'attorney-features') {
        setShowOnlyAttorney(true);
      }
    }
    
    if (storedRole) {
      const role = storedRole === 'attorney' || storedRole === 'ATTORNEY' ? 'ATTORNEY' : 'CUSTOMER';
      setSelectedRole(role); // Auto-select
    }
  }, []);

  const handleRoleSubmit = async () => {
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select your role to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateUserRole(selectedRole);
      
      if (result.success) {
        // Reset tokens on signup - grant 5000 tokens to registered users
        if (user?.id) {
          TokenTracker.resetOnSignup(user.id);
        }
        
        // Clear stored auth parameters
        localStorage.removeItem('auth_feature');
        localStorage.removeItem('auth_preselected_role');
        
        toast({
          title: "Profile Updated!",
          description: `You're now set up as ${selectedRole === 'ATTORNEY' ? 'an Attorney' : 'a Client'} with 5,000 free tokens!`,
        });
        
        // Call onComplete callback if provided
        onComplete?.();
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update your role. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card className="backdrop-blur-sm bg-white/90 shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to AI Law Wizard!
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {user?.name ? `${user.name}, please` : 'Please'} select your role to personalize your experience
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className={`grid ${showOnlyAttorney ? 'md:grid-cols-1 max-w-md mx-auto' : 'md:grid-cols-2'} gap-4`}>
              {/* Client Role - only show if not attorney-features */}
              {!showOnlyAttorney && (
              <button
                onClick={() => setSelectedRole('CUSTOMER')}
                disabled={isSubmitting}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedRole === 'CUSTOMER'
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {selectedRole === 'CUSTOMER' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">👤</div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    selectedRole === 'CUSTOMER' ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    Client
                  </h3>
                </div>
                
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Access legal AI assistance</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Find attorneys</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Document analysis</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Legal consultations</span>
                  </li>
                </ul>
              </button>
              )}

              {/* Attorney Role */}
              <button
                onClick={() => setSelectedRole('ATTORNEY')}
                disabled={isSubmitting}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedRole === 'ATTORNEY'
                    ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                }`}
              >
                {selectedRole === 'ATTORNEY' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">⚖️</div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    selectedRole === 'ATTORNEY' ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    Attorney
                  </h3>
                </div>
                
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Professional profile</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Client management</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>AI-powered tools</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Case research</span>
                  </li>
                </ul>
              </button>
            </div>

            <Button
              onClick={handleRoleSubmit}
              disabled={!selectedRole || isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                'Continue'
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              You can change your role later in your profile settings
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

