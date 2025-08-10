import { NextRequest, NextResponse } from "next/server";
import { pineIndex, openapi } from '../../lib/pineConfig';

export async function POST(request: NextRequest) {
  try {
    console.log('Similarity search API called');
    
    const body = await request.json();
    const { query, topK = 5, filter } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    if (topK < 1 || topK > 100) {
      return NextResponse.json(
        { error: 'topK must be between 1 and 100' },
        { status: 400 }
      );
    }

    console.log(`Performing similarity search for: "${query}" with topK: ${topK}`);

    // Create embedding for the query
    const queryEmbedding = await openapi.embedQuery(query);
    console.log('Query embedding created');

    // Prepare query parameters
    const queryParams: any = {
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
      includeValues: false
    };

    // Add filter if provided
    if (filter && typeof filter === 'object') {
      queryParams.filter = filter;
    }

    // Perform similarity search
    const searchResults = await pineIndex.query(queryParams);
    console.log(`Found ${searchResults.matches?.length || 0} matches`);

    // Process and format results
    const formattedResults = searchResults.matches?.map((match, index) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
      rank: index + 1
    })) || [];

    return NextResponse.json({
      success: true,
      query: query,
      results: formattedResults,
      totalResults: formattedResults.length,
      topK: topK
    });

  } catch (error) {
    console.error('Similarity search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform similarity search' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Similarity search stats API called');
    
    // Get index stats
    const indexStats = await pineIndex.describeIndexStats();
    
    return NextResponse.json({
      success: true,
      stats: {
        totalVectorCount: indexStats.totalRecordCount,
        dimension: indexStats.dimension,
        indexFullness: indexStats.indexFullness,
        namespaces: indexStats.namespaces
      }
    });

  } catch (error) {
    console.error('Similarity search stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get index stats' },
      { status: 500 }
    );
  }
}
