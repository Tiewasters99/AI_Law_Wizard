'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { 
  Search,
  Calendar,
  User,
  MessageCircle,
  Loader2,
  BookOpen,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface Blog {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  published: boolean
  comments: any[]
}

export default function PublicBlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPublishedBlogs()
  }, [])

  useEffect(() => {
    // Filter blogs based on search term
    if (searchTerm.trim()) {
      const filtered = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredBlogs(filtered)
    } else {
      setFilteredBlogs(blogs)
    }
  }, [searchTerm, blogs])

  const loadPublishedBlogs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/blog')
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }
      
      const data = await response.json()
      const publishedBlogs = data.blogs.filter((blog: Blog) => blog.published)
      setBlogs(publishedBlogs)
      setFilteredBlogs(publishedBlogs)
    } catch (error) {
      console.error('Error loading blogs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getExcerpt = (content: string, maxLength: number = 200) => {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '')
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl lg:text-4xl font-bold">Blog</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover insights, tutorials, and thoughts on various topics. 
            Join the conversation by reading and commenting on our latest posts.
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="py-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No blogs found' : 'No published blogs yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms or browse all blogs.'
                  : 'Check back later for new content!'
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2 mb-2">
                    {blog.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {getExcerpt(blog.content)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {blog.comments?.length || 0} comments
                      </Badge>
                    </div>
                    
                    <Link href={`/blog/${blog.id}`}>
                      <Button size="sm" variant="outline">
                        Read More
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredBlogs.length > 0 && (
          <div className="text-center text-sm text-gray-600">
            Showing {filteredBlogs.length} of {blogs.length} published blog{blogs.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
  )
}
