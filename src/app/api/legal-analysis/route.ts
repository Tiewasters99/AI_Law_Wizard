import { NextRequest, NextResponse } from 'next/server'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { OpenRouterService, ChatType } from '../../lib/openRouterService'

interface LegalAnalysisRequest {
  userIssue: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('Legal Analysis API called - checking environment...')
    
    // Debug: Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API key not configured. Please set OPENROUTER_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    console.log('API key found, parsing request body...')
    const body: LegalAnalysisRequest = await request.json()
    const { userIssue } = body
    
    console.log('Request parsed:', { userIssue: userIssue.substring(0, 50) + '...' })

    const analysisPrompt = `
      Analyze the following legal issue in the persona of AI Law Wizard (witty, a bit rebellious, but ultimately insightful and smart). Provide comprehensive guidance.

      LEGAL ISSUE: "${userIssue}"

      Structure your response as a JSON object with the following keys: "summary", "key_points", "recommendations", "legal_areas", "urgency_level", "disclaimer", "recommended_lawyers".
      - summary: A brief, insightful summary of the legal issue.
      - key_points: An array of strings with the main legal points to consider.
      - recommendations: An array of strings with recommended actions or next steps.
      - legal_areas: An array of strings with the relevant areas of law.
      - urgency_level: A string which can be one of: "low", "medium", "high", "urgent".
      - disclaimer: Your standard legal disclaimer, but with a bit of a witty Grok spin.
      - recommended_lawyers: An array of 2-3 lawyer objects, each with the following structure:
        {
          "id": "unique_id",
          "name": "Full Name",
          "title": "Professional Title",
          "specializations": ["Area 1", "Area 2", "Area 3"],
          "experience": "X+ years",
          "rating": 4.7-4.9,
          "reviewCount": 50-200,
          "description": "How this lawyer can specifically help WIN this type of case - be persuasive and case-specific",
          "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"],
          "contactEmail": "email@lawfirm.com",
          "contactPhone": "(555) XXX-XXXX",
          "image": "/images/lawyer-X.jpg"
        }

      IMPORTANT for recommended_lawyers:
      - Generate realistic lawyer profiles that match the specific legal areas identified
      - Each lawyer should specialize in the areas most relevant to this case
      - Descriptions should be tailored to how they can help WIN this specific type of case
      - Use diverse names and backgrounds
      - Make achievements relevant to their specializations
      - Ensure specializations directly match the legal_areas identified
      - Focus on lawyers who can help the user ACHIEVE SUCCESS and WIN their case
    `

    // Create LangChain messages for the legal analysis
    const messages = [
      new SystemMessage('You are AI Law Wizard - witty, a bit rebellious, but ultimately insightful and smart. Provide comprehensive legal guidance with a professional yet approachable tone.'),
      new HumanMessage(analysisPrompt)
    ]

    console.log('Calling OpenRouter with LangChain for legal analysis...')
    
    // Use OpenRouter with wizard model (Grok-4-fast) for faster response
    const openRouterResponse = await OpenRouterService.sendMessage(messages, 'wizard' as ChatType)
    
    console.log('OpenRouter response successful:', {
      modelUsed: openRouterResponse.modelUsed,
      tokenCount: openRouterResponse.tokenCount,
      contentLength: openRouterResponse.content.length
    })

    const responseText = openRouterResponse.content
    console.log('Response text (first 100 chars):', responseText.substring(0, 100) + '...')

    return NextResponse.json({ 
      success: true,
      content: responseText,
      modelUsed: openRouterResponse.modelUsed,
      tokenCount: openRouterResponse.tokenCount
    })
  } catch (error) {
    console.error('Legal Analysis API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Failed to process legal analysis request'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'API key not configured. Please set OPENROUTER_API_KEY in your environment variables.'
        statusCode = 500
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
        statusCode = 429
      } else if (error.message.includes('credits')) {
        errorMessage = 'No credits available. Please check your OpenRouter account.'
        statusCode = 402
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
