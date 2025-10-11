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

    // Step 1: Analyze the question and generate appropriate response structure
    console.log('Step 1: Analyzing question to determine optimal response format...')
    
    const formatAnalysisPrompt = `
      You are a LEGAL CONTENT STRATEGIST designing the BEST possible response structure for this legal question.

      LEGAL QUESTION: "${userIssue}"

      As a legal content strategist, you have COMPLETE FREEDOM to design the optimal legal information format.
      
      Consider from a legal content strategy perspective:
      - What legal information structure would best serve this question?
      - How many sections are needed? (can be 2, 3, 5, 10, or any number)
      - What should each section be called from a legal content perspective?
      - What legal content should each section contain?
      - Should there be legal comparisons, statutory timelines, compliance checklists, legal framework explanations, case examples, etc.?
      - What legal disclaimers, warnings, or attorney recommendations should be naturally integrated?
      - How to balance legal accuracy with accessibility for non-lawyers?
      
      **YOUR ROLE AS LEGAL CONTENT STRATEGIST:**
      - Design legal content that is accurate, comprehensive, and properly structured
      - Consider what legal concepts, statutes, precedents, or frameworks need explanation
      - Think about legal context, jurisdictional variations, and practical implications
      - Include legal disclaimers and attorney consultation recommendations where strategically appropriate
      - Balance thoroughness with clarity for someone seeking legal understanding
      - Create a structure that serves both immediate answers and deeper legal context
      
      Return ONLY a JSON object with this structure:
      {
        "sections": [
          {"name": "Section Name", "description": "What this section should cover"},
          {"name": "Another Section", "description": "What this section should cover"},
          ...
        ]
      }
      
      Design the OPTIMAL legal content format for THIS question - complete creative freedom as a legal content strategist.
    `

    const formatMessages = [
      new SystemMessage('You are a legal content strategist specializing in structuring legal information. Design optimal response structures for legal questions that balance accuracy, comprehensiveness, and accessibility. Return only valid JSON.'),
      new HumanMessage(formatAnalysisPrompt)
    ]

    console.log('Calling OpenRouter for format analysis...')
    const formatResponse = await OpenRouterService.sendMessage(formatMessages, 'wizard' as ChatType)
    
    console.log('Format analysis complete:', {
      modelUsed: formatResponse.modelUsed,
      tokenCount: formatResponse.tokenCount
    })

    // Parse the format structure
    let responseStructure
    try {
      // Extract JSON from potential markdown code blocks
      let jsonText = formatResponse.content.trim()
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim()
      }
      responseStructure = JSON.parse(jsonText)
      console.log('Parsed response structure:', JSON.stringify(responseStructure, null, 2))
    } catch (parseError) {
      console.error('Failed to parse format structure, using default:', parseError)
      // Fallback to a simple structure
      responseStructure = {
        sections: [
          { name: "Response", description: "Answer to the user's question" }
        ]
      }
    }

    // Step 2: Generate content following the custom structure
    console.log('Step 2: Generating content with custom format...')
    
    const sectionsOutline = responseStructure.sections.map((section: any, index: number) => 
      `## **${index + 1}. ${section.name}**\n${section.description}`
    ).join('\n\n')

    const analysisPrompt = `
      You are a LEGAL CONTENT STRATEGIST providing comprehensive legal information to users.

      LEGAL QUESTION: "${userIssue}"

      **Response structure designed by legal content strategist:**

      ${sectionsOutline}

      **Your task as legal content strategist:**
      - Provide accurate, comprehensive legal information following the strategic structure above
      - Address the user's question with appropriate legal depth and context
      - Use proper legal terminology and cite relevant laws, statutes, regulations, or legal principles
      - Explain legal frameworks, precedents, and jurisdictional considerations where relevant
      - Include legal disclaimers, attorney consultation recommendations, and warnings strategically where they add value
      - Consider both immediate legal answers and broader legal context the user should understand
      - Balance legal accuracy with accessibility for non-lawyers
      - Provide practical legal guidance while maintaining professional standards

      **Format:**
      - Use proper markdown syntax (headers, bold, lists, code blocks, tables, etc.)
      - Be professional, authoritative, and clear
      - Adapt your writing style to what the legal question requires (formal legal analysis, plain-language explanation, comparative review, etc.)
      - DO NOT use emojis
      - Return ONLY the markdown content, no code blocks wrapping the entire response
      - Make the legal content flow naturally and logically
      
      Write a comprehensive, strategically structured legal response that serves the user's need for legal understanding.
    `

    // Create LangChain messages for the legal analysis
    const messages = [
      new SystemMessage('You are a professional legal content strategist. Provide accurate, comprehensive legal information with appropriate legal context, disclaimers, and strategic guidance. Balance legal accuracy with accessibility. Be thorough, authoritative, and focused on serving the user\'s need for legal understanding.'),
      new HumanMessage(analysisPrompt)
    ]

    console.log('Calling OpenRouter with LangChain for legal analysis (streaming)...')
    
    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send metadata first
          const metadata = {
            type: 'metadata',
            responseStructure: responseStructure.sections.map((s: any) => s.name)
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`))

          // Stream the content and track tokens
          let fullContent = ''
          let tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
          
          for await (const chunk of OpenRouterService.sendStreamingMessage(messages, 'wizard' as ChatType)) {
            if (chunk.type === 'content' && chunk.content) {
              fullContent += chunk.content
              const data = {
                type: 'content',
                content: chunk.content
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            } else if (chunk.type === 'usage' && chunk.usage) {
              tokenUsage = chunk.usage
            }
          }

          // Send completion signal with token usage
          const completion = {
            type: 'done',
            success: true,
            tokensUsed: tokenUsage.totalTokens
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completion)}\n\n`))
          
          console.log('OpenRouter streaming response completed:', {
            contentLength: fullContent.length,
            tokensUsed: tokenUsage.totalTokens
          })

          controller.close()
        } catch (error) {
          console.error('Error during streaming:', error)
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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
