import React from 'react'
import { Button } from './button'
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* First Page Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="h-9 w-9 p-0 bg-white/80 hover:bg-white border-gray-200/60 hover:border-blue-300/60 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 p-0 bg-white/80 hover:bg-white border-gray-200/60 hover:border-blue-300/60 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <div className="flex h-9 w-9 items-center justify-center">
              <MoreHorizontal className="h-4 w-4 text-gray-400 animate-pulse" />
            </div>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={`h-9 w-9 p-0 font-medium transition-all duration-200 transform hover:scale-105 ${
                currentPage === page 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl border-0 hover:from-blue-700 hover:to-indigo-700' 
                  : 'bg-white/80 hover:bg-white border-gray-200/60 hover:border-blue-300/60 shadow-sm hover:shadow-md hover:text-blue-600'
              }`}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 p-0 bg-white/80 hover:bg-white border-gray-200/60 hover:border-blue-300/60 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last Page Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 p-0 bg-white/80 hover:bg-white border-gray-200/60 hover:border-blue-300/60 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
