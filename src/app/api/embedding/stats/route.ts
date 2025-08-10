import { NextResponse } from "next/server";
import { getJobStats } from '../../../../lib/database';

export async function GET() {
    try {
        const stats = await getJobStats();
        return NextResponse.json({ stats });

    } catch (error) {
        console.error('Error fetching embedding stats:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

