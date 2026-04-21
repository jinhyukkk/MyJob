import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensure() {
  let p = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!p) p = await prisma.profile.create({ data: { id: 1 } });
  return p;
}

export async function GET() {
  const p = await ensure();
  return NextResponse.json({ profile: p });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<{
    name: string;
    role: string;
    stack: string[];
    interests: string[];
    locations: string[];
    salaryMin: number | null;
    salaryMax: number | null;
    passive: boolean;
  }>;
  await ensure();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.role !== undefined) data.role = body.role;
  if (body.stack !== undefined) data.stack = JSON.stringify(body.stack);
  if (body.interests !== undefined) data.interests = JSON.stringify(body.interests);
  if (body.locations !== undefined) data.locations = JSON.stringify(body.locations);
  if (body.salaryMin !== undefined) data.salaryMin = body.salaryMin;
  if (body.salaryMax !== undefined) data.salaryMax = body.salaryMax;
  if (body.passive !== undefined) data.passive = body.passive;

  const p = await prisma.profile.update({ where: { id: 1 }, data });
  return NextResponse.json({ profile: p });
}
