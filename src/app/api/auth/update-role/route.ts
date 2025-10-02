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

    const { role } = await request.json();

    if (!role || !['LAWYER', 'CUSTOMER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update user role and mark profile as complete in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        role,
        profileComplete: true // Mark profile as complete when role is selected
      },
      include: {
        lawyerProfile: true,
        customerProfile: true,
      },
    });

    // Create appropriate profile if it doesn't exist
    if (role === 'LAWYER' && !updatedUser.lawyerProfile) {
      await prisma.lawyerProfile.create({
        data: {
          userId: session.user.id,
        },
      });
    } else if (role === 'CUSTOMER' && !updatedUser.customerProfile) {
      await prisma.customerProfile.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      role: updatedUser.role 
    });

  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
