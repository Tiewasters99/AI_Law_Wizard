'use client'

import React from 'react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Search, 
  Zap,
  Brain,
  BarChart3,
  Scissors,
  FileDown,
  Merge,
  ArrowRight,
  Timer,
  Activity
} from 'lucide-react'
import { ProgressEvent, ProgressEventType, OperationStep } from '../../hooks/useDocumentProcessing'

interface OperationChainProgressProps {
  operationChain: OperationStep[]
  currentStep: number
  totalSteps: number
  isChain: boolean
}

export const OperationChainProgress: React.FC<OperationChainProgressProps> = ({
  operationChain,
  currentStep,
  totalSteps,
  isChain
}) => {
  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'summary': return <FileText className="w-4 h-4" />
      case 'analysis': return <BarChart3 className="w-4 h-4" />
      case 'extraction': return <Scissors className="w-4 h-4" />
      case 'transformation': return <FileDown className="w-4 h-4" />
      case 'file_operation': return <Merge className="w-4 h-4" />
      case 'qa': return <Brain className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'summary': return 'bg-blue-500'
      case 'analysis': return 'bg-green-500'
      case 'extraction': return 'bg-purple-500'
      case 'transformation': return 'bg-orange-500'
      case 'file_operation': return 'bg-pink-500'
      case 'qa': return 'bg-indigo-500'
      default: return 'bg-gray-500'
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep - 1) return 'completed'
    if (stepIndex === currentStep - 1) return 'current'
    return 'pending'
  }

  if (!isChain || operationChain.length <= 1) {
    const operation = operationChain[0]
    if (!operation) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Single Operation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border">
            <div className={`p-2 rounded-full text-white ${getOperationColor(operation.operation)}`}>
              {getOperationIcon(operation.operation)}
            </div>
            <div className="flex-1">
              <h3 className="font-medium capitalize">{operation.operation}</h3>
              {operation.description && (
                <p className="text-sm text-gray-600">{operation.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {currentStep > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Operation Chain Progress
          <Badge variant="secondary">{currentStep}/{totalSteps}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Operation Steps */}
          <div className="space-y-3">
            {operationChain.map((operation, index) => {
              const status = getStepStatus(index)
              
              return (
                <div key={index} className="flex items-center gap-3">
                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${status === 'completed' ? 'bg-green-500 text-white' : 
                        status === 'current' ? 'bg-blue-500 text-white' : 
                        'bg-gray-200 text-gray-600'}
                    `}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : status === 'current' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    
                    {index < operationChain.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Operation details */}
                  <div className={`
                    flex-1 p-3 rounded-lg border transition-all
                    ${status === 'completed' ? 'bg-green-50 border-green-200' : 
                      status === 'current' ? 'bg-blue-50 border-blue-200' : 
                      'bg-gray-50 border-gray-200'}
                  `}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded text-white ${getOperationColor(operation.operation)}`}>
                        {getOperationIcon(operation.operation)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium capitalize">{operation.operation}</h4>
                        {operation.description && (
                          <p className="text-sm text-gray-600">{operation.description}</p>
                        )}
                      </div>
                      {operation.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {(operation.confidence * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RealTimeLogsProps {
  events: ProgressEvent[]
  maxEvents?: number
}

export const RealTimeLogs: React.FC<RealTimeLogsProps> = ({ 
  events, 
  maxEvents = 50 
}) => {
  const getEventIcon = (type: ProgressEventType) => {
    switch (type) {
      case ProgressEventType.STARTED: return <Zap className="w-3 h-3 text-blue-500" />
      case ProgressEventType.CLASSIFICATION: return <Brain className="w-3 h-3 text-purple-500" />
      case ProgressEventType.FILES_SEARCH: return <Search className="w-3 h-3 text-orange-500" />
      case ProgressEventType.FILES_FOUND: return <FileText className="w-3 h-3 text-green-500" />
      case ProgressEventType.OPERATION_START: return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
      case ProgressEventType.OPERATION_COMPLETE: return <CheckCircle className="w-3 h-3 text-green-500" />
      case ProgressEventType.COMPLETE: return <CheckCircle className="w-3 h-3 text-green-600" />
      case ProgressEventType.ERROR: return <AlertCircle className="w-3 h-3 text-red-500" />
      default: return <Clock className="w-3 h-3 text-gray-500" />
    }
  }

  const getEventBgColor = (type: ProgressEventType) => {
    switch (type) {
      case ProgressEventType.ERROR: return 'bg-red-50 border-red-200'
      case ProgressEventType.COMPLETE: return 'bg-green-50 border-green-200'
      case ProgressEventType.OPERATION_START: return 'bg-blue-50 border-blue-200'
      case ProgressEventType.OPERATION_COMPLETE: return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const recentEvents = events.slice(-maxEvents).reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Real-time Logs
          <Badge variant="secondary">{events.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {recentEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No events yet. Processing will show real-time updates here.</p>
            </div>
          ) : (
            recentEvents.map((event, index) => (
              <div 
                key={`${event.id}-${index}`} 
                className={`p-3 rounded-lg border ${getEventBgColor(event.type)}`}
              >
                <div className="flex items-start gap-2">
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {event.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.step && event.totalSteps && (
                        <Badge variant="outline" className="text-xs">
                          Step {event.step}/{event.totalSteps}
                        </Badge>
                      )}
                      {event.operation && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {event.operation}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatusCardsProps {
  isProcessing: boolean
  isConnected: boolean
  currentStep: number
  totalSteps: number
  processedFiles: any[]
  processingTime: number
  confidence: number
  error: string | null
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  isProcessing,
  isConnected,
  currentStep,
  totalSteps,
  processedFiles,
  processingTime,
  confidence,
  error
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Connection Status */}
      <Card className={isConnected ? 'border-green-200' : 'border-red-200'}>
        <CardContent className="p-4 text-center">
          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
            isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isConnected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <p className="text-xs text-gray-600">Connection</p>
          <p className="text-sm font-bold">{isConnected ? 'Connected' : 'Disconnected'}</p>
        </CardContent>
      </Card>

      {/* Progress Status */}
      <Card className={isProcessing ? 'border-blue-200' : 'border-gray-200'}>
        <CardContent className="p-4 text-center">
          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
            isProcessing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
          </div>
          <p className="text-xs text-gray-600">Progress</p>
          <p className="text-sm font-bold">{currentStep}/{totalSteps}</p>
        </CardContent>
      </Card>

      {/* Files Processed */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center bg-purple-100 text-purple-600">
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-xs text-gray-600">Files</p>
          <p className="text-sm font-bold">{processedFiles.length}</p>
        </CardContent>
      </Card>

      {/* Processing Time */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center bg-orange-100 text-orange-600">
            <Timer className="w-4 h-4" />
          </div>
          <p className="text-xs text-gray-600">Time</p>
          <p className="text-sm font-bold">
            {processingTime > 0 ? `${processingTime.toFixed(1)}s` : '--'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

interface IntermediateResultsProps {
  intermediateResults: string[]
  operationChain: OperationStep[]
}

export const IntermediateResults: React.FC<IntermediateResultsProps> = ({
  intermediateResults,
  operationChain
}) => {
  if (intermediateResults.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="w-5 h-5" />
          Intermediate Results
          <Badge variant="secondary">{intermediateResults.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {intermediateResults.map((result, index) => {
            const operation = operationChain[index]
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Step {index + 1}</Badge>
                  {operation && (
                    <Badge variant="secondary" className="capitalize">
                      {operation.operation}
                    </Badge>
                  )}
                </div>
                <div className="bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap text-gray-700">
                    {result.length > 300 ? `${result.substring(0, 300)}...` : result}
                  </pre>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
