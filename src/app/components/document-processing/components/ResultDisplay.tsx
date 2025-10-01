import { motion } from 'framer-motion'
import { CheckCircle, MessageSquare, Copy, Download, RefreshCw } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import ReactMarkdown from 'react-markdown'
import { useToast } from '../../ui/use-toast'

interface ResultDisplayProps {
  result: string
  confidence: number
  processingTime: number
  onContinueChat: () => void
  onNewAnalysis: () => void
}

export const ResultDisplay = ({
  result,
  confidence,
  processingTime,
  onContinueChat,
  onNewAnalysis
}: ResultDisplayProps) => {
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    toast({
      title: 'Copied',
      description: 'Result copied to clipboard'
    })
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-${new Date().getTime()}.md`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Downloaded',
      description: 'Analysis result downloaded'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-green-900">Analysis Complete</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-white/60">
                Confidence: {Math.round(confidence * 100)}%
              </Badge>
              <Badge variant="secondary" className="bg-white/60">
                {processingTime.toFixed(1)}s
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onContinueChat}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Continue Chat
            </Button>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="border-2 border-gray-300 hover:bg-gray-100 rounded-xl"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-2 border-gray-300 hover:bg-gray-100 rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={onNewAnalysis}
              variant="outline"
              className="border-2 border-blue-300 hover:bg-blue-50 text-blue-700 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

