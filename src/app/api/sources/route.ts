import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { adapters } from '@/lib/crawlers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { jobs: true } } },
  });
  return NextResponse.json({
    sources,
    adapters: Object.values(adapters).map((a) => ({
      key: a.key,
      name: a.name,
      configSchema: a.configSchema ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<{
    name: string;
    adapter: string;
    url: string;
    active: boolean;
  }>;
  if (!body.name || !body.adapter || !body.url) {
    return NextResponse.json({ error: 'name/adapter/url required' }, { status: 400 });
  }
  if (!adapters[body.adapter]) {
    return NextResponse.json({ error: `unknown adapter: ${body.adapter}` }, { status: 400 });
  }
  const source = await prisma.source.create({
    data: {
      name: body.name,
      adapter: body.adapter,
      url: body.url,
      active: body.active ?? true,
    },
  });
  return NextResponse.json({ source });
}
