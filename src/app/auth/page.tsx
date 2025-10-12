'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
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
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type AuthTab = 'signin' | 'signup';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ATTORNEY' | 'CUSTOMER'>('CUSTOMER');
  const [isRoleLocked, setIsRoleLocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Handle role parameters from URL
  useEffect(() => {
    const roleParam = searchParams.get('role');
    
    if (roleParam === 'attorney' || roleParam === 'ATTORNEY') {
      setRole('ATTORNEY');
      setIsRoleLocked(true);
      setActiveTab('signup'); // Show signup tab for attorney features
    } else if (roleParam === 'client' || roleParam === 'CUSTOMER') {
      setRole('CUSTOMER');
      setIsRoleLocked(true);
    } else {
      setIsRoleLocked(false);
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
    return true;
  };

  const validateSignIn = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUp = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
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
    
    if (!role) {
      newErrors.role = 'Please select your role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignIn()) {
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
        localStorage.setItem('rememberedEmail', email);
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to AI Law Wizard.",
        });
        
        setTimeout(async () => {
          const sessionResponse = await fetch('/api/auth/session');
          const session = await sessionResponse.json();
          
          if (session?.user?.profileComplete) {
            router.push('/');
          } else {
            router.push('/profile-setup');
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) {
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
          role,
        }),
      });

      if (res.ok) {
        localStorage.setItem('rememberedEmail', email);
        
        toast({
          title: "Account Created!",
          description: `Welcome! Your ${role === 'ATTORNEY' ? 'attorney' : 'client'} account has been created with 5,000 free tokens.`,
        });
        
        const signInResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (signInResult?.ok) {
          router.push('/');
        } else {
          setActiveTab('signin');
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

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
            className="w-full max-w-2xl"
          >
            <Card 
              className="relative shadow-2xl border-0"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(226, 232, 240, 0.5)',
              }}
            >
              <CardHeader className="text-center pb-6">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center p-2 shadow-lg border border-white/20">
                      <Image
                        src="/images/ai_law_wizard_logo_v1.png"
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

                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  AI Law Wizard
                </CardTitle>
                
                <p className="text-gray-600 text-sm">
                  Your AI-powered legal assistant
                </p>

                {/* Tab Switcher */}
                <div 
                  className="flex gap-2 p-1 rounded-lg mt-6 mx-auto max-w-sm"
                  style={{
                    backgroundColor: 'rgba(241, 245, 249, 0.4)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                  }}
                >
                  <button
                    onClick={() => setActiveTab('signin')}
                    className="flex-1 py-1.5 px-4 rounded-md text-sm font-medium transition-all duration-200 relative overflow-hidden whitespace-nowrap"
                    style={{
                      background: activeTab === 'signin' 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)'
                        : 'transparent',
                      backdropFilter: activeTab === 'signin' ? 'blur(12px)' : 'none',
                      color: activeTab === 'signin' ? '#ffffff' : '#64748b',
                      boxShadow: activeTab === 'signin' 
                        ? '0 4px 12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                        : 'none',
                      border: activeTab === 'signin' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'signin') {
                        e.currentTarget.style.backgroundColor = 'rgba(226, 232, 240, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'signin') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className="flex-1 py-1.5 px-4 rounded-md text-sm font-medium transition-all duration-200 relative overflow-hidden whitespace-nowrap"
                    style={{
                      background: activeTab === 'signup' 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)'
                        : 'transparent',
                      backdropFilter: activeTab === 'signup' ? 'blur(12px)' : 'none',
                      color: activeTab === 'signup' ? '#ffffff' : '#64748b',
                      boxShadow: activeTab === 'signup' 
                        ? '0 4px 12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                        : 'none',
                      border: activeTab === 'signup' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'signup') {
                        e.currentTarget.style.backgroundColor = 'rgba(226, 232, 240, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'signup') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                  {/* Sign In Form */}
                  {activeTab === 'signin' && (
                    <motion.form
                      key="signin"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSignIn}
                      className="space-y-5"
                    >
                      {/* Email Field */}
                      <div className="space-y-2">
                        <label htmlFor="signin-email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors(prev => ({...prev, email: ''}));
                            }}
                            className={`pl-10 h-12 transition-all duration-200 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-blue-500'}`}
                            disabled={isLoading}
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

                      {/* Password Field */}
                      <div className="space-y-2">
                        <label htmlFor="signin-password" className="text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="signin-password"
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

                      {/* Forgot Password Link */}
                      <div className="flex items-center justify-end">
                        <Link 
                          href="/forgot-password" 
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      {/* Sign In Button */}
                      <Button 
                        type="submit" 
                        className="w-full h-10 text-white font-medium rounded-md transition-all duration-200 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        }}
                        disabled={isLoading}
                        onMouseEnter={(e) => {
                          if (!isLoading) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(126, 34, 206, 0.95) 100%)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoading) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                          }
                        }}
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
                    </motion.form>
                  )}

                  {/* Sign Up Form */}
                  {activeTab === 'signup' && (
                    <motion.form
                      key="signup"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSignUp}
                      className="space-y-5"
                    >
                      {/* Role Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                          Select Your Role {isRoleLocked && <span className="text-gray-500 text-xs">(Pre-selected)</span>}
                        </label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Client Card */}
                          {(!isRoleLocked || role === 'CUSTOMER') && (
                            <motion.button
                              type="button"
                              whileHover={!isRoleLocked || role === 'CUSTOMER' ? { y: -2 } : {}}
                              onClick={() => {
                                if (!isRoleLocked) {
                                  setRole('CUSTOMER');
                                  if (errors.role) setErrors(prev => ({...prev, role: ''}));
                                }
                              }}
                              disabled={isRoleLocked && role !== 'CUSTOMER'}
                              className={`relative p-6 rounded-xl transition-all duration-200 text-center ${
                                isRoleLocked && role !== 'CUSTOMER' ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              style={{
                                backgroundColor: role === 'CUSTOMER' ? 'rgba(239, 246, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(12px)',
                                border: role === 'CUSTOMER' ? '2px solid #3b82f6' : '1px solid rgba(226, 232, 240, 0.5)',
                                boxShadow: role === 'CUSTOMER' ? '0 4px 6px -1px rgba(59, 130, 246, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              {role === 'CUSTOMER' && (
                                <div className="absolute top-3 right-3">
                                  <CheckCircle className="w-6 h-6 text-blue-600" />
                                </div>
                              )}
                              <div className="text-5xl mb-3">👤</div>
                              <h3 className={`text-lg font-bold mb-2 ${
                                role === 'CUSTOMER' ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                                Client
                              </h3>
                              <p className="text-sm text-gray-600">
                                Seeking legal guidance and services
                              </p>
                            </motion.button>
                          )}

                          {/* Attorney Card */}
                          {(!isRoleLocked || role === 'ATTORNEY') && (
                            <motion.button
                              type="button"
                              whileHover={!isRoleLocked || role === 'ATTORNEY' ? { y: -2 } : {}}
                              onClick={() => {
                                if (!isRoleLocked) {
                                  setRole('ATTORNEY');
                                  if (errors.role) setErrors(prev => ({...prev, role: ''}));
                                }
                              }}
                              disabled={isRoleLocked && role !== 'ATTORNEY'}
                              className={`relative p-6 rounded-xl transition-all duration-200 text-center ${
                                isRoleLocked && role !== 'ATTORNEY' ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              style={{
                                backgroundColor: role === 'ATTORNEY' ? 'rgba(240, 253, 244, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(12px)',
                                border: role === 'ATTORNEY' ? '2px solid #10b981' : '1px solid rgba(226, 232, 240, 0.5)',
                                boxShadow: role === 'ATTORNEY' ? '0 4px 6px -1px rgba(16, 185, 129, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              {role === 'ATTORNEY' && (
                                <div className="absolute top-3 right-3">
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                              )}
                              <div className="text-5xl mb-3">⚖️</div>
                              <h3 className={`text-lg font-bold mb-2 ${
                                role === 'ATTORNEY' ? 'text-green-700' : 'text-gray-900'
                              }`}>
                                Attorney
                              </h3>
                              <p className="text-sm text-gray-600">
                                Legal professional providing services
                              </p>
                            </motion.button>
                          )}
                        </div>
                        
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
                        <label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="signup-name"
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

                      {/* Email Field */}
                      <div className="space-y-2">
                        <label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors(prev => ({...prev, email: ''}));
                            }}
                            className={`pl-10 h-12 transition-all duration-200 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-blue-500'}`}
                            disabled={isLoading}
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

                      {/* Password Field */}
                      <div className="space-y-2">
                        <label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="signup-password"
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

                      {/* Confirm Password Field */}
                      <div className="space-y-2">
                        <label htmlFor="signup-confirm-password" className="text-sm font-medium text-gray-700">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="signup-confirm-password"
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

                      {/* Sign Up Button */}
                      <Button 
                        type="submit" 
                        className="w-full h-10 text-white font-medium rounded-md transition-all duration-200 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        }}
                        disabled={isLoading}
                        onMouseEnter={(e) => {
                          if (!isLoading) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(126, 34, 206, 0.95) 100%)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoading) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                          }
                        }}
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
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Divider - Temporarily Removed */}
                {/* <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div> */}

                {/* Google Sign In - Temporarily Removed */}
                {/* <GoogleSignIn /> */}
              </CardContent>
            </Card>
          </motion.div>
        </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
