'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/stores/authStore';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Loader2, Scale, Users, CheckCircle, ArrowRight } from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelected?: (role: 'LAWYER' | 'CUSTOMER') => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelected }) => {
  const { updateUserRole, redirectAfterRoleSelection } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'LAWYER' | 'CUSTOMER' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role: 'LAWYER' | 'CUSTOMER') => {
    setSelectedRole(role);
    // Don't automatically update role, just select it
    // User will click continue to proceed
  };

  const handleContinue = async () => {
    console.log('Continue button clicked, selectedRole:', selectedRole);
    if (!selectedRole) {
      console.log('No role selected, returning');
      return;
    }
    
    setIsLoading(true);
    console.log('Starting role update for:', selectedRole);

    try {
      const result = await updateUserRole(selectedRole);
      console.log('Role update result:', result);
      
      if (result.success) {
        console.log('Role update successful, redirecting to home page');
        // Use the auth store redirect function for better reliability
        redirectAfterRoleSelection(selectedRole);
      } else {
        console.error('Failed to update role:', result.error);
        alert('Failed to update role: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating role: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'LAWYER' as const,
      title: 'Attorney/Lawyer',
      description: 'Legal professional with access to all features',
      icon: Scale,
      features: [
        'Full document processing capabilities',
        'Token management and billing',
        'Advanced wizard functionality',
        'Client consultation tools',
        'Document analysis and legal research',
        'Admin features and analytics'
      ],
      badge: 'Professional',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'CUSTOMER' as const,
      title: 'Client/Customer',
      description: 'Client seeking legal assistance',
      icon: Users,
      features: [
        'Document consultation',
        'Legal question answering',
        'Simplified wizard interface',
        'Attorney matching (coming soon)',
        'Basic document analysis',
        'Client dashboard and history'
      ],
      badge: 'Client',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select your role to access the appropriate features and tools. 
            You can change this later in your profile settings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.id;
            const isProcessing = isLoading && selectedRole === option.id;

            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all duration-200 ${option.color} ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => !isLoading && handleRoleSelect(option.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${option.color} border-2`}>
                      <Icon className={`w-8 h-8 ${option.iconColor}`} />
                    </div>
                  </div>
                  <div className="flex justify-center mb-2">
                    <Badge variant="secondary" className="text-sm">
                      {option.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-3">
                      What you&apos;ll get:
                    </h4>
                    <ul className="space-y-2">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Button 
                      className="w-full"
                      variant={isSelected ? "default" : "outline"}
                      disabled={isLoading}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        `Select ${option.title.split('/')[0]}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button - appears after role selection */}
        {selectedRole && (
          <div className="text-center mt-8">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full max-w-md h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help choosing? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};
