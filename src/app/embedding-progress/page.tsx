'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { useToast } from '@/app/components/ui/use-toast'
import Layout from '@/app/components/Layout'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  FileText, 
  RefreshCw,
  Trash2,
  BarChart3
} from 'lucide-react'

interface EmbeddingChunk {
  id: string
  chunkIndex: number
  contentLength: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  embeddingId?: string
  error?: string
  processedAt?: string
  createdAt: string
  updatedAt: string
}

interface EmbeddingJob {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  filePath?: string
  totalChunks: number
  processedChunks: number
  failedChunks: number
  error?: string
  startedAt: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  chunks: EmbeddingChunk[]
  user?: {
    id: string
    email: string
    name?: string
  }
}

interface JobStats {
  totalJobs: number
  totalChunks: number
  completedChunks: number
  statusBreakdown: Record<string, number>
}

export default function EmbeddingProgressPage() {
  const [jobs, setJobs] = useState<EmbeddingJob[]>([])
  const [stats, setStats] = useState<JobStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/embedding/jobs')
      const data = await response.json()
      if (data.jobs) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch embedding jobs",
        variant: "destructive",
      })
    }
  }, [toast])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/embedding/stats')
      const data = await response.json()
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  const refreshData = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([fetchJobs(), fetchStats()])
    setRefreshing(false)
  }, [fetchJobs, fetchStats])

  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/embedding/jobs?jobId=${jobId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Job deleted successfully",
        })
        await refreshData()
      } else {
        throw new Error('Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchJobs(), fetchStats()])
      setLoading(false)
    }
    loadData()

    // Set up polling for real-time updates
    const interval = setInterval(refreshData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [fetchJobs, fetchStats, refreshData])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getProgressPercentage = (job: EmbeddingJob) => {
    if (job.totalChunks === 0) return 0
    return Math.round((job.processedChunks / job.totalChunks) * 100)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Embedding Progress</h1>
          <p className="text-gray-600">Track the progress of your file embeddings</p>
        </div>
        <Button onClick={refreshData} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChunks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Chunks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedChunks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalChunks > 0 
                  ? Math.round((stats.completedChunks / stats.totalChunks) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Jobs</h2>
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No embedding jobs found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <CardTitle className="text-lg">{job.originalName}</CardTitle>
                        <CardDescription>
                          {formatFileSize(job.fileSize)} • {job.fileType}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteJob(job.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress: {job.processedChunks}/{job.totalChunks} chunks</span>
                      <span>{getProgressPercentage(job)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(job)}%` }}
                      />
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Started:</span>
                      <br />
                      {formatDate(job.startedAt)}
                    </div>
                    {job.completedAt && (
                      <div>
                        <span className="font-medium">Completed:</span>
                        <br />
                        {formatDate(job.completedAt)}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Failed Chunks:</span>
                      <br />
                      {job.failedChunks}
                    </div>
                  </div>

                  {/* Error Message */}
                  {job.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-800 text-sm">
                        <strong>Error:</strong> {job.error}
                      </p>
                    </div>
                  )}

                  {/* Chunks Details (Collapsible) */}
                  {job.chunks && job.chunks.length > 0 && (
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        View Chunks ({job.chunks.length})
                      </summary>
                      <div className="mt-3 space-y-2">
                        {job.chunks.map((chunk) => (
                          <div
                            key={chunk.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(chunk.status)}
                              <span>Chunk {chunk.chunkIndex + 1}</span>
                              <span className="text-gray-500">
                                ({chunk.contentLength} chars)
                              </span>
                            </div>
                            <Badge className={getStatusColor(chunk.status)}>
                              {chunk.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
      </div>
    </Layout>
  )
}
