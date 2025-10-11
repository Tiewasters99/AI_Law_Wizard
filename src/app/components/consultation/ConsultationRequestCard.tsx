'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  AlertTriangle,
  FileText,
  User,
  Building,
  Mail,
  Phone
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { colors } from '@/app/lib/designSystem'
import { useRouter } from 'next/navigation'

interface ConsultationRequest {
  id: string
  caseType: string
  description: string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  conversation?: {
    id: string
    unreadByAttorney: number
  }
}

interface Client {
  id: string
  name: string | null
  email: string | null
  image: string | null
  customerProfile?: {
    companyName: string | null
    industry: string | null
    phone: string | null
  } | null
}

interface ConsultationRequestCardProps {
  request: ConsultationRequest
  client: Client
  onStatusChange?: () => void
}

const URGENCY_COLORS = {
  LOW: { bg: colors.secondary[100], text: colors.secondary[700], border: colors.secondary[300] },
  MEDIUM: { bg: colors.primary[100], text: colors.primary[700], border: colors.primary[300] },
  HIGH: { bg: colors.accent[100], text: colors.accent[700], border: colors.accent[300] },
  URGENT: { bg: colors.error[100], text: colors.error[700], border: colors.error[300] }
}

const STATUS_COLORS = {
  PENDING: { bg: colors.accent[100], text: colors.accent[700], border: colors.accent[300] },
  ACCEPTED: { bg: colors.success[100], text: colors.success[700], border: colors.success[300] },
  REJECTED: { bg: colors.error[100], text: colors.error[700], border: colors.error[300] },
  IN_PROGRESS: { bg: colors.primary[100], text: colors.primary[700], border: colors.primary[300] },
  COMPLETED: { bg: colors.secondary[100], text: colors.secondary[700], border: colors.secondary[300] },
  CANCELLED: { bg: colors.secondary[100], text: colors.secondary[700], border: colors.secondary[300] }
}

export function ConsultationRequestCard({ request, client, onStatusChange }: ConsultationRequestCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const urgencyColor = URGENCY_COLORS[request.urgency]
  const statusColor = STATUS_COLORS[request.status]

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/consultation-request/${request.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        onStatusChange?.()
      }
    } catch (error) {
      console.error('Error updating request status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageClient = () => {
    if (request.conversation?.id) {
      router.push(`/inbox?conversationId=${request.conversation.id}`)
    }
  }

  return (
    <Card className="bg-white border hover:shadow-lg transition-all" style={{ borderColor: colors.secondary[200] }}>
      <div className="h-1" style={{ backgroundColor: urgencyColor.bg }}></div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primary[100] }}>
              {client.image ? (
                <img src={client.image} alt={client.name || 'Client'} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <User className="w-6 h-6" style={{ color: colors.primary[700] }} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base truncate" style={{ color: colors.text }}>
                {client.name || 'Anonymous Client'}
              </h3>
              <p className="text-xs truncate" style={{ color: colors.secondary[600] }}>
                {client.customerProfile?.companyName || 'Individual Client'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            <Badge
              variant="outline"
              className="text-xs font-semibold px-2 py-0.5"
              style={{
                backgroundColor: urgencyColor.bg,
                color: urgencyColor.text,
                borderColor: urgencyColor.border
              }}
            >
              {request.urgency}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-semibold px-2 py-0.5"
              style={{
                backgroundColor: statusColor.bg,
                color: statusColor.text,
                borderColor: statusColor.border
              }}
            >
              {request.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Case Type */}
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: colors.secondary[50] }}>
          <FileText className="w-4 h-4 flex-shrink-0" style={{ color: colors.secondary[700] }} />
          <span className="text-sm font-medium" style={{ color: colors.text }}>{request.caseType}</span>
        </div>

        {/* Description Preview */}
        <div>
          <p className={`text-sm leading-relaxed ${showDetails ? '' : 'line-clamp-2'}`} style={{ color: colors.secondary[700] }}>
            {request.description}
          </p>
          {request.description.length > 100 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-semibold mt-1 hover:underline"
              style={{ color: colors.primary[700] }}
            >
              {showDetails ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 pt-3 border-t" style={{ borderColor: colors.secondary[200] }}>
          {client.email && (
            <div className="flex items-center space-x-2 text-xs" style={{ color: colors.secondary[700] }}>
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <a href={`mailto:${client.email}`} className="hover:underline truncate">
                {client.email}
              </a>
            </div>
          )}
          {client.customerProfile?.phone && (
            <div className="flex items-center space-x-2 text-xs" style={{ color: colors.secondary[700] }}>
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <a href={`tel:${client.customerProfile.phone}`} className="hover:underline">
                {client.customerProfile.phone}
              </a>
            </div>
          )}
          {client.customerProfile?.industry && (
            <div className="flex items-center space-x-2 text-xs" style={{ color: colors.secondary[700] }}>
              <Building className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{client.customerProfile.industry}</span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center space-x-2 text-xs" style={{ color: colors.secondary[500] }}>
          <Clock className="w-3.5 h-3.5" />
          <span>Received {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-3">
          {request.status === 'PENDING' && (
            <>
              <Button
                onClick={() => handleStatusUpdate('ACCEPTED')}
                disabled={loading}
                size="sm"
                className="flex-1 text-white"
                style={{ backgroundColor: colors.success[600] }}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Button
                onClick={() => handleStatusUpdate('REJECTED')}
                disabled={loading}
                size="sm"
                variant="outline"
                className="flex-1"
                style={{ borderColor: colors.error[300], color: colors.error[700] }}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {(request.status === 'ACCEPTED' || request.status === 'IN_PROGRESS') && (
            <Button
              onClick={handleMessageClient}
              size="sm"
              className="flex-1 text-white relative"
              style={{ backgroundColor: colors.primary[700] }}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Message Client
              {request.conversation && request.conversation.unreadByAttorney > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white" style={{ backgroundColor: colors.error[500] }}>
                  {request.conversation.unreadByAttorney}
                </span>
              )}
            </Button>
          )}
          {request.status === 'ACCEPTED' && (
            <Button
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Mark In Progress
            </Button>
          )}
          {request.status === 'IN_PROGRESS' && (
            <Button
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Mark Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

