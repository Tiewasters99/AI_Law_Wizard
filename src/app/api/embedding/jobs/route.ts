import { NextRequest, NextResponse } from "next/server";
import { getJobWithChunks, getUserJobs, getAllJobs, deleteJob } from '../../../../lib/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const jobId = searchParams.get('jobId');

        if (jobId) {
            // Get specific job
            const job = await getJobWithChunks(jobId);
            if (!job) {
                return NextResponse.json(
                    { error: 'Job not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ job });
        }

        if (userId) {
            // Get jobs for specific user
            const jobs = await getUserJobs(userId);
            return NextResponse.json({ jobs });
        }

        // Get all jobs (for admin)
        const jobs = await getAllJobs();
        return NextResponse.json({ jobs });

    } catch (error) {
        console.error('Error fetching embedding jobs:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        await deleteJob(jobId);
        return NextResponse.json({ success: true, message: 'Job deleted successfully' });

    } catch (error) {
        console.error('Error deleting embedding job:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

