'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Search, X, ChevronDown, ChevronUp, Hash, User, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { PacerSearchQuery } from '@/types/pacer'
import { PACER_COURTS } from '@/types/pacer'
import { motion, AnimatePresence } from 'framer-motion'

interface CaseSearchFormProps {
  onSearch: (query: PacerSearchQuery) => void
  loading: boolean
}

export function CaseSearchForm({ onSearch, loading }: CaseSearchFormProps) {
  const [searchParams, setSearchParams] = useState<PacerSearchQuery>({
    caseNumber: '',
    caseTitle: '',
    partyName: '',
    attorneyName: '',
    court: '',
    filingDateFrom: '',
    filingDateTo: '',
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [validationError, setValidationError] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    
    // Validate required fields
    const hasRequiredField = !!(
      searchParams.caseNumber?.trim() ||
      searchParams.caseTitle?.trim() ||
      searchParams.partyName?.trim() ||
      searchParams.attorneyName?.trim()
    )

    if (!hasRequiredField) {
      const errorMsg = 'Please enter at least one search criteria'
      setValidationError(errorMsg)
      toast.error(errorMsg)
      return
    }
    
    // Filter out empty values
    const filteredParams: PacerSearchQuery = {}
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        filteredParams[key as keyof PacerSearchQuery] = value
      }
    })

    onSearch(filteredParams)
  }

  const handleClear = () => {
    setSearchParams({
      caseNumber: '',
      caseTitle: '',
      partyName: '',
      attorneyName: '',
      court: '',
      filingDateFrom: '',
      filingDateTo: '',
    })
    setValidationError('')
  }

  const handlePreset = (type: 'caseNumber' | 'party' | 'attorney') => {
    handleClear()
    // Just focus on the respective field
    setTimeout(() => {
      const fieldId = type === 'caseNumber' ? 'caseNumber' : type === 'party' ? 'partyName' : 'attorneyName'
      document.getElementById(fieldId)?.focus()
    }, 100)
  }

  const hasRequiredField = !!(
    searchParams.caseNumber?.trim() ||
    searchParams.caseTitle?.trim() ||
    searchParams.partyName?.trim() ||
    searchParams.attorneyName?.trim()
  )

  const hasAnyField = Object.values(searchParams).some(val => val && val.trim() !== '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-4">
        {/* Header with presets */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-bold text-gray-900">Search Cases</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick Presets */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePreset('caseNumber')}
                className="text-xs"
              >
                <Hash className="w-3 h-3 mr-1" />
                By Case #
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePreset('party')}
                className="text-xs"
              >
                <User className="w-3 h-3 mr-1" />
                By Party
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePreset('attorney')}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                By Attorney
              </Button>
            </div>
            {hasAnyField && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={loading}
                className="text-xs"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-red-800">{validationError}</p>
          </div>
        )}

        {/* Primary Search Fields - 3 Column Compact Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Case Number */}
          <div>
            <Label htmlFor="caseNumber" className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Case Number
            </Label>
            <Input
              id="caseNumber"
              type="text"
              value={searchParams.caseNumber || ''}
              onChange={(e) => {
                setSearchParams({ ...searchParams, caseNumber: e.target.value })
                if (validationError) setValidationError('')
              }}
              placeholder="1:23-cv-12345"
              disabled={loading}
              className="h-9 text-sm"
            />
          </div>

          {/* Party Name */}
          <div>
            <Label htmlFor="partyName" className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              Party Name
            </Label>
            <Input
              id="partyName"
              type="text"
              value={searchParams.partyName || ''}
              onChange={(e) => {
                setSearchParams({ ...searchParams, partyName: e.target.value })
                if (validationError) setValidationError('')
              }}
              placeholder="Enter party name"
              disabled={loading}
              className="h-9 text-sm"
            />
          </div>

          {/* Attorney Name */}
          <div>
            <Label htmlFor="attorneyName" className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Attorney Name
            </Label>
            <Input
              id="attorneyName"
              type="text"
              value={searchParams.attorneyName || ''}
              onChange={(e) => {
                setSearchParams({ ...searchParams, attorneyName: e.target.value })
                if (validationError) setValidationError('')
              }}
              placeholder="Enter attorney"
              disabled={loading}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Case Title - Full Width */}
        <div className="mb-4">
          <Label htmlFor="caseTitle" className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Case Title
          </Label>
          <Input
            id="caseTitle"
            type="text"
            value={searchParams.caseTitle || ''}
            onChange={(e) => {
              setSearchParams({ ...searchParams, caseTitle: e.target.value })
              if (validationError) setValidationError('')
            }}
            placeholder="e.g., Smith v. Jones"
            disabled={loading}
            className="h-9 text-sm"
          />
        </div>

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium mb-3 transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced Filters {!showAdvanced && '(Court & Date Range)'}
        </button>

        {/* Advanced Filters - Collapsible */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Court */}
                  <div className="md:col-span-3">
                    <Label htmlFor="court" className="text-xs font-semibold text-gray-700 mb-1">
                      Court (Optional)
                    </Label>
                    <select
                      id="court"
                      value={searchParams.court || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, court: e.target.value })}
                      disabled={loading}
                      className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">All Courts</option>
                      {PACER_COURTS.map((court) => (
                        <option key={court.code} value={court.code}>
                          {court.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filing Date From */}
                  <div>
                    <Label htmlFor="filingDateFrom" className="text-xs font-semibold text-gray-700 mb-1">
                      Filing From
                    </Label>
                    <Input
                      id="filingDateFrom"
                      type="date"
                      value={searchParams.filingDateFrom}
                      onChange={(e) => setSearchParams({ ...searchParams, filingDateFrom: e.target.value })}
                      disabled={loading}
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* Filing Date To */}
                  <div>
                    <Label htmlFor="filingDateTo" className="text-xs font-semibold text-gray-700 mb-1">
                      Filing To
                    </Label>
                    <Input
                      id="filingDateTo"
                      type="date"
                      value={searchParams.filingDateTo}
                      onChange={(e) => setSearchParams({ ...searchParams, filingDateTo: e.target.value })}
                      disabled={loading}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            className="flex-1 h-10 font-semibold"
            disabled={loading || !hasRequiredField}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Searching PACER...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Cases
              </>
            )}
          </Button>
          
          {/* Search hint */}
          {!hasRequiredField && !loading && (
            <span className="text-xs text-gray-500 hidden sm:block">
              Enter at least one field above
            </span>
          )}
        </div>

        {/* Info Footer */}
        <p className="text-xs text-gray-500 text-center mt-3 pt-3 border-t border-gray-100">
          Results limited to 50 cases. Standard PACER fees apply ($0.10 per page).
        </p>
      </form>
    </motion.div>
  )
}
