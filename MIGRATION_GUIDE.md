# Migration Guide: From Custom Hooks to Zustand

## 📋 Overview

This guide helps you migrate from the old custom hooks to the new Zustand-based architecture.

---

## 🔄 Quick Migration Steps

### Step 1: Update Imports

#### Document Processing

**Before:**
```typescript
import { useDocumentProcessing } from '../../hooks/useDocumentProcessing'

const processingState = useDocumentProcessing()
const isProcessing = processingState.isProcessing
const finalResult = processingState.finalResult
```

**After:**
```typescript
import { useDocumentProcessingStore } from '../../stores'

const { isProcessing, finalResult } = useDocumentProcessingStore()
```

#### Query History

**Before:**
```typescript
import { useQueryHistory } from '../../hooks/useQueryHistory'

const queryHistory = useQueryHistory()
const queries = queryHistory.queries
const statistics = queryHistory.statistics
```

**After:**
```typescript
import { useQueryHistoryStore } from '../../stores'

const { queries, statistics } = useQueryHistoryStore()
```

### Step 2: Update Component Usage

**Before:**
```typescript
import { DocumentAnalysisInterface } from './components/document-processing'

export default function Page() {
  return <DocumentAnalysisInterface />
}
```

**After:**
```typescript
import { RefactoredDocumentAnalysisInterface } from './components/document-processing'

export default function Page() {
  return <RefactoredDocumentAnalysisInterface />
}
```

---

## 📝 Detailed Migration Examples

### Example 1: Basic Processing

**Before:**
```typescript
'use client'

import { useState } from 'react'
import { useDocumentProcessing } from '../../hooks/useDocumentProcessing'

export function MyComponent() {
  const [userPrompt, setUserPrompt] = useState('')
  const processingState = useDocumentProcessing()

  const handleSubmit = () => {
    if (!userPrompt.trim()) return
    processingState.startProcessing({ userPrompt: userPrompt.trim() })
  }

  return (
    <div>
      <input 
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={processingState.isProcessing}>
        {processingState.isProcessing ? 'Processing...' : 'Submit'}
      </button>
      
      {processingState.finalResult && (
        <div>{processingState.finalResult}</div>
      )}
      
      {processingState.error && (
        <div>Error: {processingState.error}</div>
      )}
    </div>
  )
}
```

**After:**
```typescript
'use client'

import { useState } from 'react'
import { useDocumentProcessingStore } from '../../stores'

export function MyComponent() {
  const [userPrompt, setUserPrompt] = useState('')
  const { isProcessing, finalResult, error, startProcessing } = useDocumentProcessingStore()

  const handleSubmit = async () => {
    if (!userPrompt.trim()) return
    await startProcessing({ userPrompt: userPrompt.trim() })
  }

  return (
    <div>
      <input 
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Submit'}
      </button>
      
      {finalResult && <div>{finalResult}</div>}
      {error && <div>Error: {error}</div>}
    </div>
  )
}
```

**Key Changes:**
- ✅ Direct destructuring from store
- ✅ Cleaner variable names
- ✅ Async/await for startProcessing
- ✅ No intermediate variable needed

### Example 2: Query History

**Before:**
```typescript
'use client'

import { useEffect } from 'react'
import { useQueryHistory } from '../../hooks/useQueryHistory'

export function HistoryComponent() {
  const queryHistory = useQueryHistory()

  useEffect(() => {
    queryHistory.fetchRecentQueries(10)
  }, [])

  if (queryHistory.loading) return <div>Loading...</div>
  if (queryHistory.error) return <div>Error: {queryHistory.error}</div>

  return (
    <div>
      <h2>Query History ({queryHistory.statistics?.total || 0})</h2>
      {queryHistory.queries.map(query => (
        <div key={query.id}>
          <p>{query.userQuery}</p>
          <button onClick={() => queryHistory.deleteQuery(query.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

**After:**
```typescript
'use client'

import { useEffect } from 'react'
import { useQueryHistoryStore } from '../../stores'

