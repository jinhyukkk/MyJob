// variant-bold.jsx — Shim 2: Bold Kanban (tracker-first, large type, warmer dark surface)

const boldStyles = {
  frame: {
    width: '100%', height: '100%',
    fontFamily: MJ_FONTS.sans,
    background: '#0f0f10',
    color: '#f4f1eb',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
};

const boldTokens = {
  bg: '#0f0f10',
  surface: '#18181a',
  surface2: '#202022',
  line: '#2a2a2d',
  lineSoft: '#1f1f22',
  text: '#f4f1eb',
  textMid: '#a8a69e',
  textSoft: '#78766f',
  textFaint: '#55544f',
  accent: '#d8ff5c', // electric lime
  accentText: '#0f0f10',
  saved: '#7aa8ff',
  applied: '#ffb86c',
  interview: '#ff7a7a',
  offer: '#b8ff7a',
  rejected: '#55544f',
};

function BoldApp({ initialScreen = 'tracker' }) {
  const [screen, setScreen] = React.useState(initialScreen);
  const [selected, setSelected] = React.useState(null);
  const [jobs, setJobs] = React.useState(MJ_JOBS);

  const openJob = (j) => { setSelected(j); setScreen('detail'); };
  const toggleSaved = (id) => setJobs(js => js.map(j => j.id === id ? { ...j, saved: !j.saved } : j));
  const moveStage = (id, stage) => setJobs(js => js.map(j => j.id === id ? { ...j, applied: true, stage } : j));

  return (
    <div style={boldStyles.frame}>
      <BoldNav screen={screen} setScreen={setScreen} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {screen === 'tracker'   && <BoldTracker jobs={jobs} onOpen={openJob} onMove={moveStage} />}
        {screen === 'feed'      && <BoldFeed jobs={jobs} onOpen={openJob} onToggleSave={toggleSaved} />}
        {screen === 'detail'    && selected && <BoldDetail job={selected} onBack={() => setScreen('tracker')} onToggleSave={toggleSaved} />}
        {screen === 'bookmarks' && <BoldBookmarks jobs={jobs.filter(j => j.saved)} onOpen={openJob} onToggleSave={toggleSaved} />}
        {screen === 'profile'   && <BoldProfile />}
        {screen === 'sources'   && <BoldSources />}
      </div>
    </div>
  );
}

// ── Nav (horizontal tabs, bold) ──────────────────────────────────────
function BoldNav({ screen, setScreen }) {
  const tabs = [
    { k: 'tracker',   l: 'PIPELINE' },
    { k: 'feed',      l: 'DISCOVER' },
    { k: 'bookmarks', l: 'SAVED' },
    { k: 'sources',   l: 'SOURCES' },
    { k: 'profile',   l: 'PROFILE' },
  ];
  return (
    <div style={{
      padding: '18px 28px', background: boldTokens.bg,
      borderBottom: `1px solid ${boldTokens.line}`, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 28,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.8, color: boldTokens.text }}>MyJob</div>
        <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1 }}>/ v0.1</div>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 4 }}>
        {tabs.map(t => (
          <button key={t.k} onClick={() => setScreen(t.k)} style={{
            padding: '8px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 1.2,
            border: 'none', background: screen === t.k ? boldTokens.accent : 'transparent',
            color: screen === t.k ? boldTokens.accentText : boldTokens.textMid,
            cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
          }}>{t.l}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft }}>
          <span style={{ color: boldTokens.accent }}>●</span> crawling · {MJ_SOURCES.filter(s => s.active).length}/{MJ_SOURCES.length}
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 16, background: boldTokens.accent, color: boldTokens.accentText,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800,
        }}>{MJ_PROFILE.avatarInitial}</div>
      </div>
    </div>
  );
}

