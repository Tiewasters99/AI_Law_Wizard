import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth, getClientIP, getUserAgent } from '@/lib/admin/apiProtection';
import { logAdminAction } from '@/lib/admin/activityLogger';
import { prisma } from '@/lib/backend/prisma';
import { getTopTokenConsumers, getConsumptionTrends } from '@/lib/admin/tokenUtils';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdminAuth(request);
    
    // Calculate user statistics
    const totalUsers = await prisma.user.count();
    const customerCount = await prisma.user.count({ 
      where: { role: 'CUSTOMER' } 
    });
    const attorneyCount = await prisma.user.count({ 
      where: { role: 'ATTORNEY' } 
    });
    
    // Calculate feature statistics
    const enabledFeatures = await prisma.feature.count({ 
      where: { isEnabled: true } 
    });
    const totalFeatures = await prisma.feature.count();
    
    // Calculate token statistics
    const wallets = await prisma.wallet.findMany();
    const totalTokens = wallets.reduce((sum, w) => sum + w.balance, 0);
    const averageTokens = totalUsers > 0 ? totalTokens / totalUsers : 0;
    
    // Calculate revenue for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonthRevenue = await prisma.purchase.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth },
      },
      _sum: { amountPaid: true },
      _count: true,
    });
    
    // Calculate revenue for last month for comparison
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);
    
    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(0);
    endOfLastMonth.setHours(23, 59, 59, 999);
    
    const lastMonthRevenue = await prisma.purchase.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { 
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: { amountPaid: true },
    });
    
    // Calculate percentage changes (mock data for now)
    const userChange = 5; // Mock: 5% increase
    const featureChange = 0; // Mock: no change
    const tokenChange = 12; // Mock: 12% increase
    const revenueChange = lastMonthRevenue._sum.amountPaid 
      ? Math.round(((thisMonthRevenue._sum.amountPaid || 0) - lastMonthRevenue._sum.amountPaid) / lastMonthRevenue._sum.amountPaid * 100)
      : 0;
    
    // Get additional data
    const topConsumers = await getTopTokenConsumers(10);
    const trends = await getConsumptionTrends(30);
    
    const stats = {
      users: {
        total: totalUsers,
        customers: customerCount,
        attorneys: attorneyCount,
        change: userChange,
      },
      features: {
        enabled: enabledFeatures,
        total: totalFeatures,
        change: featureChange,
      },
      tokens: {
        total: totalTokens,
        average: Math.round(averageTokens),
        change: tokenChange,
      },
      revenue: {
        amount: thisMonthRevenue._sum.amountPaid || 0,
        count: thisMonthRevenue._count,
        change: revenueChange,
      },
      topConsumers,
      trends,
    };
    
    // Log the dashboard access
    await logAdminAction({
      adminId: admin.id,
      action: 'LOGIN', // Using LOGIN as a generic admin action
      details: {
        targetType: 'Dashboard',
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        additionalDetails: { action: 'dashboard_stats_viewed' },
      },
    });
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
