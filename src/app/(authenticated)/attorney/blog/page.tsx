"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Calendar,
  User,
  Loader2,
  Search,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/attorney/blog");
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/attorney/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        await fetchBlogs();
        setMode("list");
        setTitle("");
        setContent("");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedBlog || !title.trim() || !content.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/attorney/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedBlog.id, title, content }),
      });

      if (response.ok) {
        await fetchBlogs();
        setMode("list");
        setSelectedBlog(null);
        setTitle("");
        setContent("");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/attorney/blog?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBlogs();
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/attorney/blog/publish", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, published: !published }),
      });

      if (response.ok) {
        await fetchBlogs();
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setMode("edit");
  };

  const filteredBlogs = blogs.filter(
    blog =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Legal Blog</h1>
            <p className="text-slate-600 mt-1">Create and manage blog posts</p>
          </div>
        </div>

        {mode === "list" && (
          <Button
            onClick={() => setMode("create")}
            className="bg-blue-700 hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Blog
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(mode === "create" || mode === "edit") && (
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "create" ? "Create New Blog" : "Edit Blog"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Blog title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Blog content..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[300px]"
            />
            <div className="flex gap-3">
              <Button
                onClick={mode === "create" ? handleCreate : handleUpdate}
                disabled={!title.trim() || !content.trim() || isLoading}
                className="bg-blue-700 hover:bg-blue-800"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create" : "Update"}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMode("list");
                  setTitle("");
                  setContent("");
                  setSelectedBlog(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog List */}
      {mode === "list" && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Blogs</p>
                    <p className="text-2xl font-bold">{blogs.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Published</p>
                    <p className="text-2xl font-bold text-green-600">
                      {blogs.filter(b => b.published).length}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Drafts</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {blogs.filter(b => !b.published).length}
                    </p>
                  </div>
                  <EyeOff className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blog Grid */}
          {isLoading && filteredBlogs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-slate-600">Loading blogs...</span>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No blogs found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "Start creating your first blog post."}
                </p>
                <Button onClick={() => setMode("create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Blog
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map(blog => (
                <Card
                  key={blog.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={blog.published ? "default" : "secondary"}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {blog.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{blog.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                      {blog.content.replace(/<[^>]*>/g, "").substring(0, 150)}
                      ...
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(blog)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant={blog.published ? "outline" : "default"}
                        size="sm"
                        onClick={() =>
                          handleTogglePublish(blog.id, blog.published)
                        }
                        className="flex-1"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {blog.published ? "Published" : "Publish"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