// ── Tracker / Kanban (main screen) ───────────────────────────────────
function BoldTracker({ jobs, onOpen, onMove }) {
  const stages = [
    { k: 'saved',     l: 'SAVED',     c: boldTokens.saved,    desc: 'bookmarked' },
    { k: 'applied',   l: 'APPLIED',   c: boldTokens.applied,  desc: 'submitted' },
    { k: 'interview', l: 'INTERVIEW', c: boldTokens.interview, desc: 'in-process' },
    { k: 'offer',     l: 'OFFER',     c: boldTokens.offer,    desc: 'closing' },
    { k: 'rejected',  l: 'ARCHIVED',  c: boldTokens.rejected, desc: 'dead / no-go' },
  ];
  const byStage = {
    saved: jobs.filter(j => j.saved && !j.applied),
    applied: jobs.filter(j => j.applied && j.stage === 'Applied'),
    interview: jobs.filter(j => j.stage === 'Interview'),
    offer: jobs.filter(j => j.stage === 'Offer'),
    rejected: [],
  };
  const total = Object.values(byStage).flat().length;

  return (
    <div style={{ padding: '28px 28px 40px' }}>
      {/* Headline */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 6 }}>2026 · WEEK 17 · APR 21</div>
          <h1 style={{
            fontSize: 56, fontWeight: 800, letterSpacing: -2.4, margin: 0, lineHeight: 0.95, color: boldTokens.text,
          }}>Your next move.</h1>
          <div style={{ fontSize: 16, color: boldTokens.textMid, marginTop: 8 }}>
            {total} jobs in flight · <span style={{ color: boldTokens.accent }}>2 interviews this week</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            padding: '12px 18px', fontSize: 13, fontWeight: 700, letterSpacing: 0.6,
            border: `1px solid ${boldTokens.line}`, background: 'transparent',
            color: boldTokens.text, cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
          }}>+ ADD MANUALLY</button>
          <button style={{
            padding: '12px 18px', fontSize: 13, fontWeight: 700, letterSpacing: 0.6,
            border: 'none', background: boldTokens.accent, color: boldTokens.accentText,
            cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
          }}>SYNC CRAWL NOW →</button>
        </div>
      </div>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {stages.map(s => {
          const list = byStage[s.k];
          return (
            <div key={s.k} style={{
              background: boldTokens.surface, borderRadius: 2, minHeight: 460,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                padding: 16, borderBottom: `1px solid ${boldTokens.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: s.c }}/>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: boldTokens.text }}>{s.l}</div>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, marginTop: 4, letterSpacing: 0.3 }}>{s.desc}</div>
                </div>
                <div style={{
                  fontSize: 32, fontWeight: 800, fontFamily: MJ_FONTS.display, color: list.length ? boldTokens.text : boldTokens.textFaint,
                  letterSpacing: -1.5, lineHeight: 1,
                }}>{String(list.length).padStart(2, '0')}</div>
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {list.map(j => (
                  <div key={j.id} onClick={() => onOpen(j)} style={{
                    padding: 12, background: boldTokens.surface2, borderRadius: 2,
                    cursor: 'pointer', border: `1px solid transparent`,
                    transition: 'border-color .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = boldTokens.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' }}>{j.company}</div>
                      <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: s.c }}>{j.match}%</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: boldTokens.text, letterSpacing: -0.2, lineHeight: 1.2, marginBottom: 8 }}>{j.title}</div>
                    <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 0.4 }}>
                      {j.location.split(' ')[0]} · {j.type}
                    </div>
                  </div>
                ))}
                {list.length === 0 && (
                  <div style={{
                    border: `1px dashed ${boldTokens.line}`, borderRadius: 2, padding: '24px 12px',
                    textAlign: 'center', fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textFaint, letterSpacing: 1,
                  }}>EMPTY</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats strip */}
      <div style={{
        marginTop: 28, padding: 20, background: boldTokens.surface, borderRadius: 2,
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16,
      }}>
        {[
          { l: 'RESPONSE RATE', v: '42%', d: '▲ 8 vs last wk', c: boldTokens.accent },
          { l: 'AVG TIME TO REPLY', v: '3.2d', d: 'for saved apps' },
          { l: 'THIS WEEK', v: '12', d: 'new matches' },
          { l: 'INTERVIEWS', v: '2', d: 'coupang · stripe', c: boldTokens.interview },
          { l: 'OFFER ETA', v: 'Apr 25', d: 'stripe billing', c: boldTokens.offer },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, letterSpacing: 1.2, color: boldTokens.textSoft, marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: MJ_FONTS.display, letterSpacing: -1, color: s.c || boldTokens.text, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: boldTokens.textMid, marginTop: 4, fontFamily: MJ_FONTS.mono }}>{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feed ─────────────────────────────────────────────────────────────
function BoldFeed({ jobs, onOpen, onToggleSave }) {
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const filtered = React.useMemo(() => {
    let list = jobs;
    if (filter === 'remote') list = list.filter(j => /remote/i.test(j.location));
    if (filter === 'top')    list = list.filter(j => j.match >= 80);
    if (filter === 'new')    list = list.filter(j => /h ago|d ago/.test(j.posted));
    if (query) list = list.filter(j => (j.title + j.company + j.stack.join(' ')).toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [jobs, filter, query]);

  return (
    <div style={{ padding: '28px 28px 40px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 6 }}>FOR YOU · APR 21</div>
        <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2.4, margin: 0, lineHeight: 0.95 }}>
          <span style={{ color: boldTokens.accent }}>{filtered.length}</span> new matches.
        </h1>
      </div>

      {/* Filter + search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { k: 'all',    l: 'ALL' },
            { k: 'top',    l: 'TOP MATCH' },
            { k: 'remote', l: 'REMOTE' },
            { k: 'new',    l: 'NEW TODAY' },
          ].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{
              padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
              border: 'none', background: filter === f.k ? boldTokens.text : 'transparent',
              color: filter === f.k ? boldTokens.bg : boldTokens.textMid,
              cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
            }}>{f.l}</button>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 38, background: boldTokens.surface, borderRadius: 2 }}>
          <MJIcon name="search" size={14} stroke={boldTokens.textSoft} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="FIND BY TITLE, COMPANY, OR STACK…"
            style={{ border: 'none', outline: 'none', background: 'transparent', color: boldTokens.text, fontSize: 12, flex: 1, fontFamily: MJ_FONTS.sans, letterSpacing: 1 }}/>
        </div>
      </div>

      {/* Feed cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filtered.map(j => (
          <div key={j.id} onClick={() => onOpen(j)} style={{
            padding: '18px 20px', background: boldTokens.surface, borderRadius: 2,
            cursor: 'pointer', display: 'grid',
            gridTemplateColumns: '80px 1fr 200px 100px 40px', gap: 20, alignItems: 'center',
            borderLeft: `3px solid ${j.match >= 85 ? boldTokens.accent : 'transparent'}`,
          }}>
            <div style={{
              fontSize: 40, fontWeight: 800, fontFamily: MJ_FONTS.display, letterSpacing: -1.5,
              color: j.match >= 85 ? boldTokens.accent : boldTokens.textMid, lineHeight: 1,
            }}>{j.match}</div>
            <div>
              <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.2, marginBottom: 4, textTransform: 'uppercase' }}>{j.company} · {j.team}</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.2, marginBottom: 6 }}>{j.title}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {j.stack.slice(0, 4).map(s => (
                  <span key={s} style={{ fontSize: 10, padding: '2px 6px', border: `1px solid ${boldTokens.line}`, color: boldTokens.textMid, fontFamily: MJ_FONTS.mono, letterSpacing: 0.3 }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textMid, letterSpacing: 0.4 }}>
              <div style={{ marginBottom: 4 }}>{j.location}</div>
              <div>{j.salary}</div>
            </div>
            <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, textAlign: 'right', letterSpacing: 0.6 }}>{j.posted.toUpperCase()}</div>
            <button onClick={e => { e.stopPropagation(); onToggleSave(j.id); }} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: j.saved ? boldTokens.accent : boldTokens.textSoft, padding: 4,
            }}>
              <MJIcon name={j.saved ? 'bookmarkFilled' : 'bookmark'} size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Detail ───────────────────────────────────────────────────────────
function BoldDetail({ job, onBack, onToggleSave }) {
  return (
    <div>
      <div style={{
        padding: '20px 28px', borderBottom: `1px solid ${boldTokens.line}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button onClick={onBack} style={{
          padding: '8px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
          border: `1px solid ${boldTokens.line}`, background: 'transparent', color: boldTokens.text,
          cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
        }}>← BACK</button>
        <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, flex: 1 }}>
          JOB · {job.id.toUpperCase()}
        </div>
      </div>

      <div style={{ padding: '40px 28px 60px', maxWidth: 1100 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }}>
          <div>
            <div style={{ fontSize: 13, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 12 }}>{job.company.toUpperCase()} · {job.team?.toUpperCase()}</div>
            <h1 style={{
              fontSize: 64, fontWeight: 800, letterSpacing: -2.8, margin: '0 0 24px', lineHeight: 0.95,
            }}>{job.title}</h1>

            <div style={{ display: 'flex', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
              <BoldMeta l="LOCATION" v={job.location} />
              <BoldMeta l="LEVEL" v={job.level} />
              <BoldMeta l="TYPE" v={job.type} />
              <BoldMeta l="SALARY" v={job.salary} c={boldTokens.accent} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
              <button style={{
                padding: '16px 28px', fontSize: 13, fontWeight: 800, letterSpacing: 1.4,
                border: 'none', background: boldTokens.accent, color: boldTokens.accentText,
                cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
              }}>APPLY NOW →</button>
              <button onClick={() => onToggleSave(job.id)} style={{
                padding: '16px 24px', fontSize: 13, fontWeight: 700, letterSpacing: 1.2,
                border: `1px solid ${boldTokens.line}`, background: 'transparent',
                color: job.saved ? boldTokens.accent : boldTokens.text,
                cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
                display: 'flex', alignItems: 'center', gap: 8,
              }}><MJIcon name={job.saved ? 'bookmarkFilled' : 'bookmark'} size={14} /> {job.saved ? 'SAVED' : 'SAVE'}</button>
              <button style={{
                padding: '16px 24px', fontSize: 13, fontWeight: 700, letterSpacing: 1.2,
                border: `1px solid ${boldTokens.line}`, background: 'transparent', color: boldTokens.text,
                cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
              }}>ORIGINAL ↗</button>
            </div>

            <BoldSect title="ABOUT">
              <p style={{ fontSize: 16, lineHeight: 1.7, color: boldTokens.textMid, margin: 0 }}>{job.about || 'Original posting will be fetched on-demand.'}</p>
            </BoldSect>

            {job.requirements.length > 0 && (
              <BoldSect title="YOU BRING">
                {job.requirements.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.accent, letterSpacing: 0.6, fontWeight: 700, paddingTop: 4, minWidth: 24 }}>0{i+1}</div>
                    <div style={{ fontSize: 15, color: boldTokens.text, lineHeight: 1.5 }}>{r}</div>
                  </div>
                ))}
              </BoldSect>
            )}

            {job.nice.length > 0 && (
              <BoldSect title="BONUS">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {job.nice.map((n, i) => (
                    <div key={i} style={{ padding: '10px 14px', border: `1px solid ${boldTokens.line}`, fontSize: 13, color: boldTokens.text }}>{n}</div>
                  ))}
                </div>
              </BoldSect>
            )}
          </div>

          <div>
            <div style={{ background: boldTokens.surface, padding: 24, borderRadius: 2, marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 12 }}>MATCH SCORE</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                <div style={{ fontSize: 80, fontWeight: 800, fontFamily: MJ_FONTS.display, color: boldTokens.accent, letterSpacing: -4, lineHeight: 0.9 }}>{job.match}</div>
                <div style={{ fontSize: 20, color: boldTokens.textMid }}>/100</div>
              </div>
              <div style={{ height: 2, background: boldTokens.line, marginBottom: 16 }}>
                <div style={{ width: `${job.match}%`, height: '100%', background: boldTokens.accent }}/>
              </div>
              {job.matchReasons.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: boldTokens.textMid, marginBottom: 6, display: 'flex', gap: 6 }}>
                  <span style={{ color: boldTokens.accent }}>+</span> {r}
                </div>
              ))}
            </div>

            <div style={{ background: boldTokens.surface, padding: 20, borderRadius: 2, marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 12 }}>STACK</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.stack.map(s => (
                  <span key={s} style={{ fontSize: 11, padding: '4px 10px', border: `1px solid ${boldTokens.line}`, fontFamily: MJ_FONTS.mono, color: boldTokens.text, letterSpacing: 0.4 }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ background: boldTokens.surface, padding: 20, borderRadius: 2 }}>
              <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 12 }}>CRAWLED FROM</div>
              <div style={{ fontSize: 12, fontFamily: MJ_FONTS.mono, color: boldTokens.text, marginBottom: 4, wordBreak: 'break-all' }}>{job.source}</div>
              <div style={{ fontSize: 11, color: boldTokens.textSoft, fontFamily: MJ_FONTS.mono }}>{job.postedAbs} · {job.posted}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoldMeta({ l, v, c }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.2, marginBottom: 4 }}>{l}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: c || boldTokens.text, fontFamily: c ? MJ_FONTS.mono : MJ_FONTS.sans }}>{v}</div>
    </div>
  );
}
function BoldSect({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{
        fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.8,
        marginBottom: 20, paddingBottom: 10, borderBottom: `1px solid ${boldTokens.line}`,
      }}>— {title}</div>
      {children}
    </div>
  );
}

