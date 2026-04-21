'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Shell } from '@/ui/Shell';
import { MJ_TOKENS, MJ_FONTS } from '@/ui/tokens';
import { JobRow, JobTableHeader, type JobLite } from '@/ui/JobRow';
import { JobDetailDrawer } from '@/ui/JobDetailDrawer';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function SavedPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const { data, mutate, isLoading } = useSWR<{ jobs: JobLite[]; count: number }>(
    '/api/jobs?scope=saved&sort=deadline',
    fetcher,
  );
  const jobs = data?.jobs ?? [];

  const toggleSave = async (id: string) => {
    await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saved: false }),
    });
    mutate();
  };

  return (
    <Shell>
      <div style={{ padding: '20px 28px 40px' }}>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
          Library
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: '0 0 20px' }}>
          Saved · {jobs.length}
        </h1>

        <JobTableHeader />
        {isLoading && <div style={{ padding: 40, textAlign: 'center', color: MJ_TOKENS.textSoft }}>loading…</div>}
        {!isLoading && jobs.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: MJ_TOKENS.textSoft, fontSize: 13 }}>
            아직 저장한 공고가 없습니다.
          </div>
        )}
        {jobs.map((j) => (
          <JobRow
            key={j.id}
            job={j}
            onOpen={() => setSelected(j.id)}
            onToggleSave={() => toggleSave(j.id)}
          />
        ))}
      </div>
      {selected && (
        <JobDetailDrawer id={selected} onClose={() => setSelected(null)} onMutated={() => mutate()} />
      )}
    </Shell>
  );
}
