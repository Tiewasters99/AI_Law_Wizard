import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const TOKEN_LIMITS = {
  anonymous: 1000,
  registered: 5000
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { currentUsage } = body

    const userId = session?.user?.id
    const limit = userId ? TOKEN_LIMITS.registered : TOKEN_LIMITS.anonymous
    const isValid = currentUsage < limit

    return NextResponse.json({
      success: true,
      isValid,
      limit,
      currentUsage,
      remaining: Math.max(0, limit - currentUsage),
      userId: userId || null
    })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate tokens' },
      { status: 500 }
    )
  }
}

