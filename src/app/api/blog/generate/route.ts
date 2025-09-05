import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ChatXAI } from '@langchain/xai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, prompt } = body

    if (!topic || !prompt) {
      return NextResponse.json(
        { error: 'Topic and prompt are required' },
        { status: 400 }
      )
    }

    // Check if API key is available
    if (!process.env.XAI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Please set XAI_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    // Initialize ChatXAI
    const llm = new ChatXAI({
      apiKey: process.env.XAI_API_KEY,
      model: 'grok-4-latest',
      temperature: 0.7,
    })

    // Generate blog title
    const titleMessages = [
      new SystemMessage(`You are an expert blog title generator. Create compelling, SEO-friendly titles that capture attention and accurately reflect the content.

Rules:
1. Keep titles under 60 characters for SEO
2. Make them engaging and click-worthy
3. Include relevant keywords
4. Avoid clickbait - be accurate
5. Return ONLY the title, no quotes or extra text`),
      new HumanMessage(`Generate a compelling blog title for this topic: "${topic}"

The blog will cover: ${prompt}`)
    ]

    const titleResponse = await llm.invoke(titleMessages)
    const blogTitle = titleResponse.content.toString().trim()

    // Generate blog content
    const contentMessages = [
      new SystemMessage(`You are an expert blog writer. Create comprehensive, well-structured blog posts that are informative, engaging, and professionally written.

Writing Guidelines:
1. Use clear, professional language
2. Structure with proper headings and subheadings
3. Include practical examples where relevant
4. Write in an engaging, conversational tone
5. Ensure content is well-researched and accurate
6. Include a strong introduction and conclusion
7. Use bullet points and lists for better readability
8. Aim for 800-1500 words for comprehensive coverage

Format the blog post in Markdown for proper structure.`),
      new HumanMessage(`Write a comprehensive blog post with the title: "${blogTitle}"

Topic: ${topic}

Detailed requirements: ${prompt}

Please write a complete, professional blog post following the title and requirements above.`)
    ]

    const contentResponse = await llm.invoke(contentMessages)
    const blogContent = contentResponse.content.toString().trim()

    if (!blogTitle || !blogContent) {
      throw new Error('Failed to generate complete blog post')
    }

    // Save the generated blog to database
    const blog = await prisma.blog.create({
      data: {
        title: blogTitle,
        content: blogContent,
        published: false
      }
    })

    return NextResponse.json({ 
      blog,
      generationDetails: {
        topic,
        promptUsed: prompt
      }
    })
  } catch (error) {
    console.error('Error generating blog:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate blog' },
      { status: 500 }
    )
  }
}
