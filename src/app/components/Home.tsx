'use client'

import React, { useState } from 'react'
import { Consultation } from "@/app/lib/api"
import StreamlinedConsultation from "./consultation/StreamlinedConsultation"
import { Message } from '@/app/components/chat/types'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmitIssue = async (userIssue: string) => {
    setIsLoading(true)

    // Create user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userIssue.trim(),
      role: 'user',
      timestamp: new Date()
    }

    try {
      const consultation = await Consultation.create({
        user_issue: userIssue,
        status: "processing"
      })

      // Call the legal analysis API endpoint
      const response = await fetch('/api/legal-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIssue: userIssue
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorData}`)
      }

      const responseData = await response.json()

      if (responseData.error) {
        throw new Error(responseData.error || "The backend function call failed.")
      }

      if (!responseData.success || !responseData.content) {
        throw new Error("No content received from the AI.")
      }

      // Use the markdown content directly from the LLM
      const markdownContent = responseData.content

      await Consultation.update(consultation.id, {
        analysis: { markdown: markdownContent } as any,
        status: "completed"
      })

      // Create assistant message with the markdown content
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: markdownContent,
        role: 'assistant',
        timestamp: new Date()
      }

      // Store messages in localStorage and navigate to chat page
      localStorage.setItem('legalChatMessages', JSON.stringify([userMessage, assistantMessage]))
      router.push('/legal-chat')
    } catch (error) {
      console.error("Error processing consultation:", error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${(error as Error).message}\n\nPlease check your API configuration or try again later.`,
        role: 'assistant',
        timestamp: new Date()
      }

      // Store error messages and navigate
      localStorage.setItem('legalChatMessages', JSON.stringify([userMessage, errorMessage]))
      router.push('/legal-chat')
    } finally {
      setIsLoading(false)
    }
  }

  // Consultation view
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          The Future Awaits
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Get instant legal guidance, manage and manipulate your documents with AI agents, generate and read custom blogs, create your own legal Miniverse™ — tomorrow today!
        </p>
      </div>

      <StreamlinedConsultation
        onSubmit={handleSubmitIssue}
        isLoading={isLoading}
      />
    </div>
  )
}
