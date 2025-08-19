import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Check if OneDrive files are synced
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const oneDriveIds = searchParams.get('oneDriveIds')
    
    if (!oneDriveIds) {
      return NextResponse.json({ error: 'oneDriveIds parameter is required' }, { status: 400 })
    }

    const ids = oneDriveIds.split(',').filter(id => id.trim())
    
    if (ids.length === 0) {
      return NextResponse.json({ syncedFiles: [] })
    }

    const syncedFiles = await prisma.embeddingJob.findMany({
      where: {
        oneDriveId: {
          in: ids
        },
        isOneDriveFile: true
      },
      select: {
        oneDriveId: true,
        fileName: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({ syncedFiles })
  } catch (error) {
    console.error('Error checking synced files:', error)
    return NextResponse.json(
      { error: 'Failed to check synced files' },
      { status: 500 }
    )
  }
}
