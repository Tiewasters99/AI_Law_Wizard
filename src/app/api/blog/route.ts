import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - List all blogs
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ blogs })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}

// POST - Create new blog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const blog = await prisma.blog.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        published: false
      }
    })

    return NextResponse.json({ blog })
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    )
  }
}

// PUT - Update existing blog
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, content } = body

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'ID, title and content are required' },
        { status: 400 }
      )
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ blog })
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blog
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      )
    }

    await prisma.blog.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    )
  }
}
