'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/app/components/Layout';
import { useTokenAccess } from '@/app/hooks/useTokenAccess';
import { TOKEN_COSTS } from '@/app/lib/tokenUtils';
import { fetchTokenPackages, TokenPackage } from '@/app/lib/stripe';
import { TokenPurchase } from '@/app/components/payment/TokenPurchase';
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
  Activity,
  FileText,
  Calendar,
  TrendingUp,
  CreditCard,
  BarChart3,
  Clock
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

// Sidebar navigation items
const sidebarItems = [
  {
    id: 'profile',
    name: 'Profile Management',
    icon: User,
    description: 'Manage your personal information'
  },
  {
    id: 'tokens',
    name: 'Token Management',
    icon: Coins,
    description: 'View and manage your tokens'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'Account and privacy settings'
  }
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { wallet, loading: tokenLoading, currentTokens } = useTokenAccess();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
          company: session.user?.role === 'LAWYER' ? 'Smith & Associates Law Firm' : 'TechCorp Inc.',
          specialty: session.user?.role === 'LAWYER' ? 'Corporate Law' : undefined,
          barLicense: session.user?.role === 'LAWYER' ? 'NY-123456' : undefined,
          yearsOfExperience: session.user?.role === 'LAWYER' ? 8 : undefined,
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

  const handleSave = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleCancel = () => {
    setEditForm(profile || {});
    setIsEditing(false);
  };

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

          {profile.role === 'LAWYER' && (
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
    <Layout>
      <div className="min-h-[calc(100vh-200px)] bg-white/90 backdrop-blur-sm shadow-2xl rounded-lg mx-auto max-w-7xl">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your account settings</p>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && renderProfileManagement()}
              {activeTab === 'tokens' && renderTokenManagement()}
              {activeTab === 'settings' && renderSettings()}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}