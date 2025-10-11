'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Loader2, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { colors } from '@/app/lib/designSystem'
import { useRouter } from 'next/navigation'

interface ConsultationRequestModalProps {
  isOpen: boolean
  onClose: () => void
  attorney: {
    id: string
    name: string | null
    image: string | null
    lawyerProfile?: {
      specialty: string | null
      firmName: string | null
    } | null
  }
  hasReachedLimit?: boolean
}

const CASE_TYPES = [
  'Corporate Law',
  'Criminal Law',
  'Family Law',
  'Real Estate Law',
  'Intellectual Property',
  'Tax Law',
  'Employment Law',
  'Immigration Law',
  'Other'
]

const URGENCY_LEVELS = [
  { value: 'LOW', label: 'Low', description: 'Non-urgent matter' },
  { value: 'MEDIUM', label: 'Medium', description: 'Standard timeline' },
  { value: 'HIGH', label: 'High', description: 'Needs prompt attention' },
  { value: 'URGENT', label: 'Urgent', description: 'Requires immediate action' }
]

export function ConsultationRequestModal({ isOpen, onClose, attorney, hasReachedLimit }: ConsultationRequestModalProps) {
  const router = useRouter()
  const [caseType, setCaseType] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState('MEDIUM')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const characterCount = description.length
  const isDescriptionValid = characterCount >= 50 && characterCount <= 500

  const handleSubmit = async () => {
    if (!caseType || !isDescriptionValid) {
      setError('Please fill all required fields correctly')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/consultation-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attorneyId: attorney.id,
          caseType,
          description,
          urgency
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          setError('You have reached your free consultation request limit. Please purchase tokens to send more requests.')
        } else {
          setError(data.error || 'Failed to send consultation request')
        }
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        router.push('/inbox')
      }, 2000)

    } catch (err) {
      console.error('Error sending consultation request:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      // Reset form
      setTimeout(() => {
        setCaseType('')
        setDescription('')
        setUrgency('MEDIUM')
        setError(null)
        setSuccess(false)
      }, 300)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: colors.secondary[200] }}>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                    Send Consultation Request
                  </h2>
                  <p className="text-sm mt-1" style={{ color: colors.secondary[600] }}>
                    to {attorney.name} {attorney.lawyerProfile?.firmName && `• ${attorney.lawyerProfile.firmName}`}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: colors.secondary[600] }} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Success State */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border flex items-center space-x-3"
                    style={{
                      backgroundColor: colors.success[50],
                      borderColor: colors.success[200]
                    }}
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.success[600] }} />
                    <div>
                      <p className="font-semibold" style={{ color: colors.success[900] }}>
                        Request Sent Successfully!
                      </p>
                      <p className="text-sm" style={{ color: colors.success[700] }}>
                        Redirecting to your inbox...
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Limit Warning */}
                {hasReachedLimit && (
                  <div className="p-4 rounded-lg border flex items-start space-x-3"
                    style={{
                      backgroundColor: colors.accent[50],
                      borderColor: colors.accent[200]
                    }}
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.accent[600] }} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: colors.accent[900] }}>
                        Free Consultation Limit Reached
                      </p>
                      <p className="text-sm mt-1" style={{ color: colors.accent[700] }}>
                        You have used your free consultation request. Purchase tokens to send more requests.
                      </p>
                      <Button
                        onClick={() => router.push('/tokens')}
                        className="mt-2 text-sm"
                        size="sm"
                        style={{ backgroundColor: colors.primary[700] }}
                      >
                        Purchase Tokens
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border flex items-center space-x-3"
                    style={{
                      backgroundColor: colors.error[50],
                      borderColor: colors.error[200]
                    }}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.error[600] }} />
                    <p className="text-sm" style={{ color: colors.error[900] }}>{error}</p>
                  </motion.div>
                )}

                {!success && !hasReachedLimit && (
                  <>
                    {/* Case Type */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        Case Type <span style={{ color: colors.error[500] }}>*</span>
                      </label>
                      <select
                        value={caseType}
                        onChange={(e) => setCaseType(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-lg border text-sm"
                        style={{
                          borderColor: colors.secondary[300],
                          color: colors.text
                        }}
                      >
                        <option value="">Select case type...</option>
                        {CASE_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        Case Description <span style={{ color: colors.error[500] }}>*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                        placeholder="Please describe your legal matter in detail. Include relevant facts, dates, and what kind of assistance you need..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border text-sm resize-none"
                        style={{
                          borderColor: isDescriptionValid || characterCount === 0 ? colors.secondary[300] : colors.error[300],
                          color: colors.text
                        }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs" style={{ color: characterCount < 50 ? colors.error[600] : colors.secondary[600] }}>
                          {characterCount < 50 
                            ? `Minimum 50 characters (${50 - characterCount} more needed)`
                            : characterCount > 500
                            ? `Maximum 500 characters exceeded by ${characterCount - 500}`
                            : 'Looking good!'
                          }
                        </p>
                        <p className="text-xs" style={{ color: characterCount > 500 ? colors.error[600] : colors.secondary[600] }}>
                          {characterCount}/500
                        </p>
                      </div>
                    </div>

                    {/* Urgency */}
                    <div>
                      <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                        Urgency Level
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {URGENCY_LEVELS.map(level => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => setUrgency(level.value)}
                            disabled={loading}
                            className="p-3 rounded-lg border text-left transition-all"
                            style={{
                              borderColor: urgency === level.value ? colors.primary[500] : colors.secondary[300],
                              backgroundColor: urgency === level.value ? colors.primary[50] : 'white'
                            }}
                          >
                            <p className="font-semibold text-sm" style={{ 
                              color: urgency === level.value ? colors.primary[900] : colors.text 
                            }}>
                              {level.label}
                            </p>
                            <p className="text-xs mt-1" style={{ 
                              color: urgency === level.value ? colors.primary[700] : colors.secondary[600] 
                            }}>
                              {level.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!success && !hasReachedLimit && (
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between" style={{ borderColor: colors.secondary[200] }}>
                  <p className="text-xs" style={{ color: colors.secondary[600] }}>
                    <FileText className="w-3.5 h-3.5 inline mr-1" />
                    Your request will be sent to {attorney.name}
                  </p>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleClose}
                      disabled={loading}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !caseType || !isDescriptionValid}
                      className="text-white"
                      style={{ backgroundColor: colors.primary[700] }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Request'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

