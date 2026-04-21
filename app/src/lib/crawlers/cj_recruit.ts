import * as cheerio from 'cheerio';
import type {
  AdapterConfig,
  AdapterConfigSchema,
  CrawlerAdapter,
  NormalizedJob,
} from '../types';

type CJRow = {
  zz_jo_num: string;
  zz_title: string;
  many_lng_zz_title?: string;
  compnm: string;
  location_cd_nm?: string | null;
  job_cd_nm?: string | null;
  zz_str_dt?: number | null;
  zz_str_dt_str?: string | null;
  zz_end_dt?: number | null;
  zz_end_dt_str?: string | null;
  dday?: number | string | null;
  zz_close_yn?: string;
  zz_open_yn?: string;
  tot_cnt?: number;
  zz_new_time?: number;
  zz_target_1?: string;
  gubun?: string | null;
};

const LIST_URL =
  'https://recruit.cj.net/recruit/ko/recruit/recruit/searchNewGonggoList.fo';
const DETAIL_URL_PLAIN = (id: string) =>
  `https://recruit.cj.net/recruit/ko/recruit/recruit/detail.fo?zz_jo_num=${encodeURIComponent(id)}`;
const DETAIL_URL_BEST = (id: string) =>
  `https://recruit.cj.net/recruit/ko/recruit/recruit/bestDetail.fo?direct=N&zz_jo_num=${encodeURIComponent(id)}`;
// The `gubun` field in list response decides which detail URL the site itself
// navigates to. Both URLs return the same body, but mirroring the real routing
// keeps "원문 보기" links consistent with the live site.
function detailUrlFor(row: { zz_jo_num: string; gubun?: string | null }): string {
  const id = String(row.zz_jo_num);
  return row.gubun === '2' ? DETAIL_URL_BEST(id) : DETAIL_URL_PLAIN(id);
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 MyJob/0.1';

// CJ filter code tables (extracted from the live list page)
const GUBUN_OPTIONS = [
  { value: 'A', label: '신입' },
  { value: 'B', label: '경력' },
  { value: 'C', label: '인턴' },
  { value: 'Z', label: '기타' },
];

const JOB_OPTIONS = [
  { value: 'AA', label: '인사' },
  { value: 'AB', label: '사업관리/재무' },
  { value: 'AC', label: '전략' },
  { value: 'AD', label: '경영지원' },
  { value: 'BE', label: '영업' },
  { value: 'CF', label: '마케팅' },
  { value: 'DG', label: '서비스' },
  { value: 'EI', label: '콘텐츠제작' },
  { value: 'EJ', label: '콘텐츠사업' },
  { value: 'EK', label: '콘텐츠기술' },
  { value: 'FM', label: '제조' },
  { value: 'GN', label: '건설/개발' },
  { value: 'HP', label: '연구개발' },
  { value: 'IR', label: 'IT' },
  { value: 'JS', label: '디자인' },
  { value: 'KT', label: '물류' },
];

const AREA_OPTIONS = [
  { value: 'KR00', label: '전국' },
  { value: 'KR11', label: '서울' },
  { value: 'KR26', label: '부산' },
  { value: 'KR27', label: '대구' },
  { value: 'KR28', label: '인천' },
  { value: 'KR29', label: '광주' },
  { value: 'KR30', label: '대전' },
  { value: 'KR31', label: '울산' },
];

const configSchema: AdapterConfigSchema = {
  fields: [
    { key: 'gubun',   label: '채용구분', type: 'multi', options: GUBUN_OPTIONS },
    { key: 'recJob',  label: '직무',     type: 'multi', options: JOB_OPTIONS },
    { key: 'recArea', label: '지역',     type: 'multi', options: AREA_OPTIONS },
    {
      key: 'descriptionIncludes',
      label: '본문 포함 키워드 (AND)',
      type: 'keywords',
      placeholder: '예: Java, Spring',
    },
  ],
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && x.length > 0);
}

async function fetchPage(
  page: number,
  pageSize: number,
  filters: { gubun: string[]; recJob: string[]; recArea: string[] },
): Promise<{ rows: CJRow[]; total: number }> {
  const hasFilter =
    filters.gubun.length > 0 || filters.recJob.length > 0 || filters.recArea.length > 0;
  const body = new URLSearchParams({
    pageVal: String(page),
    pageIndex: String(pageSize),
    schArea: hasFilter ? 'Y' : 'N',
    arrGubun: filters.gubun.join('-@-'),
    arrRecBu: '',
    arrRecJob: filters.recJob.join('-@-'),
    arrRecArea: filters.recArea.join('-@-'),
    sch_title: '',
    orderDesc: '',
  });
  const res = await fetch(LIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': UA,
      Referer:
        'https://recruit.cj.net/recruit/ko/recruit/recruit/list.fo',
    },
    body,
  });
  if (!res.ok) throw new Error(`CJ list HTTP ${res.status}`);
  const data = (await res.json()) as {
    ds_newRecruitList?: CJRow[] | null;
  };
  const rows = data.ds_newRecruitList ?? [];
  const total = rows.length > 0 ? Number(rows[0].tot_cnt ?? rows.length) : 0;
  return { rows, total };
}

