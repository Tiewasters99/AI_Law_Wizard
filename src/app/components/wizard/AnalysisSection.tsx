'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { FolderOpen, ArrowRight, FileText, CheckCircle, Brain } from 'lucide-react'
import { DocumentAnalysisInterface } from '../document-processing/DocumentAnalysisInterface'

interface ServerFile {
  id: string
  fileName: string
  originalName: string
  size: number
  uploadedAt: string
  modifiedAt: string
  path: string
}

interface AnalysisSectionProps {
  files: ServerFile[]
  grokResult: string | null
  onBackToFiles: () => void
  onAnalysisStart: () => Promise<boolean>
  onAnalysisComplete: (result: string) => void
  onNewAnalysis: () => void
}

export const AnalysisSection = ({
  files,
  grokResult,
  onBackToFiles,
  onAnalysisStart,
  onAnalysisComplete,
  onNewAnalysis
}: AnalysisSectionProps) => {
  const getAllFiles = () => {
    return files.filter(file => file.fileName && file.fileName.trim() !== '')
  }

  const hasFiles = getAllFiles().length > 0

  if (!hasFiles) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <FolderOpen className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
          <p className="text-gray-600 mb-4">
            Connect documents before starting analysis.
          </p>
          <Button
            onClick={onBackToFiles}
            variant="outline"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Documents
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analysis Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Examples</CardTitle>
          <CardDescription>
            Try asking these types of questions to get the most out of your AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-blue-900">Summary</h4>
              </div>
              <p className="text-sm text-blue-800">
                &ldquo;Summarize the key points from all documents&rdquo;
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-900">Action Items</h4>
              </div>
              <p className="text-sm text-green-800">
                &ldquo;Extract action items and deadlines&rdquo;
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-semibold text-purple-900">Themes</h4>
              </div>
              <p className="text-sm text-purple-800">
                &ldquo;What are the main themes discussed?&rdquo;
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Start Analysis</CardTitle>
          <CardDescription>
            Enter your question or request below to begin AI-powered document analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentAnalysisInterface
            onBeforeStart={onAnalysisStart}
            onComplete={(result, generatedFile) => {
              onAnalysisComplete(result)
            }}
          />
        </CardContent>
      </Card>

      {/* Analysis Complete */}
      {grokResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">Analysis Complete</h3>
                  <p className="text-green-700">Your AI analysis finished successfully</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={onNewAnalysis}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  New Analysis
                </Button>
                <Button
                  onClick={onBackToFiles}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Back to Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
