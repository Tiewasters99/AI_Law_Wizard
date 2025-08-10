import { NextRequest, NextResponse } from "next/server";
import { pineIndex, pine, openapi } from '../../lib/pineConfig';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
import { createEmbeddingJob, updateJobStatus, updateJobProgress, createChunks, updateChunkStatus, JobStatus, ChunkStatus, prisma } from '../../../lib/database';

// Configure Tesseract.js for Next.js environment
const tesseractConfig = {
    logger: (m: any) => console.log(m),
    workerPath: undefined, // Let Tesseract.js find its own worker
    langPath: undefined,   // Let Tesseract.js find its own language data
    corePath: undefined    // Let Tesseract.js find its own core
};

// Function to get appropriate LangChain document loader based on file type
async function getDocumentLoader(file: File): Promise<Document[]> {
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let documents: Document[] = [];

    try {
        if (file.type === 'application/pdf') {
            // Handle PDF files with OCR (LangChain PDFLoader not available)
            console.log(`Processing PDF with OCR: ${file.name}`);
            const worker = await createWorker('eng', undefined, tesseractConfig);
            const result = await worker.recognize(buffer);
            await worker.terminate();
            documents = [new Document({
                pageContent: result.data.text,
                metadata: { source: file.name, type: file.type }
            })];
            console.log(`PDF OCR completed for ${file.name}, extracted ${result.data.text.length} characters`);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.type === 'application/vnd.ms-word.document.12' ||
                   file.type === 'application/vnd.ms-word.document.macroEnabled.12' ||
                   file.type === 'application/vnd.ms-word.template.12' ||
                   file.type === 'application/vnd.ms-word.template.macroEnabled.12') {
            // Handle .docx files with mammoth (LangChain DocxLoader not available)
            console.log(`Processing Word document with mammoth: ${file.name}`);
            const result = await mammoth.extractRawText({ buffer });
            documents = [new Document({
                pageContent: result.value,
                metadata: { source: file.name, type: file.type }
            })];
        } else if (file.type === 'application/msword') {
            // Handle .doc files with mammoth
            console.log(`Processing .doc file with mammoth: ${file.name}`);
            const result = await mammoth.extractRawText({ buffer });
            documents = [new Document({
                pageContent: result.value,
                metadata: { source: file.name, type: file.type }
            })];
        } else if (file.type.startsWith('text/') || file.type === 'text/rtf') {
            // Handle text files manually
            console.log(`Processing text file manually: ${file.name}`);
            const textContent = buffer.toString('utf-8');
            documents = [new Document({
                pageContent: textContent,
                metadata: { source: file.name, type: file.type }
            })];
        } else if (file.type === 'text/csv') {
            // Handle CSV files manually
            console.log(`Processing CSV file manually: ${file.name}`);
            const csvContent = buffer.toString('utf-8');
            documents = [new Document({
                pageContent: csvContent,
                metadata: { source: file.name, type: file.type }
            })];
        } else if (file.type === 'application/json') {
            // Handle JSON files manually
            console.log(`Processing JSON file manually: ${file.name}`);
            const jsonContent = buffer.toString('utf-8');
            documents = [new Document({
                pageContent: jsonContent,
                metadata: { source: file.name, type: file.type }
            })];
        } else if (file.type.startsWith('image/')) {
            // Handle image files with OCR
            console.log(`Processing image with OCR: ${file.name}`);
            const worker = await createWorker('eng', undefined, tesseractConfig);
            const result = await worker.recognize(buffer);
            await worker.terminate();
            documents = [new Document({
                pageContent: result.data.text,
                metadata: { source: file.name, type: file.type }
            })];
            console.log(`OCR completed for ${file.name}, extracted ${result.data.text.length} characters`);
        } else {
            // For other binary files, use filename as metadata
            documents = [new Document({
                pageContent: `File: ${file.name} (${file.type})`,
                metadata: { source: file.name, type: file.type }
            })];
        }

        // Add file metadata to all documents
        documents = documents.map(doc => ({
            ...doc,
            metadata: {
                ...doc.metadata,
                originalName: file.name,
                fileType: file.type,
                fileSize: file.size,
                uploadedAt: new Date().toISOString()
            }
        }));

    } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Create a fallback document with error information
        documents = [new Document({
            pageContent: `File: ${file.name} (${file.type}) - Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            metadata: { 
                source: file.name, 
                type: file.type,
                originalName: file.name,
                fileType: file.type,
                fileSize: file.size,
                uploadedAt: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        })];
    }

    return documents;
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

        // Initialize LangChain text splitter
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
            separators: ['\n\n', '\n', ' ', '']
        });

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
                
                // Create embedding job in database (no filePath needed since we're not storing locally)
                const job = await createEmbeddingJob({
                    fileName,
                    originalName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    // filePath is optional and not needed since we're working with blob storage
                });

                // Update job status to processing
                await updateJobStatus(job.id, JobStatus.PROCESSING);

                // Process file and get documents using LangChain
                console.log(`Processing file: ${file.name}`);
                const documents = await getDocumentLoader(file);

                // Split documents into chunks using LangChain text splitter
                const splitDocs = await textSplitter.splitDocuments(documents);
                console.log(`Documents split into ${splitDocs.length} chunks.`);

                // Create chunks in database
                const chunkData = splitDocs.map((doc, index) => ({
                    jobId: job.id,
                    chunkIndex: index,
                    content: doc.pageContent,
                    contentLength: doc.pageContent.length,
                }));

                await createChunks(job.id, chunkData);

                // Update job with total chunks
                await updateJobProgress(job.id, splitDocs.length, 0, 0);

                // Process each chunk
                let processedChunks = 0;
                let failedChunks = 0;

                for (let i = 0; i < splitDocs.length; i++) {
                    const doc = splitDocs[i];
                    
                    try {
                        // Get chunk from database
                        const chunks = await prisma.embeddingChunk.findMany({
                            where: { jobId: job.id, chunkIndex: i },
                        });
                        
                        if (chunks.length === 0) continue;
                        const chunk = chunks[0];

                        // Update chunk status to processing
                        await updateChunkStatus(chunk.id, ChunkStatus.PROCESSING);

                        const embedding = await openapi.embedQuery(doc.pageContent);
                        console.log(`Chunk embedding created for ${file.name}, chunk ${i + 1}/${splitDocs.length}, length: ${doc.pageContent.length}`);

                        // Upsert to Pinecone
                        const embeddingId = `${fileName.replace(/\.[^/.]+$/, '')}-chunk-${i}`;
                        
                        // Filter metadata to only include Pinecone-compatible values
                        const filteredMetadata: Record<string, any> = {
                            text: doc.pageContent,
                        };
                        
                        // Only include metadata fields that are strings, numbers, booleans, or arrays of strings
                        for (const [key, value] of Object.entries(doc.metadata)) {
                            if (key === 'loc') {
                                // Convert loc object to a simple string representation
                                if (typeof value === 'object' && value !== null) {
                                    if (value.lines && typeof value.lines === 'object') {
                                        filteredMetadata.loc = `lines:${value.lines.from || 0}-${value.lines.to || 0}`;
                                    } else {
                                        filteredMetadata.loc = JSON.stringify(value);
                                    }
                                } else {
                                    filteredMetadata.loc = String(value);
                                }
                            } else if (
                                typeof value === 'string' ||
                                typeof value === 'number' ||
                                typeof value === 'boolean' ||
                                (Array.isArray(value) && value.every(item => typeof item === 'string'))
                            ) {
                                filteredMetadata[key] = value;
                            }
                        }
                        
                        await pineIndex.upsert([
                            {
                                id: embeddingId,
                                values: embedding,
                                metadata: filteredMetadata
                            }
                        ]);

                        // Update chunk as completed
                        await updateChunkStatus(chunk.id, ChunkStatus.COMPLETED, embeddingId);
                        processedChunks++;

                    } catch (error) {
                        console.error(`Error processing chunk ${i} for file ${file.name}:`, error);
                        const chunks = await prisma.embeddingChunk.findMany({
                            where: { jobId: job.id, chunkIndex: i },
                        });
                        if (chunks.length > 0) {
                            await updateChunkStatus(
                                chunks[0].id, 
                                ChunkStatus.FAILED, 
                                undefined, 
                                error instanceof Error ? error.message : 'Unknown error'
                            );
                        }
                        failedChunks++;
                    }

                    // Update job progress
                    await updateJobProgress(job.id, splitDocs.length, processedChunks, failedChunks);
                }

                // Update job status to completed or failed
                const finalStatus = failedChunks === 0 ? JobStatus.COMPLETED : JobStatus.FAILED;
                await updateJobStatus(job.id, finalStatus);

                const fileInfo = {
                    id: job.id,
                    originalName: file.name,
                    fileName: fileName,
                    size: file.size,
                    type: file.type,
                    chunks: splitDocs.length,
                    processedChunks,
                    failedChunks,
                    status: finalStatus,
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

