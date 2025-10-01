# Quick Start Guide - Refactored Document Processing

## 🚀 Quick Start

### 1. Import the Refactored Interface

```typescript
import { RefactoredDocumentAnalysisInterface } from '@/components/document-processing'

export default function AnalysisPage() {
  return <RefactoredDocumentAnalysisInterface />
}
```

### 2. Using Zustand Stores

#### Document Processing Store

```typescript
import { useDocumentProcessingStore } from '@/stores'

function MyComponent() {
  // Get state and actions
  const { 
    isProcessing,
    finalResult,
    processedFiles,
    error,
    startProcessing,
    clearState 
  } = useDocumentProcessingStore()

  // Start analysis
  const handleAnalyze = async () => {
    await startProcessing({ 
      userPrompt: 'Analyze my documents' 
    })
  }

  return (
    <div>
      {isProcessing && <p>Loading...</p>}
      {finalResult && <p>{finalResult}</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleAnalyze}>Analyze</button>
    </div>
  )
}
```

#### Query History Store

```typescript
import { useQueryHistoryStore } from '@/stores'

function HistoryComponent() {
  const { 
    queries, 
    statistics, 
    fetchRecentQueries,
    deleteQuery 
  } = useQueryHistoryStore()

  useEffect(() => {
    fetchRecentQueries(10)
  }, [])

  return (
    <div>
      <h2>Total: {statistics?.total}</h2>
      {queries.map(query => (
        <div key={query.id}>
          <p>{query.userQuery}</p>
          <button onClick={() => deleteQuery(query.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

#### UI Store

```typescript
import { useUIStore } from '@/stores'

function TabComponent() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <div>
      <button onClick={() => setActiveTab('analysis')}>
        Analysis
      </button>
      <button onClick={() => setActiveTab('history')}>
        History
      </button>
      {activeTab === 'analysis' && <AnalysisView />}
      {activeTab === 'history' && <HistoryView />}
    </div>
  )
}
```

### 3. Using Individual Components

```typescript
import {
  AnalysisInput,
  ResultDisplay,
  ProcessingIndicator,
  ErrorDisplay
} from '@/components/document-processing/components'

function CustomAnalysis() {
  const [prompt, setPrompt] = useState('')
  const { isProcessing, finalResult, error, startProcessing } = useDocumentProcessingStore()

  return (
    <div>
      <AnalysisInput
        userPrompt={prompt}
        onPromptChange={setPrompt}
        onSubmit={() => startProcessing({ userPrompt: prompt })}
        isProcessing={isProcessing}
      />

      {isProcessing && <ProcessingIndicator />}
      {error && <ErrorDisplay error={error} />}
      
      {finalResult && (
        <ResultDisplay
          result={finalResult}
          confidence={0.95}
          processingTime={2.5}
          onContinueChat={() => console.log('Chat')}
          onNewAnalysis={() => console.log('New')}
        />
      )}
    </div>
  )
}
```

### 4. Session Management

```typescript
import { createDocumentAnalysisSession } from '@/components/document-processing/utils'

