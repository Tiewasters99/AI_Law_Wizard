import { NextRequest, NextResponse } from 'next/server'

interface LegalAnalysisRequest {
  userIssue: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('Legal Analysis API called - checking environment...')
    
    // Debug: Check if API key is available
    if (!process.env.XAI_API_KEY) {
      console.error('GROK_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API key not configured. Please set GROK_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    console.log('API key found, parsing request body...')
    const body: LegalAnalysisRequest = await request.json()
    const { userIssue } = body
    
    console.log('Request parsed:', { userIssue: userIssue.substring(0, 50) + '...' })

    const analysisPrompt = `
      Analyze the following legal issue in the persona of Grok (witty, a bit rebellious, but ultimately insightful and smart). Provide comprehensive guidance.

      LEGAL ISSUE: "${userIssue}"

      Structure your response as a JSON object with the following keys: "summary", "key_points", "recommendations", "legal_areas", "urgency_level", "disclaimer".
      - summary: A brief, insightful summary of the legal issue.
      - key_points: An array of strings with the main legal points to consider.
      - recommendations: An array of strings with recommended actions or next steps.
      - legal_areas: An array of strings with the relevant areas of law.
      - urgency_level: A string which can be one of: "low", "medium", "high", "urgent".
      - disclaimer: Your standard legal disclaimer, but with a bit of a witty Grok spin.
    `

    console.log('Analysis prompt created, calling Grok API...')
    console.log('API Key (first 10 chars):', process.env.XAI_API_KEY?.substring(0, 10) + '...')

    // Call Grok API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
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

    return NextResponse.json({ 
      success: true,
      content: responseText 
    })
  } catch (error) {
    console.error('Legal Analysis API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process legal analysis request' },
      { status: 500 }
    )
  }
}
