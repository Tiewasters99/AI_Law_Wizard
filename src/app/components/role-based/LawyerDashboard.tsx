'use client';

import React from 'react';
import { useAuth } from '@/app/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import Layout from '@/app/components/Layout';
import { 
  FileText, 
  Zap, 
  DollarSign, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export const LawyerDashboard: React.FC = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Document Analysis',
      description: 'Analyze legal documents with AI',
      icon: FileText,
      href: '/wizard',
      color: 'bg-blue-500',
      badge: 'Popular'
    },
    {
      title: 'Token Management',
      description: 'View and manage your tokens',
      icon: DollarSign,
      href: '/tokens',
      color: 'bg-green-500'
    },
    {
      title: 'Client Consultation',
      description: 'Start a consultation session',
      icon: Users,
      href: '/consultation',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View usage analytics',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-orange-500'
    }
  ];

  const stats = [
    {
      title: 'Total Tokens',
      value: '1,250',
      change: '+12%',
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      title: 'Documents Processed',
      value: '48',
      change: '+8',
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: 'Active Sessions',
      value: '3',
      change: '+1',
      icon: Clock,
      color: 'text-green-500'
    },
    {
      title: 'Success Rate',
      value: '94%',
      change: '+2%',
      icon: CheckCircle,
      color: 'text-purple-500'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Document Analysis',
      description: 'Contract review completed',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      action: 'Token Purchase',
      description: '500 tokens added to account',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: 3,
      action: 'Client Consultation',
      description: 'New consultation started',
      time: '2 days ago',
      status: 'active'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Dashboard Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name || 'Attorney'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Ready to tackle your legal tasks with AI assistance
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Professional Account
                </Badge>
                <Button asChild>
                  <Link href="/wizard">
                    <Plus className="w-4 h-4 mr-2" />
                    New Analysis
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Start working on your legal tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${action.color} text-white`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                                {action.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {action.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                              <Button asChild variant="outline" size="sm">
                                <Link href={action.href}>Get Started</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/query-history">View All Activity</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};
