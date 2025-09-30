# Document Processing System - Flow Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[DocumentAnalysisInterface]
        B[ProcessingStatusIndicators]
        C[QueryHistoryDashboard]
        D[useDocumentProcessing Hook]
    end
    
    subgraph "API Layer"
        E[/api/document-processing/route.ts]
        F[Mode Detection]
        G[File Search]
        H[Processing Engine]
    end
    
    subgraph "AI Models"
        I[GPT-4o-mini]
        J[Grok-4]
    end
    
    subgraph "Data Layer"
        K[PostgreSQL Database]
        L[Pinecone Vector DB]
        M[File Storage]
    end
    
    A --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    E --> K
    E --> L
    E --> M
```

## 2. Processing Flow - Question Answering Mode

```mermaid
sequenceDiagram
    participant U as User
    participant UI as DocumentAnalysisInterface
    participant Hook as useDocumentProcessing
    participant API as /api/document-processing
    participant DB as Database
    participant Vector as Pinecone
    participant AI as GPT-4o-mini
    
    U->>UI: Enter query
    UI->>Hook: startProcessing()
    Hook->>API: POST request
    API->>API: detectResponseMode()
    API->>API: searchRelevantFiles()
    API->>Vector: Search embeddings
    Vector-->>API: Relevant chunks
    API->>DB: Get chunk summaries
    DB-->>API: Chunk data
    API->>AI: Process with chunks
    AI-->>API: Response
    API->>DB: Save query result
    API-->>Hook: Success response
    Hook-->>UI: Update state
    UI-->>U: Display result
```

## 3. Processing Flow - Action Performance Mode

```mermaid
sequenceDiagram
    participant U as User
    participant UI as DocumentAnalysisInterface
    participant Hook as useDocumentProcessing
    participant API as /api/document-processing
    participant DB as Database
    participant Vector as Pinecone
    participant AI as Grok-4
    
    U->>UI: Enter action request
    UI->>Hook: startProcessing()
    Hook->>API: POST request
    API->>API: detectResponseMode()
    API->>API: searchRelevantFiles()
    API->>Vector: Search embeddings
    Vector-->>API: Relevant chunks
    API->>DB: Get full file content
    DB-->>API: File data
    API->>AI: Agent processing
    AI->>AI: File editing tools
    AI-->>API: Edited content
    API->>DB: Save query result
    API-->>Hook: Success response
    Hook-->>UI: Update state
    UI-->>U: Display result
```

## 4. Mode Detection Flow

```mermaid
flowchart TD
    A[User Input] --> B{Keyword Pattern Match}
    B -->|Question Keywords| C[question_answering]
    B -->|Action Keywords| D[action_performance]
    B -->|No Match| E[AI Fallback]
    E --> F{GPT-4o-mini Classification}
    F -->|Question| C
    F -->|Action| D
    C --> G[Chunk-based Processing]
    D --> H[Full File Processing]
```

## 5. File Search and Retrieval Flow

```mermaid
flowchart TD
    A[Search Query] --> B[Vector Database Search]
    B --> C[Get Embedding IDs]
    C --> D[Database Chunk Lookup]
    D --> E[Get Job Information]
    E --> F[Combine Results]
    F --> G{Quick Search Success?}
    G -->|Yes| H[Return Results]
    G -->|No| I[Fallback to Vector Search]
    I --> J[File Processing Tool]
    J --> H
```

## 6. Real-time Processing State Management

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: startProcessing()
    Processing --> Searching: Mode Detection
    Searching --> QuestionMode: Question Answering
    Searching --> ActionMode: Action Performance
    QuestionMode --> ProcessingComplete: GPT-4o-mini Response
    ActionMode --> ProcessingComplete: Grok-4 Response
    ProcessingComplete --> [*]
    Processing --> Error: Processing Failed
    Error --> [*]
```

## 7. Database Schema Relationships

```mermaid
erDiagram
    DocumentQuery {
        string id PK
        string userQuery
        string aiResponse
        boolean success
        number processingTime
        string[] toolsUsed
        json filesProcessed
    }
    
    EmbeddingJob {
        string id PK
        string fileName
        string fileType
        number fileSize
        string status
        number totalChunks
        number processedChunks
    }
    
    EmbeddingChunk {
        string id PK
        string jobId FK
        string content
        string summary
        string embeddingId
        json metadata
    }
    
    ChatSession {
        string id PK
        string title
        string userId
        json metadata
        boolean isActive
    }
    
    ChatMessage {
        string id PK
        string sessionId FK
        string role
        string content
        number tokenCount
        string modelUsed
    }
    
    DocumentQuery ||--o{ EmbeddingJob : processes
    EmbeddingJob ||--o{ EmbeddingChunk : contains
    ChatSession ||--o{ ChatMessage : has
```

## 8. Performance Optimization Strategy

```mermaid
graph LR
    A[User Request] --> B{Fast Mode Detection}
    B -->|Keywords| C[Instant Classification]
    B -->|Ambiguous| D[AI Fallback]
    C --> E{Response Mode}
    D --> E
    E -->|Question| F[Chunk-based Processing]
    E -->|Action| G[Full File Processing]
    F --> H[GPT-4o-mini]
    G --> I[Grok-4]
    H --> J[Fast Response]
    I --> K[Advanced Processing]
    J --> L[Save to DB]
    K --> L
```

## 9. Error Handling and Recovery

```mermaid
flowchart TD
    A[Processing Request] --> B{Connection OK?}
    B -->|No| C[Retry Connection]
    C --> D{Max Retries?}
    D -->|No| B
    D -->|Yes| E[Connection Error]
    B -->|Yes| F[Process Request]
    F --> G{Processing Success?}
    G -->|Yes| H[Return Result]
    G -->|No| I[Error Classification]
    I --> J{Recoverable?}
    J -->|Yes| K[Retry Processing]
    J -->|No| L[User Error Message]
    K --> F
    E --> M[Save Error to DB]
    L --> M
    H --> N[Save Success to DB]
```

## 10. User Interface Component Hierarchy

```mermaid
graph TD
    A[DocumentAnalysisInterface] --> B[Analysis Tab]
    A --> C[Files Tab]
    A --> D[History Tab]
    A --> E[Sidebar]
    
    B --> F[Input Form]
    B --> G[Processing Status]
    B --> H[Results Display]
    
    C --> I[OneDriveInterface]
    C --> J[File Upload]
    
    D --> K[QueryHistoryList]
    D --> L[QueryAnalyticsDashboard]
    
    E --> M[Quick Tools]
    E --> N[Recent Queries]
    
    G --> O[ProcessingStatusIndicators]
    G --> P[Real-time Logs]
    G --> Q[Progress Tracking]
```

## Key Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Mode Detection | < 1s | ~0.5s |
| Question Answering | 2-5s | ~3s |
| Action Performance | 5-15s | ~8s |
| File Processing | 1-3s/file | ~2s/file |
| Database Queries | < 500ms | ~300ms |

## System Benefits

1. **Dual-Mode Architecture**: Optimized for both information retrieval and document manipulation
2. **Smart Mode Detection**: Fast keyword-based classification with AI fallback
3. **Vector-First Search**: Efficient semantic search across all documents
4. **Cost Optimization**: Appropriate AI model selection based on task complexity
5. **Real-time Feedback**: Comprehensive progress tracking and user feedback
6. **Error Recovery**: Robust error handling and graceful degradation
7. **Scalable Design**: Modular architecture for easy maintenance and enhancement
