'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Layout from '@/app/components/Layout';
import { useTokenAccess } from '@/app/hooks/useTokenAccess';
import { TOKEN_COSTS } from '@/app/lib/tokenUtils';
import { fetchTokenPackages, TokenPackage } from '@/app/lib/stripe';
import { TokenPurchase } from '@/app/components/payment/TokenPurchase';
import { colors, practiceAreas, badgeTypes } from '@/app/lib/designSystem';
import { 
  User, 
  Settings, 
  Coins,
  Shield,
  Mail,
  MapPin,
  Phone,
  Building,
  Award,
  Edit,
  Save,
  X,
  FileText,
  Calendar,
  TrendingUp,
  CreditCard,
  BarChart3,
  Clock,
  Briefcase,
  CheckCircle,
  Upload,
  Star,
  Gavel
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

// Define types for profile data
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  company?: string;
  specialty?: string;
  barLicense?: string;
  yearsOfExperience?: number;
  joinedAt: string;
  lastActive: string;
  totalQueries: number;
  totalDocuments: number;
}

// Sidebar navigation items - moved outside component
const SIDEBAR_ITEMS = [
  {
    id: 'profile',
    name: 'Professional Profile',
    icon: User,
    description: 'Attorney credentials & information'
  },
  {
    id: 'credentials',
    name: 'Credentials & Certifications',
    icon: Award,
    description: 'Bar license & certifications'
  },
  {
    id: 'credits',
    name: 'Service Credits',
    icon: Coins,
    description: 'Manage legal analysis credits'
  },
  {
    id: 'settings',
    name: 'Account Settings',
    icon: Settings,
    description: 'Privacy & security'
  }
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { wallet, loading: tokenLoading, currentTokens } = useTokenAccess();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is attorney
  const isAttorney = useMemo(
    () => session?.user?.role === 'ATTORNEY' || session?.user?.role === 'LAWYER',
    [session?.user?.role]
  );
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // Mock profile data
  useEffect(() => {
    if (session) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockProfile: UserProfile = {
          id: session.user?.id || '1',
          name: session.user?.name || 'John Doe',
          email: session.user?.email || 'john@example.com',
          role: session.user?.role || 'CUSTOMER',
          bio: 'Legal professional with expertise in corporate law and AI-assisted legal research.',
          location: 'New York, NY',
          phone: '+1 (555) 123-4567',
          company: (session.user?.role === 'ATTORNEY' || session.user?.role === 'LAWYER') ? 'Smith & Associates Law Firm' : 'TechCorp Inc.',
          specialty: (session.user?.role === 'ATTORNEY' || session.user?.role === 'LAWYER') ? 'Corporate Law' : undefined,
          barLicense: (session.user?.role === 'ATTORNEY' || session.user?.role === 'LAWYER') ? 'NY-123456' : undefined,
          yearsOfExperience: (session.user?.role === 'ATTORNEY' || session.user?.role === 'LAWYER') ? 8 : undefined,
          joinedAt: '2024-01-15',
          lastActive: new Date().toISOString(),
          totalQueries: 47,
          totalDocuments: 23,
        };
        setProfile(mockProfile);
        setEditForm(mockProfile);
        setIsLoading(false);
      }, 1000);
    }
  }, [session]);

  // Load token packages
  useEffect(() => {
    const loadTokenPackages = async () => {
      if (session?.user) {
        setPackagesLoading(true);
        try {
          const packages = await fetchTokenPackages();
          setTokenPackages(packages);
        } catch (error) {
          console.error('Failed to load token packages:', error);
        } finally {
          setPackagesLoading(false);
        }
      }
    };

    loadTokenPackages();
  }, [session]);

  const handleSave = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }, [editForm]);

  const handleCancel = useCallback(() => {
    setEditForm(profile || {});
    setIsEditing(false);
  }, [profile]);

  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600">Please sign in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
              <p className="text-gray-600">Unable to load your profile information.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const renderProfileManagement = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Management</h2>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{profile.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {profile.role}
              </Badge>
              <p className="text-gray-600 mt-2">{profile.bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              {isEditing ? (
                <Input
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span>{profile.name}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-500 mr-2" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
            {isEditing ? (
              <Textarea
                value={editForm.bio || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p>{profile.bio || 'No bio provided'}</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
              {isEditing ? (
                <Input
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                  <span>{profile.location || 'Not specified'}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
              {isEditing ? (
                <Input
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span>{profile.phone || 'Not provided'}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Company/Organization</label>
            {isEditing ? (
              <Input
                value={editForm.company || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company name"
              />
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Building className="w-4 h-4 text-gray-500 mr-2" />
                <span>{profile.company || 'Not specified'}</span>
              </div>
            )}
          </div>

          {(profile.role === 'ATTORNEY' || profile.role === 'LAWYER') && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Specialty</label>
                  {isEditing ? (
                    <Input
                      value={editForm.specialty || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, specialty: e.target.value }))}
                      placeholder="Legal specialty"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Award className="w-4 h-4 text-gray-500 mr-2" />
                      <span>{profile.specialty || 'Not specified'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Bar License</label>
                  {isEditing ? (
                    <Input
                      value={editForm.barLicense || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, barLicense: e.target.value }))}
                      placeholder="Bar license number"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-4 h-4 text-gray-500 mr-2" />
                      <span>{profile.barLicense || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Years of Experience</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editForm.yearsOfExperience || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                    placeholder="Years of experience"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                    <span>{profile.yearsOfExperience ? `${profile.yearsOfExperience} years` : 'Not specified'}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTokenManagement = () => {
    if (tokenLoading) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Token Management</h2>
            <p className="text-gray-600">Loading your token information...</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Token Management</h2>
          <p className="text-gray-600">View and manage your token usage and packages</p>
        </div>

        {/* Token Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Tokens</p>
                  <p className="text-2xl font-bold text-blue-600">{currentTokens.toLocaleString()}</p>
                </div>
                <Coins className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wallet Status</p>
                  <p className="text-2xl font-bold text-green-600">
                    {wallet ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {wallet?.updatedAt ? new Date(wallet.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Costs Information */}
        <Card>
          <CardHeader>
            <CardTitle>Token Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Wizard Chat</p>
                    <p className="text-sm text-gray-600">Per message</p>
                  </div>
                  <Badge variant="outline">{TOKEN_COSTS.WIZARD_CHAT} token</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Grand Wizard Chat</p>
                    <p className="text-sm text-gray-600">Per message</p>
                  </div>
                  <Badge variant="outline">{TOKEN_COSTS.GRAND_WIZARD_CHAT} tokens</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Document Analysis</p>
                    <p className="text-sm text-gray-600">Per analysis</p>
                  </div>
                  <Badge variant="outline">{TOKEN_COSTS.DOCUMENT_ANALYSIS} tokens</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">File Processing</p>
                    <p className="text-sm text-gray-600">Per operation</p>
                  </div>
                  <Badge variant="outline">{TOKEN_COSTS.FILE_PROCESSING} tokens</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Available Token Packages</CardTitle>
          </CardHeader>
          <CardContent>
            {packagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading packages...</span>
              </div>
            ) : (
              <TokenPurchase showWallet={false} />
            )}
          </CardContent>
        </Card>

        {/* Wallet Information */}
        {wallet && (
          <Card>
            <CardHeader>
              <CardTitle>Wallet Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Wallet ID</p>
                    <p className="text-sm text-gray-600">{wallet.id}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(wallet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Status</p>
                    <Badge variant={wallet.status === 'active' ? 'default' : 'secondary'}>
                      {wallet.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Manage your account and privacy settings</p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates about your account</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-gray-600">Change your account password</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Profile Visibility</h4>
              <p className="text-sm text-gray-600">Control who can see your profile</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Sharing</h4>
              <p className="text-sm text-gray-600">Manage how your data is used</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-600">Delete Account</h4>
              <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row bg-white overflow-hidden">
          {/* Professional Sidebar */}
          <div className="w-full lg:w-80 border-b lg:border-r lg:border-b-0 p-6" style={{ backgroundColor: colors.secondary[50], borderColor: colors.secondary[200] }}>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary[700] }}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: colors.text }}>Professional Profile</h1>
                  {isAttorney && (
                    <Badge variant="outline" className="mt-1" style={{ 
                      color: colors.accent[700], 
                      backgroundColor: colors.accent[50],
                      borderColor: colors.accent[200]
                    }}>
                      <Shield className="w-3 h-3 mr-1" />
                      Attorney
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm" style={{ color: colors.secondary[600] }}>Manage credentials & account</p>
            </div>
            
            <nav className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isActive ? 'shadow-sm' : 'hover:bg-gray-100'
                    }`}
                    style={isActive ? {
                      backgroundColor: colors.primary[50],
                      borderLeft: `3px solid ${colors.primary[700]}`,
                    } : {}}
                  >
                    <Icon className="w-5 h-5" style={{ color: isActive ? colors.primary[700] : colors.secondary[600] }} />
                    <div>
                      <div className="font-medium text-sm" style={{ color: isActive ? colors.primary[900] : colors.text }}>{item.name}</div>
                      <div className="text-xs" style={{ color: colors.secondary[500] }}>{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Professional Footer */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.secondary[200] }}>
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.primary[50] }}>
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4" style={{ color: colors.primary[700] }} />
                  <span className="text-xs font-semibold" style={{ color: colors.primary[900] }}>Profile Completion</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ backgroundColor: colors.primary[600], width: '75%' }}></div>
                </div>
                <p className="text-xs mt-2" style={{ color: colors.primary[800] }}>75% Complete</p>
              </div>
            </div>
          </div>

          {/* Professional Main Content */}
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto overflow-x-hidden" style={{ backgroundColor: colors.background }}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && renderProfileManagement()}
              {activeTab === 'credentials' && renderCredentials()}
              {activeTab === 'credits' && renderTokenManagement()}
              {activeTab === 'settings' && renderSettings()}
            </motion.div>
          </div>
    </div>
  );

  // New Credentials Section
  function renderCredentials() {
    if (!isAttorney) {
      return (
        <div className="text-center py-12">
          <Image 
            src="/logo_icon.png" 
            alt="AI Wizard Logo" 
            width={64} 
            height={64}
            className="mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Attorney Access Required</h3>
          <p style={{ color: colors.secondary[600] }}>This section is only available for licensed attorneys.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>Professional Credentials</h2>
          <p style={{ color: colors.secondary[600] }}>Manage your bar license, certifications, and professional achievements</p>
        </div>

        {/* Bar License Card */}
        <Card className="shadow-sm" style={{ borderColor: colors.secondary[200] }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: colors.text }}>
              <Shield className="w-5 h-5 mr-2" style={{ color: colors.primary[700] }} />
              Bar License Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Bar License Number</label>
                <Input
                  value={profile?.barLicense || ''}
                  placeholder="NY-123456"
                  disabled={!isEditing}
                  style={{ borderColor: colors.secondary[300] }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Years of Experience</label>
                <Input
                  type="number"
                  value={profile?.yearsOfExperience || ''}
                  placeholder="8"
                  disabled={!isEditing}
                  style={{ borderColor: colors.secondary[300] }}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Practice Areas</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-lg" style={{ backgroundColor: colors.secondary[50] }}>
                {practiceAreas.slice(0, 6).map((area) => (
                  <label key={area} className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded" disabled={!isEditing} />
                    <span style={{ color: colors.text }}>{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications Card */}
        <Card className="shadow-sm" style={{ borderColor: colors.secondary[200] }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: colors.text }}>
              <Award className="w-5 h-5 mr-2" style={{ color: colors.accent[600] }} />
              Professional Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: 'Board Certified - Corporate Law', issuer: 'State Bar Association', date: '2020' },
                { title: 'Mediation Certification', issuer: 'American Bar Association', date: '2019' },
              ].map((cert, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 rounded-lg" style={{ backgroundColor: colors.secondary[50] }}>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: colors.success[600] }} />
                    <div>
                      <h4 className="font-semibold text-sm" style={{ color: colors.text }}>{cert.title}</h4>
                      <p className="text-xs" style={{ color: colors.secondary[600] }}>{cert.issuer} • {cert.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm" style={{ borderColor: colors.primary[300], color: colors.primary[700] }}>
                <Upload className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Professional Achievements */}
        <Card className="shadow-sm" style={{ borderColor: colors.secondary[200] }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: colors.text }}>
              <Star className="w-5 h-5 mr-2" style={{ color: colors.accent[600] }} />
              Professional Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Cases Won', value: '150+', icon: Gavel },
                { label: 'Client Rating', value: '4.9/5.0', icon: Star },
                { label: 'Years Practice', value: profile?.yearsOfExperience || '8', icon: Award },
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.primary[50] }}>
                  <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: colors.primary[700] }} />
                  <p className="text-2xl font-bold mb-1" style={{ color: colors.primary[900] }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: colors.primary[700] }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}