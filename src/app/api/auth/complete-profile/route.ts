import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profileData = await request.json();
    const { role, ...otherData } = profileData;

    // Get current user to check role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        lawyerProfile: true,
        customerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update profile based on user role
    if ((user.role === 'ATTORNEY' || user.role === 'LAWYER') && user.lawyerProfile) {
      await prisma.lawyerProfile.update({
        where: { userId: session.user.id },
        data: {
          specialty: otherData.specialty,
          barLicense: otherData.barLicense,
          bio: otherData.bio,
          yearsOfExperience: otherData.yearsOfExperience,
          firmName: otherData.firmName,
        },
      });
    } else if (user.role === 'CUSTOMER' && user.customerProfile) {
      await prisma.customerProfile.update({
        where: { userId: session.user.id },
        data: {
          companyName: otherData.companyName,
          address: otherData.address,
          phone: otherData.phone,
          industry: otherData.industry,
          needs: otherData.needs,
        },
      });
    }

    // Mark profile as complete
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        profileComplete: true,
        profileData: otherData,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Profile completed successfully' 
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete profile' },
      { status: 500 }
    );
  }
}
