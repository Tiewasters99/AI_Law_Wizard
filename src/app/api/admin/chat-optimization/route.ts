import { NextRequest, NextResponse } from 'next/server';
import { ChatManagementUtils } from '../../../lib/chatOptimizationUtils';

/**
 * Admin API endpoint for chat management
 * GET: Get chat statistics and status
 * POST: Trigger management actions
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await ChatManagementUtils.getChatStats();
        return NextResponse.json({ success: true, data: stats });

      case 'sessions-needing-management':
        const limit = parseInt(searchParams.get('limit') || '50');
        const sessions = await ChatManagementUtils.getSessionsNeedingManagement(limit);
        return NextResponse.json({ success: true, data: sessions });

      case 'report':
        const report = await ChatManagementUtils.generateManagementReport();
        return NextResponse.json({ success: true, data: { report } });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Available actions: stats, sessions-needing-management, report' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in chat management GET:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'force-summarization':
        if (!params.sessionId) {
          return NextResponse.json({ 
            success: false, 
            error: 'sessionId is required for force-summarization' 
          }, { status: 400 });
        }
        await ChatManagementUtils.forceSummarization(params.sessionId);
        return NextResponse.json({ success: true, message: 'Summarization triggered' });

      case 'archive-old-messages':
        const olderThanDays = params.olderThanDays || 30;
        const sessionIds = params.sessionIds;
        const archivedCount = await ChatManagementUtils.archiveOldMessagesBulk(olderThanDays, sessionIds);
        return NextResponse.json({ 
          success: true, 
          message: `Archived ${archivedCount} messages` 
        });

      case 'cleanup-orphaned-sessions':
        const cleanedCount = await ChatManagementUtils.cleanupOrphanedSessions();
        return NextResponse.json({ 
          success: true, 
          message: `Cleaned up ${cleanedCount} orphaned sessions` 
        });

      case 'get-token-estimate':
        if (!params.sessionId) {
          return NextResponse.json({ 
            success: false, 
            error: 'sessionId is required for get-token-estimate' 
          }, { status: 400 });
        }
        const estimate = await ChatManagementUtils.getSessionTokenEstimate(params.sessionId);
        return NextResponse.json({ success: true, data: estimate });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Available actions: force-summarization, archive-old-messages, cleanup-orphaned-sessions, get-token-estimate' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in chat management POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
