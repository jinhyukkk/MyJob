// common.jsx — shared tokens + mock data for MyJob crawling aggregator

const MJ_TOKENS = {
  // Cool neutral — Linear/Notion feel
  bg:        'oklch(0.985 0.002 265)',
  bgAlt:     'oklch(0.97  0.003 265)',
  surface:   'oklch(1 0 0)',
  line:      'oklch(0.92  0.004 265)',
  lineSoft:  'oklch(0.955 0.004 265)',
  text:      'oklch(0.18  0.01  265)',
  textMid:   'oklch(0.42  0.01  265)',
  textSoft:  'oklch(0.58  0.008 265)',
  textFaint: 'oklch(0.72  0.006 265)',
  // Accent — forest green (growth / career move)
  accent:    'oklch(0.52 0.13 155)',
  accentSoft:'oklch(0.94 0.04 155)',
  accentText:'oklch(0.36 0.12 155)',
  // status colors (same chroma band)
  saved:     'oklch(0.62 0.12 245)',   // blue
  applied:   'oklch(0.62 0.14 55)',    // amber
  interview: 'oklch(0.60 0.16 25)',    // coral
  offer:     'oklch(0.58 0.14 155)',   // green
  rejected:  'oklch(0.60 0.02 265)',   // gray
};

// Shared font stacks
const MJ_FONTS = {
  sans:  '"Pretendard Variable", "Pretendard", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  mono:  '"IBM Plex Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  display: '"Pretendard Variable", "Pretendard", "IBM Plex Sans", -apple-system, sans-serif',
};

