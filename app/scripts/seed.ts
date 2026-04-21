import { prisma } from '../src/lib/db';

const DEFAULT_CJ_CONFIG = {
  gubun: ['B'],       // 경력
  recJob: ['IR'],     // IT
  recArea: ['KR11'],  // 서울
  descriptionIncludes: ['Java'],
};

async function main() {
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: '나',
      role: '',
      stack: JSON.stringify(['Java']),
      interests: JSON.stringify([]),
      locations: JSON.stringify(['서울']),
      passive: true,
    },
  });

  const existing = await prisma.source.findFirst({ where: { adapter: 'cj_recruit' } });
  if (!existing) {
    await prisma.source.create({
      data: {
        name: 'CJ Careers',
        adapter: 'cj_recruit',
        url: 'https://recruit.cj.net/',
        active: true,
        config: JSON.stringify(DEFAULT_CJ_CONFIG),
      },
    });
    console.log('✓ seeded source: CJ Careers (경력/IT/서울, Java)');
  } else {
    // keep id but normalize config if missing/empty
    let current: Record<string, unknown> = {};
    try { current = JSON.parse(existing.config || '{}'); } catch { current = {}; }
    if (Object.keys(current).length === 0) {
      await prisma.source.update({
        where: { id: existing.id },
        data: { config: JSON.stringify(DEFAULT_CJ_CONFIG) },
      });
      console.log('✓ populated empty config on existing source');
    } else {
      console.log('· source already configured:', existing.name, current);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); process.exit(1); });
