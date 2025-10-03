'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Maximize2,
  Minimize2,
  Copy,
  RotateCcw,
  RotateCw,
  Wand2,
  FileText,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

interface EnhancedTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  showToolbar?: boolean
  showStats?: boolean
  maxLength?: number
  label?: string
  theme?: 'light' | 'dark'
}

export function EnhancedTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className = "",
  minHeight = "200px",
  showToolbar = true,
  showStats = true,
  maxLength,
  label,
  theme = 'light'
}: EnhancedTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update history when value changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(value)
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [value, history, historyIndex])

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = value.substring(0, start) + text + value.substring(end)
    
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + text.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          insertText('**', '**')
          break
        case 'i':
          e.preventDefault()
          insertText('*', '*')
          break
        case 'u':
          e.preventDefault()
          insertText('<u>', '</u>')
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
          break
        case 'y':
          e.preventDefault()
          redo()
          break
      }
    }

    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      insertAtCursor('  ')
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Text copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy text')
    }
  }

  const autoFormat = () => {
    let formatted = value
    
    // Auto-capitalize sentences
    formatted = formatted.replace(/([.!?]\s*)([a-z])/g, (match, punctuation, letter) => {
      return punctuation + letter.toUpperCase()
    })
    
    // Fix double spaces
    formatted = formatted.replace(/\s{2,}/g, ' ')
    
    // Ensure proper spacing after punctuation
    formatted = formatted.replace(/([.!?])([A-Z])/g, '$1 $2')
    
    // Fix markdown formatting spacing
    formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, ' **$1** ')
    formatted = formatted.replace(/\*([^\*]+)\*/g, ' *$1* ')
    
    // Clean up extra spaces
    formatted = formatted.replace(/\s{2,}/g, ' ').trim()
    
    onChange(formatted)
    toast.success('Text auto-formatted')
  }

  const exportAsFile = () => {
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-export-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('File exported successfully')
  }

  const clearContent = () => {
    if (value.trim() && window.confirm('Are you sure you want to clear all content?')) {
      onChange('')
      toast.success('Content cleared')
    }
  }

  const formatters = [
    {
      icon: Bold,
      label: 'Bold (Ctrl+B)',
      action: () => insertText('**', '**')
    },
    {
      icon: Italic,
      label: 'Italic (Ctrl+I)',
      action: () => insertText('*', '*')
    },
    {
      icon: Underline,
      label: 'Underline (Ctrl+U)',
      action: () => insertText('<u>', '</u>')
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertAtCursor('> ')
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertAtCursor('- ')
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertAtCursor('1. ')
    },
    {
      icon: Type,
      label: 'Heading',
      action: () => insertAtCursor('## ')
    }
  ]

  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length
  const charCount = value.length
  const lineCount = value.split('\n').length

  const isDark = theme === 'dark'
  const bgClass = isDark ? 'bg-gray-900' : 'bg-white'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'
  const toolbarBgClass = isDark ? 'bg-gray-800' : 'bg-gray-50'
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900'
  const placeholderClass = isDark ? 'placeholder-gray-400' : 'placeholder-gray-500'

  return (
    <div className={`${isFullscreen ? `fixed inset-0 z-50 ${bgClass}` : ''} ${className}`}>
      <Card className={`${isFullscreen ? 'h-full' : ''} ${borderClass} ${bgClass} shadow-lg`}>
        {label && (
          <div className="px-4 pt-4 pb-2">
            <label className={`text-sm font-medium ${textClass}`}>{label}</label>
          </div>
        )}
        
        {showToolbar && (
          <div className={`border-b ${toolbarBgClass} px-4 py-2 ${borderClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 flex-wrap">
                {formatters.map((formatter, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={formatter.action}
                    title={formatter.label}
                    className="h-8 w-8 p-0"
                  >
                    <formatter.icon className="h-4 w-4" />
                  </Button>
                ))}
                
                <div className="w-px h-6 bg-gray-300 mx-2" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  title="Undo (Ctrl+Z)"
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo (Ctrl+Y)"
                  className="h-8 w-8 p-0"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                
                <div className="w-px h-6 bg-gray-300 mx-2" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={autoFormat}
                  title="Auto-format text"
                  className="h-8 w-8 p-0"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportAsFile}
                  title="Export as file"
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
        
        <CardContent className={`p-0 ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (maxLength && e.target.value.length > maxLength) return
              onChange(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full p-4 border-0 resize-none outline-none rounded-b-lg
              ${isFullscreen ? 'flex-1' : ''}
              ${bgClass} ${textClass} ${placeholderClass}
              focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
              font-mono text-sm leading-relaxed transition-colors
            `}
            style={{
              minHeight: isFullscreen ? 'auto' : minHeight,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
            }}
          />
        </CardContent>
        
        {showStats && (
          <div className={`border-t ${toolbarBgClass} px-4 py-2 ${borderClass}`}>
            <div className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="flex items-center gap-4">
                <span>Words: {wordCount}</span>
                <span>Characters: {charCount}{maxLength ? `/${maxLength}` : ''}</span>
                <span>Lines: {lineCount}</span>
              </div>
              <div className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Use Ctrl+B for bold, Ctrl+I for italic, Tab for indent
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
