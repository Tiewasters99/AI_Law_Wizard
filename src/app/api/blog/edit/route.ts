import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ChatXAI } from '@langchain/xai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { blogId, currentContent, editRequest, context } = body

    if (!blogId || !currentContent || !editRequest) {
      return NextResponse.json(
        { error: 'Blog ID, current content, and edit request are required' },
        { status: 400 }
      )
    }

    // Check if API key is available
    if (!process.env.GROK_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Please set GROK_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    // Get the current blog from database for additional context
    const blog = await prisma.blog.findUnique({
      where: { id: blogId }
    })

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }

    // Initialize ChatXAI
    const llm = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-4-latest',
      temperature: 0.7,
    })

    // Build context-aware edit prompt
    const messages = [
      new SystemMessage(`You are an expert blog editor with perfect memory of the content context. Your task is to make intelligent edits to blog posts while maintaining consistency, style, and overall coherence.

Guidelines for editing:
1. Maintain the original tone and writing style
2. Ensure edits flow naturally with existing content
3. Keep the overall structure and format (Markdown)
4. Make sure edits are contextually appropriate
5. Preserve any important information unless specifically asked to change it
6. If the edit request is unclear, make the most reasonable interpretation
7. Return the COMPLETE updated content, not just the changes

Context to remember:
- Blog Title: "${blog.title}"
- Original Topic: Based on the content, understand the main topic and theme
- Writing Style: Analyze and maintain the existing style
- Target Audience: Infer from the content and maintain consistency`),
      new HumanMessage(`Current blog content:
---
${currentContent}
---

${context ? `Additional context from previous edits: ${context}` : ''}

Edit request: ${editRequest}

Please provide the complete updated blog content with the requested changes applied.`)
    ]

    const response = await llm.invoke(messages)
    const updatedContent = response.content.toString().trim()

    // Update the blog in the database
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        content: updatedContent,
        updatedAt: new Date()
      }
    })

    // Store the edit context for future reference
    const editContext = {
      editRequest,
      timestamp: new Date().toISOString(),
      previousContext: context || null
    }

    return NextResponse.json({ 
      blog: updatedBlog,
      editContext,
      success: true
    })
  } catch (error) {
    console.error('Error editing blog:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to edit blog' },
      { status: 500 }
    )
  }
}
