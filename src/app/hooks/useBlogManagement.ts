import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface Blog {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  published: boolean
}

export interface AIGenerationState {
  step: 'topic' | 'prompt' | 'generating' | 'complete'
  topic: string
  generatedPrompt: string
  isGenerating: boolean
}

export interface EditContext {
  editRequest: string
  timestamp: string
  previousContext?: string | null
}

export function useBlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editContexts, setEditContexts] = useState<Record<string, EditContext[]>>({})

  // Load all blogs
  const loadBlogs = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/blog')
      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs || [])
      } else {
        throw new Error('Failed to load blogs')
      }
    } catch (error) {
      console.error('Error loading blogs:', error)
      toast.error('Failed to load blogs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Generate blog prompt from topic
  const generatePromptFromTopic = useCallback(async (topic: string): Promise<string | null> => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return null
    }

    try {
      const response = await fetch('/api/blog/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })

      if (response.ok) {
        const data = await response.json()
        return data.prompt
      } else {
        throw new Error('Failed to generate prompt')
      }
    } catch (error) {
      console.error('Error generating prompt:', error)
      toast.error('Failed to generate prompt')
      return null
    }
  }, [])

  // Generate blog from prompt
  const generateBlogFromPrompt = useCallback(async (
    topic: string, 
    prompt: string
  ): Promise<Blog | null> => {
    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, prompt })
      })

      if (response.ok) {
        const data = await response.json()
        const newBlog = data.blog
        setBlogs(prev => [newBlog, ...prev])
        toast.success('Blog generated successfully!')
        return newBlog
      } else {
        throw new Error('Failed to generate blog')
      }
    } catch (error) {
      console.error('Error generating blog:', error)
      toast.error('Failed to generate blog')
      return null
    }
  }, [])

  // Save blog (create or update)
  const saveBlog = useCallback(async (
    title: string, 
    content: string, 
    id?: string
  ): Promise<Blog | null> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/blog', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, content })
      })

      if (response.ok) {
        const data = await response.json()
        const savedBlog = data.blog
        
        if (id) {
          setBlogs(prev => prev.map(blog => blog.id === id ? savedBlog : blog))
          if (selectedBlog && selectedBlog.id === id) {
            setSelectedBlog(savedBlog)
          }
        } else {
          setBlogs(prev => [savedBlog, ...prev])
        }
        
        toast.success(id ? 'Blog updated!' : 'Blog created!')
        return savedBlog
      } else {
        throw new Error('Failed to save blog')
      }
    } catch (error) {
      console.error('Error saving blog:', error)
      toast.error('Failed to save blog')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBlog])

  // Delete blog
  const deleteBlog = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        setBlogs(prev => prev.filter(blog => blog.id !== id))
        if (selectedBlog && selectedBlog.id === id) {
          setSelectedBlog(null)
        }
        // Clean up edit contexts
        setEditContexts(prev => {
          const newContexts = { ...prev }
          delete newContexts[id]
          return newContexts
        })
        toast.success('Blog deleted!')
        return true
      } else {
        throw new Error('Failed to delete blog')
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      toast.error('Failed to delete blog')
      return false
    }
  }, [selectedBlog])

  // Toggle published status
  const togglePublished = useCallback(async (id: string, published: boolean): Promise<boolean> => {
    try {
      const response = await fetch('/api/blog/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published })
      })

      if (response.ok) {
        const data = await response.json()
        const updatedBlog = data.blog
        setBlogs(prev => prev.map(blog => blog.id === id ? updatedBlog : blog))
        if (selectedBlog && selectedBlog.id === id) {
          setSelectedBlog(updatedBlog)
        }
        toast.success(published ? 'Blog published!' : 'Blog unpublished!')
        return true
      } else {
        throw new Error('Failed to update blog')
      }
    } catch (error) {
      console.error('Error updating blog:', error)
      toast.error('Failed to update blog')
      return false
    }
  }, [selectedBlog])

  // Edit blog with AI assistance
  const editBlogWithAI = useCallback(async (
    blogId: string,
    currentContent: string,
    editRequest: string
  ): Promise<Blog | null> => {
    try {
      setIsLoading(true)
      
      // Get previous edit context for this blog
      const context = editContexts[blogId]?.map(ctx => 
        `${ctx.timestamp}: ${ctx.editRequest}`
      ).join('\n') || null

      const response = await fetch('/api/blog/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blogId, 
          currentContent, 
          editRequest,
          context 
        })
      })

      if (response.ok) {
        const data = await response.json()
        const updatedBlog = data.blog
        const editContext = data.editContext

        // Update blog state
        setBlogs(prev => prev.map(blog => blog.id === blogId ? updatedBlog : blog))
        if (selectedBlog && selectedBlog.id === blogId) {
          setSelectedBlog(updatedBlog)
        }

        // Update edit context
        setEditContexts(prev => ({
          ...prev,
          [blogId]: [...(prev[blogId] || []), editContext]
        }))

        toast.success('Blog edited successfully!')
        return updatedBlog
      } else {
        throw new Error('Failed to edit blog')
      }
    } catch (error) {
      console.error('Error editing blog:', error)
      toast.error('Failed to edit blog')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBlog, editContexts])

  return {
    // State
    blogs,
    selectedBlog,
    isLoading,
    editContexts,
    
    // Actions
    setSelectedBlog,
    loadBlogs,
    generatePromptFromTopic,
    generateBlogFromPrompt,
    saveBlog,
    deleteBlog,
    togglePublished,
    editBlogWithAI
  }
}
