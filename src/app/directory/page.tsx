'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/stores/authStore'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Layout from '@/app/components/Layout'
import { ConsultationRequestModal } from '@/app/components/consultation/ConsultationRequestModal'
import { ConsultationRequestCard } from '@/app/components/consultation/ConsultationRequestCard'
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
  Send
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'

interface ConsultationRequest {
  id: string
  status: string
  caseType: string
  urgency: string
  createdAt: string
  conversation?: {
    id: string
    unreadByAttorney: number
  }
}

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
  existingRequest?: {
    attorneyId: string
    status: string
    id: string
  } | null
  consultationRequests?: ConsultationRequest[]
}

// Guest preview profiles - static data outside component
const GUEST_PREVIEW_PROFILES: DirectoryUser[] = [
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
  const [selectedAttorney, setSelectedAttorney] = useState<DirectoryUser | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [hasReachedLimit, setHasReachedLimit] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Fetch current user limits
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!isAuthenticated) return

      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (data?.user) {
          // Fetch full user data including consultation request limits
          const userResponse = await fetch(`/api/directory`)
          const userData = await userResponse.json()
          setCurrentUser(userData)
        }
      } catch (err) {
        console.error('Error fetching current user:', err)
      }
    }

    fetchCurrentUser()
  }, [isAuthenticated])

  // Fetch directory users from API
  const fetchUsers = useCallback(async () => {
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
  }, [isAuthenticated])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSendRequest = useCallback((attorney: DirectoryUser) => {
    setSelectedAttorney(attorney)
    setHasReachedLimit(false)
    setShowRequestModal(true)
  }, [])

  const handleCloseRequestModal = useCallback(() => {
    setShowRequestModal(false)
    setSelectedAttorney(null)
    fetchUsers()
  }, [fetchUsers])

  // Memoized computed values
  const isShowingLawyers = useMemo(
    () => targetRole === 'ATTORNEY' || targetRole === 'LAWYER',
    [targetRole]
  )

  const displayProfiles = useMemo(
    () => !isAuthenticated ? GUEST_PREVIEW_PROFILES : users,
    [isAuthenticated, users]
  )

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
        {/* Professional Header Section */}
        <div className="border-b shadow-sm py-6" style={{ 
          backgroundColor: colors.secondary[50],
          borderColor: colors.secondary[200]
        }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: colors.primary[700] }}>
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: colors.text }}>
                      {isShowingLawyers || !isAuthenticated ? 'Attorney Directory' : 'Client Directory'}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: colors.secondary[600] }}>
                      {isShowingLawyers || !isAuthenticated ? 'Connect with qualified legal professionals' : 'Browse potential clients and their consultation requests'}
                    </p>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="hidden sm:flex items-center space-x-2.5 px-5 py-2.5 rounded-xl border shadow-sm" style={{ 
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[200]
                  }}>
                    <Users className="w-4 h-4" style={{ color: colors.primary[700] }} />
                    <span className="text-sm font-semibold" style={{ color: colors.primary[900] }}>
                      {displayProfiles.length} {isShowingLawyers ? 'Available Attorneys' : 'Client Profiles'}
                    </span>
                  </div>
                )}
              </div>

              {/* Search and Filter Bar */}
              {isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.secondary[400] }} />
                    <Input
                      placeholder={isShowingLawyers ? "Search by name, specialty, or location..." : "Search by name, company, or industry..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 h-11 border shadow-sm rounded-lg"
                      style={{ 
                        borderColor: colors.secondary[300],
                        backgroundColor: 'white'
                      }}
                    />
                  </div>
                  <div className="flex gap-3">
                    {isShowingLawyers ? (
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border shadow-sm text-sm font-medium min-w-[160px]"
                        style={{ 
                          borderColor: colors.secondary[300], 
                          color: colors.text,
                          backgroundColor: 'white'
                        }}
                      >
                        <option>All Practice Areas</option>
                        {practiceAreas.map(area => (
                          <option key={area}>{area}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border shadow-sm text-sm font-medium min-w-[160px]"
                        style={{ 
                          borderColor: colors.secondary[300], 
                          color: colors.text,
                          backgroundColor: 'white'
                        }}
                      >
                        <option>All Industries</option>
                        <option>Technology</option>
                        <option>Healthcare</option>
                        <option>Finance</option>
                        <option>Real Estate</option>
                        <option>Manufacturing</option>
                        <option>Retail</option>
                        <option>Education</option>
                        <option>Other</option>
                      </select>
                    )}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'experience' | 'name' | 'verified')}
                      className="px-4 py-2.5 rounded-lg border shadow-sm text-sm font-medium min-w-[160px]"
                      style={{ 
                        borderColor: colors.secondary[300], 
                        color: colors.text,
                        backgroundColor: 'white'
                      }}
                    >
                      {isShowingLawyers ? (
                        <>
                          <option value="experience">Most Experienced</option>
                          <option value="name">Name (A-Z)</option>
                          <option value="verified">Verified First</option>
                        </>
                      ) : (
                        <>
                          <option value="name">Name (A-Z)</option>
                          <option value="experience">Newest Members</option>
                          <option value="verified">Has Requests</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 overflow-y-auto">
        
        {/* Loading State */}
        {loading && isAuthenticated && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-14 h-14 animate-spin mb-5" style={{ color: colors.primary[600] }} />
            <p className="text-lg font-medium" style={{ color: colors.secondary[600] }}>Loading directory...</p>
          </div>
        )}

        {/* Error State */}
        {error && isAuthenticated && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-white border shadow-xl" style={{ borderColor: colors.error[200] }}>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.error[500] }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Error Loading Directory</h3>
                <p className="mb-6" style={{ color: colors.secondary[600] }}>{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="text-white shadow-sm"
                  style={{ backgroundColor: colors.primary[700] }}
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
            <Card className="bg-white border shadow-xl" style={{ borderColor: colors.primary[200] }}>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: colors.primary[500] }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>No {isShowingLawyers ? 'Attorneys' : 'Clients'} Found</h3>
                <p style={{ color: colors.secondary[600] }}>
                  {isShowingLawyers 
                    ? 'There are no attorneys with completed profiles available at the moment.'
                    : 'There are no clients with consultation requests available at the moment.'
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
                  <Image 
                    src="/logo_icon.png" 
                    alt="AI Wizard Logo" 
                    width={32} 
                    height={32}
                  />
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
          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full overflow-auto pb-6 ${!isAuthenticated ? 'opacity-30 pointer-events-none' : ''}`}>
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
                <Card className="bg-white hover:shadow-lg transition-all duration-200 border overflow-hidden" style={{ 
                  borderColor: colors.secondary[200]
                }}>
                  {/* Professional Top Border */}
                  <div className="h-1" style={{ backgroundColor: colors.primary[700] }}></div>
                  
                  <CardHeader className="pb-2 px-4 pt-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{ 
                            backgroundColor: colors.primary[100]
                          }}>
                            <Users className="w-5 h-5" style={{ color: colors.primary[700] }} />
                          </div>
                          {/* Professional status indicator */}
                          {isLawyerProfile && lawyerData?.verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-white rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: colors.success[500] }}>
                              <CheckCircle className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm font-bold truncate leading-tight" style={{ color: colors.text }}>
                            {profile.name || 'Anonymous User'}
                          </CardTitle>
                          <p className="text-xs font-medium truncate" style={{ color: colors.secondary[600] }}>
                            {isLawyerProfile 
                              ? (lawyerData?.firmName || 'Individual Attorney')
                              : (customerData?.companyName || 'Individual Client')
                            }
                          </p>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline"
                        className="border flex-shrink-0 font-semibold text-xs px-2 py-0.5"
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
                        {isLawyerProfile ? (
                          lawyerData?.verified ? (
                            <><CheckCircle className="w-3 h-3 mr-1 inline" /> Attorney</>
                          ) : (
                            'Attorney'
                          )
                        ) : (
                          'Client'
                        )}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 pt-0 px-4 pb-3">
                    {/* Professional Experience and Specialty */}
                    <div className="space-y-1.5">
                      {isLawyerProfile ? (
                        <>
                          {lawyerData?.yearsOfExperience && (
                            <div className="flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded-md" style={{ 
                              color: colors.primary[900],
                              backgroundColor: colors.primary[50],
                              borderColor: colors.primary[200]
                            }}>
                              <Award className="w-3 h-3 flex-shrink-0" style={{ color: colors.primary[700] }} />
                              <span className="font-medium">{lawyerData.yearsOfExperience}+ Years</span>
                            </div>
                          )}
                          {lawyerData?.specialty && (
                            <div className="px-2.5 py-1.5 rounded-md" style={{ 
                              backgroundColor: colors.secondary[50],
                              borderColor: colors.secondary[200]
                            }}>
                              <div className="flex items-center space-x-2">
                                <Briefcase className="w-3 h-3 flex-shrink-0" style={{ color: colors.secondary[700] }} />
                                <span className="text-xs font-medium truncate" style={{ color: colors.text }}>{lawyerData.specialty}</span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded-md" style={{ 
                            backgroundColor: colors.secondary[50],
                            borderColor: colors.secondary[200],
                            color: colors.secondary[700]
                          }}>
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium">Since {joinDate}</span>
                          </div>
                          {customerData?.industry && (
                            <div className="px-2.5 py-1.5 rounded-md" style={{ 
                              backgroundColor: colors.secondary[50],
                              borderColor: colors.secondary[200]
                            }}>
                              <div className="flex items-center space-x-2">
                                <Building className="w-3 h-3 flex-shrink-0" style={{ color: colors.secondary[700] }} />
                                <span className="text-xs font-medium truncate" style={{ color: colors.text }}>{customerData.industry}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Professional Bio - Compact */}
                    {(isLawyerProfile && lawyerData?.bio) && (
                      <p className="text-xs line-clamp-1 leading-relaxed" style={{ color: colors.secondary[700] }}>
                        {lawyerData.bio}
                      </p>
                    )}
                    
                    {(!isLawyerProfile && customerData?.needs) && (
                      <p className="text-xs line-clamp-1 leading-relaxed" style={{ color: colors.secondary[700] }}>
                        {customerData.needs}
                      </p>
                    )}

                    {/* Professional Contact Information - Compact */}
                    {isAuthenticated && (
                      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: colors.secondary[200] }}>
                        {profile.email && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Mail className="w-3 h-3 flex-shrink-0" style={{ color: colors.primary[600] }} />
                            <a href={`mailto:${profile.email}`} className="truncate flex-1 font-medium hover:underline" style={{ color: colors.secondary[700] }}>
                              {profile.email}
                            </a>
                          </div>
                        )}
                        {customerData?.phone && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Phone className="w-3 h-3 flex-shrink-0" style={{ color: colors.secondary[600] }} />
                            <a href={`tel:${customerData.phone}`} className="flex-1 font-medium hover:underline" style={{ color: colors.secondary[700] }}>
                              {customerData.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Professional Action Button */}
                    {isAuthenticated && isShowingLawyers && (
                      <>
                        {profile.existingRequest ? (
                          <div className="space-y-2">
                            <Badge
                              variant="outline"
                              className="w-full text-xs font-semibold px-3 py-2"
                              style={{
                                backgroundColor: colors.success[50],
                                color: colors.success[700],
                                borderColor: colors.success[200]
                              }}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-2" />
                              Request {profile.existingRequest.status}
                            </Badge>
                            {profile.existingRequest.status === 'ACCEPTED' && (
                              <Button 
                                className="w-full text-white shadow-sm transition-all hover:shadow-md py-2 rounded-lg"
                                style={{ backgroundColor: colors.primary[700] }}
                                onClick={() => router.push('/inbox')}
                                size="sm"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                <span className="font-semibold text-xs">View Messages</span>
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button 
                            className="w-full text-white shadow-sm transition-all hover:shadow-md py-2 rounded-lg"
                            style={{ backgroundColor: colors.primary[700] }}
                            onClick={() => handleSendRequest(profile)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            <span className="font-semibold text-xs">Send Request</span>
                          </Button>
                        )}
                      </>
                    )}
                    
                    {/* For attorneys viewing clients with consultation requests */}
                    {isAuthenticated && !isShowingLawyers && profile.consultationRequests && profile.consultationRequests.length > 0 && (
                      <div className="pt-3 border-t" style={{ borderColor: colors.secondary[200] }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: colors.text }}>
                          Consultation Requests ({profile.consultationRequests.length})
                        </p>
                        {profile.consultationRequests.slice(0, 1).map(req => (
                          <Badge
                            key={req.id}
                            variant="outline"
                            className="w-full text-xs font-semibold px-3 py-2 mb-2"
                            style={{
                              backgroundColor: colors.primary[50],
                              color: colors.primary[700],
                              borderColor: colors.primary[200]
                            }}
                          >
                            {req.caseType} • {req.status}
                          </Badge>
                        ))}
                        <Button 
                          className="w-full text-white shadow-sm transition-all hover:shadow-md py-2 rounded-lg"
                          style={{ backgroundColor: colors.primary[700] }}
                          onClick={() => router.push('/inbox')}
                          size="sm"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          <span className="font-semibold text-xs">View All Requests</span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
            })}
          </div>
        )}

        </div>

      {/* Consultation Request Modal */}
      {selectedAttorney && (
        <ConsultationRequestModal
          isOpen={showRequestModal}
          onClose={handleCloseRequestModal}
          attorney={selectedAttorney}
          hasReachedLimit={hasReachedLimit}
        />
      )}
    </div>
  )
}

