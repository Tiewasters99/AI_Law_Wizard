"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Search,
  Eye,
  ThumbsUp,
  MessageSquare,
  BookOpen,
  Clock,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    title: string;
    experience: number;
  };
  publishedAt: Date;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  category: string;
  featured: boolean;
  imageUrl?: string;
}

interface BlogCategory {
  id: string;
  name: string;
  count: number;
  color: string;
}

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const categories_data: BlogCategory[] = useMemo(
    () => [
      {
        id: "all",
        name: "All Posts",
        count: 0,
        color: "bg-gray-100 text-gray-800",
      },
      {
        id: "contract-law",
        name: "Contract Law",
        count: 12,
        color: "bg-blue-100 text-blue-800",
      },
      {
        id: "litigation",
        name: "Litigation",
        count: 8,
        color: "bg-red-100 text-red-800",
      },
      {
        id: "business-law",
        name: "Business Law",
        count: 15,
        color: "bg-green-100 text-green-800",
      },
      {
        id: "family-law",
        name: "Family Law",
        count: 6,
        color: "bg-purple-100 text-purple-800",
      },
      {
        id: "criminal-law",
        name: "Criminal Law",
        count: 4,
        color: "bg-orange-100 text-orange-800",
      },
      {
        id: "real-estate",
        name: "Real Estate",
        count: 9,
        color: "bg-yellow-100 text-yellow-800",
      },
      {
        id: "employment",
        name: "Employment Law",
        count: 7,
        color: "bg-pink-100 text-pink-800",
      },
    ],
    []
  );

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockPosts: BlogPost[] = [
      {
        id: "1",
        title:
          "Understanding Contract Termination Clauses: A Comprehensive Guide",
        excerpt:
          "Learn about the different types of termination clauses in contracts and how they can protect your business interests.",
        content:
          "Contract termination clauses are crucial elements that define the circumstances under which a contract can be ended...",
        author: {
          id: "attorney-1",
          name: "Sarah Johnson",
          title: "Senior Partner",
          experience: 15,
        },
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        readTime: 8,
        views: 1247,
        likes: 89,
        comments: 23,
        tags: ["contracts", "business", "legal-advice"],
        category: "contract-law",
        featured: true,
      },
      {
        id: "2",
        title: "Recent Changes in Employment Law: What Employers Need to Know",
        excerpt:
          "Stay updated with the latest changes in employment legislation and their impact on your business operations.",
        content:
          "The employment law landscape is constantly evolving, with new regulations and court decisions shaping the way businesses operate...",
        author: {
          id: "attorney-2",
          name: "Michael Chen",
          title: "Employment Law Specialist",
          experience: 12,
        },
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        readTime: 12,
        views: 892,
        likes: 67,
        comments: 18,
        tags: ["employment", "hr", "compliance"],
        category: "employment",
        featured: false,
      },
      {
        id: "3",
        title: "Divorce Mediation vs. Litigation: Choosing the Right Path",
        excerpt:
          "Explore the pros and cons of mediation versus litigation in divorce proceedings to make an informed decision.",
        content:
          "When facing a divorce, one of the most important decisions you'll make is how to proceed with the legal process...",
        author: {
          id: "attorney-3",
          name: "Emily Rodriguez",
          title: "Family Law Attorney",
          experience: 8,
        },
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        readTime: 6,
        views: 1563,
        likes: 112,
        comments: 31,
        tags: ["divorce", "mediation", "family-law"],
        category: "family-law",
        featured: true,
      },
      {
        id: "4",
        title: "Real Estate Due Diligence: A Step-by-Step Checklist",
        excerpt:
          "Ensure you're fully prepared for your real estate transaction with this comprehensive due diligence checklist.",
        content:
          "Real estate transactions involve significant financial investments, making due diligence a critical step...",
        author: {
          id: "attorney-4",
          name: "David Thompson",
          title: "Real Estate Attorney",
          experience: 20,
        },
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        readTime: 10,
        views: 743,
        likes: 45,
        comments: 12,
        tags: ["real-estate", "due-diligence", "checklist"],
        category: "real-estate",
        featured: false,
      },
      {
        id: "5",
        title: "Criminal Defense Strategies: Building a Strong Case",
        excerpt:
          "Learn about effective criminal defense strategies and how experienced attorneys approach different types of cases.",
        content:
          "Criminal defense requires a strategic approach that considers the unique circumstances of each case...",
        author: {
          id: "attorney-5",
          name: "Lisa Wang",
          title: "Criminal Defense Attorney",
          experience: 10,
        },
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        readTime: 15,
        views: 2103,
        likes: 156,
        comments: 42,
        tags: ["criminal-defense", "legal-strategy", "court"],
        category: "criminal-law",
        featured: true,
      },
    ];

    setPosts(mockPosts);
    setFilteredPosts(mockPosts);
    setCategories(
      categories_data.map(cat => ({
        ...cat,
        count:
          cat.id === "all"
            ? mockPosts.length
            : mockPosts.filter(p => p.category === cat.id).length,
      }))
    );
    setIsLoading(false);
  }, [categories_data]);

  // Filter and search posts
  useEffect(() => {
    let filtered = posts;

    // Search by title, excerpt, or tags
    if (searchQuery) {
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some(tag =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.publishedAt.getTime() - a.publishedAt.getTime();
        case "oldest":
          return a.publishedAt.getTime() - b.publishedAt.getTime();
        case "most-viewed":
          return b.views - a.views;
        case "most-liked":
          return b.likes - a.likes;
        case "most-commented":
          return b.comments - a.comments;
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, searchQuery, selectedCategory, sortBy, categories_data]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
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
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Legal Blog</h1>
              <p className="text-gray-600 mt-2">
                Expert insights and legal guidance from our attorney community
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {filteredPosts.length}
              </div>
              <div className="text-sm text-gray-500">Articles Available</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-viewed">Most Viewed</option>
              <option value="most-liked">Most Liked</option>
              <option value="most-commented">Most Commented</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-xs"
                >
                  {category.name}
                  {category.count > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          variant="outline"
                          className={
                            categories.find(c => c.id === post.category)?.color
                          }
                        >
                          {categories.find(c => c.id === post.category)?.name}
                        </Badge>
                        {post.featured && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {post.title}
                      </CardTitle>

                      <p className="text-sm text-gray-600 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Author Info */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>
                            {post.author.name
                              .split(" ")
                              .map(n => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {post.author.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {post.author.title} • {post.author.experience} years
                            exp
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime} min</span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(post.publishedAt)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts
                .filter(post => post.featured)
                .map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <Card className="h-full">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge
                            variant="outline"
                            className={
                              categories.find(c => c.id === post.category)
                                ?.color
                            }
                          >
                            {categories.find(c => c.id === post.category)?.name}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>

                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {post.title}
                        </CardTitle>

                        <p className="text-sm text-gray-600 line-clamp-3">
                          {post.excerpt}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Author Info */}
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>
                              {post.author.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {post.author.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {post.author.title} • {post.author.experience}{" "}
                              years exp
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime} min</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(post.publishedAt)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                          >
                            Read More
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
