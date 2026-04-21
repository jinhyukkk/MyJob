// variant-minimal.jsx — Shim 1: Minimal Editorial (dense list, Linear-like)

const minStyles = {
  frame: {
    width: '100%', height: '100%',
    fontFamily: MJ_FONTS.sans,
    background: MJ_TOKENS.bg,
    color: MJ_TOKENS.text,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
};

function MinimalApp({ initialScreen = 'feed' }) {
  const [screen, setScreen] = React.useState(initialScreen);
  const [selectedJob, setSelectedJob] = React.useState(null);
  const [jobs, setJobs] = React.useState(MJ_JOBS);
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ level: [], remote: false, minMatch: 0, stack: [] });

  const toggleSaved = (id) => {
    setJobs(js => js.map(j => j.id === id ? { ...j, saved: !j.saved } : j));
  };

  const openJob = (j) => { setSelectedJob(j); setScreen('detail'); };

  const filtered = React.useMemo(() => {
    return jobs.filter(j => {
      if (query && !(j.title + j.company + j.stack.join(' ')).toLowerCase().includes(query.toLowerCase())) return false;
      if (filters.level.length && !filters.level.includes(j.level)) return false;
      if (filters.remote && !/remote/i.test(j.location)) return false;
      if (filters.minMatch && j.match < filters.minMatch) return false;
      if (filters.stack.length && !filters.stack.some(s => j.stack.includes(s))) return false;
      return true;
    });
  }, [jobs, query, filters]);

  return (
    <div style={minStyles.frame}>
      <MinTopBar screen={screen} setScreen={setScreen} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <MinSidebar screen={screen} setScreen={setScreen} />
        <div style={{ flex: 1, overflow: 'auto', background: MJ_TOKENS.bg }}>
          {screen === 'feed' &&
            <MinFeed jobs={filtered} total={jobs.length} query={query} setQuery={setQuery}
              filters={filters} setFilters={setFilters}
              onOpen={openJob} onToggleSave={toggleSaved} />}
          {screen === 'detail' && selectedJob &&
            <MinDetail job={selectedJob} onBack={() => setScreen('feed')} onToggleSave={toggleSaved} />}
          {screen === 'tracker' && <MinTracker jobs={jobs} onOpen={openJob} />}
          {screen === 'bookmarks' && <MinBookmarks jobs={jobs.filter(j => j.saved)} onOpen={openJob} onToggleSave={toggleSaved} />}
          {screen === 'profile'   && <MinProfile />}
          {screen === 'sources'   && <MinSources />}
        </div>
      </div>
    </div>
  );
}

// ── Top bar ──────────────────────────────────────────────────────────
function MinTopBar({ screen, setScreen }) {
  return (
    <div style={{
      height: 44, borderBottom: `1px solid ${MJ_TOKENS.line}`, background: MJ_TOKENS.surface,
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 220 }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4, background: MJ_TOKENS.text,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: MJ_TOKENS.surface, fontSize: 11, fontWeight: 700, fontFamily: MJ_FONTS.mono,
        }}>◣</div>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.2 }}>MyJob</div>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, marginLeft: 4 }}>0.1.2</div>
      </div>
      <div style={{
        flex: 1, maxWidth: 420, height: 26, borderRadius: 5, background: MJ_TOKENS.bgAlt,
        border: `1px solid ${MJ_TOKENS.lineSoft}`, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6,
      }}>
        <MJIcon name="search" size={12} stroke={MJ_TOKENS.textSoft} />
        <div style={{ fontSize: 12, color: MJ_TOKENS.textSoft, flex: 1 }}>Search jobs, companies, stacks…</div>
        <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: MJ_TOKENS.textFaint, border: `1px solid ${MJ_TOKENS.line}`, padding: '1px 4px', borderRadius: 3 }}>⌘K</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <MinIconBtn icon="refresh" title="Refresh crawl" />
        <MinIconBtn icon="bell" badge={3} />
        <div style={{
          width: 22, height: 22, borderRadius: 11, background: MJ_TOKENS.accent, color: 'white',
          fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{MJ_PROFILE.avatarInitial}</div>
      </div>
    </div>
  );
}

