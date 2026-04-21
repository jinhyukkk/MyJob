import { NextRequest, NextResponse } from 'next/server';
import { crawlAllActive, crawlSource } from '@/lib/crawl';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const sourceId = req.nextUrl.searchParams.get('sourceId');
  try {
    const results = sourceId
      ? [await crawlSource(sourceId)]
      : await crawlAllActive();
    return NextResponse.json({ results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
