'use client';

import { MJ_TOKENS, MJ_FONTS } from './tokens';
import { Icon } from './Icon';
import { Placeholder } from './Placeholder';

export type JobLite = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  category: string | null;
  deadlineLabel: string | null;
  ddayLabel: string | null;
  postedAt: string | null;
  url: string;
  saved: boolean;
  applied: boolean;
  stage: string | null;
  closed: boolean;
  match: number;
};

export function JobRow({
  job, onOpen, onToggleSave,
}: {
  job: JobLite;
  onOpen: () => void;
  onToggleSave: () => void;
}) {
  const dday = job.ddayLabel || '';
  const isUrgent = /^D-([0-6])$/.test(dday);
  const ddayColor = dday === '마감' || job.closed
    ? MJ_TOKENS.textFaint
    : isUrgent
    ? MJ_TOKENS.interview
    : MJ_TOKENS.textMid;

  return (
    <div
      onClick={onOpen}
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 140px 110px 90px 70px 70px',
        padding: '12px 10px',
        borderBottom: `1px solid ${MJ_TOKENS.lineSoft}`,
        alignItems: 'center',
        cursor: 'pointer',
        fontSize: 13,
        opacity: job.closed ? 0.55 : 1,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = MJ_TOKENS.surface)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        style={{
          color: job.saved ? MJ_TOKENS.accent : MJ_TOKENS.textFaint,
          cursor: 'pointer', padding: 2,
        }}
      >
        <Icon name={job.saved ? 'bookmarkFilled' : 'bookmark'} size={14} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 500, color: MJ_TOKENS.text, marginBottom: 2, letterSpacing: -0.1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {job.title}
          {job.applied && (
            <span
              style={{
                marginLeft: 8, fontSize: 10, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase',
                color:
                  job.stage === 'Offer' ? MJ_TOKENS.offer
                  : job.stage === 'Interview' ? MJ_TOKENS.interview
                  : MJ_TOKENS.applied,
                border: '1px solid currentColor', padding: '1px 5px', borderRadius: 3,
                letterSpacing: 0.4,
              }}
            >
              {job.stage || 'Applied'}
            </span>
          )}
          {job.closed && (
            <span
              style={{
                marginLeft: 8, fontSize: 10, fontFamily: MJ_FONTS.mono,
                color: MJ_TOKENS.textFaint, letterSpacing: 0.4, textTransform: 'uppercase',
              }}
            >
              closed
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
          {[job.category, job.location].filter(Boolean).join(' · ') || '—'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <Placeholder label={job.company.slice(0, 2)} w={20} h={20} rounded={4} />
        <div
          style={{
            fontSize: 12, color: MJ_TOKENS.textMid,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {job.company}
        </div>
      </div>
      <div style={{ fontSize: 11, color: MJ_TOKENS.textMid, fontFamily: MJ_FONTS.mono }}>
        {job.deadlineLabel || '—'}
      </div>
      <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: ddayColor }}>
        {dday || '—'}
      </div>
      <div
        style={{
          textAlign: 'right', fontFamily: MJ_FONTS.mono, fontSize: 12,
          color: job.match >= 40 ? MJ_TOKENS.accentText : MJ_TOKENS.textMid,
          fontWeight: job.match >= 40 ? 600 : 400,
        }}
      >
        {job.match}%
      </div>
      <div style={{ textAlign: 'right', fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
        <a
          href={job.url}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(e) => e.stopPropagation()}
          style={{ color: MJ_TOKENS.textSoft, textDecoration: 'none', display: 'inline-flex', gap: 3, alignItems: 'center' }}
          title="원문 보기"
        >
          원문 <Icon name="external" size={10} stroke={MJ_TOKENS.textSoft} />
        </a>
      </div>
    </div>
  );
}

export function JobTableHeader() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 140px 110px 90px 70px 70px',
        padding: '8px 10px', fontSize: 10, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono,
        textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: `1px solid ${MJ_TOKENS.line}`,
      }}
    >
      <div>★</div>
      <div>Position</div>
      <div>Company</div>
      <div>Deadline</div>
      <div>D-day</div>
      <div style={{ textAlign: 'right' }}>Match</div>
      <div style={{ textAlign: 'right' }}>Link</div>
    </div>
  );
}
