'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import useSWR from 'swr';
import { MJ_TOKENS, MJ_FONTS } from './tokens';
import { Icon } from './Icon';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

type Stats = {
  total: number; active: number; saved: number; applied: number;
  sources: number; activeSources: number; lastSyncAt: string | null;
};

function agoLabel(iso: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: stats, mutate: mutateStats } = useSWR<Stats>('/api/stats', fetcher, {
    refreshInterval: 30000,
  });
  const [crawling, setCrawling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const onCrawl = async () => {
    setCrawling(true);
    setToast(null);
    try {
      const r = await fetch('/api/crawl', { method: 'POST' });
      const d = await r.json();
      if (r.ok) {
        const sum = (d.results || []).reduce(
          (a: { f: number; i: number; u: number }, x: { fetched: number; inserted: number; updated: number }) => ({
            f: a.f + x.fetched, i: a.i + x.inserted, u: a.u + x.updated,
          }),
          { f: 0, i: 0, u: 0 },
        );
        setToast(`fetched ${sum.f} · new ${sum.i} · updated ${sum.u}`);
      } else {
        setToast(`error: ${d.error}`);
      }
    } catch (e) {
      setToast(e instanceof Error ? e.message : String(e));
    } finally {
      setCrawling(false);
      mutateStats();
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div
      style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        fontFamily: MJ_FONTS.sans, background: MJ_TOKENS.bg, color: MJ_TOKENS.text,
        overflow: 'hidden',
      }}
    >
      <TopBar onCrawl={onCrawl} crawling={crawling} stats={stats} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar pathname={pathname} stats={stats} />
        <div style={{ flex: 1, overflow: 'auto', background: MJ_TOKENS.bg }}>
          {children}
        </div>
      </div>
      {toast && (
        <div
          style={{
            position: 'fixed', bottom: 16, right: 16, padding: '10px 14px',
            background: MJ_TOKENS.text, color: 'white', borderRadius: 6, fontSize: 12,
            fontFamily: MJ_FONTS.mono, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 100,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function TopBar({
  onCrawl, crawling, stats,
}: { onCrawl: () => void; crawling: boolean; stats?: Stats }) {
  return (
    <div
      style={{
        height: 44, borderBottom: `1px solid ${MJ_TOKENS.line}`, background: MJ_TOKENS.surface,
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 220 }}>
        <div
          style={{
            width: 18, height: 18, borderRadius: 4, background: MJ_TOKENS.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: MJ_TOKENS.surface, fontSize: 11, fontWeight: 700, fontFamily: MJ_FONTS.mono,
          }}
        >
          ◣
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.2 }}>MyJob</div>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, marginLeft: 4 }}>
          0.1.0
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
          {stats ? `${stats.active} active · synced ${agoLabel(stats.lastSyncAt)}` : '—'}
        </div>
        <button
          onClick={onCrawl}
          disabled={crawling}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px',
            fontSize: 12, border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 5,
            background: crawling ? MJ_TOKENS.bgAlt : MJ_TOKENS.surface,
            color: MJ_TOKENS.textMid, cursor: crawling ? 'wait' : 'pointer',
          }}
          title="Run crawl now"
        >
          <Icon name="refresh" size={12} />
          {crawling ? 'Crawling…' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}

function Sidebar({ pathname, stats }: { pathname: string; stats?: Stats }) {
  const groups = [
    {
      group: 'Browse',
      items: [
        { href: '/', label: 'For you', icon: 'spark' as const, badge: stats?.active },
        { href: '/saved', label: 'Saved', icon: 'bookmark' as const, badge: stats?.saved },
      ],
    },
    {
      group: 'Pipeline',
      items: [
        { href: '/applications', label: 'Applications', icon: 'briefcase' as const, badge: stats?.applied },
      ],
    },
    {
      group: 'Setup',
      items: [
        { href: '/sources', label: 'Sources', icon: 'link' as const, badge: stats?.activeSources },
        { href: '/profile', label: 'Profile', icon: 'settings' as const },
      ],
    },
  ];
  return (
    <div
      style={{
        width: 220, borderRight: `1px solid ${MJ_TOKENS.line}`, background: MJ_TOKENS.surface,
        padding: '12px 8px', flexShrink: 0, overflow: 'auto',
      }}
    >
      {groups.map((grp) => (
        <div key={grp.group} style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600,
              color: MJ_TOKENS.textFaint, padding: '6px 8px', fontFamily: MJ_FONTS.mono,
            }}
          >
            {grp.group}
          </div>
          {grp.items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                style={{
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                  borderRadius: 5, fontSize: 13,
                  color: active ? MJ_TOKENS.text : MJ_TOKENS.textMid,
                  background: active ? MJ_TOKENS.bgAlt : 'transparent',
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon name={it.icon} size={13} stroke={active ? MJ_TOKENS.text : MJ_TOKENS.textMid} />
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.badge != null && (
                  <span style={{ fontSize: 10, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
                    {it.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
      <div
        style={{
          marginTop: 24, padding: '10px 8px', borderTop: `1px solid ${MJ_TOKENS.lineSoft}`,
        }}
      >
        <div style={{ fontSize: 10, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono, marginBottom: 6 }}>
          CRAWL STATUS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: MJ_TOKENS.textMid }}>
          <div
            style={{
              width: 6, height: 6, borderRadius: 3,
              background: (stats?.activeSources ?? 0) > 0 ? MJ_TOKENS.accent : MJ_TOKENS.textFaint,
            }}
          />
          <span>
            {stats ? `${stats.activeSources} of ${stats.sources} active` : '—'}
          </span>
        </div>
        <div style={{ fontSize: 10, color: MJ_TOKENS.textSoft, marginTop: 3, fontFamily: MJ_FONTS.mono }}>
          synced {stats ? agoLabel(stats.lastSyncAt) : '—'}
        </div>
      </div>
    </div>
  );
}
