import { NextRequest, NextResponse } from 'next/server'
import { ChatXAI } from '@langchain/xai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic } = body

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
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

    // Initialize ChatXAI using LangChain
    const llm = new ChatXAI({
      apiKey: process.env.GROK_API_KEY,
      model: 'grok-4-latest',
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Build messages for generating a blog prompt using LangChain message types
    const messages = [
      new SystemMessage(`You are an expert blog prompt generator. Your task is to create detailed, engaging prompts that will help generate high-quality blog posts. 

When given a topic, create a comprehensive prompt that includes:
1. Clear instructions for writing style and tone
2. Specific sections or structure to follow
3. Key points to cover
4. Target audience considerations
5. Call-to-action suggestions

Make the prompt detailed enough to generate a complete, professional blog post.`),
      new HumanMessage(`Create a detailed blog writing prompt for the topic: "${topic}"`)
    ]

    // Use LangChain to invoke the model
    const response = await llm.invoke(messages)
    const prompt = response.content.toString().trim()

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error generating blog prompt:', error)
    
    // Handle specific LangChain/API errors
    let errorMessage = 'Failed to generate blog prompt'
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your GROK_API_KEY environment variable.'
      } else if (error.message.includes('403')) {
        errorMessage = 'No credits available. Please purchase credits on https://console.x.ai/'
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
