/*
 * RoleSelection Component - COMMENTED OUT
 * 
 * This component is no longer needed since role selection now happens on the landing page.
 * Users now select their role before authentication, not after.
 * 
 * The component has been completely commented out to preserve the code for reference.
 * 
 * New Flow:
 * 1. User visits landing page
 * 2. User clicks "Start as Client" or "Start as Attorney" 
 * 3. User is redirected to /auth with role parameter
 * 4. Registration form shows pre-selected role
 * 5. User completes registration with their role already set
 */

// Original component code commented out below:
/*
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
  // Component implementation commented out...
  return null;
};
*/