function MinIconBtn({ icon, badge, title, onClick }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 26, height: 26, borderRadius: 5, border: 'none', background: 'transparent',
      color: MJ_TOKENS.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}
    onMouseEnter={e => e.currentTarget.style.background = MJ_TOKENS.bgAlt}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <MJIcon name={icon} size={14} />
      {badge && <div style={{
        position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: 3,
        background: MJ_TOKENS.interview,
      }}/>}
    </button>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────
function MinSidebar({ screen, setScreen }) {
  const items = [
    { group: 'Browse', items: [
      { key: 'feed',      label: 'For you',      icon: 'spark',     badge: 12 },
      { key: 'bookmarks', label: 'Saved',        icon: 'bookmark',  badge: 4  },
    ]},
    { group: 'Pipeline', items: [
      { key: 'tracker',   label: 'Applications', icon: 'briefcase', badge: 6 },
    ]},
    { group: 'Setup', items: [
      { key: 'sources',   label: 'Sources',      icon: 'link' },
      { key: 'profile',   label: 'Profile',      icon: 'settings' },
    ]},
  ];
  return (
    <div style={{
      width: 220, borderRight: `1px solid ${MJ_TOKENS.line}`, background: MJ_TOKENS.surface,
      padding: '12px 8px', flexShrink: 0, overflow: 'auto',
    }}>
      {items.map(grp => (
        <div key={grp.group} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600,
            color: MJ_TOKENS.textFaint, padding: '6px 8px', fontFamily: MJ_FONTS.mono,
          }}>{grp.group}</div>
          {grp.items.map(it => (
            <div key={it.key} onClick={() => setScreen(it.key)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 5,
              fontSize: 13, cursor: 'pointer',
              color: screen === it.key ? MJ_TOKENS.text : MJ_TOKENS.textMid,
              background: screen === it.key ? MJ_TOKENS.bgAlt : 'transparent',
              fontWeight: screen === it.key ? 500 : 400,
            }}>
              <MJIcon name={it.icon} size={13} stroke={screen === it.key ? MJ_TOKENS.text : MJ_TOKENS.textMid} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge != null && <span style={{
                fontSize: 10, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono,
              }}>{it.badge}</span>}
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 24, padding: '10px 8px', borderTop: `1px solid ${MJ_TOKENS.lineSoft}` }}>
        <div style={{ fontSize: 10, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono, marginBottom: 6 }}>CRAWL STATUS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: MJ_TOKENS.textMid }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: MJ_TOKENS.accent }}/>
          <span>9 of 10 active</span>
        </div>
        <div style={{ fontSize: 10, color: MJ_TOKENS.textSoft, marginTop: 3, fontFamily: MJ_FONTS.mono }}>synced 2m ago</div>
      </div>
    </div>
  );
}

