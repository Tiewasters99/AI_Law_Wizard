# Context Maintenance Implementation with LangChain

## Overview

This document describes the implementation of proper context maintenance for the follow-up chat interface in the AI Document Wizard. The system uses LangChain to maintain full context of the original document analysis throughout the conversation.

## Key Components

### 1. Session-Based Context Management

**Location**: `src/app/api/document-processing/sessions/route.ts`

- Creates document analysis sessions with full context
- Stores original query, analysis results, and processed files
- Maintains file IDs for vector search context

**Session Context Structure**:
```typescript
{
  originalQuery: string,           // User's original question
  processedFiles: Array,            // Files that were analyzed
  analysisResult: string,           // Complete analysis result
  timestamp: string,                // Session creation time
  fileIds: string[],                // File IDs for vector search
  conversationTopics: string[],     // Tracks conversation flow
  searchesPerformed: number,        // Tracks searches
  documentsReferenced: string[]     // Unique document IDs
}
```

### 2. LangChain Integration

**Location**: `src/app/api/document-processing/chat/route.ts`

#### AI Models Used

- **ChatXAI (Grok-4)**: For action-oriented responses and complex reasoning
- **ChatOpenAI (GPT-4o-mini)**: For Q&A responses and simple queries

#### Message History Management

```typescript
// Build conversation history with proper LangChain messages
const recentMessages = session.messages.slice(-10) // Keep last 10 messages
const messageHistory: BaseMessage[] = recentMessages.map(msg => {
  if (msg.role === 'USER') {
    return new HumanMessage(msg.content)
  } else {
    return new AIMessage(msg.content)
  }
})
```

#### System Prompt with Full Context

The system prompt includes:
- Original analysis context (query, result, files)
- Relevant document content from vector search
- Clear instructions for maintaining context
- Response guidelines for consistency

### 3. Vector Search for Context Retrieval

**Function**: `searchVectorDatabaseForChat()`

- Searches across ALL chunks without job filtering
- Uses OpenAI embeddings for query vectorization
- Returns top K relevant chunks with metadata
- Enriches results with job information and summaries

**Search Process**:
1. Create embedding for user's follow-up question
2. Search Pinecone vector database
3. Fetch database chunks with summaries
4. Enrich with job/file information
5. Sort by relevance score

### 4. Context Tracking Throughout Conversation

**Enhanced Session Updates**:
```typescript
await prisma.documentAnalysisSession.update({
  where: { id: sessionId },
  data: { 
    context: {
      ...sessionContext,
      lastMessage: message,
      lastResponse: aiResponse,
      totalMessages: session.messages.length + 2,
      // Maintain original context
      originalQuery: sessionContext.originalQuery || originalQuery,
      analysisResult: sessionContext.analysisResult || analysisResult,
      processedFiles: sessionContext.processedFiles || processedFiles,
      // Track conversation flow
      conversationTopics: [...],
      searchesPerformed: count,
      documentsReferenced: [uniqueIds]
    }
  }
})
```

### 5. File Context Management

**Location**: `FileContext` model in Prisma schema

Tracks which files are referenced in each conversation:
- File ID and name
- Chunks used from each file
- Relevance score
- Last accessed timestamp

### 6. UI Indicators

**Location**: `src/app/components/document-processing/DocumentAnalysisInterface.tsx`

**Context Indicator in Chat Header**:
```tsx
<div className="flex items-center gap-1.5 text-xs text-gray-500">
  <Brain className="w-3 h-3 text-blue-500" />
  <span>Context maintained from original analysis</span>
  <Badge>{processedFiles.length} documents</Badge>
</div>
```

**Expandable Context Information**:
- Shows original query
- Displays number of documents analyzed
- Accessible via "View Original Analysis Context" button

### 7. Automatic Session Creation

**Location**: `DocumentAnalysisInterface.tsx` - `useEffect` hook

