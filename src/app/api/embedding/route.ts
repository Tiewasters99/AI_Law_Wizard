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

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 10MB.');
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
            // Handle PDF files with OCR (LangChain PDFLoader not available)
            console.log(`Processing PDF with OCR: ${file.name}`);
            const loader = new PDFLoader(file);
            const docs = await loader.load();
            const textContent = docs.map(doc => doc.pageContent).join('\n\n');
            console.log(`PDF OCR completed for ${file.name}, extracted ${textContent.length} characters`);
            return textContent;
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

        console.log(`Processing ${files.length} files`);

        const uploadedFiles = [];
        const createdJobs = [];

        for (const file of files) {
            try {
                // Validate file has a name
                if (!file.name || typeof file.name !== 'string') {
                    throw new Error('File must have a valid name');
                }
                
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
                
                // Create embedding job in database with blob URL
                const job = await createEmbeddingJob({
                    fileName,
                    originalName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    filePath: url, // Store the blob URL
                });

                // Update job status to processing
                await updateJobStatus(job.id, JobStatus.PROCESSING);

                // Extract text content from file
                console.log(`Processing file: ${file.name}`);
                const textContent = await extractTextContent(file, buffer);

                // Use ingestPlainText to process the text content
                const chunkCount = await ingestPlainText(fileName, textContent, job.id, {
                    maxChars: 1000,
                    overlap: 200
                });

                console.log(`File processed with ${chunkCount} chunks: ${file.name}`);

                // Update job with total chunks and mark as completed
                await updateJobProgress(job.id, chunkCount, chunkCount, 0);
                await updateJobStatus(job.id, JobStatus.COMPLETED);

                const fileInfo = {
                    id: job.id,
                    originalName: file.name,
                    fileName: fileName,
                    size: file.size,
                    type: file.type,
                    url: url, // Include the blob URL
                    chunks: chunkCount,
                    processedChunks: chunkCount,
                    failedChunks: 0,
                    status: JobStatus.COMPLETED,
                    uploadedAt: new Date().toISOString()
                };

                uploadedFiles.push(fileInfo);
                createdJobs.push(job);
                console.log(`File processed: ${file.name} -> ${fileName}`);

            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                return NextResponse.json(
                    { error: `Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}` },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            files: uploadedFiles,
            jobs: createdJobs.map(job => ({ id: job.id, status: job.status })),
            message: `${uploadedFiles.length} file(s) processed successfully and embeddings created...`
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown upload error' },
            { status: 500 }
        );
    }
}

