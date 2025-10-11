'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/stores/authStore'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/app/components/Layout'
import { colors, badgeTypes, practiceAreas } from '@/app/lib/designSystem'
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Star, 
  Award,
  FileText,
  Phone,
  Mail,
  Calendar,
  Shield,
  LogIn,
  MessageSquare,
  Building,
  Clock,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  CheckCircle,
  Gavel,
  Scale
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'

interface DirectoryUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: 'ATTORNEY' | 'LAWYER' | 'CUSTOMER' // Support both ATTORNEY and legacy LAWYER
  createdAt: string
  lawyerProfile?: {
    specialty: string | null
    barLicense: string | null
    bio: string | null
    yearsOfExperience: number | null
    firmName: string | null
    verified: boolean
  } | null
  customerProfile?: {
    companyName: string | null
    address: string | null
    phone: string | null
    industry: string | null
    needs: string | null
  } | null
}

export default function DirectoryPage() {
  const { data: session } = useSession()
  const { user, isLawyer, isCustomer } = useAuth()
  const router = useRouter()
  const isAuthenticated = !!session

  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [targetRole, setTargetRole] = useState<'ATTORNEY' | 'LAWYER' | 'CUSTOMER' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All Practice Areas')
  const [sortBy, setSortBy] = useState<'experience' | 'name' | 'verified'>('experience')

  // Fetch directory users from API
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/directory')
        
        if (!response.ok) {
          throw new Error('Failed to fetch directory users')
        }

        const data = await response.json()
        setUsers(data.users || [])
        setTargetRole(data.targetRole)
      } catch (err) {
        console.error('Error fetching directory users:', err)
        setError('Failed to load directory. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [isAuthenticated])

  const isShowingLawyers = targetRole === 'ATTORNEY' || targetRole === 'LAWYER'
  const profiles = users

  // Sample preview profiles for guests (show lawyers by default)
  const guestPreviewProfiles: DirectoryUser[] = [
    {
      id: 'preview-1',
      name: 'Attorney Profile',
      email: 'contact@example.com',
      image: null,
      role: 'LAWYER',
      createdAt: new Date().toISOString(),
      lawyerProfile: {
        specialty: 'Legal Practice',
        barLicense: null,
        bio: 'Experienced legal professional ready to help with your case.',
        yearsOfExperience: 10,
        firmName: 'Law Firm',
        verified: true
      }
    },
    {
      id: 'preview-2',
      name: 'Legal Expert',
      email: 'expert@example.com',
      image: null,
      role: 'LAWYER',
      createdAt: new Date().toISOString(),
      lawyerProfile: {
        specialty: 'Corporate Law',
        barLicense: null,
        bio: 'Specialized in business and corporate matters.',
        yearsOfExperience: 15,
        firmName: 'Legal Associates',
        verified: true
      }
    },
    {
      id: 'preview-3',
      name: 'Law Professional',
      email: 'info@example.com',
      image: null,
      role: 'LAWYER',
      createdAt: new Date().toISOString(),
      lawyerProfile: {
        specialty: 'Family Law',
        barLicense: null,
        bio: 'Compassionate legal guidance for family matters.',
        yearsOfExperience: 8,
        firmName: 'Family Law Center',
        verified: false
      }
    }
  ]

  const displayProfiles = !isAuthenticated ? guestPreviewProfiles : profiles

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] bg-white overflow-hidden relative">
        {/* Professional Header Section */}
        <div className="border-b shadow-sm py-5 relative" style={{ 
          backgroundColor: colors.secondary[50],
          borderColor: colors.secondary[200]
        }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: colors.primary[700] }}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.text }}>
                      Attorney Directory
                    </h1>
                    <p className="text-sm" style={{ color: colors.secondary[600] }}>
                      {isShowingLawyers || !isAuthenticated ? 'Connect with qualified legal professionals' : 'Professional client network'}
                    </p>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg border shadow-sm" style={{ 
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[200]
                  }}>
                    <CheckCircle className="w-4 h-4" style={{ color: colors.primary[700] }} />
                    <span className="text-sm font-medium" style={{ color: colors.primary[900] }}>{profiles.length} Verified Attorneys</span>
                  </div>
                )}
              </div>

              {/* Search and Filter Bar */}
              {isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.secondary[400] }} />
                    <Input
                      placeholder="Search by name, specialty, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border shadow-sm"
                      style={{ borderColor: colors.secondary[300] }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="px-4 py-2 rounded-lg border shadow-sm text-sm"
                      style={{ borderColor: colors.secondary[300], color: colors.text }}
                    >
                      <option>All Practice Areas</option>
                      {practiceAreas.map(area => (
                        <option key={area}>{area}</option>
                      ))}
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'experience' | 'name' | 'verified')}
                      className="px-4 py-2 rounded-lg border shadow-sm text-sm"
                      style={{ borderColor: colors.secondary[300], color: colors.text }}
                    >
                      <option value="experience">Most Experienced</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="verified">Verified First</option>
                    </select>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-6 sm:px-8 lg:px-12 py-6 relative h-[calc(100%-6rem)] z-10">
        
        {/* Loading State */}
        {loading && isAuthenticated && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading directory...</p>
          </div>
        )}

        {/* Error State */}
        {error && isAuthenticated && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-white/60 backdrop-blur-xl border border-red-200/50 shadow-xl">
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Directory</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && isAuthenticated && users.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-white/60 backdrop-blur-xl border border-blue-200/50 shadow-xl">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No {isShowingLawyers ? 'Attorneys' : 'Clients'} Found</h3>
                <p className="text-gray-600">
                  {isShowingLawyers 
                    ? 'There are no attorneys with completed profiles available at the moment.'
                    : 'There are no clients with completed profiles available at the moment.'
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Professional Unauthenticated Overlay */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="bg-white rounded-2xl p-12 max-w-lg mx-4 shadow-xl border" style={{ borderColor: colors.secondary[200] }}>
                {/* Professional header */}
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm" style={{ backgroundColor: colors.primary[700] }}>
                  <Scale className="w-8 h-8 text-white" />
                </div>
                
                {/* Title */}
                <h2 className="text-3xl font-bold mb-3" style={{ color: colors.text }}>
                  Access Attorney Directory
                </h2>
                
                {/* Subtitle */}
                <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: colors.secondary[600] }}>
                  Sign in to connect with qualified attorneys and access comprehensive legal professional network
                </p>

                {/* Professional Benefits */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: Shield, label: 'Bar Verified' },
                    { icon: Award, label: 'Certified Attorneys' },
                    { icon: Gavel, label: 'Legal Expertise' },
                    { icon: MessageSquare, label: 'Direct Contact' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border text-center" style={{ 
                      backgroundColor: colors.secondary[50],
                      borderColor: colors.secondary[200]
                    }}>
                      <item.icon className="w-5 h-5 mx-auto mb-1" style={{ color: colors.primary[700] }} />
                      <span className="text-xs font-medium" style={{ color: colors.text }}>{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Professional Sign In Button */}
                <Button
                  onClick={() => router.push('/auth')}
                  className="w-full py-6 rounded-xl font-semibold text-base shadow-sm"
                  size="lg"
                  style={{ backgroundColor: colors.primary[700] }}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Directory
                </Button>

                {/* Professional trust indicators */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.secondary[200] }}>
                  <div className="flex items-center justify-center space-x-6 text-xs" style={{ color: colors.secondary[600] }}>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" style={{ color: colors.success[600] }} />
                      <span>Secure Platform</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" style={{ color: colors.success[600] }} />
                      <span>Verified Professionals</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Professional Profiles Grid */}
        {(!loading && !error && (users.length > 0 || !isAuthenticated)) && (
          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full overflow-auto pb-4 ${!isAuthenticated ? 'opacity-30 pointer-events-none' : ''}`}>
            {displayProfiles.map((profile: DirectoryUser, index: number) => {
              const isLawyerProfile = profile.role === 'LAWYER'
              const lawyerData = profile.lawyerProfile
              const customerData = profile.customerProfile
              const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              
              return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="group"
              >
                <Card className="h-full bg-white hover:shadow-lg transition-all duration-200 border overflow-hidden" style={{ 
                  borderColor: colors.secondary[200]
                }}>
                  {/* Professional Top Border */}
                  <div className="h-1" style={{ backgroundColor: colors.primary[700] }}></div>
                  
                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-sm" style={{ 
                            backgroundColor: colors.primary[100]
                          }}>
                          {profile.image ? (
                            <img src={profile.image} alt={profile.name || 'User'} className="w-full h-full rounded-xl object-cover" />
                          ) : (
                            <Scale className="w-8 h-8" style={{ color: colors.primary[700] }} />
                          )}
                          </div>
                          {/* Professional status indicator */}
                          {isLawyerProfile && lawyerData?.verified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full flex items-center justify-center" style={{ backgroundColor: colors.success[500] }}>
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold" style={{ color: colors.text }}>
                            {profile.name || 'Anonymous User'}
                          </CardTitle>
                          <p className="text-sm font-medium mt-0.5" style={{ color: colors.secondary[600] }}>
                            {isLawyerProfile 
                              ? (lawyerData?.firmName || 'Private Practice')
                              : (customerData?.companyName || 'Individual Client')
                            }
                          </p>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline"
                        className="border"
                        style={isLawyerProfile && lawyerData?.verified ? {
                          color: colors.success[700],
                          backgroundColor: colors.success[50],
                          borderColor: colors.success[200]
                        } : {
                          color: colors.primary[700],
                          backgroundColor: colors.primary[50],
                          borderColor: colors.primary[200]
                        }}
                      >
                        {isLawyerProfile ? (lawyerData?.verified ? <><CheckCircle className="w-3 h-3 mr-1 inline" /> Bar Verified</> : 'Attorney') : 'Client'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 relative z-10">
                    {/* Professional Experience and Specialty */}
                    <div className="space-y-2">
                      {isLawyerProfile ? (
                        <>
                          {lawyerData?.yearsOfExperience && (
                            <div className="flex items-center space-x-2 text-sm px-3 py-2 rounded-lg border" style={{ 
                              color: colors.primary[900],
                              backgroundColor: colors.primary[50],
                              borderColor: colors.primary[200]
                            }}>
                              <Award className="w-4 h-4" style={{ color: colors.primary[700] }} />
                              <span className="font-semibold">{lawyerData.yearsOfExperience}+ Years Experience</span>
                            </div>
                          )}
                          {lawyerData?.specialty && (
                            <div className="px-3 py-2 rounded-lg border" style={{ 
                              backgroundColor: colors.secondary[50],
                              borderColor: colors.secondary[200]
                            }}>
                              <div className="flex items-center space-x-2">
                                <Briefcase className="w-4 h-4" style={{ color: colors.secondary[700] }} />
                                <span className="text-sm font-medium" style={{ color: colors.text }}>{lawyerData.specialty}</span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 text-sm px-3 py-2 rounded-lg border" style={{ 
                            backgroundColor: colors.secondary[50],
                            borderColor: colors.secondary[200],
                            color: colors.secondary[700]
                          }}>
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Member since {joinDate}</span>
                          </div>
                          {customerData?.industry && (
                            <div className="px-3 py-2 rounded-lg border" style={{ 
                              backgroundColor: colors.secondary[50],
                              borderColor: colors.secondary[200]
                            }}>
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4" style={{ color: colors.secondary[700] }} />
                                <span className="text-sm font-medium" style={{ color: colors.text }}>{customerData.industry}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Professional Bio */}
                    {(isLawyerProfile && lawyerData?.bio) && (
                      <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: colors.secondary[700] }}>
                        {lawyerData.bio}
                      </p>
                    )}
                    
                    {(!isLawyerProfile && customerData?.needs) && (
                      <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: colors.secondary[700] }}>
                        {customerData.needs}
                      </p>
                    )}

                    {/* Professional Contact Information */}
                    {isAuthenticated && (
                      <div className="pt-3 border-t space-y-2" style={{ borderColor: colors.secondary[200] }}>
                        {profile.email && (
                          <div className="flex items-center space-x-2 text-sm transition-colors">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary[50] }}>
                              <Mail className="w-4 h-4" style={{ color: colors.primary[700] }} />
                            </div>
                            <a href={`mailto:${profile.email}`} className="truncate flex-1" style={{ color: colors.secondary[700] }}>
                              {profile.email}
                            </a>
                          </div>
                        )}
                        {customerData?.phone && (
                          <div className="flex items-center space-x-2 text-sm transition-colors">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.secondary[100] }}>
                              <Phone className="w-4 h-4" style={{ color: colors.secondary[700] }} />
                            </div>
                            <a href={`tel:${customerData.phone}`} className="flex-1" style={{ color: colors.secondary[700] }}>
                              {customerData.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Professional Action Button */}
                    {isAuthenticated && (
                      <Button 
                        className="w-full text-white shadow-sm transition-all"
                        style={{ backgroundColor: colors.primary[700] }}
                        onClick={() => {
                          console.log(`${isShowingLawyers ? 'Scheduling consultation with' : 'Connecting with client'} ${profile.name}`)
                        }}
                      >
                        {isShowingLawyers ? (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-semibold">Schedule Consultation</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            <span className="font-semibold">Contact Client</span>
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
            })}
          </div>
        )}

        </div>
      </div>
    </Layout>
  )
}