export function HistoryComponent() {
  const { queries, statistics, loading, error, fetchRecentQueries, deleteQuery } = useQueryHistoryStore()

  useEffect(() => {
    fetchRecentQueries(10)
  }, [fetchRecentQueries])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Query History ({statistics?.total || 0})</h2>
      {queries.map(query => (
        <div key={query.id}>
          <p>{query.userQuery}</p>
          <button onClick={() => deleteQuery(query.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

**Key Changes:**
- ✅ Direct access to all needed values
- ✅ fetchRecentQueries in dependency array
- ✅ Cleaner data access

### Example 3: Using UI Store

**Before:**
```typescript
'use client'

import { useState } from 'react'

export function TabComponent() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'history'>('analysis')
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <button onClick={() => setActiveTab('analysis')}>Analysis</button>
      <button onClick={() => setActiveTab('history')}>History</button>
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      
      {activeTab === 'analysis' && <AnalysisView />}
      {activeTab === 'history' && <HistoryView />}
      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  )
}
```

**After:**
```typescript
'use client'

import { useUIStore } from '../../stores'

export function TabComponent() {
  const { activeTab, showResultModal, setActiveTab, toggleResultModal } = useUIStore()

  return (
    <div>
      <button onClick={() => setActiveTab('analysis')}>Analysis</button>
      <button onClick={() => setActiveTab('history')}>History</button>
      <button onClick={toggleResultModal}>Open Modal</button>
      
      {activeTab === 'analysis' && <AnalysisView />}
      {activeTab === 'history' && <HistoryView />}
      {showResultModal && <Modal onClose={toggleResultModal} />}
    </div>
  )
}
```

**Key Changes:**
- ✅ No local useState needed
- ✅ State persists across component unmounts
- ✅ Shared across multiple components

### Example 4: Multiple Stores

**Before:**
```typescript
'use client'

import { useState } from 'react'
import { useDocumentProcessing } from '../../hooks/useDocumentProcessing'
import { useQueryHistory } from '../../hooks/useQueryHistory'

export function DashboardComponent() {
  const [activeTab, setActiveTab] = useState('analysis')
  const processingState = useDocumentProcessing()
  const queryHistory = useQueryHistory()

  const handleAnalysis = () => {
    processingState.startProcessing({ userPrompt: '...' })
  }

  return (
    <div>
      <button onClick={() => setActiveTab('analysis')}>Analysis</button>
      <button onClick={() => setActiveTab('history')}>History</button>
      
      {activeTab === 'analysis' && (
        <div>
          <button onClick={handleAnalysis}>Analyze</button>
          {processingState.isProcessing && <div>Processing...</div>}
        </div>
      )}
      
      {activeTab === 'history' && (
        <div>
          <p>Total: {queryHistory.statistics?.total}</p>
        </div>
      )}
    </div>
  )
}
```

**After:**
```typescript
'use client'

import { 
  useDocumentProcessingStore,
  useQueryHistoryStore,
  useUIStore 
} from '../../stores'

export function DashboardComponent() {
  const { isProcessing, startProcessing } = useDocumentProcessingStore()
  const { statistics } = useQueryHistoryStore()
  const { activeTab, setActiveTab } = useUIStore()

  const handleAnalysis = async () => {
    await startProcessing({ userPrompt: '...' })
  }

  return (
    <div>
      <button onClick={() => setActiveTab('analysis')}>Analysis</button>
      <button onClick={() => setActiveTab('history')}>History</button>
      
      {activeTab === 'analysis' && (
        <div>
          <button onClick={handleAnalysis}>Analyze</button>
          {isProcessing && <div>Processing...</div>}
        </div>
      )}
      
      {activeTab === 'history' && (
        <div>
          <p>Total: {statistics?.total}</p>
        </div>
      )}
    </div>
  )
}
```

**Key Changes:**
- ✅ Clean imports from single source
- ✅ All stores in one place
- ✅ Better separation of concerns

---

## 🎯 API Method Mapping

### Document Processing Store

| Old Method | New Method | Notes |
|------------|------------|-------|
| `processingState.startProcessing()` | `startProcessing()` | Now async, returns Promise |
| `processingState.stopProcessing()` | `stopProcessing()` | Same |
| `processingState.clearState()` | `clearState()` | Same |
| `processingState.isProcessing` | `isProcessing` | Direct access |
| `processingState.finalResult` | `finalResult` | Direct access |
| `processingState.error` | `error` | Direct access |
| `processingState.processedFiles` | `processedFiles` | Direct access |

### Query History Store

| Old Method | New Method | Notes |
|------------|------------|-------|
| `queryHistory.fetchQueries()` | `fetchQueries()` | Now async |
| `queryHistory.fetchRecentQueries()` | `fetchRecentQueries()` | Now async |
| `queryHistory.deleteQuery()` | `deleteQuery()` | Now async |
| `queryHistory.queries` | `queries` | Direct access |
| `queryHistory.statistics` | `statistics` | Direct access |
| `queryHistory.loading` | `loading` | Direct access |

### UI Store (New)

| Feature | Method | Notes |
|---------|--------|-------|
| Active tab | `activeTab`, `setActiveTab()` | New feature |
| Chat mode | `showChatMode`, `toggleChatMode()` | New feature |
| File editor | `showFileEditor`, `toggleFileEditor()` | New feature |
| Result modal | `showResultModal`, `toggleResultModal()` | New feature |

---

## ⚠️ Breaking Changes

### 1. Async Methods

**Before:**
```typescript
processingState.startProcessing({ userPrompt })
// Continues immediately
```

**After:**
```typescript
await startProcessing({ userPrompt })
// Waits for completion
```

### 2. Direct Access

**Before:**
```typescript
const processingState = useDocumentProcessing()
if (processingState.isProcessing) { }
```

**After:**
```typescript
const { isProcessing } = useDocumentProcessingStore()
if (isProcessing) { }
```

### 3. Component Imports

**Before:**
```typescript
import { DocumentAnalysisInterface } from './DocumentAnalysisInterface'
```

**After:**
```typescript
import { RefactoredDocumentAnalysisInterface } from './RefactoredDocumentAnalysisInterface'
```

---

## ✅ Testing Your Migration

### Step 1: Update One Component

Start with a simple component:

```typescript
// Before
const processingState = useDocumentProcessing()

// After
const { isProcessing, finalResult } = useDocumentProcessingStore()
```

### Step 2: Test Functionality

- ✅ Processing starts correctly
- ✅ Loading states display properly
- ✅ Results show as expected
- ✅ Errors are handled
- ✅ State persists correctly

### Step 3: Check DevTools

Open Redux DevTools to see store state:
- Check `DocumentProcessingStore`
- Check `QueryHistoryStore`
- Check `UIStore`

### Step 4: Performance Check

Monitor:
- ✅ No unnecessary re-renders
- ✅ State updates are fast
- ✅ No console errors

---

## 🐛 Troubleshooting

### Issue 1: Store Not Updating

**Problem:**
```typescript
const store = useDocumentProcessingStore()
// Store never updates
```

**Solution:**
```typescript
// Use destructuring or selector
const { isProcessing } = useDocumentProcessingStore()
// Or
const isProcessing = useDocumentProcessingStore(state => state.isProcessing)
```

### Issue 2: Stale Closure

**Problem:**
```typescript
const handleClick = () => {
  // userPrompt is stale
  startProcessing({ userPrompt })
}
```

**Solution:**
```typescript
const handleClick = () => {
  const state = useDocumentProcessingStore.getState()
  startProcessing({ userPrompt: state.userPrompt })
}
```

### Issue 3: Type Errors

**Problem:**
```typescript
// TypeScript complains about types
const { isProcessing } = useDocumentProcessingStore()
```

**Solution:**
```typescript
// Make sure to import from the right place
import { useDocumentProcessingStore } from '@/stores'
// Not from hooks
```

---

## 📊 Migration Checklist

### Per Component

- [ ] Update imports
- [ ] Replace custom hook with store hook
- [ ] Update variable access (no more `.property`)
- [ ] Add `async`/`await` where needed
- [ ] Test functionality
- [ ] Check for TypeScript errors
- [ ] Verify in browser
- [ ] Check DevTools

### Global

- [ ] All components migrated
- [ ] No references to old hooks
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance is good
- [ ] Documentation updated

---

## 🎉 Benefits After Migration

### Code Quality
- ✅ **Less boilerplate** - No useState/useEffect chains
- ✅ **Better types** - Full TypeScript support
- ✅ **Cleaner code** - Direct destructuring

### Performance
- ✅ **Faster renders** - Selective subscriptions
- ✅ **Better caching** - Zustand optimizations
- ✅ **Smaller bundle** - Less code

### Developer Experience
- ✅ **DevTools** - State inspection
- ✅ **Easier debugging** - Clear state flow
- ✅ **Better testing** - Isolated stores

---

## 📚 Additional Resources

- [Full Refactoring Documentation](./REFACTORING_DOCUMENTATION.md)
- [Quick Start Guide](./QUICK_START_REFACTORED.md)
- [Refactoring Summary](./REFACTORING_SUMMARY.md)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

---

## 🤝 Need Help?

If you encounter issues during migration:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [Examples](#-detailed-migration-examples)
3. Check Zustand documentation
4. Create an issue with details

---

**Happy Migrating! 🚀**

