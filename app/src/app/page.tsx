'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Shell } from '@/ui/Shell';
import { MJ_TOKENS, MJ_FONTS } from '@/ui/tokens';
import { Icon } from '@/ui/Icon';
import { JobRow, JobTableHeader, type JobLite } from '@/ui/JobRow';
import { JobDetailDrawer } from '@/ui/JobDetailDrawer';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function FeedPage() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'match' | 'recent' | 'deadline'>('deadline');
  const [hideClosed, setHideClosed] = useState(true);
  const [company, setCompany] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const query = new URLSearchParams();
  if (q) query.set('q', q);
  query.set('sort', sort);
  if (hideClosed) query.set('scope', 'active');
  const { data, mutate, isLoading } = useSWR<{ jobs: JobLite[]; count: number }>(
    `/api/jobs?${query.toString()}`,
    fetcher,
    { refreshInterval: 60000 },
  );

  const allJobs = data?.jobs ?? [];
  const companies = useMemo(() => {
    const m = new Map<string, number>();
    for (const j of allJobs) m.set(j.company, (m.get(j.company) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [allJobs]);
  const filtered = company ? allJobs.filter((j) => j.company === company) : allJobs;

  const toggleSave = async (id: string, saved: boolean) => {
    await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saved: !saved }),
    });
    mutate();
  };

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 ${['일','월','화','수','목','금','토'][today.getDay()]}`;

  return (
    <Shell>
      <div style={{ padding: '20px 28px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div
              style={{
                fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono,
                textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4,
              }}
            >
              For you · {dateLabel}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: 0 }}>
              공고 {filtered.length}개{' '}
              <span style={{ color: MJ_TOKENS.textSoft, fontWeight: 400 }}>
                of {data?.count ?? 0}
              </span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['match', 'recent', 'deadline'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  padding: '4px 10px', fontSize: 12,
                  border: `1px solid ${sort === s ? MJ_TOKENS.line : 'transparent'}`,
                  background: sort === s ? MJ_TOKENS.surface : 'transparent',
                  color: sort === s ? MJ_TOKENS.text : MJ_TOKENS.textMid,
                  borderRadius: 5, cursor: 'pointer',
                }}
              >
                {s === 'match' ? 'Best match' : s === 'recent' ? 'Most recent' : 'Deadline'}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex', gap: 8, alignItems: 'center', margin: '18px 0 14px', flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', height: 28,
              background: MJ_TOKENS.surface, border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 5,
              minWidth: 240, flex: 1, maxWidth: 320,
            }}
          >
            <Icon name="search" size={12} stroke={MJ_TOKENS.textSoft} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="제목 / 회사 / 직무 필터…"
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 12, flex: 1, color: MJ_TOKENS.text,
              }}
            />
            {q && (
              <button
                onClick={() => setQ('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: MJ_TOKENS.textSoft, display: 'flex' }}
              >
                <Icon name="close" size={11} />
              </button>
            )}
          </div>

          <Chip on={!hideClosed} onClick={() => setHideClosed((v) => !v)}>
            {hideClosed ? '진행중만' : '마감 포함'}
          </Chip>

          {companies.slice(0, 6).map(([c, n]) => (
            <Chip key={c} on={company === c} onClick={() => setCompany(company === c ? null : c)}>
              {c} <span style={{ fontFamily: MJ_FONTS.mono, opacity: 0.7 }}>{n}</span>
            </Chip>
          ))}
          {company && (
            <button
              onClick={() => setCompany(null)}
              style={{
                padding: '3px 8px', fontSize: 11, border: 'none', background: 'transparent',
                color: MJ_TOKENS.textSoft, cursor: 'pointer', fontFamily: MJ_FONTS.mono,
              }}
            >
              clear
            </button>
          )}
        </div>

        <JobTableHeader />

        {isLoading && (
          <div style={{ padding: 40, textAlign: 'center', color: MJ_TOKENS.textSoft, fontSize: 13 }}>
            loading…
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div
            style={{
              padding: 60, textAlign: 'center', color: MJ_TOKENS.textSoft, fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            아직 수집된 공고가 없습니다.
            <br />
            <span style={{ fontSize: 12, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono }}>
              상단 우측 <b>Refresh</b> 버튼을 눌러 크롤을 실행하세요.
            </span>
          </div>
        )}

        {filtered.map((j) => (
          <JobRow
            key={j.id}
            job={j}
            onOpen={() => setSelected(j.id)}
            onToggleSave={() => toggleSave(j.id, j.saved)}
          />
        ))}
      </div>

      {selected && (
        <JobDetailDrawer
          id={selected}
          onClose={() => setSelected(null)}
          onMutated={() => mutate()}
        />
      )}
    </Shell>
  );
}

function Chip({
  on, onClick, children,
}: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 28, padding: '0 10px', fontSize: 12,
        border: `1px solid ${on ? MJ_TOKENS.accent : MJ_TOKENS.line}`,
        borderRadius: 5,
        background: on ? MJ_TOKENS.accentSoft : MJ_TOKENS.surface,
        color: on ? MJ_TOKENS.accentText : MJ_TOKENS.textMid,
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 5,
      }}
    >
      {children}
    </button>
  );
}
