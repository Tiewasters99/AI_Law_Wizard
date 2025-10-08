'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/stores/authStore'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/app/components/Layout'
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Star, 
  Award,
  Scale,
  FileText,
  Phone,
  Mail,
  Calendar,
  Shield,
  Lock,
  LogIn,
  UserPlus,
  MessageSquare,
  Building,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'

interface DirectoryUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: 'LAWYER' | 'CUSTOMER'
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
  const [targetRole, setTargetRole] = useState<'LAWYER' | 'CUSTOMER' | null>(null)

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

  const isShowingLawyers = targetRole === 'LAWYER'
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
      <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden relative">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Compact Header Section */}
        <div className="bg-white/40 backdrop-blur-xl border-b border-white/60 shadow-sm py-5 relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {isShowingLawyers || !isAuthenticated ? 'Attorney Directory' : 'Client Directory'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {isShowingLawyers || !isAuthenticated ? 'Find expert legal assistance' : 'Connect with clients'}
                  </p>
                </div>
              </div>
              
              {isAuthenticated && (
                <div className="hidden sm:flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{profiles.length} Available</span>
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
        
        {/* Unauthenticated Overlay - Glassmorphic Sign In */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/30 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-center"
            >
              <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-12 max-w-lg mx-4 shadow-2xl border border-white/60 relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                {/* Icon with gradient background */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
                  <Scale className="w-12 h-12 text-white" />
                </div>
                
                {/* Title */}
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  Sign In to Continue
                </h2>
                
                {/* Subtitle */}
                <p className="text-gray-700 text-lg mb-8 max-w-sm mx-auto">
                  Access our directory of expert attorneys and start your legal journey today
                </p>

                {/* Single Sign In Button */}
                <Button
                  onClick={() => router.push('/auth')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                >
                  <LogIn className="w-6 h-6 mr-3" />
                  Sign In
                </Button>

                {/* Trust indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>Verified Attorneys</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Profiles Grid - Show for all users, blur for guests */}
        {(!loading && !error && (users.length > 0 || !isAuthenticated)) && (
          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full overflow-auto pb-4 ${!isAuthenticated ? 'blur-[2px] pointer-events-none' : ''}`}>
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
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <Card className="h-full bg-white/70 backdrop-blur-xl hover:bg-white/90 hover:shadow-2xl hover:shadow-blue-300/30 hover:-translate-y-2 transition-all duration-300 border border-white/60 shadow-lg overflow-hidden">
                  {/* Gradient Top Border */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {profile.image ? (
                            <img src={profile.image} alt={profile.name || 'User'} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span>{isLawyerProfile ? '⚖️' : '👤'}</span>
                          )}
                          </div>
                          {/* Status indicator dot */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                            {profile.name || 'Anonymous User'}
                          </CardTitle>
                          <p className="text-sm text-gray-600 font-medium mt-1">
                            {isLawyerProfile 
                              ? (lawyerData?.firmName || 'Attorney')
                              : (customerData?.companyName || 'Individual Client')
                            }
                          </p>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={isLawyerProfile && lawyerData?.verified ? 'default' : 'secondary'}
                        className={`${isLawyerProfile && lawyerData?.verified ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'} text-white border-0 shadow-md`}
                      >
                        {isLawyerProfile ? (lawyerData?.verified ? '✓ Verified' : 'Attorney') : 'Client'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 relative z-10">
                    {/* Lawyer: Experience | Customer: Join Date */}
                    <div className="flex items-center justify-between">
                      {isLawyerProfile ? (
                        <>
                          {lawyerData?.yearsOfExperience && (
                            <div className="flex items-center space-x-2 text-sm text-gray-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                              <Award className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold">{lawyerData.yearsOfExperience}+ years</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center space-x-2 text-sm text-gray-700 bg-purple-50 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">{joinDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Lawyer: Specialty | Customer: Industry */}
                    {isLawyerProfile && lawyerData?.specialty && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 rounded-lg border border-indigo-100">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-900">{lawyerData.specialty}</span>
                        </div>
                      </div>
                    )}

                    {!isLawyerProfile && customerData?.industry && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-2 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">{customerData.industry}</span>
                        </div>
                      </div>
                    )}

                    {/* Bio - compact */}
                    {(isLawyerProfile && lawyerData?.bio) && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {lawyerData.bio}
                      </p>
                    )}
                    
                    {(!isLawyerProfile && customerData?.needs) && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {customerData.needs}
                      </p>
                    )}

                    {/* Contact Information - Only visible when authenticated */}
                    {isAuthenticated && (
                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        {profile.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <a href={`mailto:${profile.email}`} className="truncate flex-1">
                              {profile.email}
                            </a>
                          </div>
                        )}
                        {customerData?.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                              <Phone className="w-4 h-4 text-purple-600" />
                            </div>
                            <a href={`tel:${customerData.phone}`} className="flex-1">
                              {customerData.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    {isAuthenticated && (
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                        onClick={() => {
                          console.log(`${isShowingLawyers ? 'Booking consultation with' : 'Connecting with client'} ${profile.name}`)
                        }}
                      >
                        {isShowingLawyers ? (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-semibold">Book Consultation</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            <span className="font-semibold">Connect</span>
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

