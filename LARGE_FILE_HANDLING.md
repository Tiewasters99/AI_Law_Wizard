# Large File Handling System

## Overview

The AI Wizard now supports handling large file uploads (up to 20 files, 15MB each, 200MB total) with robust error handling, progress tracking, and asynchronous processing.

## Key Features

### 1. **Smart Processing Strategy**
- **Small batches** (≤10 files, ≤50MB): Processed synchronously with parallel execution
- **Large batches** (>10 files or >50MB): Processed asynchronously in background
- **Batch processing**: Files processed in groups of 5 to prevent memory issues

### 2. **File Size Limits**
- **Per file**: 15MB maximum
- **Total batch**: 200MB maximum  
- **File count**: 20 files maximum
- **Automatic validation** before processing starts

### 3. **Progress Tracking**
- **Real-time progress** for large batches
- **Individual file status** tracking
- **Error recovery** with partial success handling
- **Background job monitoring** via API endpoints

### 4. **Error Handling**
- **Graceful degradation**: Failed files don't stop successful ones
- **Detailed error reporting** for each failed file
- **Retry mechanisms** for transient failures
- **Memory protection** with batch processing

## API Endpoints

### Upload Files
```
POST /api/embedding
```

**Request**: Multipart form data with files
**Response**: 
- Small batches: Immediate results
- Large batches: Batch ID for progress tracking

### Check Progress
```
GET /api/embedding/jobs/{batchId}
```

**Response**:
```json
{
  "id": "batch-id",
  "status": "PROCESSING",
  "progress": 75,
  "totalChunks": 100,
  "completedChunks": 75,
  "failedChunks": 5,
  "processingChunks": 20
}
```

### List All Jobs
```
GET /api/embedding/jobs?status=PROCESSING&limit=50&offset=0
```

## Frontend Components

### LargeFileUploadHandler
A React component that handles large file uploads with progress tracking:

```tsx
<LargeFileUploadHandler
  onUploadComplete={(results) => console.log('Upload complete', results)}
  onUploadError={(error) => console.error('Upload error', error)}
  maxFiles={20}
  maxTotalSize={200 * 1024 * 1024}
  maxFileSize={15 * 1024 * 1024}
/>
```

**Features**:
- Drag & drop file selection
- Real-time progress tracking
- Error handling and reporting
- File validation before upload
- Automatic retry for failed files

## Processing Flow

### 1. **File Validation**
- Check file count and size limits
- Validate file types and permissions
- Calculate total batch size

### 2. **Upload Strategy Decision**
- **Small batches**: Process immediately
- **Large batches**: Create batch job and process asynchronously

### 3. **File Processing**
- Upload to Vercel Blob storage
- Extract text content (PDF, DOC, images, etc.)
- Create embeddings and chunks
- Update progress in database

### 4. **Progress Tracking**
- Real-time status updates
- Chunk-level progress tracking
- Error reporting and recovery

## Memory Management

### Batch Processing
- Files processed in groups of 5
- 1-second delay between batches
- Memory cleanup after each batch

### File Size Handling
- 15MB per file limit
- 200MB total batch limit
- Automatic chunking for large documents

### Vercel Blob Storage
- Files stored in Vercel Blob
- Public access for processing
- Automatic cleanup of failed uploads

## Error Recovery

### Partial Success Handling
- Successful files are processed even if others fail
- Detailed error reporting for failed files
- Ability to retry failed files individually

### Timeout Protection
- 10-second timeout for Hobby plans
- 60-second timeout for Pro plans
- Background processing for large batches

### Database Consistency
- Transaction-based job creation
- Atomic status updates
- Rollback on critical failures

## Performance Optimizations

### Parallel Processing
- Multiple files processed simultaneously
- Chunk-level parallelization
- Database connection pooling

### Caching
- Embedding results cached
- Chunk metadata cached
- Progress state cached

### Resource Management
- Memory usage monitoring
- CPU usage optimization
- Network bandwidth management

## Monitoring and Analytics

### Progress Tracking
- Real-time progress updates
- Processing time metrics
- Success/failure rates

### Performance Metrics
- File processing times
- Memory usage patterns
- Error rate analysis

### User Experience
- Progress indicators
- Error messages
- Success notifications

## Best Practices

### File Preparation
- Optimize file sizes before upload
- Use appropriate file formats
- Compress images when possible

### Batch Organization
- Group related files together
- Avoid mixing very large and small files
- Consider processing time vs. batch size

### Error Handling
- Monitor failed files
- Retry failed uploads
- Report persistent errors

## Troubleshooting

### Common Issues

1. **Memory Errors**
   - Reduce batch size
   - Process files individually
   - Check file sizes

2. **Timeout Errors**
   - Use background processing
   - Split large batches
   - Optimize file content

3. **Upload Failures**
   - Check file permissions
   - Verify file formats
   - Monitor network connectivity

### Debug Information
- Check Vercel function logs
- Monitor database job status
- Review error messages

## Future Improvements

### Planned Features
- Resume interrupted uploads
- File deduplication
- Advanced compression
- Cloud storage integration

### Performance Enhancements
- Streaming file processing
- Distributed processing
- Advanced caching strategies

### User Experience
- Drag & drop interface
- Progress animations
- Error recovery suggestions
