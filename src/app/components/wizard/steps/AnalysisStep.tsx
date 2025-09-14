'use client'

import { Button } from '../../ui/button'
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  RotateCcw,
  Download,
  Coins
} from 'lucide-react'
import { GrokProcessingInterface } from '../../document-processing/GrokProcessingInterface'
import { QueryHistoryWidget } from '../../document-processing/QueryHistoryWidget'
import { Wallet } from '../../../lib/stripe'
import { useRouter } from 'next/navigation'

interface ServerFile {
  id: string
  fileName: string
  originalName: string
  size: number
  uploadedAt: string
  modifiedAt: string
  path: string
}

interface AnalysisStepProps {
  files: ServerFile[]
  grokResult: string | null
  wallet: Wallet | null
  onBackToDocuments: () => void
  onAnalysisStart: () => Promise<boolean>
  onAnalysisComplete: (result: string) => void
  onNewAnalysis: () => void
}

export const AnalysisStep = ({
  files,
  grokResult,
  wallet,
  onBackToDocuments,
  onAnalysisStart,
  onAnalysisComplete,
  onNewAnalysis
}: AnalysisStepProps) => {
  const router = useRouter()
  
  const getAllFiles = () => {
    return files.filter(file => file.fileName && file.fileName.trim() !== '')
  }

  const allFiles = getAllFiles()
  const hasFiles = allFiles.length > 0

  if (!hasFiles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
              <FileText className="w-16 h-16 text-blue-600" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Analyze
            </h2>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
              Upload your documents first to begin AI-powered analysis
            </p>

            <Button 
              onClick={onBackToDocuments} 
              size="lg" 
              className="px-12 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Upload Documents
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {wallet && (
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-200 shadow-sm">
                <Coins className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">{wallet.tokens}</span>
                <span className="text-blue-700 text-sm">credits</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">{allFiles.length} documents</span>
            </div>
          </div>
          
          <Button onClick={onBackToDocuments} variant="outline" size="lg" className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Analysis Results */}
        {grokResult && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                <span className="text-xl font-semibold text-green-900">Analysis Complete</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onNewAnalysis}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
                
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Analysis Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 md:p-8 lg:p-12">
                <GrokProcessingInterface
                  onBeforeStart={onAnalysisStart}
                  onComplete={(result, generatedFile) => {
                    onAnalysisComplete(result)
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Query History Sidebar */}
          <div className="lg:col-span-1">
            <QueryHistoryWidget 
              onViewFullHistory={() => router.push('/query-history')}
              className="sticky top-6"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
