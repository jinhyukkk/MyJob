import { prisma } from './db';
import { getAdapter } from './crawlers';
import { scoreJob } from './match';

export type CrawlResult = {
  sourceId: string;
  fetched: number;
  inserted: number;
  updated: number;
  closedMissing: number;
  error?: string;
};

function safeParseArray(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function crawlSource(sourceId: string): Promise<CrawlResult> {
  const source = await prisma.source.findUnique({ where: { id: sourceId } });
  if (!source) throw new Error(`source not found: ${sourceId}`);
  const adapter = getAdapter(source.adapter);
  if (!adapter) throw new Error(`unknown adapter: ${source.adapter}`);

  const result: CrawlResult = {
    sourceId,
    fetched: 0,
    inserted: 0,
    updated: 0,
    closedMissing: 0,
  };

  try {
    let config: Record<string, unknown> = {};
    try { config = JSON.parse(source.config || '{}'); } catch { config = {}; }
    const rows = await adapter.fetch(config);
    result.fetched = rows.length;

    const profile = await prisma.profile.findUnique({ where: { id: 1 } });
    const profileInput = profile
      ? {
          stack: safeParseArray(profile.stack),
          interests: safeParseArray(profile.interests),
          locations: safeParseArray(profile.locations),
        }
      : { stack: [], interests: [], locations: [] };

    const seenIds: string[] = [];
    const now = new Date();

    for (const row of rows) {
      seenIds.push(row.externalId);
      const existing = await prisma.job.findUnique({
        where: {
          sourceId_externalId: {
            sourceId: source.id,
            externalId: row.externalId,
          },
        },
      });
      const { score, reasons } = scoreJob(profileInput, {
        title: row.title,
        company: row.company,
        category: row.category,
        location: row.location,
        description: row.description,
      });

      if (existing) {
        await prisma.job.update({
          where: { id: existing.id },
          data: {
            title: row.title,
            company: row.company,
            team: row.team ?? null,
            location: row.location ?? null,
            type: row.type ?? null,
            level: row.level ?? null,
            category: row.category ?? null,
            url: row.url,
            postedAt: row.postedAt ?? null,
            deadlineAt: row.deadlineAt ?? null,
            deadlineLabel: row.deadlineLabel ?? null,
            ddayLabel: row.ddayLabel ?? null,
            description: row.description ?? existing.description,
            raw: JSON.stringify(row.raw),
            lastSeenAt: now,
            closed: false,
            match: score,
            matchReasons: JSON.stringify(reasons),
          },
        });
        result.updated += 1;
      } else {
        await prisma.job.create({
          data: {
            sourceId: source.id,
            externalId: row.externalId,
            title: row.title,
            company: row.company,
            team: row.team ?? null,
            location: row.location ?? null,
            type: row.type ?? null,
            level: row.level ?? null,
            category: row.category ?? null,
            url: row.url,
            postedAt: row.postedAt ?? null,
            deadlineAt: row.deadlineAt ?? null,
            deadlineLabel: row.deadlineLabel ?? null,
            ddayLabel: row.ddayLabel ?? null,
            description: row.description ?? null,
            raw: JSON.stringify(row.raw),
            firstSeenAt: now,
            lastSeenAt: now,
            match: score,
            matchReasons: JSON.stringify(reasons),
          },
        });
        result.inserted += 1;
      }
    }

    // mark jobs that were in our DB but didn't appear in this crawl as closed
    if (seenIds.length > 0) {
      const closed = await prisma.job.updateMany({
        where: {
          sourceId: source.id,
          externalId: { notIn: seenIds },
          closed: false,
        },
        data: { closed: true },
      });
      result.closedMissing = closed.count;
    }

    await prisma.source.update({
      where: { id: source.id },
      data: { lastSyncAt: now, lastError: null },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    result.error = msg;
    await prisma.source.update({
      where: { id: source.id },
      data: { lastError: msg },
    });
  }

  return result;
}

export async function crawlAllActive(): Promise<CrawlResult[]> {
  const sources = await prisma.source.findMany({ where: { active: true } });
  const out: CrawlResult[] = [];
  for (const s of sources) out.push(await crawlSource(s.id));
  return out;
}
