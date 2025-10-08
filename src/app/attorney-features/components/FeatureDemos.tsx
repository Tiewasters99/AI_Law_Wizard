'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/app/components/ui/button'
import { Textarea } from '@/app/components/ui/textarea'
import { Input } from '@/app/components/ui/input'
import { Card } from '@/app/components/ui/card'
import { 
  Send, 
  Upload, 
  Search, 
  Loader2, 
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Brain,
  Scale,
  File,
  Globe,
  Shield,
  Users,
  ArrowRight
} from 'lucide-react'

// Legal Wizard Interactive Demo
export function LegalWizardDemo() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFreeTier, setIsFreeTier] = useState(true)
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)

  const handleSubmit = async () => {
    if (!query.trim()) return

    // For free tier: Block second attempt and show sign-in modal
    if (isFreeTier && hasUsedFreeTrial) {
      setShowSignInModal(true)
      return
    }
    
    setIsProcessing(true)
    // Simulate AI processing
    setTimeout(() => {
      setResponse(`Based on your legal question: "${query}"

**Legal Analysis:**
This appears to be a matter concerning contract law and potential breach of agreement. Here are the key considerations:

1. **Contract Formation**: First, we need to verify if a valid contract exists with all essential elements (offer, acceptance, consideration, and mutual intent).

2. **Breach Assessment**: If the other party failed to perform as agreed, this may constitute a material breach depending on the terms.

3. **Remedies Available**: You may be entitled to:
   - Specific performance (forcing the other party to fulfill obligations)
   - Monetary damages for losses incurred
   - Rescission of the contract

4. **Recommended Next Steps**: 
   - Review the contract terms carefully
   - Document all communications and damages
   - Consider sending a formal demand letter
   - Consult with a specialized attorney for your jurisdiction

**Disclaimer**: This is AI-generated legal information for educational purposes. For specific legal advice, please consult a licensed attorney in your area.`)
      setIsProcessing(false)
      // Mark free trial as used
      if (isFreeTier) {
        setHasUsedFreeTrial(true)
      }
    }, 2000)
  }

  return (
    <div className="space-y-4">
      {/* Free Trial Notice */}
      {isFreeTier && !hasUsedFreeTrial && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800">
                Try one free legal consultation to explore this feature.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ask Your Legal Question
        </label>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., What are my rights if someone breaches a contract with me?"
          rows={4}
          className="w-full"
        />
      </div>
      <Button 
        onClick={handleSubmit}
        disabled={isProcessing || !query.trim()}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            AI Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Get AI Legal Analysis
          </>
        )}
      </Button>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3 text-purple-600">
              <Brain className="w-5 h-5" />
              <span className="font-semibold">AI Legal Analysis</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {response}
            </div>
          </div>

          {/* Sign In Prompt After Analysis */}
          {isFreeTier && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Continue with Unlimited Consultations
                </h3>
                <p className="text-gray-600 mb-4">
                  Your free trial is complete. Sign in as a lawyer for unlimited legal consultations and all professional features.
                </p>
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sign In to Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Sign In Modal - Shows when trying to use again */}
      {showSignInModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSignInModal(false)}
        >
          <Card className="p-8 max-w-md w-full bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Free Trial Used
              </h3>
              <p className="text-gray-600 mb-6">
                You've already used your free consultation. Sign in as a lawyer to get unlimited access to legal consultations and all professional features.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sign In as Lawyer
                </Button>
                <Button
                  onClick={() => setShowSignInModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// Document Analysis Demo  
export function DocumentAnalysisDemo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('')
  const [userQuery, setUserQuery] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [isFreeTier, setIsFreeTier] = useState(true) // Assume free tier for demo
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)

  const MAX_FREE_FILE_SIZE = 1 * 1024 * 1024 // 1MB for free users

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF, DOCX, or TXT file')
        return
      }

      // Check file size for free users
      if (isFreeTier && file.size > MAX_FREE_FILE_SIZE) {
        setError(`Free tier is limited to ${MAX_FREE_FILE_SIZE / (1024 * 1024)}MB files. Please sign in as a lawyer for larger files.`)
        return
      }

      setSelectedFile(file)
      setError('')
      handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setError('')
    
    try {
      if (isFreeTier) {
        // For free tier: Read file directly without embedding
        const reader = new FileReader()
        
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string
            setFileContent(content)
            setUploadedFilePath(file.name)
          } catch (err) {
            setError('Failed to read file')
            console.error('File read error:', err)
          } finally {
            setIsUploading(false)
          }
        }

        reader.onerror = () => {
          setError('Failed to read file')
          setIsUploading(false)
        }

        // Read text files directly, for others we'll need different handling
        if (file.type === 'text/plain') {
          reader.readAsText(file)
        } else {
          // For PDF and DOCX in free tier, we still need to process but won't create embeddings
          // Just extract text for direct use
          const formData = new FormData()
          formData.append('file', file)
          formData.append('skipEmbedding', 'true') // Flag to skip embedding

          const response = await fetch('/api/files/extract-text', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            throw new Error('Failed to extract text from document')
          }

          const data = await response.json()
          if (data.success) {
            setFileContent(data.text)
            setUploadedFilePath(file.name)
          } else {
            throw new Error(data.error || 'Text extraction failed')
          }
          setIsUploading(false)
        }
      } else {
        // For paid tier: Use full embedding pipeline
        const formData = new FormData()
        formData.append('files', file)

        const response = await fetch('/api/embedding', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await response.json()
        
        if (data.success && data.files && data.files.length > 0) {
          const uploadedFile = data.files[0]
          setUploadedFilePath(uploadedFile.fileName || uploadedFile.originalName || file.name)
        } else {
          setError(data.error || data.failedFiles?.[0]?.error || 'Upload failed')
        }
        setIsUploading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file. Please try again.')
      console.error('Upload error:', err)
      setIsUploading(false)
    }
  }

  const handleAnalysis = async () => {
    if (!uploadedFilePath) {
      setError('Please upload a document first')
      return
    }
    
    if (!userQuery.trim()) {
      setError('Please enter a question about the document')
      return
    }

    // For free tier: Block second attempt and show sign-in modal
    if (isFreeTier && hasUsedFreeTrial) {
      setShowSignInModal(true)
      return
    }
    
    setIsAnalyzing(true)
    setError('')
    
    try {
      if (isFreeTier && fileContent) {
        // For free tier: Use direct file content without embeddings
        const response = await fetch('/api/document-processing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userPrompt: userQuery,
            fileContent: fileContent, // Send raw content
            fileName: uploadedFilePath,
            mode: 'question_answering',
            skipVectorSearch: true // Flag to skip vector search
          })
        })

        if (!response.ok) {
          throw new Error('Analysis failed')
        }

        const data = await response.json()
        
        if (data.success) {
          setAnalysisResult({
            response: data.result,
            mode: data.responseMode,
            processedFiles: [{ name: uploadedFilePath }]
          })
          // Mark free trial as used
          if (isFreeTier) {
            setHasUsedFreeTrial(true)
          }
        } else {
          setError(data.error || 'Analysis failed')
        }
      } else {
        // For paid tier: Use full vector search with embeddings
        const response = await fetch('/api/document-processing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userPrompt: userQuery,
            filePath: uploadedFilePath,
            mode: 'question_answering'
          })
        })

        if (!response.ok) {
          throw new Error('Analysis failed')
        }

        const data = await response.json()
        
        if (data.success) {
          setAnalysisResult({
            response: data.result,
            mode: data.responseMode,
            processedFiles: data.processedFiles || []
          })
          // Mark free trial as used
          if (isFreeTier) {
            setHasUsedFreeTrial(true)
          }
        } else {
          setError(data.error || 'Analysis failed')
        }
      }
    } catch (err) {
      setError('Failed to analyze. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Step 1: Upload Document
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          {!selectedFile ? (
            <>
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload legal document
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports PDF, DOCX, TXT {isFreeTier && '(Max 1MB - One free analysis)'}
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-600">Uploading...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">{selectedFile.name}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Processing State - Show while uploading/reading */}
      {isUploading && selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Processing Document...</p>
              <p className="text-xs text-blue-700 mt-1">
                {isFreeTier 
                  ? 'Reading document for analysis...' 
                  : 'Creating embeddings for AI analysis. This may take a moment.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question Section - Show after file upload completes */}
      {uploadedFilePath && !isUploading && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800">
                  {isFreeTier 
                    ? 'Document ready! Ask one question to try.' 
                    : 'Document processed successfully!'}
                </p>
              </div>
              {isFreeTier && (
                <span className="text-xs text-green-700 font-medium">Free Trial</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2: Ask Questions About Your Document
            </label>
            <Textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="e.g., Analyze the contract terms and identify potential risks..."
              rows={4}
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleAnalysis}
            disabled={isAnalyzing || !userQuery.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {analysisResult && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Analysis Complete
            </h3>
            
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisResult.response}
              </ReactMarkdown>
            </div>
            
            {analysisResult.processedFiles && analysisResult.processedFiles.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-sm font-medium text-gray-700">Processed Files:</span>
                <ul className="mt-2 space-y-1">
                  {analysisResult.processedFiles.map((file: any, idx: number) => (
                    <li key={idx} className="text-sm text-gray-600">
                      {file.path || file.name || file.fileName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Sign In Prompt After Analysis */}
          {isFreeTier && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Continue with Unlimited Access
                </h3>
                <p className="text-gray-600 mb-4">
                  Your free trial is complete. Sign in as a lawyer to analyze unlimited documents, upload larger files, and access all professional features.
                </p>
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sign In to Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Sign In Modal - Shows when trying to use again */}
      {showSignInModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSignInModal(false)}
        >
          <Card className="p-8 max-w-md w-full bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Free Trial Used
              </h3>
              <p className="text-gray-600 mb-6">
                You've already used your free analysis. Sign in as a lawyer to get unlimited access to document analysis and all professional features.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sign In as Lawyer
                </Button>
                <Button
                  onClick={() => setShowSignInModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// Legal Research Demo
export function LegalResearchDemo() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [isFreeTier, setIsFreeTier] = useState(true)
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a legal research question')
      return
    }

    // For free tier: Block second attempt and show sign-in modal
    if (isFreeTier && hasUsedFreeTrial) {
      setShowSignInModal(true)
      return
    }
    
    setIsSearching(true)
    setError('')
    
    try {
      const response = await fetch('/api/document-processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: searchQuery,
          mode: 'question_answering'
        })
      })

      if (!response.ok) {
        throw new Error('Research failed')
      }

      const data = await response.json()
      
      if (data.success) {
        setResults({
          response: data.result,
          mode: data.responseMode
        })
        // Mark free trial as used
        if (isFreeTier) {
          setHasUsedFreeTrial(true)
        }
      } else {
        setError(data.error || 'Research failed')
      }
    } catch (err) {
      setError('Failed to search. Please try again.')
      console.error('Research error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Free Trial Notice */}
      {isFreeTier && !hasUsedFreeTrial && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800">
                Try one free legal research query to explore this feature.
              </p>
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Legal Research Question
        </label>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., What are the precedents for breach of contract in software licensing?"
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isSearching && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
          <p className="text-sm text-gray-600">Researching legal information...</p>
        </div>
      )}

      {results && !isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <Card className="p-4">
            <div className="flex items-start space-x-3">
              <Scale className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Research Results</h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {results.response}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </Card>

          {/* Sign In Prompt After Research */}
          {isFreeTier && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Continue with Unlimited Research
                </h3>
                <p className="text-gray-600 mb-4">
                  Your free trial is complete. Sign in as a lawyer for unlimited legal research and access to all professional features.
                </p>
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sign In to Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Sign In Modal - Shows when trying to search again */}
      {showSignInModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSignInModal(false)}
        >
          <Card className="p-8 max-w-md w-full bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Free Trial Used
              </h3>
              <p className="text-gray-600 mb-6">
                You've already used your free research query. Sign in as a lawyer to get unlimited access to legal research and all professional features.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sign In as Lawyer
                </Button>
                <Button
                  onClick={() => setShowSignInModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// Chat Consultation Demo
export function ChatConsultationDemo() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([
    {
      role: 'ai',
      content: 'Hello! I\'m your AI legal assistant. How can I help you with your legal questions today?'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isFreeTier, setIsFreeTier] = useState(true)
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    // For free tier: Block second message and show sign-in modal
    if (isFreeTier && hasUsedFreeTrial) {
      setShowSignInModal(true)
      return
    }

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const aiResponse = {
        role: 'ai' as const,
        content: `I understand your question about "${input}". Let me provide some guidance:

This is a common legal concern. Based on the information provided, here are the key points to consider:

1. **Legal Basis**: Your situation falls under general contract/civil law principles.

2. **Your Rights**: You have several legal options available, including negotiation, mediation, or potential litigation.

3. **Immediate Actions**: I recommend documenting all relevant communications and gathering supporting evidence.

4. **Professional Advice**: For specific legal action, consulting with a licensed attorney in your jurisdiction is advisable.

Would you like me to clarify any specific aspect of this guidance?`
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
      // Mark free trial as used after first message
      if (isFreeTier) {
        setHasUsedFreeTrial(true)
      }
    }, 2000)
  }

  return (
    <div className="space-y-4">
      {/* Free Trial Notice */}
      {isFreeTier && !hasUsedFreeTrial && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800">
                Try one free chat consultation to explore this feature.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-900'
            }`}>
              {msg.role === 'ai' && (
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600">AI Legal Assistant</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            </div>
          </div>
        )}
      </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your legal question..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
          />
          <Button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sign In Prompt After Chat - Show if messages > 3 (initial AI + user + AI response) */}
      {isFreeTier && messages.length > 3 && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Continue Chatting
            </h3>
            <p className="text-gray-600 mb-4">
              Your free trial is complete. Sign in as a lawyer for unlimited chat consultations and all professional features.
            </p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Sign In to Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Sign In Modal */}
      {showSignInModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSignInModal(false)}
        >
          <Card className="p-8 max-w-md w-full bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Free Trial Used
              </h3>
              <p className="text-gray-600 mb-6">
                You've already used your free chat consultation. Sign in as a lawyer to get unlimited access and all professional features.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sign In as Lawyer
                </Button>
                <Button
                  onClick={() => setShowSignInModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// OneDrive Integration Demo
export function OneDriveIntegrationDemo() {
  const [isConnected, setIsConnected] = useState(false)
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)

  const handleConnect = () => {
    // OneDrive is lawyer-only, show sign-in modal immediately
    setShowSignInModal(true)
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">OneDrive Integration</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          OneDrive integration is exclusively available for lawyers. Sign in to access your legal documents stored in OneDrive for instant AI-powered analysis.
        </p>
        <Button
          onClick={handleConnect}
          className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Globe className="w-5 h-5 mr-2" />
          Sign In to Connect OneDrive
        </Button>
      </div>

      {/* Sign In Modal - OneDrive is lawyer-only */}
      {showSignInModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSignInModal(false)}
        >
          <Card className="p-8 max-w-md w-full bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Lawyer-Only Feature
              </h3>
              <p className="text-gray-600 mb-6">
                OneDrive integration is exclusively available for lawyers. Sign in with a lawyer account to connect your OneDrive and access your legal documents.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sign In as Lawyer
                </Button>
                <Button
                  onClick={() => setShowSignInModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// Placeholder for premium features
export function PremiumFeatureDemo({ featureName }: { featureName: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Scale className="w-10 h-10 text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Lawyer-Exclusive Feature</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {featureName} is exclusively available for lawyers. Sign in with a lawyer account to unlock this professional feature with unlimited usage.
      </p>
      <Button
        onClick={() => window.location.href = '/login'}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        size="lg"
      >
        <Users className="w-5 h-5 mr-2" />
        Sign In as Lawyer
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}

