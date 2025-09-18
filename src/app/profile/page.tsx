'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/app/components/Layout';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  MapPin, 
  Phone, 
  Building, 
  Award, 
  Edit, 
  Save, 
  X,
  Settings,
  Activity,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';

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
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        setIsLoading(true);
        try {
          // Simulate API call - replace with actual API endpoint
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock profile data based on session
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
            subscription: {
              plan: 'Professional',
              status: 'active',
              expiresAt: '2024-12-31'
            }
          };
          
          setProfile(mockProfile);
          setEditForm(mockProfile);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchProfile();
  }, [session]);

  const handleSave = async () => {
    try {
      // Simulate API call to save profile
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

  return (
    <Layout>
      <motion.div 
        className="min-h-[calc(100vh-200px)] bg-white/90 backdrop-blur-sm shadow-2xl rounded-lg mx-auto max-w-6xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <Badge variant="secondary" className="mt-2">
                    {profile.role}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm">Total Queries</span>
                    </div>
                    <span className="font-semibold">{profile.totalQueries}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Documents</span>
                    </div>
                    <span className="font-semibold">{profile.totalDocuments}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-purple-500 mr-2" />
                      <span className="text-sm">Member Since</span>
                    </div>
                    <span className="font-semibold">{new Date(profile.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Subscription Info */}
                {profile.subscription && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Subscription</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Plan:</span>
                        <span className="font-medium">{profile.subscription.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Status:</span>
                        <Badge variant={profile.subscription.status === 'active' ? 'default' : 'secondary'}>
                          {profile.subscription.status}
                        </Badge>
                      </div>
                      {profile.subscription.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Expires:</span>
                          <span className="font-medium">{new Date(profile.subscription.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
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
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Professional Information
                  </CardTitle>
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

              {/* Account Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Account Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm">Last Active</span>
                      </div>
                      <span className="font-medium text-sm">
                        {new Date(profile.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm">Member Since</span>
                      </div>
                      <span className="font-medium text-sm">
                        {new Date(profile.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
