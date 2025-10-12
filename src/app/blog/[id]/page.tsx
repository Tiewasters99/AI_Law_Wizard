'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Badge } from '@/app/components/ui/badge'
import { 
  User, 
  Calendar, 
  MessageCircle, 
  Send, 
  Reply,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  authorName: string
  authorEmail?: string
  createdAt: string
  replies: Comment[]
}

interface Blog {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  published: boolean
}

export default function BlogViewPage() {
  const params = useParams()
  const blogId = params.id as string

  const [blog, setBlog] = useState<Blog | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Comment form state
  const [newComment, setNewComment] = useState({
    content: '',
    authorName: '',
    authorEmail: ''
  })

  // Reply form state
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyAuthor, setReplyAuthor] = useState('')

  const loadBlogAndComments = useCallback(async () => {
    try {
      setIsLoading(true)

      // Load blog
      const blogResponse = await fetch(`/api/blog?id=${blogId}`)
      if (!blogResponse.ok) {
        throw new Error('Blog not found')
      }
      const blogData = await blogResponse.json()
      
      if (!blogData.blog.published) {
        throw new Error('Blog is not published')
      }
      
      setBlog(blogData.blog)

      // Load comments
      const commentsResponse = await fetch(`/api/comments?blogId=${blogId}`)
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData.comments)
      }
    } catch (error) {
      console.error('Error loading blog:', error)
      toast.error('Failed to load blog post')
    } finally {
      setIsLoading(false)
    }
  }, [blogId])

  useEffect(() => {
    loadBlogAndComments()
  }, [blogId, loadBlogAndComments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.content.trim() || !newComment.authorName.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newComment,
          blogId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit comment')
      }

      toast.success('Comment submitted successfully!')
      setNewComment({ content: '', authorName: '', authorEmail: '' })
      loadBlogAndComments()
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Failed to submit comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !replyAuthor.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: replyContent,
          authorName: replyAuthor,
          blogId,
          parentId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit reply')
      }

      toast.success('Reply submitted successfully!')
      setReplyingTo(null)
      setReplyContent('')
      setReplyAuthor('')
      loadBlogAndComments()
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast.error('Failed to submit reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  const CommentComponent = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
    <div className={`border rounded-lg p-4 ${isReply ? 'ml-8 mt-2 bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-sm">{comment.authorName}</span>
          <span className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        {!isReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(comment.id)}
            className="text-xs"
          >
            <Reply className="w-3 h-3 mr-1" />
            Reply
          </Button>
        )}
      </div>
      
      <p className="text-gray-700 mb-2 whitespace-pre-wrap">{comment.content}</p>
      
      {/* Reply form */}
      {replyingTo === comment.id && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <Input
            placeholder="Your name *"
            value={replyAuthor}
            onChange={(e) => setReplyAuthor(e.target.value)}
          />
          <Textarea
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSubmitReply(comment.id)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-1" />
                  Submit Reply
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentComponent key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Blog Not Found</h2>
            <p className="text-gray-600 mb-4">
              The blog post you&apos;re looking for doesn&apos;t exist or is not published.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>

        {/* Blog Content */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <CardTitle className="text-2xl lg:text-3xl">{blog.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <Badge variant="default">Published</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment Form */}
            <form onSubmit={handleSubmitComment} className="space-y-4 border-b pb-6">
              <h3 className="font-medium">Leave a Comment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Your name *"
                  value={newComment.authorName}
                  onChange={(e) => setNewComment(prev => ({ ...prev, authorName: e.target.value }))}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your email (optional)"
                  value={newComment.authorEmail}
                  onChange={(e) => setNewComment(prev => ({ ...prev, authorEmail: e.target.value }))}
                />
              </div>
              <Textarea
                placeholder="Write your comment..."
                value={newComment.content}
                onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                required
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Comment
                  </>
                )}
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentComponent key={comment.id} comment={comment} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
