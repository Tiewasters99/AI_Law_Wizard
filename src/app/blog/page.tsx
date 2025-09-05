'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EnhancedTextEditor } from '@/components/ui/enhanced-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PenTool, 
  Wand2, 
  Save, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Loader2,
  Sparkles,
  FileText,
  Plus,
  Maximize
} from 'lucide-react'
import { toast } from 'sonner'
import { useBlogManagement, AIGenerationState } from '../hooks/useBlogManagement'
import BlogCanvasEditor from '../components/blog/BlogCanvasEditor'

export default function BlogPage() {
  const {
    blogs,
    selectedBlog,
    isLoading,
    setSelectedBlog,
    loadBlogs,
    generatePromptFromTopic,
    generateBlogFromPrompt,
    saveBlog,
    deleteBlog,
    togglePublished,
    editBlogWithAI
  } = useBlogManagement()

  const [mode, setMode] = useState<'list' | 'create-custom' | 'create-ai' | 'edit' | 'canvas'>('list')
  
  // Custom blog creation state
  const [customTitle, setCustomTitle] = useState('')
  const [customContent, setCustomContent] = useState('')
  
  // AI generation state
  const [aiState, setAIState] = useState<AIGenerationState>({
    step: 'topic',
    topic: '',
    generatedPrompt: '',
    isGenerating: false
  })

  // Local input states to prevent focus loss
  const [localTopic, setLocalTopic] = useState('')
  const [localCustomTitle, setLocalCustomTitle] = useState('')
  const [localCustomContent, setLocalCustomContent] = useState('')

  // Load blogs on component mount
  useEffect(() => {
    loadBlogs()
  }, [loadBlogs])

  const handleGenerateBlogDirectly = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!localTopic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setAIState(prev => ({ ...prev, isGenerating: true, topic: localTopic, step: 'generating' }))
    
    // Generate prompt internally first
    const prompt = await generatePromptFromTopic(localTopic)
    if (!prompt) {
      setAIState(prev => ({ ...prev, isGenerating: false }))
      return
    }

    // Then immediately generate blog from the prompt
    const newBlog = await generateBlogFromPrompt(localTopic, prompt)
    if (newBlog) {
      setSelectedBlog(newBlog)
      setMode('edit')
      setAIState({
        step: 'topic',
        topic: '',
        generatedPrompt: '',
        isGenerating: false
      })
      setLocalTopic('')
    } else {
      setAIState(prev => ({ ...prev, isGenerating: false }))
    }
  }


  const handleSaveBlog = async (title: string, content: string, id?: string) => {
    const result = await saveBlog(title, content, id)
    if (result) {
      setMode('edit')
      return result
    }
    return null
  }

  const handleSaveCustomBlog = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!localCustomTitle.trim() || !localCustomContent.trim()) {
      toast.error('Please enter both title and content')
      return
    }
    
    const result = await saveBlog(localCustomTitle, localCustomContent)
    if (result) {
      setMode('edit')
      setLocalCustomTitle('')
      setLocalCustomContent('')
      setCustomTitle('')
      setCustomContent('')
    }
  }

  const handleDeleteBlog = async (id: string) => {
    const success = await deleteBlog(id)
    if (success) {
      setMode('list')
    }
  }

  const openCanvas = (blog: any) => {
    setSelectedBlog(blog)
    setMode('canvas')
  }

  // Reset functions for mode changes
  const resetAIState = () => {
    setLocalTopic('')
    setAIState({
      step: 'topic',
      topic: '',
      generatedPrompt: '',
      isGenerating: false
    })
  }

  const resetCustomState = () => {
    setLocalCustomTitle('')
    setLocalCustomContent('')
    setCustomTitle('')
    setCustomContent('')
  }

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Creation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Blog
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => {
              resetAIState()
              setMode('create-ai')
            }}
            className="w-full justify-start"
            variant={mode === 'create-ai' ? 'default' : 'outline'}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
          <Button
            onClick={() => {
              resetCustomState()
              setMode('create-custom')
            }}
            className="w-full justify-start"
            variant={mode === 'create-custom' ? 'default' : 'outline'}
          >
            <PenTool className="w-4 h-4 mr-2" />
            Custom Write
          </Button>
        </CardContent>
      </Card>

      {/* Blog List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Your Blogs ({blogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No blogs yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBlog?.id === blog.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedBlog(blog)
                    setMode('edit')
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{blog.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={blog.published ? 'default' : 'secondary'} className="text-xs">
                      {blog.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const MainContent = () => {
    if (mode === 'create-ai') {
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Blog Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {aiState.step === 'topic' && (
              <form onSubmit={handleGenerateBlogDirectly}>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    What topic would you like to write about?
                  </label>
                  <Input
                    value={localTopic}
                    onChange={(e) => setLocalTopic(e.target.value)}
                    placeholder="e.g., The Future of AI in Legal Technology"
                    className="mb-4"
                    autoFocus
                  />
                  <Button 
                    type="submit"
                    disabled={aiState.isGenerating || !localTopic.trim()}
                    className="w-full"
                  >
                    {aiState.isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Blog...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Blog
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {aiState.step === 'generating' && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-600">Generating your blog post...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    if (mode === 'create-custom') {
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Write Custom Blog
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 h-full">
            <form onSubmit={handleSaveCustomBlog} className="space-y-4 h-full flex flex-col">
              <Input
                value={localCustomTitle}
                onChange={(e) => setLocalCustomTitle(e.target.value)}
                placeholder="Enter blog title..."
                autoFocus
              />
              <EnhancedTextEditor
                value={localCustomContent}
                onChange={setLocalCustomContent}
                placeholder="Start writing your blog content..."
                minHeight="400px"
                showToolbar={true}
                showStats={true}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button 
                  type="submit"
                  disabled={!localCustomTitle.trim() || !localCustomContent.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Blog
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setMode('list')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )
    }

    if (mode === 'edit' && selectedBlog) {
      return (
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Blog
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCanvas(selectedBlog)}
                >
                  <Maximize className="w-4 h-4 mr-1" />
                  Canvas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePublished(selectedBlog.id, !selectedBlog.published)}
                >
                  {selectedBlog.published ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Publish
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteBlog(selectedBlog.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 h-full">
            <Input
              key={`edit-title-${selectedBlog.id}`}
              value={selectedBlog.title}
              onChange={(e) => setSelectedBlog(prev => prev ? {...prev, title: e.target.value} : null)}
            />
            <EnhancedTextEditor
              key={`edit-content-${selectedBlog.id}`}
              value={selectedBlog.content}
              onChange={(content) => setSelectedBlog(prev => prev ? {...prev, content} : null)}
              placeholder="Edit your blog content..."
              minHeight="400px"
              showToolbar={true}
              showStats={true}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSaveBlog(selectedBlog.title, selectedBlog.content, selectedBlog.id)}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setMode('list')}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Default list view
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Welcome to Blog Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Start Creating Amazing Blogs</h3>
            <p className="text-gray-600 mb-6">
              Generate complete blogs instantly with AI or write custom blogs from scratch.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => {
                resetAIState()
                setMode('create-ai')
              }}>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
              <Button variant="outline" onClick={() => {
                resetCustomState()
                setMode('create-custom')
              }}>
                <PenTool className="w-4 h-4 mr-2" />
                Custom Write
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render Canvas Editor if in canvas mode
  if (mode === 'canvas' && selectedBlog) {
    return (
      <BlogCanvasEditor
        blog={selectedBlog}
        onSave={handleSaveBlog}
        onClose={() => setMode('edit')}
        onAIEdit={editBlogWithAI}
        isLoading={isLoading}
      />
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <SidebarContent />
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <MainContent />
          </div>
        </div>
      </div>
    </Layout>
  )
}
