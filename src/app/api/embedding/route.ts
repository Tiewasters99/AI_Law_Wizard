import { NextRequest, NextResponse } from "next/server";
import { pineIndex, openapi } from '../../lib/pineConfig';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
import { put } from '@vercel/blob';
import { createEmbeddingJob, updateJobStatus, updateJobProgress, createChunks, updateChunkStatus, JobStatus, ChunkStatus, prisma } from '../../../lib/database';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { ingestPlainText } from '../../lib/ingest';

// Configure Tesseract.js for Next.js environment
const tesseractConfig = {
    logger: (m: unknown) => console.log(m),
    workerPath: undefined, // Let Tesseract.js find its own worker
    langPath: undefined,   // Let Tesseract.js find its own language data
    corePath: undefined    // Let Tesseract.js find its own core
};

// Function to extract text content from files
async function extractTextContent(file: File, buffer?: Buffer): Promise<string> {
    const allowedTypes = [
        'application/pdf',
        'application/msword', // .doc files
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx files
        'application/vnd.ms-word.document.12', // Alternative .docx
        'application/vnd.ms-word.document.macroEnabled.12', // .docm files
        'application/vnd.ms-word.template.12', // .dotx files
        'application/vnd.ms-word.template.macroEnabled.12', // .dotm files
        'text/plain',
        'text/rtf',
        'application/vnd.oasis.opendocument.text',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/json',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 50MB.');
    }

    // Convert file to buffer if not provided
    let fileBuffer: Buffer;
    if (buffer) {
        fileBuffer = buffer;
    } else {
        const bytes = await file.arrayBuffer();
        fileBuffer = Buffer.from(bytes);
    }

    try {
        if (file.type === 'application/pdf') {
            // Handle PDF files with enhanced OCR processing
            console.log(`Processing PDF with enhanced OCR: ${file.name}`);
            
            try {
                // First try with PDFLoader
                const loader = new PDFLoader(file);
                const docs = await loader.load();
                let textContent = docs.map(doc => doc.pageContent).join('\n\n');
                
                // If no text extracted, try with Tesseract OCR
                if (!textContent || textContent.trim().length < 100) {
                    console.log(`PDFLoader extracted minimal text, trying Tesseract OCR for ${file.name}`);
                    const worker = await createWorker('eng', undefined, tesseractConfig);
                    const result = await worker.recognize(fileBuffer);
                    await worker.terminate();
                    textContent = result.data.text;
                }
                
                console.log(`PDF processing completed for ${file.name}, extracted ${textContent.length} characters`);
                return textContent;
            } catch (pdfError) {
                console.warn(`PDF processing failed for ${file.name}, trying Tesseract OCR:`, pdfError);
                // Fallback to Tesseract OCR
                const worker = await createWorker('eng', undefined, tesseractConfig);
                const result = await worker.recognize(fileBuffer);
                await worker.terminate();
                console.log(`Tesseract OCR completed for ${file.name}, extracted ${result.data.text.length} characters`);
                return result.data.text;
            }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.type === 'application/vnd.ms-word.document.12' ||
                   file.type === 'application/vnd.ms-word.document.macroEnabled.12' ||
                   file.type === 'application/vnd.ms-word.template.12' ||
                   file.type === 'application/vnd.ms-word.template.macroEnabled.12') {
            // Handle .docx files with mammoth (LangChain DocxLoader not available)
            console.log(`Processing Word document with mammoth: ${file.name}`);
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            return result.value;
        } else if (file.type === 'application/msword') {
            // Handle .doc files with mammoth
            console.log(`Processing .doc file with mammoth: ${file.name}`);
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            return result.value;
        } else if (file.type.startsWith('text/') || file.type === 'text/rtf') {
            // Handle text files manually
            console.log(`Processing text file manually: ${file.name}`);
            return fileBuffer.toString('utf-8');
        } else if (file.type === 'text/csv') {
            // Handle CSV files manually
            console.log(`Processing CSV file manually: ${file.name}`);
            return fileBuffer.toString('utf-8');
        } else if (file.type === 'application/json') {
            // Handle JSON files manually
            console.log(`Processing JSON file manually: ${file.name}`);
            return fileBuffer.toString('utf-8');
        } else if (file.type.startsWith('image/')) {
            // Handle image files with OCR
            console.log(`Processing image with OCR: ${file.name}`);
            const worker = await createWorker('eng', undefined, tesseractConfig);
            const result = await worker.recognize(fileBuffer);
            await worker.terminate();
            console.log(`OCR completed for ${file.name}, extracted ${result.data.text.length} characters`);
            return result.data.text;
        } else {
            // For other binary files, use filename as metadata
            return `File: ${file.name} (${file.type})`;
        }

    } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Return error information as text content
        return `File: ${file.name} (${file.type}) - Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

// Configuration for large file handling
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total
const MAX_FILES = 20;
const BATCH_SIZE = 3; // Process files in smaller batches for large files

// Helper function to process a single file asynchronously
async function processFileAsync(file: File, oneDriveId?: string, oneDriveLastModified?: string) {
    try {
        // Validate file has a name
        if (!file.name || typeof file.name !== 'string') {
            throw new Error('File must have a valid name');
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File ${file.name} is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
        
        const isOneDriveFile = !!oneDriveId;
        
        // Generate unique filename for database reference
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop() || 'txt';
        const fileName = `${timestamp}-${randomId}.${fileExtension}`;
        
        // Convert file to buffer for blob upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload file to Vercel Blob storage
        const { url } = await put(fileName, buffer, { 
            access: 'public',
            addRandomSuffix: false
        });
        
        // Create embedding job in database with blob URL and OneDrive metadata
        const job = await createEmbeddingJob({
            fileName,
            originalName: file.name,
            fileType: file.type,
            fileSize: file.size,
            filePath: url, // Store the blob URL
            isOneDriveFile,
            oneDriveId,
            oneDriveLastModified,
        });

        // Update job status to processing
        await updateJobStatus(job.id, JobStatus.PROCESSING);

        // Extract text content from file with timeout protection
        console.log(`Processing file: ${file.name}`);
        const textContent = await Promise.race([
            extractTextContent(file, buffer),
            new Promise<string>((_, reject) => 
                setTimeout(() => reject(new Error('Text extraction timeout')), 300000) // 5 minute timeout
            )
        ]);

        // Check if job already has chunks (avoid reprocessing)
        const existingChunks = await prisma.embeddingChunk.count({
            where: { jobId: job.id }
        });
        
        let chunkCount = 0;
        if (existingChunks > 0) {
            console.log(`Job ${job.id} already has ${existingChunks} chunks, skipping processing`);
            chunkCount = existingChunks;
        } else {
            // Use ingestPlainText to process the text content with adaptive chunking
            const isLargeFile = file.size > 10 * 1024 * 1024; // 10MB threshold
            const chunkSize = isLargeFile ? 2000 : 1000; // Larger chunks for large files
            const overlap = isLargeFile ? 400 : 200; // Larger overlap for large files
            
            chunkCount = await ingestPlainText(fileName, textContent, job.id, {
                maxChars: chunkSize,
                overlap: overlap
            });
        }

        console.log(`File processed with ${chunkCount} chunks: ${file.name}`);

        // Update job with total chunks and mark as completed
        if (chunkCount > 0) {
            await updateJobProgress(job.id, chunkCount, chunkCount, 0);
            await updateJobStatus(job.id, JobStatus.COMPLETED);
        } else {
            console.warn(`No chunks created for file ${file.name}, marking as failed`);
            await updateJobStatus(job.id, JobStatus.FAILED, 'No text content extracted or chunks created');
        }

        return {
            id: job.id,
            originalName: file.name,
            fileName: fileName,
            size: file.size,
            type: file.type,
            url: url,
            chunks: chunkCount,
            processedChunks: chunkCount,
            failedChunks: 0,
            status: JobStatus.COMPLETED,
            uploadedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return {
            originalName: file.name,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('File upload API called');
        
        // Get the form data from the request
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        
        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        // Validate total file count
        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `Too many files. Maximum allowed is ${MAX_FILES}` },
                { status: 400 }
            );
        }

        // Validate total file size
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
            return NextResponse.json(
                { error: `Total file size too large. Maximum allowed is ${MAX_TOTAL_SIZE / (1024 * 1024)}MB` },
                { status: 400 }
            );
        }

        console.log(`Processing ${files.length} files (${(totalSize / (1024 * 1024)).toFixed(2)}MB total)`);

        // Get OneDrive metadata (same for all files in this batch)
        const oneDriveId = formData.get('oneDriveId') as string;
        const oneDriveLastModified = formData.get('oneDriveLastModified') as string;

        // For large batches, return immediately and process asynchronously
        if (files.length > 10 || totalSize > 50 * 1024 * 1024) {
            console.log('Large batch detected, processing asynchronously');
            
            // Create a batch job for tracking
            const batchJob = await createEmbeddingJob({
                fileName: `batch-${Date.now()}`,
                originalName: `Batch of ${files.length} files`,
                fileType: 'application/batch',
                fileSize: totalSize,
                filePath: '',
                isOneDriveFile: !!oneDriveId,
                oneDriveId,
                oneDriveLastModified,
            });

            // Process files in background (don't await)
            processBatchAsync(files, oneDriveId, oneDriveLastModified, batchJob.id);

            return NextResponse.json({
                success: true,
                batchId: batchJob.id,
                message: `Batch processing started for ${files.length} files. Check progress via /api/embedding/jobs/${batchJob.id}`,
                totalFiles: files.length,
                totalSize: totalSize
            });
        }

        // For smaller batches, process synchronously but in parallel
        const results = await Promise.allSettled(
            files.map(file => processFileAsync(file, oneDriveId, oneDriveLastModified))
        );

        const successfulFiles: any[] = [];
        const failedFiles: any[] = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && !result.value.error) {
                successfulFiles.push(result.value);
            } else {
                const error = result.status === 'rejected' 
                    ? result.reason 
                    : result.value.error;
                failedFiles.push({
                    fileName: files[index].name,
                    error: error instanceof Error ? error.message : error
                });
            }
        });

        return NextResponse.json({
            success: true,
            files: successfulFiles,
            failedFiles,
            message: `${successfulFiles.length} file(s) processed successfully, ${failedFiles.length} failed`,
            totalFiles: files.length
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown upload error' },
            { status: 500 }
        );
    }
}

// Background processing function for large batches
async function processBatchAsync(files: File[], oneDriveId?: string, oneDriveLastModified?: string, batchJobId?: string) {
    try {
        console.log(`Starting background processing of ${files.length} files`);
        
        const results = [];
        
        // Process files in batches to avoid memory issues
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
            const batch = files.slice(i, i + BATCH_SIZE);
            console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(files.length / BATCH_SIZE)}`);
            
            const batchResults = await Promise.allSettled(
                batch.map(file => processFileAsync(file, oneDriveId, oneDriveLastModified))
            );
            
            results.push(...batchResults);
            
            // Small delay between batches to prevent overwhelming the system
            if (i + BATCH_SIZE < files.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Update batch job status
        if (batchJobId) {
            const successful = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
            const failed = results.length - successful;
            
            await updateJobProgress(batchJobId, results.length, successful, failed);
            await updateJobStatus(batchJobId, JobStatus.COMPLETED);
        }

        console.log(`Background processing completed: ${results.length} files processed`);
        
    } catch (error) {
        console.error('Background processing error:', error);
        if (batchJobId) {
            await updateJobStatus(batchJobId, JobStatus.FAILED);
        }
    }
}

