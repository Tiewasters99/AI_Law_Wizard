'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { 
  Wand2, 
  Save, 
  X, 
  Eye, 
  Edit3,
  Undo,
  Redo,
  MessageCircle,
  Sparkles,
  FileText,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Blog } from '../../hooks/useBlogManagement'

interface BlogCanvasEditorProps {
  blog: Blog
  onSave: (title: string, content: string) => Promise<Blog | null>
  onClose: () => void
  onAIEdit: (blogId: string, currentContent: string, editRequest: string) => Promise<Blog | null>
  isLoading?: boolean
}

interface EditHistory {
  title: string
  content: string
  timestamp: number
}

export default function BlogCanvasEditor({ 
  blog, 
  onSave, 
  onClose, 
  onAIEdit, 
  isLoading = false 
}: BlogCanvasEditorProps) {
  const [title, setTitle] = useState(blog.title)
  const [content, setContent] = useState(blog.content)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [aiEditRequest, setAIEditRequest] = useState('')
  const [isAIEditing, setIsAIEditing] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  
  // Local state for AI edit request to prevent focus loss
  const [localAIRequest, setLocalAIRequest] = useState('')
  
  // History management for undo/redo
  const [history, setHistory] = useState<EditHistory[]>([
    { title: blog.title, content: blog.content, timestamp: Date.now() }
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title !== blog.title || content !== blog.content) {
        // Save to localStorage as draft
        localStorage.setItem(`blog-draft-${blog.id}`, JSON.stringify({
          title,
          content,
          timestamp: Date.now()
        }))
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [title, content, blog.id, blog.title, blog.content])

  // Load draft on mount if exists
  useEffect(() => {
    const draft = localStorage.getItem(`blog-draft-${blog.id}`)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        if (parsed.timestamp > new Date(blog.updatedAt).getTime()) {
          setTitle(parsed.title)
          setContent(parsed.content)
          toast.info('Draft loaded from previous session')
        }
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }, [blog.id, blog.updatedAt])

  const addToHistory = useCallback((newTitle: string, newContent: string) => {
    const newEntry = { title: newTitle, content: newContent, timestamp: Date.now() }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newEntry)
    
    // Keep only last 50 entries
    if (newHistory.length > 50) {
      newHistory.shift()
    }
    
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      const prevEntry = history[prevIndex]
      setTitle(prevEntry.title)
      setContent(prevEntry.content)
      setHistoryIndex(prevIndex)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      const nextEntry = history[nextIndex]
      setTitle(nextEntry.title)
      setContent(nextEntry.content)
      setHistoryIndex(nextIndex)
    }
  }

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    // Add to history on significant changes (every 10 characters or line breaks)
    if (Math.abs(newContent.length - content.length) >= 10 || 
        newContent.includes('\n') !== content.includes('\n')) {
      addToHistory(title, newContent)
    }
  }, [content, title, addToHistory])

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    addToHistory(newTitle, content)
  }, [content, addToHistory])

  // Stable event handlers to prevent input focus loss
  const onTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleTitleChange(e.target.value)
  }, [handleTitleChange])

  const onContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(e.target.value)
  }, [handleContentChange])

  const handleSave = async () => {
    const result = await onSave(title, content)
    if (result) {
      // Clear draft on successful save
      localStorage.removeItem(`blog-draft-${blog.id}`)
      // Reset history
      setHistory([{ title, content, timestamp: Date.now() }])
      setHistoryIndex(0)
    }
  }

  const handleAIEdit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!localAIRequest.trim()) {
      toast.error('Please enter an edit request')
      return
    }

    setIsAIEditing(true)
    try {
      const result = await onAIEdit(blog.id, content, localAIRequest)
      if (result) {
        setContent(result.content)
        setTitle(result.title)
        addToHistory(result.title, result.content)
        setAIEditRequest('')
        setLocalAIRequest('')
        toast.success('AI edit applied successfully!')
      }
    } catch (error) {
      console.error('Error applying AI edit:', error)
      toast.error('Failed to apply AI edit')
    } finally {
      setIsAIEditing(false)
    }
  }

  const insertAtCursor = (text: string) => {
    if (contentRef.current) {
      const start = contentRef.current.selectionStart
      const end = contentRef.current.selectionEnd
      const newContent = content.substring(0, start) + text + content.substring(end)
      setContent(newContent)
      
      // Restore cursor position
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.selectionStart = start + text.length
          contentRef.current.selectionEnd = start + text.length
          contentRef.current.focus()
        }
      }, 0)
    }
  }

  const renderPreview = () => {
    return (
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        <div 
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ 
            __html: content
              .replace(/\n/g, '<br>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`(.*?)`/g, '<code>$1</code>')
          }}
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Canvas Editor
          </h2>
          <Badge variant="secondary">
            {mode === 'edit' ? 'Editing' : 'Preview'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <Button
            variant={mode === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('edit')}
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant={mode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('preview')}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>

          {/* History Controls */}
          <div className="flex items-center gap-1 border-l pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* AI Panel Toggle */}
          <Button
            variant={showAIPanel ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            AI Assist
          </Button>

          {/* Save & Close */}
          <div className="flex items-center gap-2 border-l pl-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Editor */}
        <div className={`flex-1 flex flex-col ${showAIPanel ? 'w-2/3' : 'w-full'}`}>
          {mode === 'edit' ? (
            <div className="flex flex-col h-full p-4 space-y-4">
              <Input
                key={`canvas-title-${blog.id}`}
                ref={titleRef}
                value={title}
                onChange={onTitleChange}
                placeholder="Blog title..."
                className="text-xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0"
              />
              <Textarea
                key={`canvas-content-${blog.id}`}
                ref={contentRef}
                value={content}
                onChange={onContentChange}
                placeholder="Start writing your blog content..."
                className="flex-1 border-0 resize-none focus-visible:ring-0 text-base leading-relaxed"
              />
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-auto">
              {renderPreview()}
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {showAIPanel && (
          <div className="w-1/3 border-l bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                AI Assistant
              </h3>
            </div>
            
            <div className="flex-1 p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Edits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setLocalAIRequest('Make the content more engaging and add compelling examples')}
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Make more engaging
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setLocalAIRequest('Improve the SEO and add relevant keywords naturally')}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Optimize for SEO
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setLocalAIRequest('Make the writing more professional and formal')}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Professional tone
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setLocalAIRequest('Add a compelling conclusion with a clear call-to-action')}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Add conclusion
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Custom Edit Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form onSubmit={handleAIEdit}>
                    <Textarea
                      value={localAIRequest}
                      onChange={(e) => setLocalAIRequest(e.target.value)}
                      placeholder="Describe what you want to change or improve..."
                      className="min-h-20 text-sm mb-3"
                    />
                    <Button
                      type="submit"
                      disabled={isAIEditing || !localAIRequest.trim()}
                      className="w-full"
                      size="sm"
                    >
                      {isAIEditing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Applying Edit...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Apply AI Edit
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Insert Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => insertAtCursor('\n## New Section\n\n')}
                  >
                    Add Heading
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => insertAtCursor('\n- Bullet point\n- Another point\n\n')}
                  >
                    Add List
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => insertAtCursor('\n> This is a quote\n\n')}
                  >
                    Add Quote
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => insertAtCursor('\n```\nCode block\n```\n\n')}
                  >
                    Add Code Block
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
