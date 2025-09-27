"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMiniverseStore } from '../../data/store';
import { useBlogManagement } from '../../../hooks/useBlogManagement';
import BlogCanvasEditor from '../../../components/blog/BlogCanvasEditor';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { 
  X, 
  Plus, 
  Edit3, 
  Eye, 
  Trash2, 
  BookOpen, 
  Sparkles,
  Loader2,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const BlogModal: React.FC = () => {
  const router = useRouter();
  const { isBlogModalOpen, closeBlogModal } = useMiniverseStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [aiGenerationState, setAIGenerationState] = useState({
    step: 'topic' as 'topic' | 'prompt' | 'generating' | 'complete',
    topic: '',
    generatedPrompt: '',
    isGenerating: false
  });

  const {
    blogs,
    selectedBlog,
    isLoading,
    loadBlogs,
    generatePromptFromTopic,
    generateBlogFromPrompt,
    saveBlog,
    deleteBlog,
    togglePublished,
    editBlogWithAI,
    setSelectedBlog
  } = useBlogManagement();

  useEffect(() => {
    if (isBlogModalOpen) {
      loadBlogs();
    }
  }, [isBlogModalOpen, loadBlogs]);

  if (!isBlogModalOpen) return null;

  const handleCreateNew = () => {
    const newBlog = {
      id: 'temp-' + Date.now(),
      title: 'New Blog Post',
      content: '',
      author: 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false
    };
    setEditingBlog(newBlog);
    setShowEditor(true);
  };

  const handleEditBlog = (blog: any) => {
    setEditingBlog(blog);
    setShowEditor(true);
  };

  const handleSaveBlog = async (title: string, content: string) => {
    const result = await saveBlog(title, content, editingBlog?.id);
    if (result) {
      setShowEditor(false);
      setEditingBlog(null);
      toast.success('Blog saved successfully!');
    }
    return result;
  };

  const handleAIEdit = async (blogId: string, currentContent: string, editRequest: string) => {
    const result = await editBlogWithAI(blogId, currentContent, editRequest);
    return result;
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      await deleteBlog(id);
    }
  };

  const handleTogglePublished = async (id: string, published: boolean) => {
    await togglePublished(id, published);
  };

  const handleGenerateWithAI = async () => {
    if (!aiGenerationState.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setAIGenerationState(prev => ({ ...prev, step: 'prompt', isGenerating: true }));
    
    const prompt = await generatePromptFromTopic(aiGenerationState.topic);
    if (prompt) {
      setAIGenerationState(prev => ({ 
        ...prev, 
        step: 'generating', 
        generatedPrompt: prompt,
        isGenerating: true 
      }));
      
      const blog = await generateBlogFromPrompt(aiGenerationState.topic, prompt);
      if (blog) {
        setAIGenerationState({
          step: 'topic',
          topic: '',
          generatedPrompt: '',
          isGenerating: false
        });
        toast.success('Blog generated successfully!');
      }
    } else {
      setAIGenerationState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleExploreBlogs = () => {
    router.push('/blog');
    closeBlogModal();
  };

  if (showEditor && editingBlog) {
    return (
      <BlogCanvasEditor
        blog={editingBlog}
        onSave={handleSaveBlog}
        onClose={() => {
          setShowEditor(false);
          setEditingBlog(null);
        }}
        onAIEdit={handleAIEdit}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <h2 className="text-2xl font-bold">📚 Blog Management</h2>
            </div>
            <button 
              onClick={closeBlogModal} 
              className="text-white hover:text-gray-200 text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - AI Generation */}
          <div className="w-1/3 border-r bg-gray-50 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Blog Generation
            </h3>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm">Generate New Blog</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Topic</label>
                  <Input
                    value={aiGenerationState.topic}
                    onChange={(e) => setAIGenerationState(prev => ({ 
                      ...prev, 
                      topic: e.target.value 
                    }))}
                    placeholder="Enter blog topic..."
                    className="mt-1"
                  />
                </div>
                
                {aiGenerationState.generatedPrompt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Generated Prompt</label>
                    <Textarea
                      value={aiGenerationState.generatedPrompt}
                      readOnly
                      className="mt-1 text-sm"
                      rows={3}
                    />
                  </div>
                )}
                
                <Button
                  onClick={handleGenerateWithAI}
                  disabled={aiGenerationState.isGenerating || !aiGenerationState.topic.trim()}
                  className="w-full"
                >
                  {aiGenerationState.isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Blog
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Button
              onClick={handleCreateNew}
              className="w-full mb-4"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Blog
            </Button>

            <Button
              onClick={handleExploreBlogs}
              className="w-full"
              variant="secondary"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Public Blogs
            </Button>
          </div>

          {/* Main Content - Blog List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Your Blogs ({blogs.length})</h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No blogs yet</h4>
                <p className="text-gray-500">Create your first blog post using AI generation or manual creation.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {blogs.map((blog) => (
                  <Card key={blog.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{blog.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {blog.author}
                            </div>
                            <Badge variant={blog.published ? "default" : "secondary"}>
                              {blog.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBlog(blog)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTogglePublished(blog.id, !blog.published)}
                          >
                            {blog.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm line-clamp-3">
                        {blog.content.substring(0, 200)}...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;
