import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API called - checking environment...')
    
    // Debug: Check if API key is available
    if (!process.env.GROK_API_KEY) {
      console.error('GROK_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API key not configured. Please set GROK_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    console.log('API key found, parsing request body...')
    const body: ChatRequest = await request.json()
    const { message } = body
    
    console.log('Request parsed:', { message: message.substring(0, 50) + '...' })

    // Build messages array for Grok API
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful legal assistant powered by Grok. Provide clear, accurate legal information and advice. Always remind users to consult with qualified legal professionals for specific legal matters.'
      },
      {
        role: 'user' as const,
        content: message
      }
    ]

    console.log('Messages built, calling Grok API...')
    console.log('API Key (first 10 chars):', process.env.GROK_API_KEY?.substring(0, 10) + '...')

    // Call Grok API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
              headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`
        },
      body: JSON.stringify({
        messages,
        model: 'grok-4-latest',
        stream: false,
        temperature: 0.7
      })
    })

    console.log('Grok API response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('Grok API error:', response.status, errorData)
      
      // Provide specific error messages based on status code
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your GROK_API_KEY environment variable.')
      } else if (response.status === 403) {
        throw new Error('No credits available. Please purchase credits on https://console.x.ai/')
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else {
        throw new Error(`Grok API error: ${response.status} - ${errorData}`)
      }
    }

    console.log('Grok API call successful, parsing response...')
    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format:', data)
      throw new Error('Invalid response format from Grok API')
    }

    const responseText = data.choices[0].message.content
    console.log('Response text (first 100 chars):', responseText.substring(0, 100) + '...')

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error('Chat API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
