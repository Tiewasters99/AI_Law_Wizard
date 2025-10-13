'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Lock, Unlock, AlertCircle, Info, ChevronDown, ChevronUp, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { PacerCredentials } from '@/types/pacer'

interface PacerAuthFormProps {
  onAuthenticate: (credentials: PacerCredentials) => Promise<boolean>
  onLogout: () => Promise<void>
  onClose?: () => void
  isAuthenticated: boolean
  username: string | null
  loading: boolean
  error: string | null
}

export function PacerAuthForm({
  onAuthenticate,
  onLogout,
  onClose,
  isAuthenticated,
  username,
  loading,
  error,
}: PacerAuthFormProps) {
  const [formData, setFormData] = useState<PacerCredentials>({
    username: '',
    password: '',
    clientCode: '',
    otpCode: '',
    redactFlag: undefined,
  })
  
  const [redactionAcknowledged, setRedactionAcknowledged] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const credentialsWithRedact = {
      ...formData,
      redactFlag: redactionAcknowledged ? '1' : undefined,
    }
    
    const success = await onAuthenticate(credentialsWithRedact)
    
    if (success) {
      toast.success('Successfully connected to PACER!', {
        description: 'You can now search for cases'
      })
    }
  }

  const handleLogout = async () => {
    await onLogout()
    setFormData({ username: '', password: '', clientCode: '', otpCode: '', redactFlag: undefined })
    setRedactionAcknowledged(false)
    setShowAdvanced(false)
  }

  if (isAuthenticated) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 rounded-t-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Unlock className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-1">Connected to PACER</h3>
                <p className="text-sm text-green-700">Logged in as: <strong>{username}</strong></p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5 text-green-600" />
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
            disabled={loading}
          >
            Disconnect from PACER
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-t-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Connect to PACER</h2>
              <p className="text-sm text-blue-100">Enter your credentials to access court records</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <div className="p-6 border-b border-gray-200">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            Your credentials are not stored and are only used for this session. Standard PACER fees apply 
            and will be billed directly to your PACER account.
          </AlertDescription>
        </Alert>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-6 pt-4">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Primary Credentials - 2 Column Compact Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username */}
          <div>
            <Label htmlFor="username" className="text-sm font-semibold mb-1.5 block">
              PACER Username *
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-sm font-semibold mb-1.5 block">
              PACER Password *
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              required
              disabled={loading}
              className="h-10"
            />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced Options {!showAdvanced && '(Client Code, MFA)'}
        </button>

        {/* Advanced Fields - Collapsible */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Client Code */}
                <div>
                  <Label htmlFor="clientCode" className="text-sm font-semibold mb-1.5 block">
                    Client Code <span className="text-gray-500 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="clientCode"
                    type="text"
                    value={formData.clientCode}
                    onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                    placeholder="If applicable"
                    disabled={loading}
                    className="h-10"
                  />
                </div>

                {/* OTP Code */}
                <div>
                  <Label htmlFor="otpCode" className="text-sm font-semibold mb-1.5 block">
                    One-Time Passcode <span className="text-gray-500 font-normal">(If MFA enabled)</span>
                  </Label>
                  <Input
                    id="otpCode"
                    type="text"
                    value={formData.otpCode}
                    onChange={(e) => setFormData({ ...formData, otpCode: e.target.value })}
                    placeholder="6-digit code"
                    disabled={loading}
                    maxLength={6}
                    className="h-10"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Redaction Acknowledgment - Compact */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="redaction"
              checked={redactionAcknowledged}
              onChange={(e) => setRedactionAcknowledged(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <Label htmlFor="redaction" className="cursor-pointer text-sm font-semibold text-amber-900">
                I acknowledge federal redaction rules
              </Label>
              <p className="text-xs text-amber-800 mt-1">
                Required for filers: I will redact SSNs, DOBs, minor names, financial account numbers, 
                and home addresses per Fed. R. App. P. 25(a)(5), Fed. R. Civ. P. 5.2, Fed. R. Crim. P. 49.1, Fed. R. Bankr. P. 9037.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 font-semibold text-base"
          disabled={loading || !formData.username || !formData.password}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Connecting to PACER...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Connect to PACER
            </>
          )}
        </Button>

        {/* Fee Disclaimer */}
        <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
          By connecting, you acknowledge that PACER fees ($0.10/page, $3.00 cap per document) 
          will be billed to your PACER account.
        </p>
      </form>
    </div>
  )
}
