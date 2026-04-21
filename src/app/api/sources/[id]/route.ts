import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const body = (await req.json().catch(() => ({}))) as Partial<{
    active: boolean;
    name: string;
    url: string;
    config: unknown; // object or JSON string
  }>;
  const data: Record<string, unknown> = {};
  if (typeof body.active === 'boolean') data.active = body.active;
  if (body.name) data.name = body.name;
  if (body.url) data.url = body.url;
  if (body.config !== undefined) {
    data.config =
      typeof body.config === 'string' ? body.config : JSON.stringify(body.config);
  }
  const source = await prisma.source.update({ where: { id: ctx.params.id }, data });
  return NextResponse.json({ source });
}

export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  await prisma.source.delete({ where: { id: ctx.params.id } });
  return NextResponse.json({ ok: true });
}