// ── Bookmarks ────────────────────────────────────────────────────────
function BoldBookmarks({ jobs, onOpen, onToggleSave }) {
  return (
    <div style={{ padding: '28px' }}>
      <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 6 }}>LIBRARY</div>
      <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2.4, margin: 0, lineHeight: 0.95, marginBottom: 24 }}>SAVED · {String(jobs.length).padStart(2, '0')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {jobs.map(j => (
          <div key={j.id} onClick={() => onOpen(j)} style={{
            padding: 20, background: boldTokens.surface, cursor: 'pointer', borderRadius: 2,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.2, textTransform: 'uppercase' }}>{j.company}</div>
              <button onClick={e => { e.stopPropagation(); onToggleSave(j.id); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: boldTokens.accent, padding: 0 }}>
                <MJIcon name="bookmarkFilled" size={14} />
              </button>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.6, marginBottom: 12, lineHeight: 1.2 }}>{j.title}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textMid }}>
              <span>{j.location}</span>
              <span style={{ color: boldTokens.accent }}>{j.match}% MATCH</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile ──────────────────────────────────────────────────────────
function BoldProfile() {
  const [passive, setPassive] = React.useState(true);
  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 880 }}>
      <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 6 }}>PREFERENCES</div>
      <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2.4, margin: 0, lineHeight: 0.95, marginBottom: 32 }}>Tune your signal.</h1>

      <div style={{ background: boldTokens.surface, padding: 24, marginBottom: 14, borderRadius: 2 }}>
        <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 12 }}>— STATUS</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{v: false, l: 'ACTIVELY LOOKING'}, {v: true, l: 'PASSIVE — OPEN TO OFFERS'}].map(o => (
            <button key={String(o.v)} onClick={() => setPassive(o.v)} style={{
              padding: '14px 20px', fontSize: 12, fontWeight: 700, letterSpacing: 1.2,
              border: passive === o.v ? 'none' : `1px solid ${boldTokens.line}`,
              background: passive === o.v ? boldTokens.accent : 'transparent',
              color: passive === o.v ? boldTokens.accentText : boldTokens.text,
              cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
            }}>{o.l}</button>
          ))}
        </div>
      </div>

      <div style={{ background: boldTokens.surface, padding: 24, marginBottom: 14, borderRadius: 2 }}>
        <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 12 }}>— STACK</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {MJ_PROFILE.stack.map(s => (
            <span key={s} style={{ padding: '8px 14px', fontSize: 13, background: boldTokens.surface2, color: boldTokens.text, fontFamily: MJ_FONTS.mono, letterSpacing: 0.3 }}>{s}</span>
          ))}
          <button style={{ padding: '8px 14px', fontSize: 13, background: 'transparent', color: boldTokens.accent, border: `1px dashed ${boldTokens.line}`, cursor: 'pointer', fontFamily: MJ_FONTS.mono }}>+ ADD</button>
        </div>
      </div>

      <div style={{ background: boldTokens.surface, padding: 24, marginBottom: 14, borderRadius: 2 }}>
        <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 16 }}>— SALARY FLOOR (연봉, 만원)</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontSize: 64, fontWeight: 800, fontFamily: MJ_FONTS.display, color: boldTokens.accent, letterSpacing: -2, lineHeight: 1 }}>9,000</div>
          <div style={{ fontSize: 20, color: boldTokens.textMid }}>~ 13,000</div>
        </div>
        <input type="range" min="5000" max="20000" defaultValue="9000" style={{ width: '100%', marginTop: 16, accentColor: boldTokens.accent }}/>
      </div>

      <div style={{ background: boldTokens.surface, padding: 24, borderRadius: 2 }}>
        <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 16 }}>— RESUME</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: MJ_FONTS.display, color: boldTokens.text }}>PDF</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{MJ_PROFILE.nameEn}_resume_2026.pdf</div>
            <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 0.4 }}>284 KB · UPLOADED 2026.04.12</div>
          </div>
          <button style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, border: `1px solid ${boldTokens.line}`, background: 'transparent', color: boldTokens.text, cursor: 'pointer', fontFamily: MJ_FONTS.sans }}>REPLACE</button>
        </div>
      </div>
    </div>
  );
}

