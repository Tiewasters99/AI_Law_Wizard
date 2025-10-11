import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's role from the database
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine which users to fetch based on current user's role
    // Attorneys see customers, Customers see attorneys
    const isAttorney = currentUser.role === 'ATTORNEY' || currentUser.role === 'LAWYER';
    const targetRole = isAttorney ? 'CUSTOMER' : 'ATTORNEY'

    // Fetch users with their profiles
    const users = await prisma.user.findMany({
      where: {
        OR: targetRole === 'ATTORNEY' 
          ? [{ role: 'ATTORNEY' }, { role: 'LAWYER' }] // Include both ATTORNEY and legacy LAWYER
          : [{ role: targetRole }],
        profileComplete: true, // Only show users with complete profiles
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        profileData: true,
        createdAt: true,
        lawyerProfile: currentUser.role === 'CUSTOMER' ? {
          select: {
            specialty: true,
            barLicense: true,
            bio: true,
            yearsOfExperience: true,
            firmName: true,
            verified: true,
          }
        } : false,
        customerProfile: isAttorney ? {
          select: {
            companyName: true,
            address: true,
            phone: true,
            industry: true,
            needs: true,
          }
        } : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ 
      users,
      currentUserRole: currentUser.role,
      targetRole,
      success: true 
    })
  } catch (error) {
    console.error('Error fetching directory users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', success: false },
      { status: 500 }
    )
  }
}

