'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Consultation } from "@/app/lib/api";
import StreamlinedConsultation from "@/app/components/consultation/StreamlinedConsultation";
import { Message } from '@/app/components/chat/types';
import { useRouter } from 'next/navigation';
import { TokenTracker } from '@/app/lib/tokenTracker';
import { UpgradeModal } from '@/app/components/auth/UpgradeModal';

export const AttorneyDashboard: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [tokenUsage, setTokenUsage] = useState({ used: 0, limit: 0 });

  useEffect(() => {
    // Load current token usage
    const userId = session?.user?.id;
    const used = TokenTracker.getTokenUsage(userId);
    const limit = TokenTracker.getLimit(userId);
    setTokenUsage({ used, limit });
  }, [session?.user?.id]);

  const handleSubmitIssue = useCallback(async (userIssue: string) => {
    // Check token limit before proceeding
    const userId = session?.user?.id;
    const hasExceeded = TokenTracker.hasExceededLimit(userId);
    
    if (hasExceeded) {
      const usage = TokenTracker.getUsageSummary(userId);
      setTokenUsage({ used: usage.used, limit: usage.limit });
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);

    // Create user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userIssue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    try {
      const consultation = await Consultation.create({
        user_issue: userIssue,
        status: "processing"
      });

      // Call the legal analysis API endpoint
      // Get existing sessionId from localStorage if available
      const existingSessionId = localStorage.getItem('legalChatSessionId');
      
      const response = await fetch('/api/legal-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIssue: userIssue,
          sessionId: existingSessionId // Include sessionId for context
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response
        let markdownContent = '';
        let responseStructure: string[] = [];

        // Create initial assistant message with empty content
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '',
          role: 'assistant',
          timestamp: new Date()
        };

        // Store initial messages and navigate to chat page immediately
        localStorage.setItem('legalChatMessages', JSON.stringify([userMessage, assistantMessage]));
        router.push('/legal-chat');

        // Process the stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === 'metadata') {
                    responseStructure = data.responseStructure;
                  } else if (data.type === 'content') {
                    markdownContent += data.content;
                    // Update localStorage with accumulated content
                    const updatedAssistantMessage = { ...assistantMessage, content: markdownContent };
                    localStorage.setItem('legalChatMessages', JSON.stringify([userMessage, updatedAssistantMessage]));
                    // Trigger a custom event to update the chat page
                    window.dispatchEvent(new CustomEvent('chat-update'));
                  } else if (data.type === 'done') {
                    // Streaming complete - track token usage and capture sessionId
                    if (data.sessionId) {
                      localStorage.setItem('legalChatSessionId', data.sessionId);
                      console.log('Session ID captured in AttorneyDashboard:', data.sessionId);
                    }
                    
                    if (data.tokensUsed) {
                      TokenTracker.addTokenUsage(data.tokensUsed, userId);
                      // Update local state
                      const updatedUsage = TokenTracker.getUsageSummary(userId);
                      setTokenUsage({ used: updatedUsage.used, limit: updatedUsage.limit });
                    }
                    
                    await Consultation.update(consultation.id, {
                      analysis: { markdown: markdownContent } as any,
                      status: "completed"
                    });
                  } else if (data.type === 'error') {
                    throw new Error(data.error);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      } else {
        // Fallback to JSON response for non-streaming responses
        const responseData = await response.json();

        if (responseData.error) {
          throw new Error(responseData.error || "The backend function call failed.");
        }

        if (!responseData.success || !responseData.content) {
          throw new Error("No content received from the AI.");
        }

        const markdownContent = responseData.content;

        await Consultation.update(consultation.id, {
          analysis: { markdown: markdownContent } as any,
          status: "completed"
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: markdownContent,
          role: 'assistant',
          timestamp: new Date()
        };

        localStorage.setItem('legalChatMessages', JSON.stringify([userMessage, assistantMessage]));
        router.push('/legal-chat');
      }
    } catch (error) {
      console.error("Error processing consultation:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${(error as Error).message}\n\nPlease check your API configuration or try again later.`,
        role: 'assistant',
        timestamp: new Date()
      };

      // Store error messages and navigate
      localStorage.setItem('legalChatMessages', JSON.stringify([userMessage, errorMessage]));
      router.push('/legal-chat');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, router]);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">
            The Future Awaits
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            Get instant legal guidance, manage and manipulate your documents with AI agents, generate and read custom blogs, create your own legal Miniverse™ — tomorrow today!
          </p>
        </div>

        <StreamlinedConsultation
          onSubmit={handleSubmitIssue}
          isLoading={isLoading}
        />
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={tokenUsage.used}
        limit={tokenUsage.limit}
        feature="home"
      />
    </>
  );
};
