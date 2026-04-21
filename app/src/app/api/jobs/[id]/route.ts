import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: ctx.params.id },
    include: { source: true },
  });
  if (!job) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const body = (await req.json().catch(() => ({}))) as Partial<{
    saved: boolean;
    applied: boolean;
    stage: string | null;
    note: string | null;
  }>;
  const data: Record<string, unknown> = {};
  if (typeof body.saved === 'boolean') data.saved = body.saved;
  if (typeof body.applied === 'boolean') {
    data.applied = body.applied;
    if (body.applied && !body.stage) data.stage = 'Applied';
    if (!body.applied) data.stage = null;
  }
  if (body.stage !== undefined) {
    data.stage = body.stage;
    if (body.stage && body.stage !== 'Saved') data.applied = true;
  }
  if (body.note !== undefined) data.note = body.note;

  const job = await prisma.job.update({
    where: { id: ctx.params.id },
    data,
  });
  return NextResponse.json({ job });
}
