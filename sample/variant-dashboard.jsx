// variant-dashboard.jsx — Shim 3: Card Dashboard (spacious, warm off-white, card grid)

const dashTokens = {
  bg: 'oklch(0.98 0.006 85)',          // warm off-white
  surface: 'oklch(1 0 0)',
  surfaceAlt: 'oklch(0.955 0.008 85)',
  line: 'oklch(0.91 0.008 85)',
  lineSoft: 'oklch(0.95 0.006 85)',
  text: 'oklch(0.22 0.015 85)',
  textMid: 'oklch(0.44 0.012 85)',
  textSoft: 'oklch(0.62 0.01 85)',
  textFaint: 'oklch(0.76 0.008 85)',
  accent: 'oklch(0.56 0.14 30)',        // terracotta
  accentSoft: 'oklch(0.94 0.04 30)',
  accentText: 'oklch(0.4 0.12 30)',
  saved: 'oklch(0.6 0.12 245)',
  applied: 'oklch(0.65 0.13 70)',
  interview: 'oklch(0.6 0.16 25)',
  offer: 'oklch(0.58 0.14 155)',
};

function DashApp({ initialScreen = 'dashboard' }) {
  const [screen, setScreen] = React.useState(initialScreen);
  const [selected, setSelected] = React.useState(null);
  const [jobs, setJobs] = React.useState(MJ_JOBS);

  const openJob = (j) => { setSelected(j); setScreen('detail'); };
  const toggleSaved = (id) => setJobs(js => js.map(j => j.id === id ? { ...j, saved: !j.saved } : j));

  return (
    <div style={{
      width: '100%', height: '100%', fontFamily: MJ_FONTS.sans,
      background: dashTokens.bg, color: dashTokens.text, display: 'flex', overflow: 'hidden',
    }}>
      <DashSide screen={screen} setScreen={setScreen} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {screen === 'dashboard' && <DashHome jobs={jobs} onOpen={openJob} onToggleSave={toggleSaved} setScreen={setScreen} />}
        {screen === 'feed'      && <DashFeed jobs={jobs} onOpen={openJob} onToggleSave={toggleSaved} />}
        {screen === 'detail'    && selected && <DashDetail job={selected} onBack={() => setScreen('dashboard')} onToggleSave={toggleSaved} />}
        {screen === 'bookmarks' && <DashBookmarks jobs={jobs.filter(j => j.saved)} onOpen={openJob} onToggleSave={toggleSaved} />}
        {screen === 'tracker'   && <DashTracker jobs={jobs} onOpen={openJob} />}
        {screen === 'profile'   && <DashProfile />}
        {screen === 'sources'   && <DashSources />}
      </div>
    </div>
  );
}

function DashSide({ screen, setScreen }) {
  const items = [
    { k: 'dashboard', l: 'Today',        i: 'spark' },
    { k: 'feed',      l: 'Discover',     i: 'search' },
    { k: 'bookmarks', l: 'Saved',        i: 'bookmark', b: 4 },
    { k: 'tracker',   l: 'Applications', i: 'briefcase', b: 6 },
  ];
  const setup = [
    { k: 'sources',   l: 'Sources',      i: 'link' },
    { k: 'profile',   l: 'Profile',      i: 'settings' },
  ];
  return (
    <div style={{
      width: 240, background: dashTokens.bg, borderRight: `1px solid ${dashTokens.line}`,
      padding: 20, flexShrink: 0, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: dashTokens.accent, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, fontFamily: MJ_FONTS.display,
        }}>M</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>MyJob</div>
          <div style={{ fontSize: 10, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>Hi, {MJ_PROFILE.nameEn.split(' ')[0]}</div>
        </div>
      </div>

      <DashNavGroup title="Browse" items={items} screen={screen} setScreen={setScreen} />
      <DashNavGroup title="Setup" items={setup} screen={screen} setScreen={setScreen} />

      <div style={{ flex: 1 }} />

      <div style={{
        background: dashTokens.surface, padding: 14, borderRadius: 10, border: `1px solid ${dashTokens.line}`,
      }}>
        <div style={{ fontSize: 11, color: dashTokens.textSoft, marginBottom: 4 }}>Next crawl</div>
        <div style={{ fontSize: 14, fontWeight: 600, fontFamily: MJ_FONTS.mono }}>00:08:24</div>
        <div style={{ height: 3, background: dashTokens.surfaceAlt, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
          <div style={{ width: '72%', height: '100%', background: dashTokens.accent }}/>
        </div>
      </div>
    </div>
  );
}

function DashNavGroup({ title, items, screen, setScreen }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: dashTokens.textFaint, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600, padding: '0 10px 8px' }}>{title}</div>
      {items.map(it => (
        <div key={it.k} onClick={() => setScreen(it.k)} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8,
          fontSize: 13, cursor: 'pointer', marginBottom: 2,
          color: screen === it.k ? dashTokens.accent : dashTokens.textMid,
          background: screen === it.k ? dashTokens.accentSoft : 'transparent',
          fontWeight: screen === it.k ? 600 : 400,
        }}>
          <MJIcon name={it.i} size={14} stroke="currentColor" />
          <span style={{ flex: 1 }}>{it.l}</span>
          {it.b && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: dashTokens.surface, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>{it.b}</span>}
        </div>
      ))}
    </div>
  );
}

