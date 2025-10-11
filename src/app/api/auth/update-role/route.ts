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

    if (!role || !['ATTORNEY', 'LAWYER', 'CUSTOMER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Normalize LAWYER to ATTORNEY for backward compatibility
    const normalizedRole = role === 'LAWYER' ? 'ATTORNEY' : role;

    // Update user role and mark profile as complete in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        role: normalizedRole,
        profileComplete: true // Mark profile as complete when role is selected
      },
      include: {
        lawyerProfile: true,
        customerProfile: true,
      },
    });

    // Create appropriate profile if it doesn't exist
    if (normalizedRole === 'ATTORNEY' && !updatedUser.lawyerProfile) {
      await prisma.lawyerProfile.create({
        data: {
          userId: session.user.id,
        },
      });
    } else if (normalizedRole === 'CUSTOMER' && !updatedUser.customerProfile) {
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
