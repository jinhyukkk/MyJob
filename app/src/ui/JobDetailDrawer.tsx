'use client';

import useSWR from 'swr';
import { MJ_TOKENS, MJ_FONTS } from './tokens';
import { Icon } from './Icon';
import { Placeholder } from './Placeholder';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

type Source = { name: string; url: string };
type JobDetail = {
  id: string;
  title: string;
  company: string;
  team: string | null;
  location: string | null;
  type: string | null;
  level: string | null;
  category: string | null;
  url: string;
  description: string | null;
  postedAt: string | null;
  deadlineAt: string | null;
  deadlineLabel: string | null;
  ddayLabel: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  closed: boolean;
  saved: boolean;
  applied: boolean;
  stage: string | null;
  note: string | null;
  match: number;
  matchReasons: string | null;
  source: Source;
};

export function JobDetailDrawer({
  id, onClose, onMutated,
}: { id: string; onClose: () => void; onMutated: () => void }) {
  const { data, mutate } = useSWR<{ job: JobDetail }>(`/api/jobs/${id}`, fetcher);
  const job = data?.job;

  const patch = async (body: Partial<{ saved: boolean; applied: boolean; stage: string | null; note: string | null }>) => {
    await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    mutate();
    onMutated();
  };

  const reasons = (() => {
    if (!job?.matchReasons) return [] as string[];
    try {
      const v = JSON.parse(job.matchReasons);
      return Array.isArray(v) ? (v as string[]) : [];
    } catch {
      return [];
    }
  })();

  const stages = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(10,15,25,0.18)', zIndex: 50,
        }}
      />
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(620px, 92vw)',
          background: MJ_TOKENS.bg, borderLeft: `1px solid ${MJ_TOKENS.line}`,
          boxShadow: '-16px 0 40px rgba(20,25,45,0.08)', zIndex: 51,
          overflow: 'auto', display: 'flex', flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'sticky', top: 0, background: MJ_TOKENS.bg, zIndex: 2,
            padding: '10px 24px', borderBottom: `1px solid ${MJ_TOKENS.line}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer',
              color: MJ_TOKENS.textMid, padding: '4px 6px',
            }}
          >
            ← Back
          </button>
          <div style={{ flex: 1, fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
            {job ? `${job.source.name.toLowerCase()} / ${job.company} / ${job.id.slice(0, 6)}` : '—'}
          </div>
          {job && (
            <>
              <button
                onClick={() => patch({ saved: !job.saved })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 10px',
                  border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 5, background: MJ_TOKENS.surface,
                  color: job.saved ? MJ_TOKENS.accent : MJ_TOKENS.textMid, cursor: 'pointer',
                }}
              >
                <Icon name={job.saved ? 'bookmarkFilled' : 'bookmark'} size={12} />
                {job.saved ? 'Saved' : 'Save'}
              </button>
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer noopener"
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 10px',
                  border: 'none', borderRadius: 5, background: MJ_TOKENS.text, color: MJ_TOKENS.surface,
                  textDecoration: 'none',
                }}
              >
                Apply <Icon name="external" size={11} stroke={MJ_TOKENS.surface} />
              </a>
            </>
          )}
        </div>

        {!job ? (
          <div style={{ padding: 40, color: MJ_TOKENS.textSoft }}>loading…</div>
        ) : (
          <div style={{ padding: '24px 24px 60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Placeholder label={job.company.slice(0, 2)} w={40} h={40} />
              <div>
                <div style={{ fontSize: 13, color: MJ_TOKENS.textMid }}>
                  {job.company}
                  {job.category ? ` · ${job.category}` : ''}
                </div>
                <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
                  via {job.source.name}
                </div>
              </div>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.4, margin: '0 0 12px', lineHeight: 1.25 }}>
              {job.title}
            </h1>
            <div
              style={{
                display: 'flex', gap: 12, fontSize: 12, color: MJ_TOKENS.textMid,
                marginBottom: 28, flexWrap: 'wrap',
              }}
            >
              {job.location && <><span>{job.location}</span><span>·</span></>}
              {job.type && <><span>{job.type}</span><span>·</span></>}
              {job.level && <><span>{job.level}</span><span>·</span></>}
              {job.deadlineLabel && (
                <span style={{ fontFamily: MJ_FONTS.mono }}>
                  마감 {job.deadlineLabel}{job.ddayLabel ? ` · ${job.ddayLabel}` : ''}
                </span>
              )}
              {job.closed && (
                <span style={{ color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono }}>CLOSED</span>
              )}
            </div>

            <Section title="Pipeline">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {stages.map((s) => {
                  const on = job.stage === s || (s === 'Applied' && job.applied && !job.stage);
                  return (
                    <button
                      key={s}
                      onClick={() => patch({ stage: on ? null : s, applied: on ? false : true })}
                      style={{
                        padding: '5px 10px', fontSize: 12, borderRadius: 4,
                        border: `1px solid ${on ? MJ_TOKENS.accent : MJ_TOKENS.line}`,
                        background: on ? MJ_TOKENS.accentSoft : MJ_TOKENS.surface,
                        color: on ? MJ_TOKENS.accentText : MJ_TOKENS.textMid,
                        cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Match score">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    fontSize: 28, fontWeight: 600, fontFamily: MJ_FONTS.mono,
                    color: MJ_TOKENS.accentText, letterSpacing: -1,
                  }}
                >
                  {job.match}
                </div>
                <div style={{ fontSize: 13, color: MJ_TOKENS.textSoft }}>/ 100</div>
              </div>
              <div
                style={{
                  height: 4, borderRadius: 2, background: MJ_TOKENS.bgAlt,
                  overflow: 'hidden', marginBottom: 10,
                }}
              >
                <div style={{ width: `${job.match}%`, height: '100%', background: MJ_TOKENS.accent }} />
              </div>
              {reasons.length === 0 ? (
                <div style={{ fontSize: 12, color: MJ_TOKENS.textFaint }}>
                  프로필에 스택/관심사를 등록하면 매칭 근거가 여기 나타납니다.
                </div>
              ) : (
                reasons.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', gap: 6, fontSize: 12, color: MJ_TOKENS.textMid, marginBottom: 4,
                    }}
                  >
                    <Icon name="check" size={11} stroke={MJ_TOKENS.accent} /> {r}
                  </div>
                ))
              )}
            </Section>

            <Section title="Notes">
              <textarea
                defaultValue={job.note ?? ''}
                placeholder="메모 (이 공고에 대한 생각, 지원 계획 등)"
                onBlur={(e) => {
                  const v = e.target.value;
                  if (v !== (job.note ?? '')) patch({ note: v });
                }}
                style={{
                  width: '100%', minHeight: 90, padding: 10, fontSize: 13,
                  border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 5,
                  background: MJ_TOKENS.surface, color: MJ_TOKENS.text, outline: 'none',
                  resize: 'vertical', fontFamily: MJ_FONTS.sans, lineHeight: 1.6,
                }}
              />
            </Section>

            <Section title="Source">
              <div
                style={{
                  padding: 12, border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 6,
                  background: MJ_TOKENS.surface, fontSize: 12,
                }}
              >
                <div style={{ fontFamily: MJ_FONTS.mono, color: MJ_TOKENS.textMid, wordBreak: 'break-all', marginBottom: 6 }}>
                  <Icon name="link" size={11} stroke={MJ_TOKENS.textSoft} /> {job.url}
                </div>
                <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
                  first seen {fmt(job.firstSeenAt)} · last seen {fmt(job.lastSeenAt)}
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 10, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase',
          letterSpacing: 0.6, color: MJ_TOKENS.textFaint, marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function fmt(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
