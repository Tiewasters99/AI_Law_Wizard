'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/app/components/Layout';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { useToast } from '@/app/components/ui/use-toast';
import { GoogleSignIn } from '@/app/components/auth/GoogleSignIn';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Shield, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type AuthStep = 'email' | 'password' | 'register';

interface UserInfo {
  exists: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    profileComplete: boolean;
  } | null;
}

function AuthPageContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ATTORNEY' | 'CUSTOMER'>('CUSTOMER'); // Only used for URL-locked existing users
  const [isRoleLocked, setIsRoleLocked] = useState(false); // Track if role is locked from URL for sign-in
  const [feature, setFeature] = useState<'home' | 'directory' | 'attorney-features' | null>(null); // Track feature source
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, []);

  // Handle role and feature parameters from URL
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const featureParam = searchParams.get('feature');
    
    // Set role if provided
    if (roleParam === 'attorney' || roleParam === 'ATTORNEY') {
      setRole('ATTORNEY');
      setIsRoleLocked(true); // Lock role to ATTORNEY
    } else if (roleParam === 'client' || roleParam === 'CUSTOMER') {
      setRole('CUSTOMER');
      setIsRoleLocked(true); // Lock role to CUSTOMER
    } else {
      setIsRoleLocked(false); // Allow role selection if no param
    }
    
    // Set feature source if provided
    if (featureParam === 'home' || featureParam === 'directory' || featureParam === 'attorney-features') {
      setFeature(featureParam as 'home' | 'directory' | 'attorney-features');
      // Store in localStorage for OAuth callback
      localStorage.setItem('auth_feature', featureParam);
      if (roleParam) {
        localStorage.setItem('auth_preselected_role', roleParam);
      }
    }
  }, [searchParams]);

  const validateEmail = () => {
    if (!email) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validatePassword = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (step === 'register') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegistration = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!role) {
      newErrors.role = 'Please select your role';
    }
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkEmailExists = async () => {
    if (!validateEmail()) return;

    setIsCheckingEmail(true);
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to check email');
      }

      const data: UserInfo = await response.json();
      setUserInfo(data);

      if (data.exists) {
        // Check if existing user's role matches the locked role (if any)
        if (isRoleLocked && data.user?.role) {
          const expectedRole = role; // The locked role from URL
          const actualRole = data.user.role;
          
          if (expectedRole !== actualRole) {
            const expectedRoleText = expectedRole === 'ATTORNEY' ? 'Attorney' : 'Client';
            const actualRoleText = actualRole === 'LAWYER' ? 'Attorney' : 'Client';
            
            toast({
              title: "Role Mismatch",
              description: `This account is registered as ${actualRoleText}. Please sign in from the appropriate page.`,
              variant: "destructive"
            });
            
            // Redirect to appropriate auth page after a delay
            setTimeout(() => {
              const correctRole = actualRole === 'LAWYER' ? 'attorney' : 'client';
              router.push(`/auth?role=${correctRole}`);
            }, 2000);
            
            return;
          }
        }
        
        setStep('password');
        toast({
          title: "Welcome back!",
          description: `Found your account. Please enter your password.`,
        });
      } else {
        setStep('register');
        toast({
          title: "Create your account",
          description: "This email is not registered. Let's create your account.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      toast({
        title: "Validation Error",
        description: "Please check your input and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive"
        });
      } else {
        // Remember email
        localStorage.setItem('rememberedEmail', email);
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to AI Law Wizard.",
        });
        
        // Check profile completion status and redirect accordingly
        // Use a small delay to ensure session is updated
        setTimeout(async () => {
          const sessionResponse = await fetch('/api/auth/session');
          const session = await sessionResponse.json();
          
          if (session?.user?.profileComplete) {
            router.push('/'); // Profile complete, go home
          } else {
            router.push('/profile-setup'); // OAuth user, needs role
          }
        }, 500);
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegistration()) {
      toast({
        title: "Validation Error",
        description: "Please check your input and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email,
          password,
          role, // Include role in registration
        }),
      });

      if (res.ok) {
        // Remember email
        localStorage.setItem('rememberedEmail', email);
        
        toast({
          title: "Account Created!",
          description: `Welcome! Your ${role === 'ATTORNEY' ? 'attorney' : 'client'} account has been created with 5,000 free tokens.`,
        });
        
        // Auto sign-in after registration
        const signInResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (signInResult?.ok) {
          // Redirect to home since profile is complete
          router.push('/');
        } else {
          // If auto sign-in fails, switch to password step
          setStep('password');
          setUserInfo({ exists: true, user: null });
        }
      } else {
        const data = await res.json();
        toast({
          title: "Registration Failed",
          description: data.message || 'Unable to create account. Please try again.',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'password' || step === 'register') {
      setStep('email');
      setUserInfo(null);
      setErrors({});
      // Reset role to locked role if it was locked, otherwise keep current
      if (isRoleLocked) {
        const roleParam = searchParams.get('role');
        if (roleParam === 'attorney') {
          setRole('ATTORNEY');
        } else if (roleParam === 'client') {
          setRole('CUSTOMER');
        }
      }
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Sign in to AI Law Wizard';
      case 'password':
        return `Welcome back, ${userInfo?.user?.name || 'there'}!`;
      case 'register':
        return 'Create your account';
      default:
        return 'AI Law Wizard';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        // For email step, show role from URL if locked
        if (isRoleLocked) {
          const roleText = role === 'ATTORNEY' ? 'Attorney' : 'Client';
          return `Enter your email address to get started as a ${roleText}`;
        }
        return 'Enter your email address to sign in';
      case 'password':
        // For existing users, show their actual role from database
        if (userInfo?.user?.role) {
          const roleText = userInfo.user.role === 'ATTORNEY' || userInfo.user.role === 'LAWYER' ? 'Attorney' : 'Client';
          return `Welcome back! You're signing in as a ${roleText}`;
        }
        return 'Enter your password to continue';
      case 'register':
        return 'Complete your account details';
      default:
        return '';
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="relative backdrop-blur-sm bg-white/90 shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center p-2 shadow-lg border border-white/20">
                    <Image
                      src="/images/logo_icon.png"
                      alt="AI Law Wizard Logo"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {getStepTitle()}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {getStepDescription()}
              </CardDescription>
              
              {/* Role Indicator - only show for existing users or locked sign-in */}
              {((step === 'password' && userInfo?.user?.role) || 
                (step === 'email' && isRoleLocked)) && (
                <div className="flex justify-center mt-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    (() => {
                      // For existing users (password step), use their actual role from database
                      if (step === 'password' && userInfo?.user?.role) {
                        return (userInfo.user.role === 'ATTORNEY' || userInfo.user.role === 'LAWYER')
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200';
                      }
                      // For new users with locked role, use the locked role
                      return role === 'ATTORNEY' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200';
                    })()
                  }`}>
                    {(() => {
                      // For existing users (password step), use their actual role from database
                      if (step === 'password' && userInfo?.user?.role) {
                        return (userInfo.user.role === 'ATTORNEY' || userInfo.user.role === 'LAWYER') ? '⚖️ Attorney' : '👤 Client';
                      }
                      // For new users with locked role
                      return role === 'ATTORNEY' ? '⚖️ Attorney' : '👤 Client';
                    })()}
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">

              {/* Back button for password/register steps */}
              {(step === 'password' || step === 'register') && (
                <Button
                  variant="ghost"
                  onClick={goBack}
                  className="w-full mb-4 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change email address</span>
                </Button>
              )}
              
              {/* Info about locked role - only show on email step when role is locked */}
              {step === 'email' && isRoleLocked && (
                <div className="flex justify-center mb-4">
                  <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                    Signing in as {role === 'ATTORNEY' ? 'Attorney' : 'Client'}
                  </div>
                </div>
              )}

              {/* Email Step */}
              {step === 'email' && (
                <form onSubmit={(e) => { e.preventDefault(); checkEmailExists(); }} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({...prev, email: ''}));
                        }}
                        className={`pl-10 h-12 transition-all duration-200 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-blue-500'}`}
                        disabled={isCheckingEmail}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p 
                          className="text-sm text-red-500 flex items-center gap-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
                    disabled={isCheckingEmail}
                  >
                    {isCheckingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Password Step */}
              {step === 'password' && (
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                            if (errors.password) setErrors(prev => ({...prev, password: ''}));
                        }}
                        className={`pl-10 pr-10 h-12 transition-all duration-200 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-blue-500'}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p 
                          className="text-sm text-red-500 flex items-center gap-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              )}

              {/* Register Step */}
              {step === 'register' && (
                <form onSubmit={handleRegister} className="space-y-5">
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Select Your Role {isRoleLocked && <span className="text-gray-500">(Pre-selected)</span>}
                    </label>
                    
                    {!isRoleLocked || feature === 'home' || feature === 'directory' ? (
                      <div className="grid grid-cols-2 gap-3">
                        {/* Client/Customer Role */}
                        {(!isRoleLocked || (isRoleLocked && role === 'CUSTOMER')) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!isRoleLocked) {
                                setRole('CUSTOMER');
                                if (errors.role) setErrors(prev => ({...prev, role: ''}));
                              }
                            }}
                            disabled={isRoleLocked && role !== 'CUSTOMER'}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              role === 'CUSTOMER'
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                            } ${isRoleLocked && role !== 'CUSTOMER' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {role === 'CUSTOMER' && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                            <div className="text-center mb-2">
                              <div className="text-3xl mb-2">👤</div>
                              <h3 className={`text-base font-bold mb-1 ${
                                role === 'CUSTOMER' ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                                Client
                              </h3>
                            </div>
                            <p className="text-xs text-gray-600 text-center">
                              Seeking legal guidance and services
                            </p>
                          </button>
                        )}

                        {/* Attorney Role */}
                        {(!isRoleLocked || (isRoleLocked && role === 'ATTORNEY')) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!isRoleLocked) {
                                setRole('ATTORNEY');
                                if (errors.role) setErrors(prev => ({...prev, role: ''}));
                              }
                            }}
                            disabled={isRoleLocked && role !== 'ATTORNEY'}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              role === 'ATTORNEY'
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                            } ${isRoleLocked && role !== 'ATTORNEY' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {role === 'ATTORNEY' && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                            )}
                            <div className="text-center mb-2">
                              <div className="text-3xl mb-2">⚖️</div>
                              <h3 className={`text-base font-bold mb-1 ${
                                role === 'ATTORNEY' ? 'text-green-700' : 'text-gray-900'
                              }`}>
                                Attorney
                              </h3>
                            </div>
                            <p className="text-xs text-gray-600 text-center">
                              Legal professional providing services
                            </p>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Single role display for locked attorney-features */
                      <div className="flex justify-center">
                        <div className="relative p-4 rounded-xl border-2 border-green-500 bg-green-50 shadow-md max-w-xs w-full">
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="text-center mb-2">
                            <div className="text-3xl mb-2">⚖️</div>
                            <h3 className="text-base font-bold mb-1 text-green-700">
                              Attorney
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600 text-center">
                            Legal professional providing services
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <AnimatePresence>
                      {errors.role && (
                        <motion.p 
                          className="text-sm text-red-500 flex items-center gap-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.role}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors(prev => ({...prev, name: ''}));
                        }}
                        className={`pl-10 h-12 transition-all duration-200 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-blue-500'}`}
                        disabled={isLoading}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p 
                          className="text-sm text-red-500 flex items-center gap-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors(prev => ({...prev, password: ''}));
                          }}
                          className={`pl-10 pr-10 h-12 transition-all duration-200 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-blue-500'}`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p 
                            className="text-sm text-red-500 flex items-center gap-1"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors(prev => ({...prev, confirmPassword: ''}));
                          }}
                          className={`pl-10 pr-10 h-12 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-blue-500'}`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {errors.confirmPassword && (
                          <motion.p 
                            className="text-sm text-red-500 flex items-center gap-1"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              )}

              {/* Google Sign In - only show on email step */}
              {step === 'email' && (
                <>
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <GoogleSignIn />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </Layout>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
