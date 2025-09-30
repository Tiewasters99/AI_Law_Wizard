import { NextRequest, NextResponse } from "next/server";
import { prisma } from '../../../../../lib/database';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const jobId = params.id;
        
        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // Get the job details
        const job = await prisma.embeddingJob.findUnique({
            where: { id: jobId },
            include: {
                chunks: {
                    select: {
                        id: true,
                        status: true,
                        chunkIndex: true
                    }
                }
            }
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        // Calculate progress
        const totalChunks = job.chunks.length;
        const completedChunks = job.chunks.filter(chunk => chunk.status === 'COMPLETED').length;
        const failedChunks = job.chunks.filter(chunk => chunk.status === 'FAILED').length;
        const processingChunks = job.chunks.filter(chunk => chunk.status === 'PROCESSING').length;

        const progress = totalChunks > 0 ? (completedChunks / totalChunks) * 100 : 0;

        return NextResponse.json({
            id: job.id,
            fileName: job.fileName,
            originalName: job.originalName,
            status: job.status,
            progress: Math.round(progress),
            totalChunks,
            completedChunks,
            failedChunks,
            processingChunks,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            isOneDriveFile: job.isOneDriveFile,
            oneDriveId: job.oneDriveId,
            oneDriveLastModified: job.oneDriveLastModified
        });

    } catch (error) {
        console.error('Error fetching job status:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
