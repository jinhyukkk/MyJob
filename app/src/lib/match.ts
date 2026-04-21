// Simple keyword-overlap match score (0-100) from profile -> job.
// Rules are transparent so score is explainable.

type ProfileInput = {
  stack: string[];
  interests: string[];
  locations: string[];
};

type JobInput = {
  title: string;
  company: string;
  category?: string | null;
  location?: string | null;
  description?: string | null;
};

export function scoreJob(profile: ProfileInput, job: JobInput): {
  score: number;
  reasons: string[];
} {
  const corpus = [
    job.title,
    job.company,
    job.category ?? '',
    job.location ?? '',
    job.description ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const reasons: string[] = [];
  let hits = 0;
  let max = 0;

  // stack (weight 5)
  max += Math.max(profile.stack.length, 1) * 5;
  for (const s of profile.stack) {
    if (!s) continue;
    if (corpus.includes(s.toLowerCase())) {
      hits += 5;
      reasons.push(`${s} 매치`);
    }
  }

  // interests (weight 3)
  max += Math.max(profile.interests.length, 1) * 3;
  for (const s of profile.interests) {
    if (!s) continue;
    if (corpus.includes(s.toLowerCase())) {
      hits += 3;
      reasons.push(`관심: ${s}`);
    }
  }

  // location (weight 2)
  max += Math.max(profile.locations.length, 1) * 2;
  for (const s of profile.locations) {
    if (!s) continue;
    if (corpus.includes(s.toLowerCase())) {
      hits += 2;
      reasons.push(`지역: ${s}`);
    }
  }

  if (max === 0) return { score: 0, reasons: [] };
  const score = Math.min(100, Math.round((hits / max) * 100));
  return { score, reasons };
}
