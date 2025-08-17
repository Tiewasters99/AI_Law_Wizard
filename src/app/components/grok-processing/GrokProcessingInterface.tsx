'use client'

import React, { useState, useRef } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { useToast } from '../ui/use-toast'
import { 
  Brain, 
  FileText, 
  Download, 
  Edit3, 
  Save, 
  X, 
  Play, 
  CheckCircle, 
  Clock, 
  Zap,
  Search,
  Settings,
  BarChart3,
  FileSearch,
  Merge,
  Scissors,
  FileDown,
  FilePlus
} from 'lucide-react'

interface AgentStep {
  step: number
  phase: 'planning' | 'execution' | 'final'
  tool?: string
  args?: any[]
  result: string
  timestamp: string
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

interface ProcessedFileInfo {
  fileId: string
  fileName: string
  originalName: string
  contentLength: number
  fileSize: number
  url: string
}

interface ToolExecutionPlan {
  tools: string[]
  reasoning: string
  executionOrder: string[]
}

interface GrokProcessingProps {
  onComplete?: (result: string, generatedFile: string) => void
}

export function GrokProcessingInterface({ onComplete }: GrokProcessingProps) {
  const [userPrompt, setUserPrompt] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([])
  const [finalResult, setFinalResult] = useState('')
  const [generatedFile, setGeneratedFile] = useState('')
  const [showFileEditor, setShowFileEditor] = useState(false)
  const [editedFile, setEditedFile] = useState('')
  const [processingLogs, setProcessingLogs] = useState<string[]>([])
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileInfo[]>([])
  const [toolExecutionPlan, setToolExecutionPlan] = useState<ToolExecutionPlan | null>(null)
  const [tokenUsage, setTokenUsage] = useState<any>(null)
  const { toast } = useToast()
  const fileEditorRef = useRef<HTMLTextAreaElement>(null)

  const handleProcess = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for processing',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    setAgentSteps([])
    setFinalResult('')
    setProcessingLogs([])
    setProcessedFiles([])
    setToolExecutionPlan(null)
    setTokenUsage(null)

    try {
      toast({
        title: 'Processing',
        description: 'Analyzing your request and finding relevant documents...',
      })

      const response = await fetch('/api/grok-processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userPrompt,
          searchQuery: searchQuery || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        setAgentSteps(data.agentSteps || [])
        setFinalResult(data.result || '')
        setProcessingLogs(data.logs || [])
        setProcessedFiles(data.processedFiles || [])
        setToolExecutionPlan(data.toolExecutionPlan || null)
        setTokenUsage(data.tokenUsage || null)
        
        if (data.generatedFile) {
          setGeneratedFile(data.generatedFile)
          setEditedFile(data.generatedFile)
        }

        toast({
          title: 'Success',
          description: `Successfully processed ${data.processedFiles?.length || 0} relevant documents`
        })

        if (onComplete) {
          onComplete(data.result || '', data.generatedFile || '')
        }
      } else {
        throw new Error(data.error || 'Processing failed')
      }
    } catch (error) {
      console.error('Processing error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process documents',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadFile = () => {
    const blob = new Blob([editedFile], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grok_processing_report_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSaveChanges = () => {
    setGeneratedFile(editedFile)
    setShowFileEditor(false)
    toast({
      title: 'Success',
      description: 'Changes saved successfully'
    })
  }

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'getAllFiles': return <FileText className="w-4 h-4" />
      case 'getFile': return <FileSearch className="w-4 h-4" />
      case 'edit': return <Edit3 className="w-4 h-4" />
      case 'analyze': return <BarChart3 className="w-4 h-4" />
      case 'extract': return <Scissors className="w-4 h-4" />
      case 'getFilesInfo': return <Settings className="w-4 h-4" />
      case 'mergeFiles': return <Merge className="w-4 h-4" />
      case 'extractFormattedContent': return <FileDown className="w-4 h-4" />
      case 'createMergedDocument': return <FilePlus className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const getToolName = (tool: string) => {
    switch (tool) {
      case 'getAllFiles': return 'Get All Files'
      case 'getFile': return 'Get Specific File'
      case 'edit': return 'Edit Content'
      case 'analyze': return 'Analyze Content'
      case 'extract': return 'Extract Information'
      case 'getFilesInfo': return 'Get Files Info'
      case 'mergeFiles': return 'Merge Files'
      case 'extractFormattedContent': return 'Extract Formatted Content'
      case 'createMergedDocument': return 'Create Merged Document'
      default: return tool
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'execution': return 'bg-green-100 text-green-800'
      case 'final': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTokenUsage = (usage: any) => {
    if (!usage) return null
    
    return {
      total: usage.totalTokens?.toLocaleString() || '0',
      prompt: usage.promptTokens?.toLocaleString() || '0',
      completion: usage.completionTokens?.toLocaleString() || '0',
      cost: usage.totalCost ? `$${usage.totalCost.toFixed(4)}` : 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Document Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              What would you like to analyze? *
            </label>
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe what you want to analyze, extract, or understand from your documents..."
              rows={4}
              disabled={isProcessing}
              className="text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Search Focus (Optional)
            </label>
            <Textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Specific terms or concepts to focus on during search..."
              rows={2}
              disabled={isProcessing}
            />
          </div>

          <Button 
            onClick={handleProcess} 
            disabled={isProcessing || !userPrompt.trim()}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start AI Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tool Execution Plan */}
      {toolExecutionPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              AI Execution Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reasoning:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {toolExecutionPlan.reasoning}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Execution Order:</h4>
                <div className="flex flex-wrap gap-2">
                  {toolExecutionPlan.executionOrder.map((tool, index) => (
                    <div key={tool} className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm font-medium">{getToolName(tool)}</span>
                      {getToolIcon(tool)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Files */}
      {processedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relevant Documents Found
              <Badge variant="secondary">{processedFiles.length} files</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processedFiles.map((file) => (
                <div key={file.fileId} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate">{file.originalName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {file.fileSize > 0 ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Content length: {file.contentLength.toLocaleString()} characters
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Usage */}
      {tokenUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Token Usage & Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Tokens</p>
                <p className="text-lg font-bold text-blue-600">{formatTokenUsage(tokenUsage)?.total}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Prompt Tokens</p>
                <p className="text-lg font-bold text-green-600">{formatTokenUsage(tokenUsage)?.prompt}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Completion Tokens</p>
                <p className="text-lg font-bold text-purple-600">{formatTokenUsage(tokenUsage)?.completion}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Estimated Cost</p>
                <p className="text-lg font-bold text-orange-600">{formatTokenUsage(tokenUsage)?.cost}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Logs */}
      {processingLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Processing Logs
              <Badge variant="secondary">{processingLogs.length} entries</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700">
                {processingLogs.join('\n')}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Steps */}
      {agentSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              AI Processing Steps
              <Badge variant="secondary">{agentSteps.length} steps</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentSteps.map((step, index) => (
                <div key={`${step.step}-${index}`} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    {getToolIcon(step.tool || 'unknown')}
                    <Badge className={getPhaseColor(step.phase)}>
                      {step.phase.charAt(0).toUpperCase() + step.phase.slice(1)}
                    </Badge>
                    <Badge variant="outline">Step {step.step}</Badge>
                    {step.tool && (
                      <Badge variant="secondary">{getToolName(step.tool)}</Badge>
                    )}
                    <span className="text-sm text-gray-500 ml-auto">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {step.args && step.args.length > 0 && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700">Arguments:</label>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(step.args, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Result:</label>
                    <div className="text-sm bg-blue-50 p-3 rounded mt-1 max-h-32 overflow-y-auto border">
                      {step.result}
                    </div>
                  </div>

                  {step.tokenUsage && (
                    <div className="mt-2 text-xs text-gray-500">
                      Tokens: {step.tokenUsage.promptTokens} prompt + {step.tokenUsage.completionTokens} completion = {step.tokenUsage.totalTokens} total
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Result */}
      {finalResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Analysis Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{finalResult}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated File Section */}
      {generatedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Report
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileEditor(!showFileEditor)}
                >
                  {showFileEditor ? <X className="w-4 h-4 mr-1" /> : <Edit3 className="w-4 h-4 mr-1" />}
                  {showFileEditor ? 'Hide Editor' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadFile}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showFileEditor ? (
              <div className="space-y-4">
                <Textarea
                  ref={fileEditorRef}
                  value={editedFile}
                  onChange={(e) => setEditedFile(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveChanges}>
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditedFile(generatedFile)
                      setShowFileEditor(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto border">
                <pre className="text-sm font-mono whitespace-pre-wrap text-gray-700">
                  {generatedFile}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