Automatically creates a session when analysis completes:
```typescript
useEffect(() => {
  if (!processingState.isProcessing && processingState.finalResult && !processingState.error) {
    // Auto-create document analysis session for chat continuity
    if (!documentSessionId) {
      createDocumentAnalysisSession()
    }
  }
}, [processingState.isProcessing, processingState.finalResult, processingState.error])
```

## Context Flow

### Initial Analysis
1. User submits document analysis query
2. System processes documents and generates result
3. Session automatically created with full context
4. Context includes: originalQuery, analysisResult, processedFiles, fileIds

### Follow-up Questions
1. User asks follow-up question in chat
2. System retrieves session with full context
3. Vector search finds relevant document chunks
4. LangChain builds message history (last 10 messages)
5. System prompt includes:
   - Original query and analysis
   - Relevant document content
   - Conversation history
6. AI generates contextually-aware response
7. Session context updated with new information

### Context Maintenance
- **Message History**: Last 10 messages maintained
- **Session Context**: Full original context preserved
- **Vector Search**: Dynamic retrieval of relevant content
- **File Tracking**: Documents referenced throughout conversation
- **Conversation Topics**: Last 10 user questions tracked

## Benefits

### 1. Full Context Awareness
- AI has access to original query and analysis
- Maintains understanding across entire conversation
- References specific documents and analysis points

### 2. Intelligent Search
- Vector search finds relevant content for each question
- Not limited to originally processed files
- Searches across entire document database

### 3. Conversation Continuity
- Maintains consistency across multiple messages
- Tracks conversation topics and patterns
- Updates context with each interaction

### 4. User Transparency
- Visual indicators show context is maintained
- Users can view original analysis context
- Clear feedback on number of documents

### 5. Performance Optimization
- Uses appropriate AI model for task (Grok-4 vs GPT-4o-mini)
- Limits message history to last 10 for efficiency
- Smart caching of session information

## Technical Implementation Details

### LangChain Components Used

1. **ChatXAI**: Grok integration for complex tasks
2. **ChatOpenAI**: GPT-4o-mini for simple Q&A
3. **Message Types**: HumanMessage, AIMessage, SystemMessage
4. **BaseMessage**: Type-safe message handling

### Database Models

1. **DocumentAnalysisSession**: Stores session and context
2. **DocumentAnalysisMessage**: Individual messages
3. **FileContext**: File reference tracking
4. **EmbeddingChunk**: Vector search integration

### API Endpoints

1. **POST /api/document-processing/sessions**: Create session with context
2. **GET /api/document-processing/sessions**: Retrieve session details
3. **POST /api/document-processing/chat**: Send message with context
4. **GET /api/document-processing/chat**: Get chat history

## Best Practices

### 1. Context Management
- Always pass full context when creating sessions
- Update context after each interaction
- Track conversation flow and patterns

### 2. Vector Search
- Search for relevant content with each question
- Include chunk summaries for better context
- Track which documents are referenced

### 3. Message History
- Limit to last 10 messages for performance
- Use proper LangChain message types
- Maintain conversation continuity

### 4. User Experience
- Provide visual feedback on context maintenance
- Show original analysis context when needed
- Clear indicators of session status

### 5. Error Handling
- Graceful degradation if session not found
- Clear error messages to users
- Fallback to alternative search methods

## Future Enhancements

1. **Conversation Summarization**: Periodically summarize long conversations
2. **Context Pruning**: Intelligent removal of less relevant context
3. **Multi-Session Management**: Track related sessions
4. **Context Export**: Allow users to export conversation context
5. **Advanced Search**: Hybrid search combining vector and keyword search

## Conclusion

The implementation successfully maintains full context from the original document analysis throughout the follow-up conversation using LangChain. Users can ask questions with confidence that the AI has access to all relevant information, including the original query, analysis results, and document content.

The system provides transparency through visual indicators and ensures optimal performance through smart model selection and context management.