// ── Feed ─────────────────────────────────────────────────────────────
function MinFeed({ jobs, total, query, setQuery, filters, setFilters, onOpen, onToggleSave }) {
  const [sort, setSort] = React.useState('match');
  const sorted = React.useMemo(() => {
    const list = [...jobs];
    if (sort === 'match')   list.sort((a,b) => b.match - a.match);
    if (sort === 'recent')  list.sort((a,b) => a.posted.localeCompare(b.posted));
    if (sort === 'salary')  list.sort((a,b) => b.match - a.match);
    return list;
  }, [jobs, sort]);

  return (
    <div style={{ padding: '20px 28px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>For you · 4월 21일 화</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: 0 }}>공고 {jobs.length}개 <span style={{ color: MJ_TOKENS.textSoft, fontWeight: 400 }}>of {total}</span></h1>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['match', 'recent', 'salary'].map(s => (
            <button key={s} onClick={() => setSort(s)} style={{
              padding: '4px 10px', fontSize: 12, border: `1px solid ${sort === s ? MJ_TOKENS.line : 'transparent'}`,
              background: sort === s ? MJ_TOKENS.surface : 'transparent', color: sort === s ? MJ_TOKENS.text : MJ_TOKENS.textMid,
              borderRadius: 5, cursor: 'pointer', fontFamily: MJ_FONTS.sans,
            }}>{s === 'match' ? 'Best match' : s === 'recent' ? 'Most recent' : 'Salary'}</button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '18px 0 14px', flexWrap: 'wrap' }}>
        <MinFilterInput value={query} onChange={setQuery} />
        <MinChipFilter label="Level" values={['Mid', 'Senior', 'Staff', 'Lead']}
          selected={filters.level} onChange={v => setFilters(f => ({ ...f, level: v }))} />
        <MinToggleChip label="Remote only" on={filters.remote} onChange={v => setFilters(f => ({ ...f, remote: v }))} />
        <MinChipFilter label="Stack" values={['React', 'TypeScript', 'Next.js', 'GraphQL', 'Node.js']}
          selected={filters.stack} onChange={v => setFilters(f => ({ ...f, stack: v }))} />
        <MinSlider label="Match ≥" value={filters.minMatch} onChange={v => setFilters(f => ({ ...f, minMatch: v }))} />
        {(filters.level.length || filters.stack.length || filters.remote || filters.minMatch > 0) ? (
          <button onClick={() => setFilters({ level: [], remote: false, minMatch: 0, stack: [] })} style={{
            padding: '3px 8px', fontSize: 11, border: 'none', background: 'transparent',
            color: MJ_TOKENS.textSoft, cursor: 'pointer', fontFamily: MJ_FONTS.mono,
          }}>clear all</button>
        ) : null}
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '48px 1fr 160px 120px 90px 80px 80px',
        padding: '8px 10px', fontSize: 10, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono,
        textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: `1px solid ${MJ_TOKENS.line}`,
      }}>
        <div>★</div>
        <div>Position</div>
        <div>Company</div>
        <div>Stack</div>
        <div>Location</div>
        <div style={{ textAlign: 'right' }}>Match</div>
        <div style={{ textAlign: 'right' }}>Posted</div>
      </div>

      {/* Rows */}
      {sorted.map(j => (
        <div key={j.id} onClick={() => onOpen(j)} style={{
          display: 'grid', gridTemplateColumns: '48px 1fr 160px 120px 90px 80px 80px',
          padding: '12px 10px', borderBottom: `1px solid ${MJ_TOKENS.lineSoft}`,
          alignItems: 'center', cursor: 'pointer', fontSize: 13,
        }}
        onMouseEnter={e => e.currentTarget.style.background = MJ_TOKENS.surface}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div onClick={e => { e.stopPropagation(); onToggleSave(j.id); }} style={{
            color: j.saved ? MJ_TOKENS.accent : MJ_TOKENS.textFaint, cursor: 'pointer', padding: 2,
          }}>
            <MJIcon name={j.saved ? 'bookmarkFilled' : 'bookmark'} size={14} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500, color: MJ_TOKENS.text, marginBottom: 2, letterSpacing: -0.1 }}>
              {j.title}
              {j.applied && <span style={{
                marginLeft: 8, fontSize: 10, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase',
                color: MJ_TOKENS[j.stage === 'Offer' ? 'offer' : j.stage === 'Interview' ? 'interview' : 'applied'],
                border: `1px solid currentColor`, padding: '1px 5px', borderRadius: 3, letterSpacing: 0.4,
              }}>{j.stage || 'Applied'}</span>}
            </div>
            <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>
              {j.level} · {j.salary} · {j.type}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MJPlaceholder label={j.company.slice(0,2)} w={20} h={20} rounded={4} />
            <div style={{ fontSize: 12, color: MJ_TOKENS.textMid }}>{j.company}</div>
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {j.stack.slice(0, 2).map(s => (
              <span key={s} style={{ fontSize: 10, padding: '1px 5px', border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 3, color: MJ_TOKENS.textMid, fontFamily: MJ_FONTS.mono }}>{s}</span>
            ))}
            {j.stack.length > 2 && <span style={{ fontSize: 10, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono }}>+{j.stack.length - 2}</span>}
          </div>
          <div style={{ fontSize: 11, color: MJ_TOKENS.textMid }}>{j.location}</div>
          <div style={{ textAlign: 'right', fontFamily: MJ_FONTS.mono, fontSize: 12, color: j.match >= 80 ? MJ_TOKENS.accentText : MJ_TOKENS.textMid, fontWeight: j.match >= 80 ? 600 : 400 }}>
            {j.match}%
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>{j.posted}</div>
        </div>
      ))}

      <div style={{ marginTop: 24, padding: '10px 12px', fontSize: 11, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono, borderRadius: 5, background: MJ_TOKENS.surface, border: `1px solid ${MJ_TOKENS.lineSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MJIcon name="refresh" size={11} stroke={MJ_TOKENS.textFaint} />
        next crawl in 00:08:24 · 10 sources · avg 2.1s
      </div>
    </div>
  );
}

function MinFilterInput({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', height: 28,
      background: MJ_TOKENS.surface, border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 5,
      minWidth: 200, flex: 1, maxWidth: 280,
    }}>
      <MJIcon name="search" size={12} stroke={MJ_TOKENS.textSoft} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="Filter…" style={{
        border: 'none', outline: 'none', background: 'transparent', fontSize: 12, flex: 1,
        fontFamily: MJ_FONTS.sans, color: MJ_TOKENS.text,
      }}/>
    </div>
  );
}

function MinChipFilter({ label, values, selected, onChange }) {
  const [open, setOpen] = React.useState(false);
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        height: 28, padding: '0 10px', fontSize: 12, border: `1px solid ${selected.length ? MJ_TOKENS.accent : MJ_TOKENS.line}`,
        borderRadius: 5, background: selected.length ? MJ_TOKENS.accentSoft : MJ_TOKENS.surface,
        color: selected.length ? MJ_TOKENS.accentText : MJ_TOKENS.textMid, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontFamily: MJ_FONTS.sans,
      }}>
        {label} {selected.length > 0 && <span style={{ fontSize: 10, padding: '0 4px', borderRadius: 3, background: MJ_TOKENS.accent, color: 'white' }}>{selected.length}</span>}
        <MJIcon name="arrowDown" size={10} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 32, left: 0, zIndex: 11, background: MJ_TOKENS.surface,
            border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 6, padding: 4, minWidth: 160,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}>
            {values.map(v => (
              <div key={v} onClick={() => toggle(v)} style={{
                padding: '6px 8px', fontSize: 12, borderRadius: 4, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                background: selected.includes(v) ? MJ_TOKENS.bgAlt : 'transparent',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 3, border: `1px solid ${selected.includes(v) ? MJ_TOKENS.accent : MJ_TOKENS.line}`,
                  background: selected.includes(v) ? MJ_TOKENS.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{selected.includes(v) && <MJIcon name="check" size={9} stroke="white" />}</div>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MinToggleChip({ label, on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      height: 28, padding: '0 10px', fontSize: 12, border: `1px solid ${on ? MJ_TOKENS.accent : MJ_TOKENS.line}`,
      borderRadius: 5, background: on ? MJ_TOKENS.accentSoft : MJ_TOKENS.surface,
      color: on ? MJ_TOKENS.accentText : MJ_TOKENS.textMid, cursor: 'pointer', fontFamily: MJ_FONTS.sans,
    }}>{label}</button>
  );
}

function MinSlider({ label, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', height: 28,
      background: MJ_TOKENS.surface, border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 5,
    }}>
      <span style={{ fontSize: 12, color: MJ_TOKENS.textMid }}>{label}</span>
      <input type="range" min="0" max="100" value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: 80, accentColor: MJ_TOKENS.accent }} />
      <span style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: MJ_TOKENS.textMid, width: 28 }}>{value}%</span>
    </div>
  );
}

// ── Detail ───────────────────────────────────────────────────────────
function MinDetail({ job, onBack, onToggleSave }) {
  return (
    <div>
      <div style={{
        position: 'sticky', top: 0, zIndex: 2, background: MJ_TOKENS.bg,
        padding: '10px 28px', borderBottom: `1px solid ${MJ_TOKENS.line}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: MJ_TOKENS.textMid,
          border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 6px',
          fontFamily: MJ_FONTS.sans,
        }}>← Back</button>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, flex: 1 }}>
          feed / {job.company.toLowerCase()} / {job.id}
        </div>
        <button onClick={() => onToggleSave(job.id)} style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 10px',
          border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 5, background: MJ_TOKENS.surface,
          color: job.saved ? MJ_TOKENS.accent : MJ_TOKENS.textMid, cursor: 'pointer',
        }}>
          <MJIcon name={job.saved ? 'bookmarkFilled' : 'bookmark'} size={12} />
          {job.saved ? 'Saved' : 'Save'}
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 10px',
          border: 'none', borderRadius: 5, background: MJ_TOKENS.text, color: MJ_TOKENS.surface,
          cursor: 'pointer',
        }}>
          Apply <MJIcon name="external" size={11} stroke={MJ_TOKENS.surface} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40, padding: '28px 28px 60px', maxWidth: 1100 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <MJPlaceholder label={job.company.slice(0,2)} w={40} h={40} rounded={6} />
            <div>
              <div style={{ fontSize: 13, color: MJ_TOKENS.textMid }}>{job.company} · {job.team}</div>
              <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>via {job.sourceTag}</div>
            </div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, margin: '0 0 12px', lineHeight: 1.2 }}>{job.title}</h1>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: MJ_TOKENS.textMid, marginBottom: 28, flexWrap: 'wrap' }}>
            <span>{job.location}</span><span>·</span>
            <span>{job.type}</span><span>·</span>
            <span>{job.level}</span><span>·</span>
            <span style={{ fontFamily: MJ_FONTS.mono }}>{job.salary}</span>
          </div>

          <MinSection title="About the role">
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: MJ_TOKENS.textMid }}>{job.about || '회사로부터 제공된 자세한 설명이 아직 수집되지 않았습니다. 원문 링크에서 전체 내용을 확인하세요.'}</p>
          </MinSection>

          {job.requirements.length > 0 && (
            <MinSection title="Requirements">
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.9, color: MJ_TOKENS.textMid }}>
                {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </MinSection>
          )}

          {job.nice.length > 0 && (
            <MinSection title="Nice to have">
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.9, color: MJ_TOKENS.textMid }}>
                {job.nice.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </MinSection>
          )}
        </div>

        <div style={{ fontSize: 12 }}>
          <div style={{
            padding: 14, border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 6,
            background: MJ_TOKENS.surface, marginBottom: 14,
          }}>
            <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, color: MJ_TOKENS.textFaint, marginBottom: 10 }}>Match score</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
              <div style={{ fontSize: 36, fontWeight: 600, fontFamily: MJ_FONTS.mono, color: MJ_TOKENS.accentText, letterSpacing: -1 }}>{job.match}</div>
              <div style={{ fontSize: 16, color: MJ_TOKENS.textSoft }}>/ 100</div>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: MJ_TOKENS.bgAlt, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ width: `${job.match}%`, height: '100%', background: MJ_TOKENS.accent }}/>
            </div>
            <div style={{ fontSize: 11, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono, marginBottom: 6 }}>WHY</div>
            {job.matchReasons.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: MJ_TOKENS.textMid, marginBottom: 4 }}>
                <MJIcon name="check" size={11} stroke={MJ_TOKENS.accent} /> {r}
              </div>
            ))}
          </div>

          <div style={{ padding: 14, border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 6, background: MJ_TOKENS.surface, marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, color: MJ_TOKENS.textFaint, marginBottom: 10 }}>Stack</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {job.stack.map(s => (
                <span key={s} style={{ fontSize: 11, padding: '2px 7px', border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 3, color: MJ_TOKENS.textMid, fontFamily: MJ_FONTS.mono }}>{s}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 6, background: MJ_TOKENS.surface }}>
            <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, color: MJ_TOKENS.textFaint, marginBottom: 10 }}>Source</div>
            <div style={{ fontSize: 12, fontFamily: MJ_FONTS.mono, color: MJ_TOKENS.textMid, wordBreak: 'break-all', marginBottom: 6 }}>
              <MJIcon name="link" size={11} stroke={MJ_TOKENS.textSoft} /> {job.source}
            </div>
            <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft }}>crawled {job.posted} · {job.postedAbs}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MinSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 10, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6,
        color: MJ_TOKENS.textFaint, marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

