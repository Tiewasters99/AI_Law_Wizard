# React Optimization Quick Reference Card

## 🎯 Quick Checklist for Each Component

- [ ] Import `useCallback` and/or `useMemo` if needed
- [ ] Move static arrays/objects outside component (above component definition)
- [ ] Wrap event handlers in `useCallback`
- [ ] Wrap computed values in `useMemo`
- [ ] Fix useEffect dependencies to be specific
- [ ] Run linter and fix any errors
- [ ] Test component functionality

---

## 📋 5 Common Patterns

### 1️⃣ Event Handler → useCallback
```typescript
// ❌ Before
const handleClick = () => {
  doSomething()
}

// ✅ After
const handleClick = useCallback(() => {
  doSomething()
}, [dependency1])
```

### 2️⃣ Computed Value → useMemo
```typescript
// ❌ Before
const filtered = users.filter(u => u.active)

// ✅ After
const filtered = useMemo(
  () => users.filter(u => u.active),
  [users]
)
```

### 3️⃣ Role Check → useMemo
```typescript
// ❌ Before
const isAttorney = session?.user?.role === 'ATTORNEY' || session?.user?.role === 'LAWYER'

// ✅ After
const isAttorney = useMemo(
  () => session?.user?.role === 'ATTORNEY' || session?.user?.role === 'LAWYER',
  [session?.user?.role]
)
```

### 4️⃣ Static Array → Outside Component
```typescript
// ❌ Before - inside component
function MyComponent() {
  const items = [{ id: 1 }, { id: 2 }]
  // ...
}

// ✅ After - outside component
const ITEMS = [{ id: 1 }, { id: 2 }]

function MyComponent() {
  // ...
}
```

### 5️⃣ Event Listener → useCallback
```typescript
// ❌ Before
useEffect(() => {
  const handler = () => { /* ... */ }
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])

// ✅ After
const handler = useCallback(() => { /* ... */ }, [])

useEffect(() => {
  handler()
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [handler])
```

---

## 🔍 What to Look For

### Event Handlers (wrap in useCallback)
- `handleClick`, `handleChange`, `handleSubmit`
- `onSomething` callback props
- Any function passed as prop to child component
- Any function used in useEffect

### Computed Values (wrap in useMemo)
- Array filtering: `.filter()`, `.map()`, `.reduce()`
- Object transformations
- Complex calculations
- Conditional values based on state/props

### Static Data (move outside)
- Navigation arrays
- Menu items
- Configuration objects
- Benefit lists
- Any array/object that doesn't depend on state/props

### useEffect Dependencies
- ❌ Full objects: `[session]`, `[user]`
- ✅ Specific properties: `[session?.user?.id]`, `[user.name]`

---

## ⚡ Quick Commands

```bash
# Lint specific file
npx eslint src/app/[path-to-file].tsx

# Lint and auto-fix
npx eslint src/app/[path-to-file].tsx --fix

# Lint entire project
npm run lint

# Type check
npx tsc --noEmit
```

---

## 🚫 Common Mistakes

### 1. Missing Dependencies
```typescript
// ❌ Wrong - missing dependencies
const handler = useCallback(() => {
  doSomething(value)
}, [])

// ✅ Correct
const handler = useCallback(() => {
  doSomething(value)
}, [value])
```

### 2. Over-Memoizing
```typescript
// ❌ Wrong - simple value doesn't need memo
const name = useMemo(() => "John", [])

// ✅ Correct
const name = "John"
```

### 3. Memoizing Everything
```typescript
// ❌ Wrong - presentational component doesn't need optimization
function Button({ label }) {
  const handleClick = useCallback(() => {}, [])
  // ... too much memoization
}

// ✅ Correct - keep it simple
function Button({ label }) {
  // ... just render
}
```

---

## 📊 Priority Order

1. **High-traffic pages** (Home, Chat, Directory)
2. **Large files** (OneDriveInterface 1138 lines, FeatureDemos 1155 lines)
3. **Components with state** and multiple handlers
4. **Components that re-render frequently**
5. **UI components** (usually don't need optimization)

---

## ✅ Optimization Checklist Per File

```
File: _______________________

[ ] Identified all event handlers
[ ] Wrapped handlers in useCallback
[ ] Identified computed values
[ ] Wrapped computations in useMemo
[ ] Moved static data outside component
[ ] Fixed useEffect dependencies
[ ] Added necessary imports
[ ] Ran linter - no errors
[ ] Tested functionality - no regressions
[ ] Updated tracking CSV
```

---

## 🎓 When NOT to Optimize

- ❌ Simple presentational components (Button, Badge, Card)
- ❌ Components that rarely render
- ❌ Components with no state or handlers
- ❌ UI library components (shadcn/ui)

---

## 💡 Pro Tips

1. **Start at the top** - Move imports, then static data, then component
2. **Test frequently** - Lint after each file
3. **Be specific** - Use `session?.user?.id` not `session`
4. **Check the plan** - Refer to FRONTEND_OPTIMIZATION_SUMMARY.md for examples
5. **Track progress** - Update OPTIMIZATION_TRACKING.csv

---

## 📁 Files to Reference

- **Full Plan**: `FRONTEND_OPTIMIZATION_SUMMARY.md` (detailed examples)
- **Tracking**: `OPTIMIZATION_TRACKING.csv` (all 117 components)
- **This Card**: `OPTIMIZATION_QUICK_REFERENCE.md` (quick patterns)

---

**Progress:** 13/117 complete (11%)  
**Next Priority:** OneDriveInterface.tsx (Phase 3)  
**Status:** ✅ Phase 1 complete, 4 phases in progress

