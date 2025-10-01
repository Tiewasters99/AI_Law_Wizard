// Animation variants for Framer Motion
export const animationVariants = {
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  card: {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 0.95 }
  },
  tab: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  button: {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  },
  loading: {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  }
}

// Tab configuration
export const TAB_CONFIG = {
  analysis: { label: 'Analysis', icon: 'Search' },
  files: { label: 'Files', icon: 'FolderOpen' },
  history: { label: 'History', icon: 'History' },
  library: { label: 'Library', icon: 'Library' }
} as const

export type TabType = keyof typeof TAB_CONFIG

// Processing state messages
export const PROCESSING_MESSAGES = {
  starting: 'Starting analysis...',
  processing: 'Processing your request...',
  searching: 'Searching relevant documents...',
  analyzing: 'Analyzing documents...',
  complete: 'Analysis complete!'
} as const

// Error messages
export const ERROR_MESSAGES = {
  noPrompt: 'Please describe what you would like to analyze',
  noDocuments: 'No relevant documents found for your query. Try rephrasing your request or upload more documents.',
  timeout: 'The analysis took too long to complete. Please try with a simpler request.',
  network: 'Network error. Please check your connection and try again.',
  unknown: 'An unexpected error occurred. Please try again.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  analysisComplete: 'Analysis Complete',
  copied: 'Copied to clipboard',
  downloaded: 'Downloaded successfully',
  sessionCreated: 'Chat session created'
} as const