// Mock job postings (IT/dev focused, Korean market)
const MJ_JOBS = [
  {
    id: 'j1', title: 'Senior Frontend Engineer', company: '토스',
    team: 'Core Platform',
    location: '서울 강남', type: '정규직', level: 'Senior',
    salary: '8,000 ~ 1.2억',
    stack: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
    posted: '2h ago', postedAbs: '2026.04.21',
    source: 'toss.im/career', sourceTag: 'Toss Careers',
    match: 94, matchReasons: ['React 6y 일치', 'GraphQL 경험', '서울 지역'],
    saved: true, applied: false,
    about: 'Core Platform 팀의 Design System과 공통 프레임워크를 책임지는 포지션입니다.',
    requirements: [
      '5년 이상의 React / TypeScript 실무 경험',
      'Design System 또는 사내 프레임워크 개발 경험',
      '대규모 모노레포 환경 협업 경험',
      '웹 성능 최적화 경험 (Core Web Vitals)',
    ],
    nice: ['GraphQL Code Generation', 'Nx 또는 Turborepo', 'Figma 플러그인 개발'],
  },
  {
    id: 'j2', title: 'Staff Product Engineer', company: 'Linear',
    team: 'Product',
    location: 'Remote (APAC)', type: 'Full-time', level: 'Staff',
    salary: '$180k ~ $240k',
    stack: ['TypeScript', 'React', 'Electron', 'PostgreSQL'],
    posted: '6h ago', postedAbs: '2026.04.21',
    source: 'linear.app/careers', sourceTag: 'Linear',
    match: 89, matchReasons: ['원격 근무 가능', 'TypeScript 전문성'],
    saved: true, applied: false,
    about: 'Linear의 핵심 제품 경험을 설계하고 구현합니다. 엔지니어링 + 프로덕트 판단이 모두 필요한 역할입니다.',
    requirements: [
      '7년 이상의 프로덕트 엔지니어 경험',
      'TypeScript에 대한 깊은 이해',
      '복잡한 UI 상태 관리 경험',
      '영어 협업 가능',
    ],
    nice: ['Electron 또는 데스크톱 앱 경험', '오픈소스 기여'],
  },
  {
    id: 'j3', title: '프론트엔드 엔지니어', company: '당근',
    team: '중고거래 실',
    location: '서울 서초', type: '정규직', level: 'Mid-Senior',
    salary: '협의',
    stack: ['React Native', 'TypeScript', 'Relay'],
    posted: '1d ago', postedAbs: '2026.04.20',
    source: 'team.daangn.com', sourceTag: 'Daangn Team',
    match: 86, matchReasons: ['React Native 경험', '중고거래 도메인'],
    saved: false, applied: true, stage: 'Applied',
    about: '당근의 핵심 중고거래 플로우를 담당하는 팀입니다.',
    requirements: ['React Native 3년 이상', 'TypeScript', 'Relay or GraphQL Client'],
    nice: ['네이티브 모듈 작성 경험'],
  },
  {
    id: 'j4', title: 'Frontend Platform Lead', company: '쿠팡',
    team: 'Web Platform',
    location: '서울 송파', type: '정규직', level: 'Lead',
    salary: '1.1억 ~ 1.6억',
    stack: ['React', 'Module Federation', 'Webpack', 'Node.js'],
    posted: '2d ago', postedAbs: '2026.04.19',
    source: 'coupang.jobs', sourceTag: 'Coupang Jobs',
    match: 82, matchReasons: ['리드 경험', 'Module Federation'],
    saved: false, applied: true, stage: 'Interview',
    about: '쿠팡 전사 웹 플랫폼의 기술 방향성을 이끄는 역할입니다.',
    requirements: ['8년+ 프론트엔드 경험', '팀 리딩 경험', 'Micro Frontend 아키텍처'],
    nice: ['Module Federation 프로덕션 경험'],
  },
  {
    id: 'j5', title: 'Software Engineer, Growth', company: 'Vercel',
    team: 'Growth',
    location: 'Remote', type: 'Full-time', level: 'Mid',
    salary: '$140k ~ $180k',
    stack: ['Next.js', 'TypeScript', 'Edge Functions'],
    posted: '3d ago', postedAbs: '2026.04.18',
    source: 'vercel.com/careers', sourceTag: 'Vercel',
    match: 78, matchReasons: ['Next.js 전문성'],
    saved: true, applied: false,
    about: 'Vercel의 Growth 팀에서 conversion 퍼널을 개선합니다.',
    requirements: ['Next.js 실무 경험', 'A/B 테스팅 설계 경험'],
    nice: ['Edge Runtime'],
  },
  {
    id: 'j6', title: 'Design Engineer', company: '카카오',
    team: 'Kakao Work',
    location: '판교', type: '정규직', level: 'Mid',
    salary: '6,500 ~ 9,500',
    stack: ['React', 'Framer Motion', 'CSS'],
    posted: '4d ago', postedAbs: '2026.04.17',
    source: 'careers.kakao.com', sourceTag: 'Kakao Careers',
    match: 74, matchReasons: ['디자인 시스템 경험'],
    saved: false, applied: false,
    about: '',
    requirements: [], nice: [],
  },
  {
    id: 'j7', title: 'Senior Software Engineer', company: 'Stripe',
    team: 'Billing',
    location: 'Singapore', type: 'Full-time', level: 'Senior',
    salary: 'S$180k ~ S$240k',
    stack: ['TypeScript', 'Ruby', 'React'],
    posted: '5d ago', postedAbs: '2026.04.16',
    source: 'stripe.com/jobs', sourceTag: 'Stripe',
    match: 71, matchReasons: ['결제 도메인 관심'],
    saved: false, applied: true, stage: 'Offer',
    about: 'Stripe Billing 팀 백엔드 + 프론트 통합 업무',
    requirements: [], nice: [],
  },
  {
    id: 'j8', title: '프론트엔드 시니어', company: '네이버',
    team: '검색 UX',
    location: '분당', type: '정규직', level: 'Senior',
    salary: '협의',
    stack: ['React', 'TypeScript', 'MobX'],
    posted: '6d ago', postedAbs: '2026.04.15',
    source: 'recruit.navercorp.com', sourceTag: 'Naver',
    match: 68, matchReasons: [],
    saved: false, applied: false,
    about: '',
    requirements: [], nice: [],
  },
  {
    id: 'j9', title: 'Frontend Engineer', company: 'Figma',
    team: 'Editor',
    location: 'Remote (APAC)', type: 'Full-time', level: 'Mid-Senior',
    salary: '$160k ~ $210k',
    stack: ['TypeScript', 'C++', 'WebGL'],
    posted: '1w ago', postedAbs: '2026.04.14',
    source: 'figma.com/careers', sourceTag: 'Figma',
    match: 66, matchReasons: [],
    saved: true, applied: false,
    about: '',
    requirements: [], nice: [],
  },
];

// Crawl sources
const MJ_SOURCES = [
  { id: 's1', name: 'Toss Careers',  url: 'toss.im/career',           jobs: 42, active: true, lastSync: '2m ago' },
  { id: 's2', name: 'Linear',        url: 'linear.app/careers',       jobs: 18, active: true, lastSync: '2m ago' },
  { id: 's3', name: 'Daangn Team',   url: 'team.daangn.com',          jobs: 26, active: true, lastSync: '5m ago' },
  { id: 's4', name: 'Coupang Jobs',  url: 'coupang.jobs',             jobs: 128, active: true, lastSync: '12m ago' },
  { id: 's5', name: 'Vercel',        url: 'vercel.com/careers',       jobs: 14, active: true, lastSync: '1h ago' },
  { id: 's6', name: 'Kakao Careers', url: 'careers.kakao.com',        jobs: 87, active: false, lastSync: '2d ago' },
  { id: 's7', name: 'Stripe',        url: 'stripe.com/jobs',          jobs: 52, active: true, lastSync: '30m ago' },
  { id: 's8', name: 'Naver',         url: 'recruit.navercorp.com',    jobs: 104, active: true, lastSync: '45m ago' },
  { id: 's9', name: 'Figma',         url: 'figma.com/careers',        jobs: 22, active: true, lastSync: '1h ago' },
  { id: 's10', name: 'Wanted (dev)', url: 'wanted.co.kr/wdlist',      jobs: 380, active: true, lastSync: '8m ago' },
];

