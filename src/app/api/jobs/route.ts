import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get('q')?.trim() || '';
  const scope = sp.get('scope') || 'all'; // all | saved | applied | active
  const company = sp.get('company') || undefined;
  const sort = sp.get('sort') || 'match';

  const where: {
    OR?: { title?: { contains: string }; company?: { contains: string }; category?: { contains: string } }[];
    company?: string;
    saved?: boolean;
    applied?: boolean;
    closed?: boolean;
  } = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { company: { contains: q } },
      { category: { contains: q } },
    ];
  }
  if (company) where.company = company;
  if (scope === 'saved') where.saved = true;
  if (scope === 'applied') where.applied = true;
  if (scope === 'active') where.closed = false;

  const orderBy =
    sort === 'recent'
      ? [{ postedAt: 'desc' as const }, { firstSeenAt: 'desc' as const }]
      : sort === 'deadline'
      ? [{ deadlineAt: 'asc' as const }]
      : [{ match: 'desc' as const }, { firstSeenAt: 'desc' as const }];

  const jobs = await prisma.job.findMany({
    where,
    orderBy,
    take: 500,
    include: { source: { select: { name: true, url: true } } },
  });
  return NextResponse.json({ jobs, count: jobs.length });
}
