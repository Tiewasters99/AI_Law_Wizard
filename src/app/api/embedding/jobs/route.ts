import { NextRequest, NextResponse } from "next/server";
import { prisma } from '../../../../lib/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where clause
        const where: any = {};
        if (status) {
            where.status = status;
        }

        // Get jobs with pagination
        const jobs = await prisma.embeddingJob.findMany({
            where,
            include: {
                chunks: {
                    select: {
                        id: true,
                        status: true,
                        chunkIndex: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        // Calculate progress for each job
        const jobsWithProgress = jobs.map(job => {
            const totalChunks = job.chunks.length;
            const completedChunks = job.chunks.filter(chunk => chunk.status === 'COMPLETED').length;
            const failedChunks = job.chunks.filter(chunk => chunk.status === 'FAILED').length;
            const processingChunks = job.chunks.filter(chunk => chunk.status === 'PROCESSING').length;

            const progress = totalChunks > 0 ? (completedChunks / totalChunks) * 100 : 0;

            return {
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
            };
        });

        // Get total count for pagination
        const totalCount = await prisma.embeddingJob.count({ where });

        return NextResponse.json({
            jobs: jobsWithProgress,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}