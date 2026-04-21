import { prisma } from '../src/lib/db';
import { crawlAllActive } from '../src/lib/crawl';

async function main() {
  const results = await crawlAllActive();
  for (const r of results) {
    console.log(
      `[${r.sourceId}] fetched=${r.fetched} inserted=${r.inserted} updated=${r.updated} closed=${r.closedMissing}${r.error ? ` error=${r.error}` : ''}`,
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
