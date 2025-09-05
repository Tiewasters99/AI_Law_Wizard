import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Toggle publish status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, published } = body

    if (!id || typeof published !== 'boolean') {
      return NextResponse.json(
        { error: 'Blog ID and published status are required' },
        { status: 400 }
      )
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        published,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ blog })
  } catch (error) {
    console.error('Error updating blog publish status:', error)
    return NextResponse.json(
      { error: 'Failed to update blog publish status' },
      { status: 500 }
    )
  }
}