const MJ_STAGES = [
  { key: 'saved',     label: 'Saved',     count: 4, color: MJ_TOKENS.saved },
  { key: 'applied',   label: 'Applied',   count: 3, color: MJ_TOKENS.applied },
  { key: 'interview', label: 'Interview', count: 2, color: MJ_TOKENS.interview },
  { key: 'offer',     label: 'Offer',     count: 1, color: MJ_TOKENS.offer },
  { key: 'rejected',  label: 'Archived',  count: 2, color: MJ_TOKENS.rejected },
];

// Profile / resume
const MJ_PROFILE = {
  name: '김준호',
  nameEn: 'Junho Kim',
  role: 'Senior Frontend Engineer',
  years: 6,
  location: 'Seoul, Korea · Open to Remote',
  stack: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Node.js'],
  interests: ['Design Systems', 'Developer Tools', 'Product Engineering'],
  salaryMin: 9000,
  salaryMax: 13000,
  employment: ['정규직', 'Full-time Remote'],
  companies: ['Naver Pay (2021–now)', 'Kakao (2019–2021)', 'Woowa Bros. (2018–2019)'],
  avatarInitial: 'J',
  status: 'Passive — open to strong opportunities',
  passive: true,
};

// Placeholder SVG pattern (subtle stripes)
const MJ_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><defs><pattern id="p" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="rgba(0,0,0,0.05)" stroke-width="3"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`
);

// Small icon helpers — just tiny SVGs
function MJIcon({ name, size = 14, stroke = 'currentColor' }) {
  const common = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    search: <><circle cx="7" cy="7" r="5"/><path d="M14 14l-3-3"/></>,
    bookmark: <path d="M4 2h8v12l-4-3-4 3z"/>,
    bookmarkFilled: <path d="M4 2h8v12l-4-3-4 3z" fill={stroke} stroke="none"/>,
    plus: <><path d="M8 3v10M3 8h10"/></>,
    filter: <path d="M2 3h12M4 8h8M6 13h4"/>,
    arrowRight: <path d="M3 8h10M9 4l4 4-4 4"/>,
    arrowUp: <path d="M8 13V3M4 7l4-4 4 4"/>,
    arrowDown: <path d="M8 3v10M4 9l4 4 4-4"/>,
    external: <><path d="M10 2h4v4"/><path d="M14 2L7 9"/><path d="M12 9v5H2V4h5"/></>,
    check: <path d="M3 8l3 3 7-7"/>,
    dot: <circle cx="8" cy="8" r="2" fill={stroke}/>,
    bell: <><path d="M4 11V7a4 4 0 118 0v4l1 2H3z"/><path d="M6 13a2 2 0 004 0"/></>,
    settings: <><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"/></>,
    briefcase: <><rect x="2" y="5" width="12" height="9" rx="1"/><path d="M6 5V3h4v2"/></>,
    pin: <><path d="M8 14s-4-4.5-4-8a4 4 0 118 0c0 3.5-4 8-4 8z"/><circle cx="8" cy="6" r="1.5"/></>,
    spark: <path d="M8 1v4M8 11v4M1 8h4M11 8h4M3 3l3 3M10 10l3 3M3 13l3-3M10 6l3-3"/>,
    clock: <><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></>,
    close: <path d="M4 4l8 8M12 4l-8 8"/>,
    link: <><path d="M7 9l2-2M10 5l1-1a2.8 2.8 0 014 4l-2 2"/><path d="M9 11l-2 2a2.8 2.8 0 01-4-4l1-1"/></>,
    refresh: <><path d="M3 8a5 5 0 019-3l1 1"/><path d="M13 3v3h-3"/><path d="M13 8a5 5 0 01-9 3l-1-1"/><path d="M3 13v-3h3"/></>,
    menu: <path d="M2 4h12M2 8h12M2 12h12"/>,
  };
  return <svg {...common}>{paths[name] || paths.dot}</svg>;
}

// Subtle striped image placeholder used when we'd otherwise be drawing SVG art
function MJPlaceholder({ label = 'logo', w = 40, h = 40, rounded = 6, dark = false }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: rounded,
      background: dark ? 'oklch(0.25 0.01 265)' : MJ_TOKENS.bgAlt,
      backgroundImage: `url("${MJ_PLACEHOLDER}")`,
      backgroundSize: '12px 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: MJ_FONTS.mono, fontSize: Math.max(9, Math.min(11, w / 4)),
      color: dark ? 'oklch(0.75 0.01 265)' : MJ_TOKENS.textSoft,
      border: `1px solid ${MJ_TOKENS.line}`, flexShrink: 0,
    }}>{label}</div>
  );
}

Object.assign(window, { MJ_TOKENS, MJ_FONTS, MJ_JOBS, MJ_SOURCES, MJ_STAGES, MJ_PROFILE, MJ_PLACEHOLDER, MJIcon, MJPlaceholder });
