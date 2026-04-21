# MyJob

> 내가 원하는 조건의 채용공고만 자동으로 모아주는 개인용 수집 서비스.

여러 채용 사이트에서 공고를 긁어와 하나의 리스트로 보여주고, 저장·지원·면접·오퍼 단계를 트래킹합니다.
프로필 기반 매칭 점수로 우선순위를 매겨주고, 본문 키워드 필터로 실제 관심 있는 공고만 남깁니다.

현재 지원 사이트: **CJ Careers** ([recruit.cj.net](https://recruit.cj.net/))
기본 설정: **경력 / IT / 서울 / 본문에 "Java" 포함** → 16건 수집 중 (2026-04-22 기준)

---

## 실행

```bash
cd app
npm install
npx prisma db push         # 스키마 → DB 동기화 (prisma/dev.db 생성)
npx tsx scripts/seed.ts    # Profile + CJ 소스 기본 설정 seed
npx tsx scripts/crawl.ts   # 첫 크롤 (목록 필터링 + 상세 본문 fetch)
npm run dev                # http://localhost:3000
```

프로덕션 빌드:

```bash
npm run build && npm start
```

---

## 화면 구성

샘플 `MyJob Minimal.html` 의 레이아웃을 Next.js로 이식. 5개 라우트 + 오른쪽 Drawer 상세.

| 경로 | 내용 |
|------|------|
| `/` (**For you**) | 수집된 공고 전체 리스트. 제목·회사·직무·위치 검색, `match / recent / deadline` 정렬, 진행중만 토글, 회사별 칩 필터. 상단 **Refresh** 로 즉시 크롤. |
| `/saved` | 북마크한 공고 |
| `/applications` | Saved / Applied / Interview / Offer 칸반 보드 |
| `/sources` | 크롤 소스 관리 — 스위치 on/off, adapter별 **필터/키워드 편집 패널**, 수동 Crawl, 삭제 |
| `/profile` | 이름/역할/스택/관심사/지역 편집. "저장 + 전체 재계산" 으로 이미 수집된 공고의 매치 점수를 다시 계산 |

상세 Drawer: 매치 점수/근거, 스테이지 버튼 (Saved → Applied → Interview → Offer → Rejected), 메모, 원문 링크, 수집 시각.

---

## 아키텍처

```
┌─ Next.js (App Router) ─────────────────────────────────────┐
│                                                            │
│   UI (src/app/*, src/ui/*)                                 │
│      │ SWR (30s polling)                                   │
│      ▼                                                     │
│   /api/jobs, /api/sources, /api/profile,                   │
│   /api/crawl, /api/stats                                   │
│      │                                                     │
│      ▼                                                     │
│   src/lib/crawl.ts  ──▶  src/lib/crawlers/<adapter>.ts     │
│      │                         │                           │
│      │                         ▼  fetch(config) → Normalized│
│      │                    외부 채용 사이트 API/HTML         │
│      ▼                                                     │
│   Prisma Client ──▶ SQLite (prisma/dev.db)                 │
└────────────────────────────────────────────────────────────┘
```

### 데이터 모델 ([prisma/schema.prisma](prisma/schema.prisma))

- **`Source`** — 크롤 대상. `adapter` 키 + `config` (JSON 문자열: 필터·키워드)
- **`Job`** — 수집된 공고. `(sourceId, externalId)` 유니크. 매 크롤마다 upsert 되고 이번 크롤에 안 나온 공고는 `closed=true` 로 마킹
- **`Profile`** — 단일 사용자 프로필 (id=1 고정). 매칭 점수 계산용 입력

### 크롤 파이프라인 ([src/lib/crawl.ts](src/lib/crawl.ts))

1. `Source.config` JSON 파싱 → adapter에 전달
2. `adapter.fetch(config)` 가 리스트 크롤 + 필터 + (선택) 상세 크롤 후 `NormalizedJob[]` 반환
3. 각 공고에 대해 **upsert** (existing → update, else → insert)
4. 프로필과의 **매치 점수 재계산** 및 저장 (스택×5, 관심사×3, 지역×2)
5. 이번 응답에 **없는** 기존 공고는 `closed=true` 처리 (필터에서 빠졌거나 사이트에서 내려간 것)
6. `Source.lastSyncAt` / `lastError` 업데이트

### 어댑터 인터페이스 ([src/lib/types.ts](src/lib/types.ts))

```ts
interface CrawlerAdapter {
  key: string;                          // "cj_recruit"
  name: string;                         // "CJ Careers"
  configSchema?: AdapterConfigSchema;   // Sources UI 자동 생성 (multi / keywords)
  fetch(config: AdapterConfig): Promise<NormalizedJob[]>;
}
```

`configSchema` 를 정의하면 **Sources 페이지에 필터 편집 UI가 자동 렌더**됩니다. 어댑터 코드만 추가하면 UI 없이 설정 가능.

---

## CJ Careers 어댑터 상세 ([src/lib/crawlers/cj_recruit.ts](src/lib/crawlers/cj_recruit.ts))

공식 내부 API를 리버스 엔지니어링해 사용 (HTML 스크래핑 최소화).

| 단계 | 엔드포인트 | 용도 |
|------|------------|------|
| 목록 | `POST /recruit/ko/recruit/recruit/searchNewGonggoList.fo` | JSON 응답. `arrGubun / arrRecJob / arrRecArea` 로 서버측 필터링 |
| 상세 | `GET /recruit/ko/recruit/recruit/{detail,bestDetail}.fo?zz_jo_num=<id>` | HTML. 리스트의 `gubun` 필드에 따라 URL 선택 (`gubun=2` → `bestDetail`) |

### 기본 설정

```json
{
  "gubun":   ["B"],                    // 경력
  "recJob":  ["IR"],                   // IT
  "recArea": ["KR11"],                 // 서울
  "descriptionIncludes": ["Java"]      // 본문에 이 키워드 모두 포함해야 통과
}
```

- `gubun / recJob / recArea` 는 리스트 API에 `-@-` 로 이어 붙여 전달 → **서버단 필터링**
- `descriptionIncludes` 는 리스트 통과한 공고에 대해서만 상세 페이지 fetch 후 **word-boundary** 매칭 (e.g. `Java` 키워드가 `JavaScript` 에 false-match 되지 않도록)
- 코드 테이블(채용구분/직무/지역)은 어댑터 안에 내장되어 Sources UI에서 드롭다운으로 보여줌

### 파싱 주의점

CJ 상세 페이지는 `<p class="contents"><p>...본문...</p></p>` 처럼 `<p>` 가 중첩되어 있어 HTML5 파서가 outer `<p>` 를 자동으로 닫아버립니다. 결과적으로 `p.contents.text()` 는 **빈 문자열**을 반환. 그래서 어댑터는 `<li>` 를 클론해 `h3/svg/script/style` 만 제거한 뒤 전체 텍스트를 뽑습니다.

---

## 매칭 점수

단순하고 투명한 키워드 중첩 방식 ([src/lib/match.ts](src/lib/match.ts)):

```
score = min(100, hits / max_possible * 100)

stack     항목 × 5점
interests 항목 × 3점
locations 항목 × 2점
```

Profile 페이지에서 키워드를 추가하면 그 다음 크롤부터 반영됩니다. 이미 수집된 공고를 즉시 재점수화하려면 **"저장 + 전체 재계산"** 버튼 (내부적으로 프로필 저장 후 전체 크롤 재실행).

LLM 기반 매칭으로 확장하려면 `scoreJob()` 을 교체하거나 크롤 시 호출되는 지점 ([crawl.ts](src/lib/crawl.ts)) 에서 대안 구현을 호출하세요.

---

## 새 사이트 추가

1. **어댑터 작성** — `src/lib/crawlers/<key>.ts` 에 `CrawlerAdapter` 구현
2. **등록** — `src/lib/crawlers/index.ts` 의 `adapters` 맵에 추가
3. **설정 스키마 (선택)** — `configSchema` 를 넘기면 Sources UI가 자동으로 필터 편집 패널 생성
   - `type: 'multi'` → 체크박스 토글
   - `type: 'keywords'` → 자유 입력 칩
4. **소스 등록** — `/sources` 에서 adapter 선택 → Add source → Edit 패널로 필터 설정 → Crawl

규약:
- `externalId` 는 해당 사이트에서 공고를 고유하게 식별하는 값 (URL에 들어가는 ID 등)
- 빈 본문을 반환해야 하는 경우엔 `description: null` (키워드 필터 쓸 때는 skip)
- throttling 필요시 어댑터 내부에서 `await sleep(ms)` — 상위 파이프라인은 관여하지 않음

---

## 프로젝트 레이아웃

```
app/
├ prisma/
│  ├ schema.prisma           # Source / Job / Profile
│  └ dev.db                  # SQLite (gitignored)
├ scripts/
│  ├ seed.ts                 # 기본 Profile + CJ 소스 생성
│  └ crawl.ts                # 모든 active 소스 크롤 실행 (cron/CLI용)
├ src/
│  ├ app/
│  │  ├ layout.tsx, globals.css
│  │  ├ page.tsx             # /  (For you)
│  │  ├ saved/page.tsx
│  │  ├ applications/page.tsx
│  │  ├ sources/page.tsx
│  │  ├ profile/page.tsx
│  │  └ api/
│  │     ├ jobs/{route.ts, [id]/route.ts}
│  │     ├ sources/{route.ts, [id]/route.ts}
│  │     ├ profile/route.ts
│  │     ├ crawl/route.ts    # POST → 전체 또는 ?sourceId= 단일 크롤
│  │     └ stats/route.ts
│  ├ lib/
│  │  ├ db.ts                # Prisma singleton
│  │  ├ types.ts             # Crawler / Config 타입
│  │  ├ match.ts             # 매칭 점수
│  │  ├ crawl.ts             # upsert + closed 판정
│  │  └ crawlers/
│  │     ├ index.ts          # adapter registry
│  │     └ cj_recruit.ts     # CJ Careers
│  └ ui/
│     ├ tokens.ts            # 샘플 디자인 토큰 이식
│     ├ Icon.tsx, Placeholder.tsx
│     ├ Shell.tsx            # TopBar + Sidebar + Refresh 버튼
│     ├ JobRow.tsx           # 테이블 행
│     └ JobDetailDrawer.tsx  # 우측 상세 패널
├ next.config.mjs, tsconfig.json
└ package.json
```

---

## 앞으로

- 자동 스케줄링 (vercel.json cron 또는 `node-cron` 기반 워커)
- 어댑터: 원티드 / 잡코리아 / 사람인 / Greenhouse·Lever 범용
- 본문 매칭 고도화 (Claude API 호출, embedding 기반 semantic match)
- 이력서 업로드 → 자동 스택 추출
- 공고 변경 감지 (제목·마감일이 바뀐 경우 diff 알림)
- Slack/이메일 push (새 D-3 공고, 매치 80+ 공고)

---

## 개발 메모

- **DB 경로**: `DATABASE_URL="file:./dev.db"` 는 `schema.prisma` 기준 상대경로로 해석됨 → 실제 파일 `app/prisma/dev.db`
- **서버 포트**: 3000 점유 시 `npx next dev -p 3001`
- **Prisma 타입 재생성**: 스키마 변경시 `npx prisma db push` 가 `generate` 까지 자동 실행. 수동으로는 `npx prisma generate`
- **Node 버전**: ESM 모듈 구동을 위해 Node 20+ 권장 (현재 24에서 테스트됨)
