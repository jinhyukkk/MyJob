'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Shell } from '@/ui/Shell';
import { MJ_TOKENS, MJ_FONTS } from '@/ui/tokens';
import { Icon } from '@/ui/Icon';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

type Profile = {
  name: string;
  role: string;
  stack: string;
  interests: string;
  locations: string;
  salaryMin: number | null;
  salaryMax: number | null;
  passive: boolean;
};

function parseArr(s: string | undefined | null): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default function ProfilePage() {
  const { data, mutate } = useSWR<{ profile: Profile }>('/api/profile', fetcher);
  const p = data?.profile;

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [passive, setPassive] = useState(true);
  const [newStack, setNewStack] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [rescoring, setRescoring] = useState(false);

  useEffect(() => {
    if (!p) return;
    setName(p.name);
    setRole(p.role);
    setStack(parseArr(p.stack));
    setInterests(parseArr(p.interests));
    setLocations(parseArr(p.locations));
    setPassive(p.passive);
  }, [p]);

  const save = async () => {
    setSaving(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, stack, interests, locations, passive }),
    });
    setSaving(false);
    mutate();
  };

  const rescore = async () => {
    setRescoring(true);
    await save();
    // trigger a crawl — adapters will re-upsert and re-score all jobs
    await fetch('/api/crawl', { method: 'POST' });
    setRescoring(false);
  };

  if (!p) {
    return <Shell><div style={{ padding: 40, color: MJ_TOKENS.textSoft }}>loading…</div></Shell>;
  }

  return (
    <Shell>
      <div style={{ padding: '20px 28px', maxWidth: 760 }}>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
          Preferences
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: '0 0 24px' }}>
          Profile &amp; Match Preferences
        </h1>

        <Field label="이름">
          <input value={name} onChange={(e) => setName(e.target.value)} style={wideInput} />
        </Field>

        <Field label="역할 / 직무 (예: 백엔드 개발자, 마케팅 담당자)">
          <input value={role} onChange={(e) => setRole(e.target.value)} style={wideInput} />
        </Field>

        <Field label="현재 상태">
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ v: false, l: '적극 구직중' }, { v: true, l: '좋은 제안이 오면 고려' }].map((o) => (
              <button
                key={String(o.v)}
                onClick={() => setPassive(o.v)}
                style={{
                  padding: '8px 14px', fontSize: 13,
                  border: `1px solid ${passive === o.v ? MJ_TOKENS.accent : MJ_TOKENS.line}`,
                  borderRadius: 5,
                  background: passive === o.v ? MJ_TOKENS.accentSoft : MJ_TOKENS.surface,
                  color: passive === o.v ? MJ_TOKENS.accentText : MJ_TOKENS.textMid,
                  cursor: 'pointer',
                }}
              >
                {o.l}
              </button>
            ))}
          </div>
        </Field>

        <TagField
          label="스택 / 스킬"
          hint="공고 제목·직무·설명에 포함되면 가중치 5점씩"
          items={stack}
          onRemove={(s) => setStack(stack.filter((x) => x !== s))}
          newValue={newStack}
          setNewValue={setNewStack}
          onAdd={() => { if (newStack.trim()) { setStack([...stack, newStack.trim()]); setNewStack(''); } }}
          placeholder="+ 스킬 추가 (예: React, TypeScript, MD)"
        />
        <TagField
          label="관심 키워드"
          hint="가중치 3점씩 (예: 커머스, 플랫폼, 데이터)"
          items={interests}
          onRemove={(s) => setInterests(interests.filter((x) => x !== s))}
          newValue={newInterest}
          setNewValue={setNewInterest}
          onAdd={() => { if (newInterest.trim()) { setInterests([...interests, newInterest.trim()]); setNewInterest(''); } }}
          placeholder="+ 관심 키워드"
        />
        <TagField
          label="희망 근무지"
          hint="가중치 2점씩 (예: 서울, 판교, Remote)"
          items={locations}
          onRemove={(s) => setLocations(locations.filter((x) => x !== s))}
          newValue={newLocation}
          setNewValue={setNewLocation}
          onAdd={() => { if (newLocation.trim()) { setLocations([...locations, newLocation.trim()]); setNewLocation(''); } }}
          placeholder="+ 지역"
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: '8px 14px', fontSize: 13, border: 'none', borderRadius: 5,
              background: MJ_TOKENS.text, color: 'white', cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? '저장 중…' : '저장'}
          </button>
          <button
            onClick={rescore}
            disabled={rescoring}
            style={{
              padding: '8px 14px', fontSize: 13, border: `1px solid ${MJ_TOKENS.line}`,
              borderRadius: 5, background: MJ_TOKENS.surface, color: MJ_TOKENS.textMid,
              cursor: rescoring ? 'wait' : 'pointer',
            }}
            title="저장 후 크롤을 실행해 모든 공고 매치 점수를 다시 계산합니다."
          >
            {rescoring ? '재계산 중…' : '저장 + 전체 재계산'}
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, marginBottom: 8 }}>{hint}</div>}
      {children}
    </div>
  );
}

function TagField({
  label, hint, items, onRemove, newValue, setNewValue, onAdd, placeholder,
}: {
  label: string; hint?: string;
  items: string[]; onRemove: (s: string) => void;
  newValue: string; setNewValue: (s: string) => void;
  onAdd: () => void; placeholder: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {items.map((s) => (
          <span
            key={s}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 4px 3px 8px',
              border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 4, background: MJ_TOKENS.surface,
              fontSize: 12, fontFamily: MJ_FONTS.mono,
            }}
          >
            {s}
            <button
              onClick={() => onRemove(s)}
              style={{ border: 'none', background: 'transparent', color: MJ_TOKENS.textSoft, cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <Icon name="close" size={10} />
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onAdd(); }}>
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder}
          style={{
            fontSize: 12, padding: '6px 10px', border: `1px solid ${MJ_TOKENS.line}`,
            borderRadius: 4, outline: 'none', fontFamily: MJ_FONTS.mono,
            background: MJ_TOKENS.surface, width: 260,
          }}
        />
      </form>
    </Field>
  );
}

const wideInput: React.CSSProperties = {
  fontSize: 13, padding: '6px 10px', border: `1px solid ${MJ_TOKENS.line}`,
  borderRadius: 4, outline: 'none', background: MJ_TOKENS.surface, width: 320,
};