// ── Sources ──────────────────────────────────────────────────────────
function BoldSources() {
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
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 1.5, marginBottom: 6 }}>CRAWLER</div>
      <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2.4, margin: 0, lineHeight: 0.95, marginBottom: 8 }}>Your <span style={{ color: boldTokens.accent }}>spiders.</span></h1>
      <div style={{ fontSize: 14, color: boldTokens.textMid, marginBottom: 28 }}>
        {sources.filter(s => s.active).length} active · {sources.reduce((a,s) => a+s.jobs, 0)} jobs indexed · next run in 00:08:24
      </div>

      <form onSubmit={add} style={{
        display: 'flex', gap: 0, marginBottom: 20, background: boldTokens.surface, borderRadius: 2,
      }}>
        <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
          placeholder="PASTE CAREERS PAGE URL"
          style={{ flex: 1, padding: '16px 20px', border: 'none', outline: 'none', background: 'transparent', color: boldTokens.text, fontSize: 13, fontFamily: MJ_FONTS.mono, letterSpacing: 1 }}/>
        <button type="submit" style={{
          padding: '0 28px', fontSize: 12, fontWeight: 800, letterSpacing: 1.4, border: 'none',
          background: boldTokens.accent, color: boldTokens.accentText, cursor: 'pointer',
          borderRadius: 2, fontFamily: MJ_FONTS.sans,
        }}>CRAWL →</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {sources.map(s => (
          <div key={s.id} style={{
            padding: 20, background: boldTokens.surface, borderRadius: 2,
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
            opacity: s.active ? 1 : 0.45,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: s.active ? boldTokens.accent : boldTokens.textFaint }}/>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
              </div>
              <div style={{ fontSize: 11, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 0.3 }}>{s.url}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: MJ_FONTS.display, color: boldTokens.text, letterSpacing: -0.8, lineHeight: 1 }}>{s.jobs}</div>
              <div style={{ fontSize: 10, fontFamily: MJ_FONTS.mono, color: boldTokens.textSoft, letterSpacing: 0.6, marginTop: 4 }}>{s.lastSync.toUpperCase()}</div>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 6, marginTop: 6 }}>
              <button onClick={() => toggle(s.id)} style={{
                padding: '6px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                border: `1px solid ${boldTokens.line}`, background: 'transparent',
                color: s.active ? boldTokens.accent : boldTokens.textMid, cursor: 'pointer',
                borderRadius: 2, fontFamily: MJ_FONTS.sans,
              }}>{s.active ? 'PAUSE' : 'RESUME'}</button>
              <button style={{
                padding: '6px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                border: `1px solid ${boldTokens.line}`, background: 'transparent', color: boldTokens.textMid,
                cursor: 'pointer', borderRadius: 2, fontFamily: MJ_FONTS.sans,
              }}>EDIT SELECTORS</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { BoldApp });
