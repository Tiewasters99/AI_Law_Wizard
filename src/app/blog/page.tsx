'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Layout from '../components/Layout'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { EnhancedTextEditor } from '@/app/components/ui/enhanced-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
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
  Maximize,
  ExternalLink,
  MessageCircle,
  Calendar,
  User,
  Settings,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'sonner'
import { useBlogManagement, AIGenerationState } from '../hooks/useBlogManagement'
import BlogCanvasEditor from '../components/blog/BlogCanvasEditor'
import Link from 'next/link'

// Client Blog Exploration Interface
const ClientBlogInterface = ({ blogs, isLoading }: { blogs: any[], isLoading: boolean }) => {
  const [selectedBlog, setSelectedBlog] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPublished, setFilterPublished] = useState(true)

  // Filter blogs based on search and published status
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPublished = filterPublished ? blog.published : true
    return matchesSearch && matchesPublished
  })

  const publishedBlogs = blogs.filter(blog => blog.published)
  const totalBlogs = blogs.length

  if (selectedBlog) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedBlog(null)}
            className="flex items-center gap-2"
          >
            ← Back to Blogs
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <User className="w-4 h-4" />
            <span>{selectedBlog.author || 'AI Wizard'}</span>
          </div>
        </div>

        {/* Blog Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{selectedBlog.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{selectedBlog.author || 'AI Wizard'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Published
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Legal Blog Library
          </CardTitle>
          <p className="text-gray-600">
            Explore our collection of legal insights and articles written by our AI Wizard technology.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filterPublished ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPublished(true)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Published ({publishedBlogs.length})
              </Button>
              <Button
                variant={!filterPublished ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPublished(false)}
              >
                All ({totalBlogs})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blog Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading blogs...</span>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No blogs found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'No blogs available at the moment.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card 
              key={blog.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedBlog(blog)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 leading-tight">
                    {blog.title}
                  </CardTitle>
                  <Badge variant={blog.published ? 'default' : 'secondary'} className="text-xs ml-2">
                    {blog.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{blog.author || 'AI Wizard'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                  {blog.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  Read more →
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BlogPage() {
  const { data: session } = useSession()
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

  // Check if user is an attorney
  const isLawyer = session?.user?.role === 'ATTORNEY' || session?.user?.role === 'LAWYER'

  const [mode, setMode] = useState<'list' | 'create-custom' | 'create-ai' | 'edit' | 'canvas' | 'manage-all'>('list')
  const [viewMode, setViewMode] = useState<'management' | 'public'>('management')
  
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

  // Progress tracking state
  const [generationProgress, setGenerationProgress] = useState({
    currentStep: 0,
    steps: [
      { name: 'Analyzing your topic', description: 'Understanding what you want to write about', duration: '5-10s' },
      { name: 'Creating your blog post', description: 'Crafting engaging content based on your topic', duration: '5-10s' },
      { name: 'Finalizing content', description: 'Polishing and formatting your blog', duration: '2-5s' },
      { name: 'Complete!', description: 'Your blog post is ready to edit and publish', duration: '✨' }
    ],
    estimatedTotal: '35-55 seconds'
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
    setGenerationProgress(prev => ({ ...prev, currentStep: 0 }))
    
    try {
      // Step 1: Analyzing topic and generating prompt
      setGenerationProgress(prev => ({ ...prev, currentStep: 0 }))
      const prompt = await generatePromptFromTopic(localTopic)
      if (!prompt) {
        setAIState(prev => ({ ...prev, isGenerating: false }))
        setGenerationProgress(prev => ({ ...prev, currentStep: 0 }))
        return
      }

      // Step 2: Creating blog content
      setGenerationProgress(prev => ({ ...prev, currentStep: 1 }))
      
      // Add a small delay to show the progress step
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newBlog = await generateBlogFromPrompt(localTopic, prompt)
      
      if (newBlog) {
        // Step 3: Finalizing
        setGenerationProgress(prev => ({ ...prev, currentStep: 2 }))
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Show completion state
        setGenerationProgress(prev => ({ ...prev, currentStep: 3 }))
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setSelectedBlog(newBlog)
        setMode('edit')
        setAIState({
          step: 'topic',
          topic: '',
          generatedPrompt: '',
          isGenerating: false
        })
        setGenerationProgress(prev => ({ ...prev, currentStep: 0 }))
        setLocalTopic('')
        toast.success('🎉 Your amazing blog post is ready!')
      } else {
        setAIState(prev => ({ ...prev, isGenerating: false }))
        setGenerationProgress(prev => ({ ...prev, currentStep: 0 }))
      }
    } catch (error) {
      setAIState(prev => ({ ...prev, isGenerating: false }))
      setGenerationProgress(prev => ({ ...prev, currentStep: 0 }))
      toast.error('Failed to generate blog. Please try again.')
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
      // Stay in current mode, just refresh the list
      if (mode !== 'manage-all') {
        setMode('list')
      }
      toast.success('Blog deleted successfully')
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

      {/* Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Blog Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setMode('manage-all')}
            className="w-full justify-start"
            variant={mode === 'manage-all' ? 'default' : 'outline'}
          >
            <FileText className="w-4 h-4 mr-2" />
            Manage All Blogs
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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedBlog?.id === blog.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Blog Header */}
                    <div 
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedBlog(blog)
                        setMode('edit')
                      }}
                    >
                      <h4 className="text-sm font-medium line-clamp-2 leading-tight">{blog.title}</h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{blog.author || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Blog Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={blog.published ? 'default' : 'secondary'} className="text-xs">
                        {blog.published ? 'Published' : 'Draft'}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        {blog.published && (
                          <Link href={`/blog/${blog.id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={() => {
                            setSelectedBlog(blog)
                            setMode('edit')
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
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
    if (mode === 'manage-all') {
      return (
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Manage All Blogs
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    resetAIState()
                    setMode('create-ai')
                  }}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Blog
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading blogs...</span>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No blogs found</h3>
                <p className="text-gray-600 mb-6">
                  Start creating your first blog post to see it here.
                </p>
                <Button
                  onClick={() => {
                    resetAIState()
                    setMode('create-ai')
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Blog
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Blogs</p>
                          <p className="text-2xl font-bold">{blogs.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Published</p>
                          <p className="text-2xl font-bold text-green-600">
                            {blogs.filter(blog => blog.published).length}
                          </p>
                        </div>
                        <Eye className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Drafts</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {blogs.filter(blog => !blog.published).length}
                          </p>
                        </div>
                        <EyeOff className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Blogs Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Blog Post
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {blogs.map((blog) => (
                          <tr key={blog.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                    {blog.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                    {blog.content.substring(0, 150)}...
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span>{blog.author || 'Admin'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge
                                variant={blog.published ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {blog.published ? 'Published' : 'Draft'}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(blog.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                {/* Primary Actions */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBlog(blog)
                                    setMode('edit')
                                  }}
                                  title="Edit Blog"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                
                                {blog.published ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePublished(blog.id, false)}
                                    title="Unpublish"
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  >
                                    <EyeOff className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePublished(blog.id, true)}
                                    title="Publish"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}

                                {/* Secondary Actions Dropdown */}
                                <div className="relative group">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="More Actions"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                  
                                  {/* Dropdown Menu */}
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    <div className="py-1">
                                      {blog.published && (
                                        <Link href={`/blog/${blog.id}`} target="_blank">
                                          <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                            <ExternalLink className="w-4 h-4 mr-3" />
                                            View Published Post
                                          </div>
                                        </Link>
                                      )}
                                      <div 
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => openCanvas(blog)}
                                      >
                                        <Maximize className="w-4 h-4 mr-3" />
                                        Canvas Editor
                                      </div>
                                      <div 
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                          navigator.clipboard.writeText(blog.content)
                                          toast.success('Blog content copied to clipboard')
                                        }}
                                      >
                                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                                          <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V9H9v2.586l3-3 3 3z" />
                                        </svg>
                                        Copy Content
                                      </div>
                                      <hr className="my-1" />
                                      <div 
                                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                        onClick={() => {
                                          if (window.confirm('⚠️ Are you sure you want to delete this blog post?\n\nThis action cannot be undone and will permanently remove the blog post and all its content.')) {
                                            handleDeleteBlog(blog.id)
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 mr-3" />
                                        Delete Blog
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

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
              <div className="py-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-medium mb-2 ${
                    generationProgress.currentStep === 3 ? 'text-green-700' : ''
                  }`}>
                    {generationProgress.currentStep === 3 ? '🎉 Blog Post Created Successfully!' : 'Creating Your Blog Post'}
                  </h3>
                  <p className={`text-sm mb-4 ${
                    generationProgress.currentStep === 3 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {generationProgress.currentStep === 3 
                      ? 'Redirecting to editor in a moment...' 
                      : `Estimated time: ${generationProgress.estimatedTotal}`
                    }
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="space-y-4">
                  {generationProgress.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {index < generationProgress.currentStep ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : index === generationProgress.currentStep ? (
                          index === 3 ? (
                            // Special completion state
                            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                              <Sparkles className="w-4 h-4 text-white animate-bounce" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )
                        ) : (
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            index <= generationProgress.currentStep ? 
                              (index === 3 && index === generationProgress.currentStep ? 'text-green-700 font-semibold' : 'text-gray-900') 
                              : 'text-gray-400'
                          }`}>
                            {step.name}
                          </h4>
                          <span className={`text-xs ${
                            index === 3 && index === generationProgress.currentStep ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {step.duration}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${
                          index <= generationProgress.currentStep ? 
                            (index === 3 && index === generationProgress.currentStep ? 'text-green-600' : 'text-gray-600') 
                            : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className={generationProgress.currentStep === 3 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {generationProgress.currentStep === 3 ? 'Completed!' : 'Progress'}
                    </span>
                    <span className={generationProgress.currentStep === 3 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {Math.round(((generationProgress.currentStep + 1) / generationProgress.steps.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                        generationProgress.currentStep === 3 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      style={{ 
                        width: `${((generationProgress.currentStep + 1) / generationProgress.steps.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
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
              <Button variant="outline" onClick={() => setMode('manage-all')}>
                <Settings className="w-4 h-4 mr-2" />
                Manage All
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

  // If user is not a lawyer, show client blog exploration interface
  if (!isLawyer) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <ClientBlogInterface blogs={blogs} isLoading={isLoading} />
        </div>
      </Layout>
    )
  }

  // Lawyer interface - full blog management
  return (
    <Layout>
      <div className="max-w-7xl mx-auto h-full">
        {/* View Mode Toggle */}
        <div className="mb-6">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Blog Management</h1>
                  <p className="text-gray-600 text-sm">Create, edit, and manage your blog posts</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'management' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('management')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                  <Link href="/blog/public">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Public View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
