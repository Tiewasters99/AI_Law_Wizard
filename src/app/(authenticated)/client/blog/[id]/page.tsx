"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string | null;
  tags: string[];
  readTime: number | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const categories_data = [
  {
    id: "contract-law",
    name: "Contract Law",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "litigation",
    name: "Litigation",
    color: "bg-red-100 text-red-800",
  },
  {
    id: "business-law",
    name: "Business Law",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "family-law",
    name: "Family Law",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "criminal-law",
    name: "Criminal Law",
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "employment",
    name: "Employment Law",
    color: "bg-pink-100 text-pink-800",
  },
];

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const id = params.id as string;
        const response = await fetch(`/api/client/blog/posts/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Blog post not found");
          }
          throw new Error("Failed to fetch blog post");
        }

        const data = await response.json();
        setBlogPost(data.blog);
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load blog post"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBlogPost();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    return formatDate(dateString);
  };

  // Format content with line breaks
  const formatContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {error === "Blog post not found" ? "Blog Post Not Found" : "Error Loading Blog Post"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {error || "The blog post you're looking for doesn't exist or is no longer available."}
          </p>
          <Button
            onClick={() => router.push("/client/blog")}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const categoryInfo = blogPost.category
    ? categories_data.find(c => c.id === blogPost.category)
    : null;

  const authorName = blogPost.author || "Attorney";
  const authorInitials = authorName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/client/blog")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-none">
            <CardContent className="p-0 space-y-6">
              {/* Title and Meta */}
              <div className="space-y-4">
                {categoryInfo && (
                  <Badge
                    variant="outline"
                    className={categoryInfo.color}
                  >
                    {categoryInfo.name}
                  </Badge>
                )}

                <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                  {blogPost.title}
                </h1>

                {/* Author and Date Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={undefined} />
                      <AvatarFallback>{authorInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {authorName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Attorney
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {blogPost.readTime || Math.ceil((blogPost.content?.length || 0) / 200)} min read
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{blogPost.views.toLocaleString()} views</span>
                    </div>
                    <div className="text-xs">
                      {formatRelativeTime(blogPost.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {blogPost.tags && blogPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {blogPost.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none pt-6">
                <div className="text-base sm:text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                  {formatContent(blogPost.content)}
                </div>
              </div>

              {/* Footer Stats */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>0</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>0</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/client/blog")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.article>
      </div>
    </div>
  );
}