async function createSession() {
  const sessionId = await createDocumentAnalysisSession({
    userPrompt: 'My analysis question',
    processedFiles: [...],
    analysisResult: '...'
  })

  if (sessionId) {
    console.log('Session created:', sessionId)
  }
}
```

## 📦 Component Library

### Available Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `AnalysisHeader` | Logo and branding | None |
| `TabNavigation` | Tab switching | `activeTab`, `onTabChange`, `statisticsTotal` |
| `AnalysisInput` | Input form | `userPrompt`, `onPromptChange`, `onSubmit`, `isProcessing` |
| `ResultDisplay` | Results display | `result`, `confidence`, `processingTime`, `onContinueChat`, `onNewAnalysis` |
| `ProcessingIndicator` | Loading state | `currentStep`, `totalSteps`, `message` |
| `ErrorDisplay` | Error handling | `error`, `onRetry`, `onDismiss` |
| `ChatSection` | Chat interface | `show`, `onClose`, `sessionId`, `processedFiles`, `onSessionCreate` |
| `RecentQueriesSidebar` | Recent queries | `queries`, `statistics`, `onQuerySelect` |

## 🎨 Styling

All components use Tailwind CSS and support:
- Responsive design (mobile-first)
- Dark mode (via Tailwind)
- Custom themes
- Framer Motion animations

## 🔧 Utilities

### Constants

```typescript
import { 
  animationVariants,
  PROCESSING_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '@/components/document-processing/utils'

// Use animation variants
<motion.div variants={animationVariants.card}>
  Content
</motion.div>

// Use message constants
toast({ title: SUCCESS_MESSAGES.analysisComplete })
```

### Session Utils

```typescript
import { 
  createDocumentAnalysisSession,
  getSessionInfo 
} from '@/components/document-processing/utils'

// Create session
const sessionId = await createDocumentAnalysisSession({
  userPrompt: '...',
  processedFiles: [...],
  analysisResult: '...'
})

// Get session info
const session = await getSessionInfo(sessionId)
```

## 🧪 Testing

### Test a Store

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDocumentProcessingStore } from '@/stores'

test('should process document', async () => {
  const { result } = renderHook(() => useDocumentProcessingStore())
  
  await act(async () => {
    await result.current.startProcessing({ userPrompt: 'test' })
  })
  
  expect(result.current.finalResult).toBeDefined()
})
```

### Test a Component

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { AnalysisInput } from '@/components/document-processing/components'

test('should handle submit', () => {
  const handleSubmit = jest.fn()
  
  render(
    <AnalysisInput
      userPrompt="test"
      onPromptChange={() => {}}
      onSubmit={handleSubmit}
      isProcessing={false}
    />
  )
  
  fireEvent.click(screen.getByText('Start Analysis'))
  expect(handleSubmit).toHaveBeenCalled()
})
```

## 📊 Performance Tips

### 1. Selective Store Subscriptions

```typescript
// ✅ Good: Only subscribe to what you need
const isProcessing = useDocumentProcessingStore(state => state.isProcessing)

// ❌ Bad: Subscribe to entire store
const store = useDocumentProcessingStore()
```

### 2. Memoize Expensive Computations

```typescript
const statistics = useMemo(() => {
  return calculateStatistics(queries)
}, [queries])
```

### 3. Use Callback Functions

```typescript
const handleSubmit = useCallback(() => {
  startProcessing({ userPrompt })
}, [userPrompt, startProcessing])
```

## 🐛 Common Issues

### Issue: Store not updating

**Solution**: Make sure you're using the hook, not importing the store directly

```typescript
// ✅ Correct
const { isProcessing } = useDocumentProcessingStore()

// ❌ Wrong
import { documentProcessingStore } from '@/stores'
```

### Issue: Component not re-rendering

**Solution**: Use destructuring or selector function

```typescript
// ✅ Correct
const { finalResult } = useDocumentProcessingStore()

// Or
const finalResult = useDocumentProcessingStore(state => state.finalResult)
```

### Issue: Stale closure in callbacks

**Solution**: Use Zustand's getState() or add to dependencies

```typescript
const handleSubmit = () => {
  const { userPrompt } = useDocumentProcessingStore.getState()
  // Use userPrompt
}
```

## 📚 Examples

### Complete Analysis Flow

```typescript
function CompleteAnalysis() {
  const [prompt, setPrompt] = useState('')
  const { 
    isProcessing, 
    finalResult, 
    error, 
    startProcessing, 
    clearState 
  } = useDocumentProcessingStore()

  const handleSubmit = async () => {
    await startProcessing({ userPrompt: prompt })
  }

  const handleReset = () => {
    setPrompt('')
    clearState()
  }

  return (
    <div className="space-y-4">
      {!finalResult && (
        <AnalysisInput
          userPrompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
        />
      )}

      {isProcessing && <ProcessingIndicator />}
      
      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={handleSubmit}
          onDismiss={() => clearState()}
        />
      )}

      {finalResult && (
        <>
          <ResultDisplay
            result={finalResult}
            confidence={0.95}
            processingTime={2.5}
            onContinueChat={() => {}}
            onNewAnalysis={handleReset}
          />
        </>
      )}
    </div>
  )
}
```

## 🎯 Next Steps

1. ✅ Read [Full Documentation](./REFACTORING_DOCUMENTATION.md)
2. ✅ Explore component examples
3. ✅ Try building custom layouts
4. ✅ Customize styling
5. ✅ Add your own features

## 💡 Tips

- **Use DevTools**: Install [Zustand DevTools](https://github.com/pmndrs/zustand#devtools) for debugging
- **Type Safety**: Always use TypeScript for better DX
- **Code Splitting**: Import components dynamically with `lazy()`
- **Performance**: Monitor re-renders with React DevTools
- **Testing**: Write tests for stores first, then components

---

Happy coding! 🚀