// ── Tracker (light kanban columns) ───────────────────────────────────
function MinTracker({ jobs, onOpen }) {
  const byStage = {
    Saved: jobs.filter(j => j.saved && !j.applied),
    Applied: jobs.filter(j => j.applied && j.stage === 'Applied'),
    Interview: jobs.filter(j => j.stage === 'Interview'),
    Offer: jobs.filter(j => j.stage === 'Offer'),
  };
  const stages = ['Saved', 'Applied', 'Interview', 'Offer'];
  const colorFor = (s) => ({ Saved: MJ_TOKENS.saved, Applied: MJ_TOKENS.applied, Interview: MJ_TOKENS.interview, Offer: MJ_TOKENS.offer }[s]);
  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Pipeline</div>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: '0 0 24px' }}>Applications</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {stages.map(s => (
          <div key={s} style={{ background: MJ_TOKENS.surface, borderRadius: 6, border: `1px solid ${MJ_TOKENS.line}`, minHeight: 300 }}>
            <div style={{ padding: '10px 12px', borderBottom: `1px solid ${MJ_TOKENS.lineSoft}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: colorFor(s) }}/>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{s}</span>
              <span style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>{byStage[s].length}</span>
            </div>
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {byStage[s].map(j => (
                <div key={j.id} onClick={() => onOpen(j)} style={{
                  padding: 10, border: `1px solid ${MJ_TOKENS.lineSoft}`, borderRadius: 5,
                  background: MJ_TOKENS.bg, cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{j.title}</div>
                  <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>{j.company}</div>
                </div>
              ))}
              {byStage[s].length === 0 && <div style={{ fontSize: 11, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono, padding: 8, textAlign: 'center' }}>— empty —</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bookmarks ────────────────────────────────────────────────────────
function MinBookmarks({ jobs, onOpen, onToggleSave }) {
  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Library</div>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: '0 0 24px' }}>Saved · {jobs.length}</h1>
      {jobs.length === 0 ? (
        <div style={{ fontSize: 13, color: MJ_TOKENS.textSoft, padding: 40, textAlign: 'center' }}>아직 저장한 공고가 없습니다.</div>
      ) : jobs.map(j => (
        <div key={j.id} onClick={() => onOpen(j)} style={{
          padding: 14, borderBottom: `1px solid ${MJ_TOKENS.lineSoft}`, cursor: 'pointer',
          display: 'flex', gap: 14, alignItems: 'center',
        }}>
          <MJPlaceholder label={j.company.slice(0,2)} w={32} h={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{j.title}</div>
            <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>{j.company} · {j.location} · {j.salary}</div>
          </div>
          <div style={{ fontSize: 11, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono }}>saved {j.posted}</div>
          <button onClick={e => { e.stopPropagation(); onToggleSave(j.id); }} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, color: MJ_TOKENS.accent,
          }}><MJIcon name="bookmarkFilled" size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ── Profile ──────────────────────────────────────────────────────────
function MinProfile() {
  const [stack, setStack] = React.useState(MJ_PROFILE.stack);
  const [salaryMin, setSalaryMin] = React.useState(MJ_PROFILE.salaryMin);
  const [salaryMax, setSalaryMax] = React.useState(MJ_PROFILE.salaryMax);
  const [passive, setPassive] = React.useState(MJ_PROFILE.passive);
  const [newStack, setNewStack] = React.useState('');

  return (
    <div style={{ padding: '20px 28px', maxWidth: 760 }}>
      <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Preferences</div>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: '0 0 24px' }}>Profile & Match Preferences</h1>

      <MinField label="Looking status">
        <div style={{ display: 'flex', gap: 8 }}>
          {[{v: false, l: 'Actively looking'}, {v: true, l: 'Passive — open to offers'}].map(o => (
            <button key={String(o.v)} onClick={() => setPassive(o.v)} style={{
              padding: '8px 14px', fontSize: 13, border: `1px solid ${passive === o.v ? MJ_TOKENS.accent : MJ_TOKENS.line}`,
              borderRadius: 5, background: passive === o.v ? MJ_TOKENS.accentSoft : MJ_TOKENS.surface,
              color: passive === o.v ? MJ_TOKENS.accentText : MJ_TOKENS.textMid, cursor: 'pointer',
              fontFamily: MJ_FONTS.sans,
            }}>{o.l}</button>
          ))}
        </div>
      </MinField>

      <MinField label="Stack & skills" hint="Drives match score">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {stack.map(s => (
            <span key={s} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 4px 3px 8px',
              border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 4, background: MJ_TOKENS.surface,
              fontSize: 12, fontFamily: MJ_FONTS.mono,
            }}>{s}<button onClick={() => setStack(stack.filter(x => x !== s))} style={{ border: 'none', background: 'transparent', color: MJ_TOKENS.textSoft, cursor: 'pointer', padding: 0, display: 'flex' }}><MJIcon name="close" size={10} /></button></span>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); if (newStack.trim()) { setStack([...stack, newStack.trim()]); setNewStack(''); } }}>
          <input value={newStack} onChange={e => setNewStack(e.target.value)} placeholder="+ add skill" style={{
            fontSize: 12, padding: '6px 10px', border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 4,
            outline: 'none', fontFamily: MJ_FONTS.mono, background: MJ_TOKENS.surface, width: 200,
          }}/>
        </form>
      </MinField>

      <MinField label="Salary range (연봉, 만원)">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="number" value={salaryMin} onChange={e => setSalaryMin(+e.target.value)} style={inputStyle}/>
          <span style={{ color: MJ_TOKENS.textSoft }}>~</span>
          <input type="number" value={salaryMax} onChange={e => setSalaryMax(+e.target.value)} style={inputStyle}/>
          <span style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, marginLeft: 8 }}>~ ${Math.round(salaryMax*0.7/10)}k USD</span>
        </div>
      </MinField>

      <MinField label="Employment types">
        <div style={{ display: 'flex', gap: 6 }}>
          {['정규직', 'Full-time Remote', 'Contract', 'Freelance'].map(t => {
            const on = MJ_PROFILE.employment.includes(t);
            return <span key={t} style={{
              padding: '5px 10px', fontSize: 12, borderRadius: 4, fontFamily: MJ_FONTS.sans,
              border: `1px solid ${on ? MJ_TOKENS.accent : MJ_TOKENS.line}`,
              background: on ? MJ_TOKENS.accentSoft : MJ_TOKENS.surface,
              color: on ? MJ_TOKENS.accentText : MJ_TOKENS.textMid, cursor: 'pointer',
            }}>{t}</span>;
          })}
        </div>
      </MinField>

      <MinField label="Resume" hint="used for automatic matching">
        <div style={{ padding: 14, border: `1px dashed ${MJ_TOKENS.line}`, borderRadius: 6, background: MJ_TOKENS.surface, display: 'flex', alignItems: 'center', gap: 12 }}>
          <MJPlaceholder label="PDF" w={36} h={44} rounded={3} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{MJ_PROFILE.nameEn}_resume_2026.pdf</div>
            <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>284 KB · 업로드 2026.04.12</div>
          </div>
          <button style={{ padding: '5px 10px', fontSize: 12, border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 4, background: MJ_TOKENS.bg, cursor: 'pointer' }}>Replace</button>
        </div>
      </MinField>
    </div>
  );
}

const inputStyle = {
  fontSize: 12, padding: '6px 10px', border: `1px solid ${MJ_TOKENS.line}`, borderRadius: 4,
  outline: 'none', fontFamily: MJ_FONTS.mono, background: MJ_TOKENS.surface, width: 90,
};

function MinField({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, marginBottom: 8 }}>{hint}</div>}
      {children}
    </div>
  );
}

// ── Sources (crawl config) ───────────────────────────────────────────
function MinSources() {
  const [sources, setSources] = React.useState(MJ_SOURCES);
  const [newUrl, setNewUrl] = React.useState('');

  const toggle = (id) => setSources(s => s.map(x => x.id === id ? { ...x, active: !x.active } : x));
  const remove = (id) => setSources(s => s.filter(x => x.id !== id));
  const add = (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setSources(s => [...s, { id: 'new' + Date.now(), name: newUrl.split('/')[0], url: newUrl, jobs: 0, active: true, lastSync: 'pending' }]);
    setNewUrl('');
  };

  return (
    <div style={{ padding: '20px 28px', maxWidth: 860 }}>
      <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Configuration</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, margin: 0 }}>Crawl Sources</h1>
        <div style={{ fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>{sources.filter(s => s.active).length} of {sources.length} active · {sources.reduce((a,s) => a + s.jobs, 0)} jobs indexed</div>
      </div>

      <form onSubmit={add} style={{
        display: 'flex', gap: 8, marginBottom: 20, padding: 12,
        border: `1px dashed ${MJ_TOKENS.line}`, borderRadius: 6, background: MJ_TOKENS.surface,
      }}>
        <MJIcon name="plus" size={14} stroke={MJ_TOKENS.textSoft} />
        <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
          placeholder="paste a careers page URL (e.g. toss.im/career)"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: MJ_FONTS.mono, color: MJ_TOKENS.text }}/>
        <button type="submit" style={{ padding: '4px 12px', fontSize: 12, border: 'none', background: MJ_TOKENS.text, color: 'white', borderRadius: 4, cursor: 'pointer', fontFamily: MJ_FONTS.sans }}>Add source</button>
      </form>

      <div style={{
        display: 'grid', gridTemplateColumns: '24px 1fr 180px 80px 100px 24px',
        padding: '8px 12px', fontSize: 10, color: MJ_TOKENS.textFaint, fontFamily: MJ_FONTS.mono,
        textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: `1px solid ${MJ_TOKENS.line}`,
      }}>
        <div></div><div>Source</div><div>URL</div><div style={{ textAlign: 'right' }}>Jobs</div><div style={{ textAlign: 'right' }}>Last sync</div><div></div>
      </div>
      {sources.map(s => (
        <div key={s.id} style={{
          display: 'grid', gridTemplateColumns: '24px 1fr 180px 80px 100px 24px',
          padding: '10px 12px', fontSize: 13, alignItems: 'center',
          borderBottom: `1px solid ${MJ_TOKENS.lineSoft}`,
          opacity: s.active ? 1 : 0.55,
        }}>
          <div onClick={() => toggle(s.id)} style={{ cursor: 'pointer' }}>
            <div style={{
              width: 22, height: 13, borderRadius: 6.5, background: s.active ? MJ_TOKENS.accent : MJ_TOKENS.line,
              position: 'relative', transition: 'background .12s',
            }}>
              <div style={{ position: 'absolute', top: 1.5, left: s.active ? 11 : 1.5, width: 10, height: 10, borderRadius: 5, background: 'white', transition: 'left .12s' }}/>
            </div>
          </div>
          <div style={{ fontWeight: 500 }}>{s.name}</div>
          <div style={{ fontSize: 12, fontFamily: MJ_FONTS.mono, color: MJ_TOKENS.textMid }}>{s.url}</div>
          <div style={{ textAlign: 'right', fontFamily: MJ_FONTS.mono, fontSize: 12, color: MJ_TOKENS.textMid }}>{s.jobs}</div>
          <div style={{ textAlign: 'right', fontSize: 11, color: MJ_TOKENS.textSoft, fontFamily: MJ_FONTS.mono }}>{s.lastSync}</div>
          <div onClick={() => remove(s.id)} style={{ cursor: 'pointer', color: MJ_TOKENS.textFaint, display: 'flex', justifyContent: 'center' }}>
            <MJIcon name="close" size={11} />
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { MinimalApp });
