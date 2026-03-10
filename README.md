# Kanban Board

Next.js App Router 기반의 개인용 칸반 보드입니다.  
`To Do / In Progress / Done` 흐름으로 할 일을 관리하고, 드래그앤드롭으로 카드를 이동할 수 있습니다.

배포 URL: [https://wjdxodbs-kanban.vercel.app/](https://wjdxodbs-kanban.vercel.app/)

## 주요 기능

- 카드 추가/수정/삭제
- `@dnd-kit` 기반 드래그앤드롭 (웹 + 모바일 터치)
- 드래그 중 오버레이, 컬럼 간 이동, 실시간 재정렬
- Zustand + `persist`로 로컬스토리지 영속화
- 하이드레이션 상태 분리 및 스켈레톤 UI
- 일일 초기화 로직
  - 날짜가 바뀌면 `In Progress`, `Done` 카드를 `To Do`로 이동
  - 기본 시간대: `Asia/Seoul`
- 접근성/SEO 기본 구성
  - ARIA 속성, 진행률 `progressbar`
  - `robots.txt`, `sitemap.xml`, metadata
- PWA 기본 구성
  - `manifest.webmanifest`
  - 서비스워커 등록 및 오프라인 페이지(`/offline`)

## 기술 스택

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- Zustand
- dnd-kit

## 프로젝트 실행

```bash
pnpm install
pnpm dev
```

- 개발 서버: [http://localhost:3000](http://localhost:3000)

프로덕션 빌드:

```bash
pnpm build
pnpm start
```

## 환경 변수

선택적으로 아래 값을 설정할 수 있습니다.

- `NEXT_PUBLIC_SITE_URL`
  - `robots/sitemap` 생성 시 기준 URL
  - 예: `https://your-domain.com`
- `NEXT_PUBLIC_RESET_TIME_ZONE`
  - 일일 초기화 기준 시간대
  - 기본값: `Asia/Seoul`
  - 예: `Asia/Seoul`, `UTC`

## PWA 확인 방법

1. 브라우저에서 앱 접속
2. DevTools > Application > Manifest에서 Installability 확인
3. DevTools > Application > Service Workers에서 `sw.js` 활성화 확인
4. 주소창 설치 아이콘 또는 메뉴의 "앱 설치" 확인

## 폴더 구조

```text
kanban/
├─ app/                                # App Router 엔트리
│  ├─ layout.tsx                       # 전역 레이아웃 + metadata + SW 등록
│  ├─ page.tsx                         # 루트 페이지(kanban page re-export)
│  ├─ globals.css                      # 전역 스타일(드래그 커서 포함)
│  ├─ manifest.ts                      # PWA 매니페스트
│  ├─ robots.ts                        # robots.txt 생성
│  ├─ sitemap.ts                       # sitemap.xml 생성
│  └─ offline/
│     └─ page.tsx                      # 오프라인 fallback 페이지
│
├─ src/
│  ├─ pages/
│  │  └─ kanban/
│  │     ├─ index.ts                   # 페이지 배럴 export
│  │     └─ ui/
│  │        └─ kanban-page.tsx         # 화면 레이아웃(헤더/보드/진행바)
│  │
│  ├─ widgets/
│  │  ├─ kanban-board/
│  │  │  ├─ index.ts
│  │  │  └─ ui/
│  │  │     └─ kanban-board.tsx        # DndContext, 센서, DragOverlay, 이동 로직
│  │  └─ board-progress/
│  │     ├─ index.ts
│  │     └─ ui/
│  │        └─ board-progress-container.tsx  # 컬럼 카운트/진행률 표시
│  │
│  ├─ features/
│  │  ├─ add-card/
│  │  │  ├─ index.ts
│  │  │  └─ ui/
│  │  │     └─ add-card-button.tsx     # 카드 추가 다이얼로그
│  │  └─ edit-card/
│  │     ├─ index.ts
│  │     └─ ui/
│  │        └─ edit-card-dialog.tsx    # 카드 수정 다이얼로그
│  │
│  ├─ entities/
│  │  ├─ card/
│  │  │  └─ ui/
│  │  │     └─ card.tsx                # 카드 프리젠테이션(UI, 액션 버튼)
│  │  └─ column/
│  │     ├─ index.ts
│  │     └─ ui/
│  │        └─ column.tsx              # 컬럼 UI + sortable 카드 리스트
│  │
│  └─ shared/
│     ├─ store/
│     │  └─ kanban-store.ts            # Zustand 상태/액션/persist/일일 초기화
│     ├─ pwa/
│     │  └─ register-sw.tsx            # 서비스워커 클라이언트 등록
│     ├─ ui/                           # shadcn 기반 공통 UI 컴포넌트
│     │  ├─ button.tsx
│     │  ├─ card.tsx
│     │  ├─ dialog.tsx
│     │  ├─ input.tsx
│     │  ├─ label.tsx
│     │  └─ textarea.tsx
│     └─ lib/
│        └─ utils.ts                   # cn 유틸
│
├─ public/
│  ├─ sw.js                            # 서비스워커 스크립트
│  ├─ icon-192.png                     # PWA 아이콘
│  ├─ icon-512.png                     # PWA 아이콘
│  └─ icon-512-maskable.png            # PWA maskable 아이콘
│
├─ next.config.ts                      # Next 설정(React Compiler 등)
├─ tsconfig.json                       # TypeScript 설정
└─ package.json                        # 스크립트/의존성
```

### 아키텍처 메모

- `app/`는 Next.js 라우팅/메타데이터/PWA 진입점만 담당합니다.
- 실제 도메인 UI와 상태 로직은 `src/`의 FSD 레이어(`pages/widgets/features/entities/shared`)에 분리되어 있습니다.
- 전역 상태는 `shared/store/kanban-store.ts` 하나로 관리하며, UI는 selector 기반으로 필요한 값만 구독합니다.