// ── Dashboard home ───────────────────────────────────────────────────
function DashHome({ jobs, onOpen, onToggleSave, setScreen }) {
  const topMatches = [...jobs].sort((a,b) => b.match - a.match).slice(0, 3);
  const recentSaved = jobs.filter(j => j.saved).slice(0, 4);
  const activeApps = jobs.filter(j => j.applied);

  return (
    <div style={{ padding: '32px 40px 60px', maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 13, color: dashTokens.textSoft, marginBottom: 4 }}>화요일, 4월 21일</div>
          <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.8, margin: 0 }}>Good morning, {MJ_PROFILE.nameEn.split(' ')[0]} 👋</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <MJPlaceholder label={MJ_PROFILE.avatarInitial} w={40} h={40} rounded={20} />
        </div>
      </div>

      {/* stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <DashStat label="New today"        value="12"  sub="↑ 4 vs yesterday" accent />
        <DashStat label="Active pipeline"  value={activeApps.length} sub="2 in interview" />
        <DashStat label="Saved"            value={jobs.filter(j => j.saved).length} sub="3 expiring soon" />
        <DashStat label="Response rate"    value="42%" sub="on submitted apps" />
      </div>

      {/* Top matches */}
      <DashCard>
        <DashCardHead title="Top matches for you" cta="View all →" onCta={() => setScreen('feed')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, padding: '0 4px 4px' }}>
          {topMatches.map(j => (
            <div key={j.id} onClick={() => onOpen(j)} style={{
              padding: 18, background: dashTokens.surface, borderRadius: 12, cursor: 'pointer',
              border: `1px solid ${dashTokens.line}`, position: 'relative',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = dashTokens.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = dashTokens.line}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MJPlaceholder label={j.company.slice(0,2)} w={28} h={28} rounded={6} />
                  <div style={{ fontSize: 12, fontWeight: 500, color: dashTokens.textMid }}>{j.company}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); onToggleSave(j.id); }} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
                  color: j.saved ? dashTokens.accent : dashTokens.textFaint,
                }}><MJIcon name={j.saved ? 'bookmarkFilled' : 'bookmark'} size={14} /></button>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, letterSpacing: -0.2, lineHeight: 1.3 }}>{j.title}</div>
              <div style={{ fontSize: 12, color: dashTokens.textSoft, marginBottom: 12, fontFamily: MJ_FONTS.mono }}>{j.location} · {j.salary}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${dashTokens.lineSoft}` }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {j.stack.slice(0, 2).map(s => (
                    <span key={s} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: dashTokens.surfaceAlt, color: dashTokens.textMid, fontFamily: MJ_FONTS.mono }}>{s}</span>
                  ))}
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: dashTokens.accent, fontFamily: MJ_FONTS.mono,
                }}>{j.match}%</div>
              </div>
            </div>
          ))}
        </div>
      </DashCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginTop: 14 }}>
        {/* Pipeline snapshot */}
        <DashCard>
          <DashCardHead title="Pipeline this week" cta="Open tracker →" onCta={() => setScreen('tracker')} />
          <div style={{ display: 'flex', gap: 10, padding: '0 4px 4px' }}>
            {[
              { l: 'Saved', n: jobs.filter(j => j.saved && !j.applied).length, c: dashTokens.saved },
              { l: 'Applied', n: 1, c: dashTokens.applied },
              { l: 'Interview', n: 1, c: dashTokens.interview },
              { l: 'Offer', n: 1, c: dashTokens.offer },
            ].map(s => (
              <div key={s.l} style={{
                flex: 1, padding: 14, background: dashTokens.surfaceAlt, borderRadius: 10,
                borderTop: `3px solid ${s.c}`,
              }}>
                <div style={{ fontSize: 11, color: dashTokens.textSoft, marginBottom: 4 }}>{s.l}</div>
                <div style={{ fontSize: 24, fontWeight: 600, fontFamily: MJ_FONTS.display, letterSpacing: -0.6, color: dashTokens.text }}>{s.n}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: 14, background: dashTokens.accentSoft, borderRadius: 10, fontSize: 12, color: dashTokens.accentText, display: 'flex', gap: 8 }}>
            <MJIcon name="clock" size={13} stroke={dashTokens.accentText} />
            <span>Coupang interview — thu 2026.04.24, 14:00</span>
          </div>
        </DashCard>

        {/* Saved */}
        <DashCard>
          <DashCardHead title="Recently saved" cta="All saved →" onCta={() => setScreen('bookmarks')} />
          <div style={{ padding: '0 4px 4px' }}>
            {recentSaved.map(j => (
              <div key={j.id} onClick={() => onOpen(j)} style={{
                padding: '10px 0', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer',
                borderBottom: `1px solid ${dashTokens.lineSoft}`,
              }}>
                <MJPlaceholder label={j.company.slice(0,2)} w={28} h={28} rounded={6} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.title}</div>
                  <div style={{ fontSize: 11, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>{j.company} · {j.posted}</div>
                </div>
                <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: dashTokens.accent }}>{j.match}%</div>
              </div>
            ))}
          </div>
        </DashCard>
      </div>

      {/* Sources preview */}
      <DashCard style={{ marginTop: 14 }}>
        <DashCardHead title="Your crawl sources" cta="Manage →" onCta={() => setScreen('sources')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, padding: '0 4px 4px' }}>
          {MJ_SOURCES.slice(0, 5).map(s => (
            <div key={s.id} style={{
              padding: 12, background: dashTokens.surfaceAlt, borderRadius: 10,
              opacity: s.active ? 1 : 0.45,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: s.active ? dashTokens.offer : dashTokens.textFaint }}/>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{s.name}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, fontFamily: MJ_FONTS.display, color: dashTokens.text, letterSpacing: -0.4 }}>{s.jobs}</div>
              <div style={{ fontSize: 10, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>{s.lastSync}</div>
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

function DashStat({ label, value, sub, accent }) {
  return (
    <div style={{
      padding: 18, background: dashTokens.surface, borderRadius: 12, border: `1px solid ${dashTokens.line}`,
    }}>
      <div style={{ fontSize: 12, color: dashTokens.textSoft, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, fontFamily: MJ_FONTS.display, color: accent ? dashTokens.accent : dashTokens.text }}>{value}</div>
      <div style={{ fontSize: 11, color: dashTokens.textSoft, marginTop: 4, fontFamily: MJ_FONTS.mono }}>{sub}</div>
    </div>
  );
}

function DashCard({ children, style }) {
  return (
    <div style={{ background: dashTokens.surface, borderRadius: 14, padding: 20, border: `1px solid ${dashTokens.line}`, ...style }}>
      {children}
    </div>
  );
}
function DashCardHead({ title, cta, onCta }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>{title}</div>
      {cta && <button onClick={onCta} style={{ fontSize: 12, color: dashTokens.textMid, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: MJ_FONTS.sans }}>{cta}</button>}
    </div>
  );
}

// ── Feed (card grid) ─────────────────────────────────────────────────
function DashFeed({ jobs, onOpen, onToggleSave }) {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const filtered = React.useMemo(() => {
    let list = jobs;
    if (filter === 'remote') list = list.filter(j => /remote/i.test(j.location));
    if (filter === 'top')    list = list.filter(j => j.match >= 80);
    if (query) list = list.filter(j => (j.title + j.company + j.stack.join(' ')).toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [jobs, filter, query]);

  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: dashTokens.textSoft, marginBottom: 4 }}>Discover</div>
        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, margin: 0 }}>{filtered.length} matches across your sources</h1>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 42, background: dashTokens.surface, borderRadius: 10, border: `1px solid ${dashTokens.line}` }}>
          <MJIcon name="search" size={14} stroke={dashTokens.textSoft} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title, company, stack…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: dashTokens.text, fontFamily: MJ_FONTS.sans }}/>
        </div>
        <div style={{ display: 'flex', gap: 4, background: dashTokens.surface, padding: 4, borderRadius: 10, border: `1px solid ${dashTokens.line}` }}>
          {[{k:'all',l:'All'},{k:'top',l:'Top match'},{k:'remote',l:'Remote'}].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{
              padding: '7px 14px', fontSize: 12, border: 'none', borderRadius: 7,
              background: filter === f.k ? dashTokens.accentSoft : 'transparent',
              color: filter === f.k ? dashTokens.accentText : dashTokens.textMid,
              fontWeight: filter === f.k ? 600 : 400, cursor: 'pointer', fontFamily: MJ_FONTS.sans,
            }}>{f.l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {filtered.map(j => (
          <div key={j.id} onClick={() => onOpen(j)} style={{
            padding: 20, background: dashTokens.surface, borderRadius: 14, cursor: 'pointer',
            border: `1px solid ${dashTokens.line}`, display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <MJPlaceholder label={j.company.slice(0,2)} w={44} h={44} rounded={10} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: dashTokens.textSoft, marginBottom: 4 }}>{j.company} · {j.team}</div>
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.25 }}>{j.title}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); onToggleSave(j.id); }} style={{
                border: 'none', background: 'transparent', cursor: 'pointer', padding: 6,
                color: j.saved ? dashTokens.accent : dashTokens.textFaint,
              }}><MJIcon name={j.saved ? 'bookmarkFilled' : 'bookmark'} size={16} /></button>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: dashTokens.textMid, fontFamily: MJ_FONTS.mono }}>
              <span>{j.location}</span><span>{j.level}</span><span>{j.salary}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {j.stack.slice(0, 4).map(s => (
                <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: dashTokens.surfaceAlt, color: dashTokens.textMid, fontFamily: MJ_FONTS.mono }}>{s}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${dashTokens.lineSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 60, height: 4, background: dashTokens.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${j.match}%`, height: '100%', background: dashTokens.accent }}/>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: dashTokens.accent, fontFamily: MJ_FONTS.mono }}>{j.match}% match</span>
              </div>
              <span style={{ fontSize: 11, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>{j.posted}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Detail ───────────────────────────────────────────────────────────
function DashDetail({ job, onBack, onToggleSave }) {
  return (
    <div style={{ padding: '24px 40px 60px', maxWidth: 1000 }}>
      <button onClick={onBack} style={{
        padding: '6px 12px', fontSize: 12, color: dashTokens.textMid,
        border: `1px solid ${dashTokens.line}`, background: dashTokens.surface, borderRadius: 8,
        cursor: 'pointer', marginBottom: 24, fontFamily: MJ_FONTS.sans,
      }}>← Back to matches</button>

      <div style={{
        background: dashTokens.surface, borderRadius: 16, padding: 32, border: `1px solid ${dashTokens.line}`, marginBottom: 14,
      }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <MJPlaceholder label={job.company.slice(0,2)} w={56} h={56} rounded={12} />
          <div>
            <div style={{ fontSize: 13, color: dashTokens.textSoft, marginBottom: 4 }}>{job.company} · {job.team}</div>
            <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, margin: 0, lineHeight: 1.2 }}>{job.title}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${dashTokens.lineSoft}` }}>
          {[
            { l: 'Location', v: job.location },
            { l: 'Level', v: job.level },
            { l: 'Type', v: job.type },
            { l: 'Salary', v: job.salary, c: dashTokens.accent },
          ].map(m => (
            <div key={m.l}>
              <div style={{ fontSize: 11, color: dashTokens.textSoft, marginBottom: 2 }}>{m.l}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: m.c || dashTokens.text, fontFamily: m.c ? MJ_FONTS.mono : MJ_FONTS.sans }}>{m.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button style={{
            padding: '10px 20px', fontSize: 13, fontWeight: 600, border: 'none',
            background: dashTokens.accent, color: 'white', cursor: 'pointer', borderRadius: 10,
          }}>Apply on {job.sourceTag} ↗</button>
          <button onClick={() => onToggleSave(job.id)} style={{
            padding: '10px 16px', fontSize: 13, border: `1px solid ${dashTokens.line}`,
            background: job.saved ? dashTokens.accentSoft : dashTokens.surface,
            color: job.saved ? dashTokens.accent : dashTokens.textMid,
            cursor: 'pointer', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, fontFamily: MJ_FONTS.sans,
          }}><MJIcon name={job.saved ? 'bookmarkFilled' : 'bookmark'} size={13} /> {job.saved ? 'Saved' : 'Save'}</button>
        </div>

        <div style={{ fontSize: 14, color: dashTokens.textMid, lineHeight: 1.7, marginBottom: 24 }}>{job.about || 'Original posting is cached from source.'}</div>

        {job.requirements.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>요구 사항</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: dashTokens.textMid, lineHeight: 1.9 }}>
              {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <DashCard>
          <div style={{ fontSize: 12, color: dashTokens.textSoft, marginBottom: 10 }}>Match score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
            <div style={{ fontSize: 44, fontWeight: 600, fontFamily: MJ_FONTS.display, color: dashTokens.accent, letterSpacing: -1.5, lineHeight: 1 }}>{job.match}</div>
            <div style={{ fontSize: 16, color: dashTokens.textSoft }}>/ 100</div>
          </div>
          <div style={{ height: 4, background: dashTokens.surfaceAlt, borderRadius: 2, marginBottom: 14 }}>
            <div style={{ width: `${job.match}%`, height: '100%', background: dashTokens.accent, borderRadius: 2 }}/>
          </div>
          {job.matchReasons.map((r, i) => (
            <div key={i} style={{ fontSize: 13, color: dashTokens.textMid, marginBottom: 6, display: 'flex', gap: 8 }}>
              <MJIcon name="check" size={12} stroke={dashTokens.accent} /> {r}
            </div>
          ))}
        </DashCard>
        <DashCard>
          <div style={{ fontSize: 12, color: dashTokens.textSoft, marginBottom: 10 }}>Source</div>
          <div style={{ fontSize: 13, fontFamily: MJ_FONTS.mono, color: dashTokens.text, marginBottom: 6, wordBreak: 'break-all' }}>{job.source}</div>
          <div style={{ fontSize: 11, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono, marginBottom: 14 }}>crawled {job.posted} · {job.postedAbs}</div>
          <div style={{ fontSize: 12, color: dashTokens.textSoft, marginBottom: 8 }}>Stack</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {job.stack.map(s => (
              <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: dashTokens.surfaceAlt, color: dashTokens.textMid, fontFamily: MJ_FONTS.mono }}>{s}</span>
            ))}
          </div>
        </DashCard>
      </div>
    </div>
  );
}

// ── Bookmarks ────────────────────────────────────────────────────────
function DashBookmarks({ jobs, onOpen, onToggleSave }) {
  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <div style={{ fontSize: 13, color: dashTokens.textSoft, marginBottom: 4 }}>Library</div>
      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, margin: '0 0 24px' }}>Saved · {jobs.length}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {jobs.map(j => (
          <div key={j.id} onClick={() => onOpen(j)} style={{
            padding: 18, background: dashTokens.surface, border: `1px solid ${dashTokens.line}`,
            borderRadius: 12, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <MJPlaceholder label={j.company.slice(0,2)} w={32} h={32} rounded={8} />
              <button onClick={e => { e.stopPropagation(); onToggleSave(j.id); }} style={{ border: 'none', background: 'transparent', color: dashTokens.accent, cursor: 'pointer', padding: 4 }}>
                <MJIcon name="bookmarkFilled" size={14} />
              </button>
            </div>
            <div style={{ fontSize: 12, color: dashTokens.textSoft, marginBottom: 4 }}>{j.company}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, lineHeight: 1.3, letterSpacing: -0.2 }}>{j.title}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>
              <span>{j.location}</span>
              <span style={{ color: dashTokens.accent }}>{j.match}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tracker (cards + progress) ───────────────────────────────────────
function DashTracker({ jobs, onOpen }) {
  const stages = [
    { k: 'Saved', c: dashTokens.saved, list: jobs.filter(j => j.saved && !j.applied) },
    { k: 'Applied', c: dashTokens.applied, list: jobs.filter(j => j.applied && j.stage === 'Applied') },
    { k: 'Interview', c: dashTokens.interview, list: jobs.filter(j => j.stage === 'Interview') },
    { k: 'Offer', c: dashTokens.offer, list: jobs.filter(j => j.stage === 'Offer') },
  ];
  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <div style={{ fontSize: 13, color: dashTokens.textSoft, marginBottom: 4 }}>Pipeline</div>
      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, margin: '0 0 24px' }}>Applications</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {stages.map(s => (
          <div key={s.k} style={{
            background: dashTokens.surface, borderRadius: 14, border: `1px solid ${dashTokens.line}`,
            padding: 16, minHeight: 320,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${dashTokens.lineSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: s.c }}/>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.k}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: MJ_FONTS.mono, color: dashTokens.textMid }}>{s.list.length}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.list.map(j => (
                <div key={j.id} onClick={() => onOpen(j)} style={{
                  padding: 12, background: dashTokens.surfaceAlt, borderRadius: 8, cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3, lineHeight: 1.3 }}>{j.title}</div>
                  <div style={{ fontSize: 11, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>{j.company}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile ──────────────────────────────────────────────────────────
function DashProfile() {
  const [passive, setPassive] = React.useState(true);
  return (
    <div style={{ padding: '32px 40px 60px', maxWidth: 820 }}>
      <div style={{ fontSize: 13, color: dashTokens.textSoft, marginBottom: 4 }}>Preferences</div>
      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, margin: '0 0 24px' }}>Profile & matching</h1>

      <DashCard style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: dashTokens.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, fontFamily: MJ_FONTS.display }}>{MJ_PROFILE.avatarInitial}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{MJ_PROFILE.nameEn}</div>
            <div style={{ fontSize: 12, color: dashTokens.textSoft }}>{MJ_PROFILE.role} · {MJ_PROFILE.years}y · {MJ_PROFILE.location}</div>
          </div>
          <button style={{ padding: '8px 14px', fontSize: 12, border: `1px solid ${dashTokens.line}`, background: dashTokens.surface, borderRadius: 8, cursor: 'pointer', fontFamily: MJ_FONTS.sans }}>Edit</button>
        </div>
      </DashCard>

      <DashCard style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Looking status</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{v: false, l: 'Actively looking'}, {v: true, l: 'Passive — open to offers'}].map(o => (
            <button key={String(o.v)} onClick={() => setPassive(o.v)} style={{
              padding: '10px 16px', fontSize: 13, borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${passive === o.v ? dashTokens.accent : dashTokens.line}`,
              background: passive === o.v ? dashTokens.accentSoft : dashTokens.surface,
              color: passive === o.v ? dashTokens.accentText : dashTokens.textMid, fontFamily: MJ_FONTS.sans,
            }}>{o.l}</button>
          ))}
        </div>
      </DashCard>

      <DashCard style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Stack & skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MJ_PROFILE.stack.map(s => (
            <span key={s} style={{ padding: '6px 12px', fontSize: 12, background: dashTokens.surfaceAlt, borderRadius: 8, fontFamily: MJ_FONTS.mono }}>{s}</span>
          ))}
          <button style={{ padding: '6px 12px', fontSize: 12, background: 'transparent', border: `1px dashed ${dashTokens.line}`, borderRadius: 8, cursor: 'pointer', color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>+ add</button>
        </div>
      </DashCard>

      <DashCard>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Resume</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, border: `1px dashed ${dashTokens.line}`, borderRadius: 10 }}>
          <MJPlaceholder label="PDF" w={36} h={44} rounded={4} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{MJ_PROFILE.nameEn}_resume_2026.pdf</div>
            <div style={{ fontSize: 11, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>284 KB · 업로드 2026.04.12</div>
          </div>
          <button style={{ padding: '7px 12px', fontSize: 12, border: `1px solid ${dashTokens.line}`, background: dashTokens.surface, borderRadius: 8, cursor: 'pointer', fontFamily: MJ_FONTS.sans }}>Replace</button>
        </div>
      </DashCard>
    </div>
  );
}

