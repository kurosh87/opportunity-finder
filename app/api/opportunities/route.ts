import { NextRequest, NextResponse } from 'next/server';
import { getOpportunities, getSubreddits, getStats, getKeywords } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;

  const action = searchParams.get('action');

  try {
    if (action === 'subreddits') {
      const subreddits = await getSubreddits();
      return NextResponse.json(subreddits);
    }

    if (action === 'stats') {
      const stats = await getStats();
      return NextResponse.json(stats);
    }

    if (action === 'keywords') {
      const keywords = await getKeywords();
      return NextResponse.json(keywords);
    }

    const params = {
      minScore: parseFloat(searchParams.get('minScore') || '0'),
      maxComplexity: parseFloat(searchParams.get('maxComplexity') || '10'),
      minRevenue: parseFloat(searchParams.get('minRevenue') || '0'),
      minNovelty: parseFloat(searchParams.get('minNovelty') || '0'),
      minDemand: parseFloat(searchParams.get('minDemand') || '0'),
      search: searchParams.get('search') || '',
      subreddit: searchParams.get('subreddit') || '',
      sortBy: searchParams.get('sortBy') || 'overall_score',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const result = await getOpportunities(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
