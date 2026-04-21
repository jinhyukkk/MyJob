'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Shell } from '@/ui/Shell';
import { MJ_TOKENS, MJ_FONTS } from '@/ui/tokens';
import { Icon } from '@/ui/Icon';
import type { AdapterConfigSchema } from '@/lib/types';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

type Source = {
  id: string;
  name: string;
  url: string;
  adapter: string;
  active: boolean;
  config: string;
  lastSyncAt: string | null;
  lastError: string | null;
  _count: { jobs: number };
};

type Adapter = { key: string; name: string; configSchema: AdapterConfigSchema | null };

export default function SourcesPage() {
  const { data, mutate } = useSWR<{ sources: Source[]; adapters: Adapter[] }>(
    '/api/sources',
    fetcher,
    { refreshInterval: 30000 },
  );
  const [form, setForm] = useState({ name: '', url: '', adapter: 'cj_recruit' });
  const [crawling, setCrawling] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = async (s: Source) => {
    await fetch(`/api/sources/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    });
    mutate();
  };
  const remove = async (s: Source) => {
    if (!confirm(`'${s.name}' 소스를 삭제할까요? 저장된 공고도 함께 삭제됩니다.`)) return;
    await fetch(`/api/sources/${s.id}`, { method: 'DELETE' });
    mutate();
  };
  const crawl = async (s: Source) => {
    setCrawling(s.id);
    await fetch(`/api/crawl?sourceId=${s.id}`, { method: 'POST' });
    setCrawling(null);
    mutate();
  };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', url: '', adapter: 'cj_recruit' });
    mutate();
  };

  const sources = data?.sources ?? [];
  const adapters = data?.adapters ?? [];
  const totalJobs = sources.reduce((a, s) => a + s._count.jobs, 0);

  return (
    <Shell>
      <div style={{ padding: '20px 28px 60px', maxWidth: 980 }}>
        <div
          style={{
            fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono,
            textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4,
          }}
        >
          Configuration
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: 0 }}>
            Crawl Sources
          </h1>
          <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
            {sources.filter((s) => s.active).length} of {sources.length} active · {totalJobs} jobs indexed
          </div>
        </div>

        <form
          onSubmit={add}
          style={{
            display: 'grid', gridTemplateColumns: '160px 1fr 160px 110px', gap: 8,
            marginBottom: 24, padding: 12, alignItems: 'center',
            border: `1px dashed ${MJ_TOKENS.line}`, borderRadius: 6, background: MJ_TOKENS.surface,
          }}
        >
          <input
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="이름 (예: CJ Careers)" style={inputStyle}
          />
          <input
            value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="URL (참조용)" style={inputStyle}
          />
          <select
            value={form.adapter} onChange={(e) => setForm({ ...form, adapter: e.target.value })}
            style={{ ...inputStyle, fontFamily: MJ_FONTS.mono }}
          >
            {adapters.map((a) => (<option key={a.key} value={a.key}>{a.name}</option>))}
          </select>
          <button
            type="submit"
            style={{
              padding: '6px 12px', fontSize: 12, border: 'none',
              background: MJ_TOKENS.text, color: 'white', borderRadius: 4, cursor: 'pointer',
            }}
          >
            Add source
          </button>
        </form>

        {sources.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: MJ_TOKENS.textSoft, fontSize: 13 }}>
            소스가 없습니다. 위에서 추가하세요.
          </div>
        )}

        {sources.map((s) => {
          const adapter = adapters.find((a) => a.key === s.adapter);
          const isOpen = expanded === s.id;
          return (
            <div
              key={s.id}
              style={{
                border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 6,
                background: MJ_TOKENS.surface, marginBottom: 10,
                opacity: s.active ? 1 : 0.6,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr 70px 120px 120px 80px 24px',
                  padding: '12px 14px', fontSize: 13, alignItems: 'center', gap: 8,
                }}
              >
                <div onClick={() => toggle(s)} style={{ cursor: 'pointer' }}>
                  <div
                    style={{
                      width: 22, height: 13, borderRadius: 6.5,
                      background: s.active ? MJ_TOKENS.accent : MJ_TOKENS.line,
                      position: 'relative', transition: 'background .12s',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute', top: 1.5, left: s.active ? 11 : 1.5,
                        width: 10, height: 10, borderRadius: 5, background: 'white',
                        transition: 'left .12s',
                      }}
                    />
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  <div
                    style={{
                      fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {s.adapter} · {s.url}
                  </div>
                  {s.lastError && (
                    <div style={{ fontSize: 11, color: MJ_TOKENS.interview, marginTop: 4 }}>
                      ⚠ {s.lastError}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontFamily: MJ_FONTS.mono, fontSize: 12, color: MJ_TOKENS.textMid }}>
                  {s._count.jobs}
                </div>
                <div style={{ textAlign: 'right', fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
                  {s.lastSyncAt ? ago(s.lastSyncAt) : 'never'}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    style={ghostBtn}
                    title="필터/키워드 편집"
                  >
                    {isOpen ? 'Hide' : 'Edit'}
                  </button>
                  <button
                    onClick={() => crawl(s)}
                    disabled={crawling === s.id}
                    style={{
                      ...ghostBtn,
                      cursor: crawling === s.id ? 'wait' : 'pointer',
                      borderColor: MJ_TOKENS.accent,
                      color: MJ_TOKENS.accentText,
                    }}
                  >
                    {crawling === s.id ? '…' : 'Crawl'}
                  </button>
                </div>
                <div
                  onClick={() => remove(s)}
                  style={{ cursor: 'pointer', color: MJ_TOKENS.textFaint, display: 'flex', justifyContent: 'center' }}
                  title="삭제"
                >
                  <Icon name="close" size={11} />
                </div>
              </div>

              {isOpen && (
                <SourceConfigEditor
                  source={s}
                  schema={adapter?.configSchema ?? null}
                  onSaved={() => mutate()}
                />
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function SourceConfigEditor({
  source, schema, onSaved,
}: {
  source: Source;
  schema: AdapterConfigSchema | null;
  onSaved: () => void;
}) {
  type Val = string[];
  const initial = (() => {
    try { return JSON.parse(source.config || '{}') as Record<string, unknown>; }
    catch { return {} as Record<string, unknown>; }
  })();
  const [state, setState] = useState<Record<string, Val>>(() => {
    const o: Record<string, Val> = {};
    if (!schema) return o;
    for (const f of schema.fields) {
      const v = initial[f.key];
      o[f.key] = Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    }
    return o;
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/sources/${source.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: state }),
    });
    setSaving(false);
    onSaved();
  };

  if (!schema) {
    return (
      <div style={{ padding: '0 14px 14px', fontSize: 12, color: MJ_TOKENS.textSoft }}>
        이 어댑터는 설정 가능한 필터가 없습니다.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '4px 14px 16px', borderTop: `1px solid ${MJ_TOKENS.lineSoft}`,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {schema.fields.map((f) => (
        <div key={f.key}>
          <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 6 }}>
            {f.label}
            <span style={{ marginLeft: 6, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono, fontSize: 10 }}>
              {f.key}
            </span>
          </div>
          {f.type === 'multi' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {f.options.map((opt) => {
                const on = (state[f.key] ?? []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const cur = state[f.key] ?? [];
                      setState({
                        ...state,
                        [f.key]: on ? cur.filter((v) => v !== opt.value) : [...cur, opt.value],
                      });
                    }}
                    style={{
                      padding: '4px 9px', fontSize: 12, borderRadius: 4,
                      border: `1px solid ${on ? MJ_TOKENS.accent : MJ_TOKENS.line}`,
                      background: on ? MJ_TOKENS.accentSoft : MJ_TOKENS.bg,
                      color: on ? MJ_TOKENS.accentText : MJ_TOKENS.textMid,
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                    <span style={{ marginLeft: 4, fontFamily: MJ_FONTS.mono, fontSize: 10, opacity: 0.6 }}>
                      {opt.value}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {f.type === 'keywords' && (
            <KeywordInput
              values={state[f.key] ?? []}
              onChange={(v) => setState({ ...state, [f.key]: v })}
              placeholder={f.placeholder}
            />
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: '6px 14px', fontSize: 12, border: 'none', borderRadius: 4,
            background: MJ_TOKENS.text, color: 'white', cursor: saving ? 'wait' : 'pointer',
          }}
        >
          {saving ? '저장 중…' : '설정 저장'}
        </button>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, alignSelf: 'center' }}>
          저장 후 이 소스의 <b>Crawl</b> 버튼을 눌러야 반영됩니다.
        </div>
      </div>
    </div>
  );
}

function KeywordInput({
  values, onChange, placeholder,
}: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
        {values.map((v) => (
          <span
            key={v}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 4px 3px 8px',
              border: `1px solid ${MJ_TOKENS.accent}`, borderRadius: 4,
              background: MJ_TOKENS.accentSoft, color: MJ_TOKENS.accentText,
              fontSize: 12, fontFamily: MJ_FONTS.mono,
            }}
          >
            {v}
            <button
              onClick={() => onChange(values.filter((x) => x !== v))}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: MJ_TOKENS.accentText, display: 'flex', padding: 0 }}
            >
              <Icon name="close" size={10} />
            </button>
          </span>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = draft.trim();
          if (v && !values.includes(v)) onChange([...values, v]);
          setDraft('');
        }}
      >
        <input
          value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder ?? '+ 키워드'}
          style={{
            fontSize: 12, padding: '5px 9px', border: `1px solid ${MJ_TOKENS.line}`,
            borderRadius: 4, outline: 'none', fontFamily: MJ_FONTS.mono,
            background: MJ_TOKENS.bg, width: 220,
          }}
        />
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontSize: 13, padding: '6px 10px', border: `1px solid ${MJ_TOKENS.line}`,
  borderRadius: 4, outline: 'none', background: MJ_TOKENS.bg, color: MJ_TOKENS.text,
};

const ghostBtn: React.CSSProperties = {
  fontSize: 11, padding: '3px 10px', border: `1px solid ${MJ_TOKENS.line}`,
  borderRadius: 4, background: MJ_TOKENS.bg, color: MJ_TOKENS.textMid, cursor: 'pointer',
};

function ago(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