// ── Sources ──────────────────────────────────────────────────────────
function DashSources() {
  const [sources, setSources] = React.useState(MJ_SOURCES);
  const [newUrl, setNewUrl] = React.useState('');
  const toggle = (id) => setSources(s => s.map(x => x.id === id ? { ...x, active: !x.active } : x));
  const add = (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setSources(s => [...s, { id: 'n'+Date.now(), name: newUrl.split('/')[0], url: newUrl, jobs: 0, active: true, lastSync: 'pending' }]);
    setNewUrl('');
  };

  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <div style={{ fontSize: 13, color: dashTokens.textSoft, marginBottom: 4 }}>Crawler</div>
      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, margin: '0 0 8px' }}>Your sources</h1>
      <div style={{ fontSize: 13, color: dashTokens.textSoft, marginBottom: 24 }}>{sources.filter(s => s.active).length} active of {sources.length} · next sync in 8m</div>

      <form onSubmit={add} style={{
        padding: 18, background: dashTokens.surface, border: `1px dashed ${dashTokens.line}`, borderRadius: 12,
        display: 'flex', gap: 10, marginBottom: 20,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: dashTokens.accentSoft, color: dashTokens.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><MJIcon name="plus" size={16} stroke={dashTokens.accent} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Add a new careers page</div>
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
            placeholder="e.g. toss.im/career, linear.app/careers"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: dashTokens.text, fontFamily: MJ_FONTS.mono }}/>
        </div>
        <button type="submit" style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, border: 'none', background: dashTokens.accent, color: 'white', borderRadius: 8, cursor: 'pointer', fontFamily: MJ_FONTS.sans }}>Start crawl</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {sources.map(s => (
          <div key={s.id} style={{
            padding: 16, background: dashTokens.surface, border: `1px solid ${dashTokens.line}`, borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <MJPlaceholder label={s.name.slice(0,2)} w={36} h={36} rounded={8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                <div style={{ width: 5, height: 5, borderRadius: 3, background: s.active ? dashTokens.offer : dashTokens.textFaint }}/>
              </div>
              <div style={{ fontSize: 11, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>{s.url} · {s.lastSync}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: MJ_FONTS.display, letterSpacing: -0.3 }}>{s.jobs}</div>
              <div style={{ fontSize: 10, color: dashTokens.textSoft, fontFamily: MJ_FONTS.mono }}>jobs</div>
            </div>
            <button onClick={() => toggle(s.id)} style={{
              width: 34, height: 20, borderRadius: 10, border: 'none', padding: 0, cursor: 'pointer',
              background: s.active ? dashTokens.accent : dashTokens.surfaceAlt, position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: 2, left: s.active ? 16 : 2, width: 16, height: 16, borderRadius: 8, background: 'white', transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { DashApp });
