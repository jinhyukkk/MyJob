'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Shell } from '@/ui/Shell';
import { MJ_TOKENS, MJ_FONTS } from '@/ui/tokens';
import { JobDetailDrawer } from '@/ui/JobDetailDrawer';
import type { JobLite } from '@/ui/JobRow';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

const STAGES = ['Saved', 'Applied', 'Interview', 'Offer'] as const;
type Stage = typeof STAGES[number];

const STAGE_COLOR: Record<Stage, string> = {
  Saved: MJ_TOKENS.saved,
  Applied: MJ_TOKENS.applied,
  Interview: MJ_TOKENS.interview,
  Offer: MJ_TOKENS.offer,
};

export default function ApplicationsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const { data, mutate, isLoading } = useSWR<{ jobs: JobLite[] }>('/api/jobs?sort=recent', fetcher);
  const jobs = data?.jobs ?? [];

  const byStage: Record<Stage, JobLite[]> = {
    Saved:     jobs.filter((j) => j.saved && !j.applied),
    Applied:   jobs.filter((j) => j.applied && (j.stage === 'Applied' || !j.stage)),
    Interview: jobs.filter((j) => j.stage === 'Interview'),
    Offer:     jobs.filter((j) => j.stage === 'Offer'),
  };

  return (
    <Shell>
      <div style={{ padding: '20px 28px' }}>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
          Pipeline
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: '0 0 24px' }}>
          Applications
        </h1>
        {isLoading && <div style={{ color: MJ_TOKENS.textSoft }}>loading…</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {STAGES.map((s) => (
            <div
              key={s}
              style={{
                background: MJ_TOKENS.surface, borderRadius: 6,
                border: `1px solid ${MJ_TOKENS.line}`, minHeight: 300,
              }}
            >
              <div
                style={{
                  padding: '10px 12px', borderBottom: `1px solid ${MJ_TOKENS.lineSoft}`,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: 3, background: STAGE_COLOR[s] }} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{s}</span>
                <span style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
                  {byStage[s].length}
                </span>
              </div>
              <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {byStage[s].map((j) => (
                  <div
                    key={j.id}
                    onClick={() => setSelected(j.id)}
                    style={{
                      padding: 10, border: `1px solid ${MJ_TOKENS.lineSoft}`,
                      borderRadius: 5, background: MJ_TOKENS.bg, cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{j.title}</div>
                    <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
                      {j.company}{j.deadlineLabel ? ` · ${j.deadlineLabel}` : ''}
                    </div>
                  </div>
                ))}
                {byStage[s].length === 0 && (
                  <div style={{ fontSize: 11, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono, padding: 8, textAlign: 'center' }}>
                    — empty —
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {selected && (
        <JobDetailDrawer id={selected} onClose={() => setSelected(null)} onMutated={() => mutate()} />
      )}
    </Shell>
  );
}