async function fetchDetailText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: 'https://recruit.cj.net/' },
  });
  if (!res.ok) throw new Error(`CJ detail HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const parts: string[] = [];
  // CJ nests <p> inside <p class="contents"> which HTML5 auto-closes during parse,
  // so `p.contents`.text() comes up empty. Read text of each <li> with the heading
  // removed to recover the full body regardless of that DOM quirk.
  $('ul.detail-list > li').each((_, li) => {
    const $li = $(li);
    const title = $li.find('h3.tit').text().replace(/\s+/g, ' ').trim();
    const $copy = $li.clone();
    $copy.find('h3.tit, svg, script, style').remove();
    const body = $copy.text().replace(/\s+/g, ' ').trim();
    if (title || body) parts.push(`## ${title}\n${body}`);
  });
  return parts.join('\n\n');
}

function parseYmd(s?: string | null): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function ddayLabel(d: CJRow['dday']): string | null {
  if (d == null) return null;
  const n = Number(d);
  if (!Number.isFinite(n)) return null;
  if (n >= 9999) return '상시';
  if (n < 0) return '마감';
  if (n === 0) return 'D-DAY';
  return `D-${n}`;
}

function normalize(row: CJRow, description: string | null): NormalizedJob {
  const posted = row.zz_str_dt ? new Date(row.zz_str_dt) : parseYmd(row.zz_str_dt_str);
  const deadline = row.zz_end_dt ? new Date(row.zz_end_dt) : parseYmd(row.zz_end_dt_str);
  const level =
    row.zz_target_1 === 'A' ? '신입'
    : row.zz_target_1 === 'B' ? '경력'
    : row.zz_target_1 === 'C' ? '인턴'
    : null;
  return {
    externalId: String(row.zz_jo_num),
    title: row.many_lng_zz_title || row.zz_title,
    company: row.compnm,
    team: null,
    location: row.location_cd_nm ?? null,
    type: null,
    level,
    category: row.job_cd_nm ?? null,
    url: detailUrlFor(row),
    postedAt: posted,
    deadlineAt: deadline,
    deadlineLabel: row.zz_end_dt_str ?? null,
    ddayLabel: ddayLabel(row.dday),
    description,
    raw: row,
  };
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Match a keyword against a haystack. If the keyword is an ASCII token
 * (letters/digits/+#.), require word boundaries so "Java" doesn't match "JavaScript".
 * Non-ASCII (Korean) keywords use plain substring match since \b doesn't behave
 * well across Hangul.
 */
function matchKeyword(haystack: string, kw: string): boolean {
  if (/^[\x00-\x7F]+$/.test(kw)) {
    const re = new RegExp(`(?:^|[^A-Za-z0-9+#.])${escapeRegExp(kw)}(?:$|[^A-Za-z0-9+#.])`, 'i');
    return re.test(haystack);
  }
  return haystack.toLowerCase().includes(kw.toLowerCase());
}

export const cjRecruit: CrawlerAdapter = {
  key: 'cj_recruit',
  name: 'CJ Careers',
  configSchema,
  async fetch(config: AdapterConfig): Promise<NormalizedJob[]> {
    const filters = {
      gubun: asStringArray(config.gubun),
      recJob: asStringArray(config.recJob),
      recArea: asStringArray(config.recArea),
    };
    const keywords = asStringArray(config.descriptionIncludes);
    const needDetail = keywords.length > 0;

    const pageSize = 100;
    const first = await fetchPage(1, pageSize, filters);
    const all: CJRow[] = [...first.rows];
    const total = first.total || first.rows.length;
    const pages = Math.ceil(total / pageSize);
    for (let p = 2; p <= pages; p++) {
      const next = await fetchPage(p, pageSize, filters);
      all.push(...next.rows);
      if (next.rows.length === 0) break;
    }

    const seen = new Set<string>();
    const unique = all.filter((r) => {
      const id = String(r.zz_jo_num);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const out: NormalizedJob[] = [];
    for (const row of unique) {
      let description: string | null = null;
      if (needDetail) {
        try {
          description = await fetchDetailText(detailUrlFor(row));
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.warn(`[cj] detail failed ${row.zz_jo_num}: ${msg}`);
          continue; // can't verify keyword match → skip
        }
        await sleep(150); // gentle throttling
        const haystack = `${row.zz_title} ${row.compnm} ${row.job_cd_nm ?? ''} ${description}`;
        const matchedAll = keywords.every((kw) => matchKeyword(haystack, kw));
        if (!matchedAll) continue;
      }
      out.push(normalize(row, description));
    }
    return out;
  },
};
