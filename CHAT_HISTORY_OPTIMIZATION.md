# Chat History Management Guide

## Overview

This document explains the comprehensive management strategies implemented in the `ChatService` to handle large chat histories efficiently while maintaining context and conversation quality.

## Problem Statement

When chat conversations become very long (hundreds or thousands of messages), sending the entire history to the LLM becomes problematic:

1. **Token Limits**: LLMs have context window limits (e.g., 4K, 8K, 32K tokens)
2. **Cost**: More tokens = higher API costs
3. **Performance**: Larger payloads = slower response times
4. **Relevance**: Older messages may not be relevant to current conversation

## Management Strategies

### 1. **Sliding Window Approach**
- Always includes the most recent `SLIDING_WINDOW_SIZE` messages (default: 10)
- Ensures recent context is preserved
- Maintains conversation flow

### 2. **Conversation Summarization**
- Automatically summarizes conversations when they exceed `SUMMARY_THRESHOLD` messages (default: 50)
- Uses AI to create concise summaries of older conversation parts
- Summaries are stored in session metadata and used as context

### 3. **Intelligent Message Selection**
- For conversations without recent summaries, selects older messages based on relevance
- Uses keyword matching between current message and historical messages
- Scores messages by relevance and selects top matches

### 4. **Token-Based Truncation**
- Final fallback strategy to ensure token limits aren't exceeded
- Estimates tokens using character count ÷ 4 approximation
- Truncates from oldest to newest if token limit is reached

### 5. **Message Archiving**
- Soft-deletes old messages to reduce database load
- Marks messages as archived instead of hard deletion
- Can be retrieved if needed for analysis

## Configuration Constants

```typescript
private static readonly MAX_CONTEXT_MESSAGES = 20; // Maximum messages in context
private static readonly MAX_CONTEXT_TOKENS = 8000; // Approximate token limit
private static readonly SUMMARY_THRESHOLD = 50; // Messages before summarization
private static readonly SLIDING_WINDOW_SIZE = 10; // Recent messages to keep
```

## How It Works

### Step-by-Step Process

1. **Check Message Count**
   - If ≤ `MAX_CONTEXT_MESSAGES`: Use all messages
   - If > `MAX_CONTEXT_MESSAGES`: Apply optimization strategies

2. **Apply Optimization Strategies**
   - Get recent summary if available and not expired (24 hours)
   - Select relevant older messages if no recent summary
   - Include recent messages (sliding window)
   - Apply token-based truncation if needed

3. **Automatic Summarization**
   - Triggered when conversation exceeds threshold
   - Runs in background (non-blocking)
   - Updates session metadata with summary

### Management Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Chat History Management                   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Check Message Count                            │
│  ≤ 20 messages? → Use all messages                         │
│  > 20 messages? → Apply management strategies               │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Apply Management Strategies                     │
│                                                             │
│  1. Check for recent summary (≤ 24 hours old)              │
│     ├── Yes: Use summary + recent messages                 │
│     └── No: Select relevant older messages                 │
│                                                             │
│  2. Always include recent 10 messages (sliding window)     │
│                                                             │
│  3. Apply token-based truncation if needed                 │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Send to LLM                                    │
│  [System Prompt] + [Managed History] + [Current Message]   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Background Processing                          │
│                                                             │
│  If > 50 messages: Trigger summarization                   │
│  Archive old messages (> 30 days)                          │
│  Update session metadata                                    │
└─────────────────────────────────────────────────────────────┘
```

### Example Flow

```
Conversation with 100 messages:
├── Messages 1-20: Archived (if older than 30 days)
├── Messages 21-80: Summarized (stored as summary in metadata)
├── Messages 81-90: Selected based on relevance to current message
└── Messages 91-100: Always included (sliding window)

Final LLM Context:
├── System Prompt
├── Conversation Summary (if available)
├── 5-10 relevant older messages (keyword-matched)
├── 10 recent messages (sliding window)
└── Current user message
```

## Key Methods

### `manageConversationHistory()`
Main orchestration method that applies all management strategies.

### `summarizeConversation()`
Creates AI-generated summaries of conversation segments using GPT-3.5-turbo.

### `selectRelevantOlderMessages()`
Intelligently selects older messages based on keyword relevance scoring.

### `archiveOldMessages()`
Soft-deletes old messages to maintain database performance.

## Benefits

1. **Cost Reduction**: Fewer tokens sent to LLM = lower API costs
2. **Better Performance**: Faster response times with smaller payloads
3. **Maintained Context**: Recent messages + summaries preserve conversation flow
4. **Scalability**: Handles conversations of any length efficiently
5. **Intelligent Selection**: Relevant older messages are preserved when needed

## Usage Examples

### Basic Usage (No Changes Required)
```typescript
// Existing code continues to work unchanged
const response = await ChatService.sendMessage(sessionId, userMessage, userId);
```

### Archive Old Messages
```typescript
// Archive messages older than 30 days
await ChatService.archiveOldMessages(sessionId, 30);
```

### Get Session History
```typescript
// Get history excluding archived messages
const history = await ChatService.getSessionHistory(sessionId);
```

## Monitoring and Metrics

### Log Messages
- `Processing message for session X with Y existing messages`
- `Successfully summarized conversation for session X`
- `Archived old messages for session X`

### Session Metadata Tracking
- `summary`: AI-generated conversation summary
- `lastSummarizedAt`: Timestamp of last summarization
- `archived`: Flag for archived messages

## Best Practices

1. **Monitor Token Usage**: Track actual vs estimated tokens
2. **Adjust Thresholds**: Tune constants based on your use case
3. **Regular Archiving**: Run archiving jobs periodically
4. **Summary Quality**: Review AI-generated summaries for accuracy
5. **Performance Monitoring**: Watch response times and costs

## Future Enhancements

1. **Semantic Similarity**: Use embeddings for better message selection
2. **Dynamic Thresholds**: Adjust limits based on conversation type
3. **Compression**: More sophisticated text compression
4. **Caching**: Cache summaries and optimizations
5. **Analytics**: Detailed metrics on optimization effectiveness

## Troubleshooting

### Common Issues

1. **Summaries Not Generated**
   - Check OpenAI API key configuration
   - Verify message count exceeds threshold
   - Check for errors in background summarization

2. **Poor Message Selection**
   - Review keyword extraction logic
   - Adjust relevance scoring weights
   - Consider using semantic similarity

3. **Token Limit Exceeded**
   - Reduce `MAX_CONTEXT_TOKENS`
   - Increase summarization frequency
   - Implement more aggressive truncation

### Debug Mode

Enable detailed logging to trace optimization decisions:

```typescript
// Add to your environment variables
DEBUG_CHAT_OPTIMIZATION=true
```

This will log detailed information about message selection, summarization, and token usage.
