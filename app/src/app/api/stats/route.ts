import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [total, active, saved, applied, sources, activeSources] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { closed: false } }),
    prisma.job.count({ where: { saved: true } }),
    prisma.job.count({ where: { applied: true } }),
    prisma.source.count(),
    prisma.source.count({ where: { active: true } }),
  ]);
  const lastSync = await prisma.source.findFirst({
    orderBy: { lastSyncAt: 'desc' },
    select: { lastSyncAt: true },
  });
  return NextResponse.json({
    total,
    active,
    saved,
    applied,
    sources,
    activeSources,
    lastSyncAt: lastSync?.lastSyncAt ?? null,
  });
}
