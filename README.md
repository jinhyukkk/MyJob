# MyJob

개인용 채용공고 수집·트래킹 서비스. **Next.js 14 App Router + Prisma(SQLite) + 어댑터형 크롤러.**

현재 지원 사이트: **CJ Careers** ([recruit.cj.net](https://recruit.cj.net/))
기본 정책: `경력 / IT / 서울 / 본문에 "Java" 포함` (word-boundary 매치)

---

## 1. 빠른 시작 (fresh clone)

```bash
git clone https://github.com/jinhyukkk/MyJob.git
cd MyJob
npm install
npx prisma db push         # 스키마 → ./prisma/dev.db 생성
npx tsx scripts/seed.ts    # 기본 Profile + CJ 소스 (config 포함) 주입
npx tsx scripts/crawl.ts   # 실제 크롤 실행 (16건 내외)
npm run dev                # http://localhost:3000
```

**요구사항**
- Node **20+** (전역 `fetch` 필요, Node 24 테스트됨)
- 네트워크에서 `recruit.cj.net` 접근 가능

**절대 지켜야 할 것**
- 모든 명령은 **리포 루트(`MyJob/`)에서 실행**. `DATABASE_URL="file:./dev.db"`는 `prisma/schema.prisma` 기준 상대경로라 다른 디렉터리에서 실행하면 DB 파일 위치가 어긋남.

---

## 2. 리포지토리 레이아웃

| 경로 | 역할 | AI가 처음 봐야 할 순서 |
|------|------|----------------------|
| `prisma/schema.prisma` | DB 모델 3개 (Source/Job/Profile) | ① |
| `src/lib/types.ts` | `CrawlerAdapter`, `AdapterConfigSchema`, `NormalizedJob` 인터페이스 | ② |
| `src/lib/crawlers/cj_recruit.ts` | CJ 어댑터 구현 — 레퍼런스 구현체 | ③ |
| `src/lib/crawl.ts` | 공통 파이프라인 (upsert + closed 감지 + 점수 재계산) | ④ |
| `src/lib/match.ts` | 매칭 점수 공식 | ⑤ |
| `src/app/api/*` | REST 엔드포인트 | ⑥ |
| `src/app/**/page.tsx` | 5개 라우트 UI | ⑦ |
| `src/ui/*` | 재사용 컴포넌트 (Shell/Icon/JobRow/DetailDrawer) | ⑧ |
| `scripts/seed.ts` | 기본 Profile + CJ 소스 seed (idempotent) | - |
| `scripts/crawl.ts` | CLI 크롤 실행 (cron 연결용) | - |
| `sample/` | 원본 React 프로토타입 (참고용, 빌드에 포함 안 됨) | - |

---

## 3. 데이터 모델 ([prisma/schema.prisma](prisma/schema.prisma))

```
Source (크롤 소스)
  id         cuid
  name       string       # 표시명
  adapter    string       # 어댑터 키 (e.g. "cj_recruit")
  url        string       # 참조용 URL
  active     bool
  config     string       # JSON 문자열: 어댑터 필터·키워드
  lastSyncAt DateTime?
  lastError  string?
  └─ jobs: Job[]

Job (수집된 공고)
  id             cuid
  sourceId       → Source
  externalId     string   # 사이트의 공고 고유 ID
  title, company, team, location, type, level, category
  url            string   # 원문 링크
  description    string?  # 상세 본문 (키워드 필터용)
  postedAt       DateTime?
  deadlineAt     DateTime?
  deadlineLabel  string?  # "2026.05.03"
  ddayLabel      string?  # "D-12" | "상시" | "마감"
  raw            string   # adapter가 받은 원본 JSON
  firstSeenAt, lastSeenAt DateTime
  closed         bool     # 이번 크롤에 안 나타나면 true
  saved, applied bool
  stage          string?  # Saved | Applied | Interview | Offer | Rejected
  note           string?
  match          int      # 0-100 매칭 점수
  matchReasons   string?  # JSON array
  UNIQUE(sourceId, externalId)

Profile (단일 사용자, id=1 고정)
  name, role       string
  stack            JSON string[]   # 가중치 5
  interests        JSON string[]   # 가중치 3
  locations        JSON string[]   # 가중치 2
  salaryMin/Max    int?
  passive          bool
```

---

## 4. 크롤 파이프라인 ([src/lib/crawl.ts](src/lib/crawl.ts))

`crawlSource(sourceId)` 가 호출되면:

```
1. Source 로드 + Source.config JSON 파싱
2. adapter.fetch(config) → NormalizedJob[]
3. Profile 로드 → stack/interests/locations 추출
4. 각 NormalizedJob 에 대해:
     - (sourceId, externalId) 존재하면 UPDATE (description/fields/match)
     - 없으면 INSERT
     - match 점수는 scoreJob(profile, job) 로 매번 재계산
5. adapter 응답에 **없는** 기존 Job 은 closed = true 로 마킹
6. Source.lastSyncAt 갱신, 에러는 Source.lastError 에 기록
```

**트리거 방법**
- UI 우상단 **Refresh** 버튼 → `POST /api/crawl`
- `/sources` 개별 소스 **Crawl** 버튼 → `POST /api/crawl?sourceId=<id>`
- CLI: `npx tsx scripts/crawl.ts` (모든 active 소스)

---

## 5. 어댑터 계약 ([src/lib/types.ts](src/lib/types.ts))

```ts
interface CrawlerAdapter {
  key: string;                          // 예: "cj_recruit"
  name: string;                         // 예: "CJ Careers"
  configSchema?: AdapterConfigSchema;   // Sources UI 자동 생성
  fetch(config: AdapterConfig): Promise<NormalizedJob[]>;
}

type AdapterConfigField =
  | { key, label, type: "multi",    options: { value, label }[] }
  | { key, label, type: "keywords", placeholder?: string };
```

어댑터는 **`fetch()` 안에서 필터링·throttling·상세 fetch를 모두 책임**. 상위 파이프라인은 결과만 받음.

---

## 6. CJ Careers 어댑터 ([src/lib/crawlers/cj_recruit.ts](src/lib/crawlers/cj_recruit.ts))

### 엔드포인트

| 종류 | 메서드 | URL | 포맷 |
|------|--------|-----|------|
| 목록 | POST | `/recruit/ko/recruit/recruit/searchNewGonggoList.fo` | `application/x-www-form-urlencoded` → JSON |
| 상세 | GET | `/recruit/ko/recruit/recruit/{detail\|bestDetail}.fo?zz_jo_num={id}` | HTML |

**detail vs bestDetail 분기**: 응답의 `gubun` 필드가 `"2"`면 `bestDetail.fo`, 그 외는 `detail.fo`. 두 URL은 같은 body를 반환하지만 실제 사이트 라우팅과 맞추면 원문 링크 UX가 일관됨.

### 목록 요청 파라미터

```
pageVal=1                  # 페이지 번호 (1-base)
pageIndex=100              # 페이지 크기
schArea=Y or N             # 필터 사용 여부 (아무 필터라도 있으면 Y)
arrGubun=B                 # 채용구분, -@- 로 multi-value 조인
arrRecBu=                  # 주관사
arrRecJob=IR               # 직무
arrRecArea=KR11            # 지역
sch_title=                 # 제목 검색
orderDesc=
```

### 내장 코드 테이블 (Sources UI 드롭다운 소스)

| 필드 | 키 | 값 |
|------|----|----|
| 채용구분 (`arrGubun`) | `A`/`B`/`C`/`Z` | 신입/경력/인턴/기타 |
| 직무 (`arrRecJob`) | `AA`/`AB`/`AC`/`AD`/`BE`/`CF`/`DG`/`EI`/`EJ`/`EK`/`FM`/`GN`/`HP`/**`IR`**/`JS`/`KT` | 인사/사업관리/전략/경영지원/영업/마케팅/서비스/콘텐츠제작/콘텐츠사업/콘텐츠기술/제조/건설개발/연구개발/**IT**/디자인/물류 |
| 지역 (`arrRecArea`) | `KR00`/**`KR11`**/`KR26`/`KR27`/`KR28`/`KR29`/`KR30`/`KR31` | 전국/**서울**/부산/대구/인천/광주/대전/울산 |

### 알려진 quirk

CJ 상세 페이지는 `<p class="contents"><p>...본문...</p></p>` 처럼 `<p>`가 중첩됨. HTML5 파서가 outer `<p>`를 자동으로 닫아 `p.contents.text()` 가 **빈 문자열**을 반환함. 대응:

```ts
// li 를 clone → h3/svg/script/style 제거 → 전체 text()
```

이 방식으로 중첩 DOM과 무관하게 본문 확보.

---

## 7. Source.config 스키마 (CJ 어댑터)

```jsonc
{
  "gubun":   ["B"],           // 채용구분 코드 배열 (빈 배열 = 전체)
  "recJob":  ["IR"],          // 직무 코드 배열
  "recArea": ["KR11"],        // 지역 코드 배열
  "descriptionIncludes": ["Java"]   // 본문 키워드 (AND, word-boundary 매치)
}
```

**동작 순서**
1. `gubun/recJob/recArea` → CJ 목록 API에 그대로 전달 (서버측 필터링)
2. 목록 응답받은 각 공고 → 상세 페이지 fetch → 본문 추출
3. `descriptionIncludes`의 **모든 키워드**가 본문에 word-boundary 매치로 포함되어야 통과
4. ASCII 키워드(`Java`)는 `\bJava\b` 정규식 → `JavaScript` 에 false-match 안 됨
5. 한글 키워드는 plain substring 매치 (Hangul에서 `\b` 가 신뢰 불가)

**편집 방법**
- GUI: `/sources` → 해당 소스 **Edit** → 체크박스/칩 입력 → **설정 저장** → **Crawl**
- API: `PATCH /api/sources/:id` body `{ "config": { ... } }`
- JSON 직접 편집: `sqlite3 prisma/dev.db "UPDATE Source SET config='...' WHERE id=..."` 후 재크롤

---

## 8. 매칭 점수 ([src/lib/match.ts](src/lib/match.ts))

```
corpus = title + company + category + location + description   (lowercase)

max  = len(stack)*5 + len(interests)*3 + len(locations)*2
hits = Σ (스택 매치) * 5  +  Σ (관심사 매치) * 3  +  Σ (지역 매치) * 2

score = min(100, round(hits / max * 100))
reasons = 매치된 키워드별 이유 문자열 배열
```

점수는 크롤마다 재계산됨. Profile 페이지의 **"저장 + 전체 재계산"** 버튼은 프로필 저장 후 전체 크롤을 다시 실행 → 기존 공고까지 즉시 재점수화.

---

## 9. API 엔드포인트

| Method | Path | Body / Query | 반환 |
|--------|------|--------------|------|
| GET | `/api/stats` | — | 공고·소스 카운터 + lastSyncAt |
| GET | `/api/jobs` | `?q=&scope=all\|saved\|applied\|active&company=&sort=match\|recent\|deadline` | `{ jobs[], count }` |
| GET | `/api/jobs/:id` | — | `{ job }` (source relation 포함) |
| PATCH | `/api/jobs/:id` | `{ saved?, applied?, stage?, note? }` | 업데이트된 `{ job }` |
| GET | `/api/sources` | — | `{ sources[], adapters[] }` (adapters 에 configSchema 포함) |
| POST | `/api/sources` | `{ name, adapter, url, active? }` | 생성된 `{ source }` |
| PATCH | `/api/sources/:id` | `{ active?, name?, url?, config? }` (`config` 는 object 또는 JSON string) | `{ source }` |
| DELETE | `/api/sources/:id` | — | `{ ok: true }` (cascade로 Job도 삭제) |
| POST | `/api/crawl` | `?sourceId=<id>` (옵션) | `{ results: CrawlResult[] }` |
| GET | `/api/profile` | — | `{ profile }` (없으면 auto-create) |
| PATCH | `/api/profile` | `{ name?, role?, stack?, interests?, locations?, salaryMin?, salaryMax?, passive? }` | `{ profile }` |

---

## 10. UI 라우트

| 경로 | 컴포넌트 | 기능 |
|------|----------|------|
| `/` | [page.tsx](src/app/page.tsx) | **For you** — 전체 리스트, 검색, 회사 칩, 진행중 토글, match/recent/deadline 정렬 |
| `/saved` | [saved/page.tsx](src/app/saved/page.tsx) | 북마크 목록 |
| `/applications` | [applications/page.tsx](src/app/applications/page.tsx) | Saved/Applied/Interview/Offer 칸반 |
| `/sources` | [sources/page.tsx](src/app/sources/page.tsx) | 소스 CRUD + **configSchema 기반 자동 편집 UI** + Crawl 트리거 |
| `/profile` | [profile/page.tsx](src/app/profile/page.tsx) | 프로필 편집 + 전체 재점수화 |

공통 Shell: [src/ui/Shell.tsx](src/ui/Shell.tsx) — 상단바 + 좌측 네비 + Refresh + 크롤 상태 배지
상세 Drawer: [src/ui/JobDetailDrawer.tsx](src/ui/JobDetailDrawer.tsx) — 우측 슬라이드. stage 변경, 메모, 매치 근거.

SWR 자동 폴링: stats 30s, 개별 리스트 60s. 크롤 후 `mutate()` 수동 갱신.

---

## 11. 새 어댑터 추가 체크리스트

신규 사이트 지원 시 **어댑터 파일 1개 + 레지스트리 1줄**만 건드리면 됨. 기타 시스템은 config 스키마를 읽어 자동 대응.

- [ ] `src/lib/crawlers/<key>.ts` 생성, `CrawlerAdapter` 구현
  - `key`, `name` 설정
  - `fetch(config)` 에서 목록 → (필요시) 상세 → `NormalizedJob[]` 반환
  - 필터 UI 원하면 `configSchema` 정의
  - 상세 페이지 fetch 시 `await sleep(150~300ms)` throttling
  - 에러는 throw (상위에서 `Source.lastError` 에 기록됨)
- [ ] `src/lib/crawlers/index.ts` 의 `adapters` 맵에 추가
- [ ] `/sources` 페이지에서 Add source → 어댑터 선택 → config 편집 → Crawl
- [ ] 한번 크롤해서 `raw` 필드에 실제 응답 저장되는지 확인 → 필드 매핑 교정

**NormalizedJob 필드 규약**
```ts
{
  externalId: string,   // 해당 사이트의 공고 고유 ID (URL 해시 금지)
  title, company: string,
  url: string,          // 원문 링크 (detail 페이지)
  description?: string, // 키워드 필터 쓰려면 필수
  postedAt?, deadlineAt?: Date,
  deadlineLabel?: string,  // 사이트 표기 그대로
  ddayLabel?: string,      // "D-3" | "상시" | "마감"
  raw: unknown,         // 원본 보존
  ...
}
```

---

## 12. 운영 / 트러블슈팅

| 증상 | 원인 / 해결 |
|------|------------|
| `prisma/dev.db` 가 없음 | `npx prisma db push` 실행. seed 전에 반드시. |
| `Table Job does not exist` | 리포 루트가 아닌 곳에서 명령 실행함. `cd MyJob` 후 재시도. |
| 크롤 `HTTP 4xx/5xx` | CJ 사이트 구조 변경 가능성. `curl -X POST .../searchNewGonggoList.fo` 로 직접 호출해 응답 확인. |
| description 이 비어 있음 | 상세 페이지 DOM 변경 가능성. [cj_recruit.ts `fetchDetailText`](src/lib/crawlers/cj_recruit.ts) 의 li-text 로직 확인. |
| "Java" 키워드인데 예상 공고가 빠짐 | word-boundary 매치라 `JavaScript` 는 제외됨. 원하면 `configSchema` 매칭 로직을 substring 으로 완화. |
| 크롤 후 `closed` 공고가 급증 | 필터를 새로 좁히면 기존에 매치되던 공고가 전부 사라지므로 정상. `/` 의 "진행중만" 필터로 숨겨짐. |
| Prisma 타입이 최신 아님 | 스키마 수정 후 `npx prisma db push` 자동 `generate`. 수동은 `npx prisma generate`. |
| 서버 포트 충돌 | `npx next dev -p 3001` |

---

## 13. 향후 확장 지점

- **스케줄링**: `scripts/crawl.ts` 를 cron 으로 연결 (`0 */2 * * * cd /path/to/MyJob && npx tsx scripts/crawl.ts`) 또는 Vercel Cron / node-cron 기반 워커
- **신규 어댑터**: 원티드·잡코리아·사람인·링크드인·Greenhouse·Lever
- **매칭 고도화**: `scoreJob()` 를 LLM (Claude API) 호출로 교체. 프롬프트 캐싱 적극 사용
- **이력서 업로드**: PDF → Claude API 로 스택/경력 추출해 Profile 자동 채우기
- **변경 감지**: 제목·마감일 diff → 알림
- **푸시 알림**: 매치 80+ 또는 D-3 공고 Slack/이메일
