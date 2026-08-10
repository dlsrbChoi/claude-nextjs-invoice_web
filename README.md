# 노션 기반 견적서 관리 시스템 v3.0

Notion을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 웹에서 조회·PDF 다운로드할 수 있는 프로덕션 레디 풀스택 애플리케이션

## 🎯 주요 기능

### 공개 사용자 (인증 불필요)

- 🔍 **견적서 조회** — Notion 페이지 ID 또는 URL로 견적서 상세 정보 조회
- 📥 **PDF 다운로드** — 견적서를 PDF 파일로 다운로드 및 인쇄
- 🔗 **링크 공유** — 견적서 공유 URL 생성 및 복사
- 📢 **신고 기능** — 부적절한 견적서를 공개적으로 신고

### 관리자 (쿠키 기반 인증)

- 📊 **대시보드** — 통계(견적서 수, 상태별 건수, 총액), 클라이언트 요약, 최근 활동
- 📋 **견적서 목록** — Notion 커서 기반 페이지네이션 (이전/다음 지원)
- 👥 **클라이언트 목록** — clientName 기준 집계 및 거래 통계
- 🚨 **신고 관리** — 신고 목록 조회 및 상태 변경 (pending → reviewing → resolved/dismissed)
- ✉️ **이메일 공유** — 선택된 견적서를 수신자에게 직접 발송

## 🛠️ 기술 스택

| 카테고리        | 기술 스택                                               |
| --------------- | ------------------------------------------------------- |
| **프레임워크**  | Next.js 16 (App Router), React 19, TypeScript 5         |
| **스타일링**    | TailwindCSS v4 (oklch 색상), shadcn/ui (base-nova)      |
| **UI 컴포넌트** | @base-ui/react, lucide-react, Sonner                    |
| **테마**        | next-themes (라이트/다크/시스템 모드)                   |
| **외부 API**    | Notion API v1, Resend (이메일)                          |
| **인증**        | HTTP-only 쿠키, 세션 기반                               |
| **배포**        | Vercel                                                  |
| **개발 도구**   | ESLint 9, Prettier 3.9.6, TypeScript strict mode, Husky |

## 📁 디렉토리 구조

```
invoice-web/
├── src/
│   ├── app/                           # App Router 라우트
│   │   ├── (root)/
│   │   │   ├── page.tsx              # 홈페이지 (견적서 ID 입력)
│   │   │   ├── layout.tsx            # 루트 레이아웃
│   │   │   ├── error.tsx             # 전역 에러 처리
│   │   │   └── not-found.tsx         # 404 페이지
│   │   │
│   │   ├── invoice/[notionPageId]/
│   │   │   ├── page.tsx              # 견적서 상세 조회
│   │   │   └── loading.tsx           # 로딩 상태
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx              # 관리자 로그인
│   │   │
│   │   ├── admin/                    # 관리자 영역 (인증 필수)
│   │   │   ├── layout.tsx            # 관리자 레이아웃 (사이드바)
│   │   │   ├── page.tsx              # 대시보드
│   │   │   ├── loading.tsx           # 로딩 상태
│   │   │   ├── error.tsx             # 에러 처리
│   │   │   ├── invoices/
│   │   │   │   └── page.tsx          # 견적서 목록
│   │   │   ├── clients/
│   │   │   │   └── page.tsx          # 클라이언트 목록
│   │   │   └── reports/
│   │   │       └── page.tsx          # 신고 관리
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts    # 로그인 (쿠키 발급)
│   │   │   │   └── logout/route.ts   # 로그아웃 (쿠키 삭제)
│   │   │   ├── admin/
│   │   │   │   ├── share-email/route.ts        # 이메일 발송
│   │   │   │   └── reports/[id]/route.ts       # 신고 상태 변경
│   │   │   └── public/
│   │   │       └── report/route.ts   # 신고 접수 (공개)
│   │   │
│   │   ├── globals.css               # TailwindCSS + oklch 색상 변수
│   │   └── layout.tsx                # 루트 레이아웃
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   │   ├── button.tsx, card.tsx, input.tsx, ...
│   │   │   └── dialog.tsx, badge.tsx, separator.tsx
│   │   │
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   ├── header.tsx            # 헤더
│   │   │   ├── footer.tsx            # 푸터
│   │   │   ├── container.tsx         # 컨테이너
│   │   │   ├── theme-toggle.tsx      # 라이트/다크 모드 토글
│   │   │   ├── admin-menu.tsx        # 관리자 드롭다운
│   │   │   └── admin-sidebar.tsx     # 관리자 사이드바
│   │   │
│   │   ├── patterns/                 # 패턴 컴포넌트
│   │   │   ├── page-header.tsx       # 페이지 헤더
│   │   │   ├── empty-state.tsx       # 빈 상태 표시
│   │   │   └── pagination.tsx        # 페이지네이션 UI
│   │   │
│   │   ├── invoice/                  # 견적서 관련 컴포넌트
│   │   │   ├── invoice-lookup.tsx    # 견적서 ID 입력 폼
│   │   │   ├── invoice-detail.tsx    # 견적서 상세 정보
│   │   │   ├── invoice-list-table.tsx # 견적서 목록 테이블
│   │   │   ├── report-dialog.tsx     # 신고 폼 (모달)
│   │   │   ├── email-share-dialog.tsx # 이메일 공유 폼
│   │   │   └── client-list-table.tsx # 클라이언트 요약 테이블
│   │   │
│   │   └── admin/                    # 관리자 컴포넌트
│   │       └── reports-panel.tsx     # 신고 목록 및 상태 변경
│   │
│   └── lib/                          # 유틸리티 및 라이브러리
│       ├── notion.ts                 # Notion API 클라이언트
│       ├── notion-parser.ts          # Notion 데이터 파싱
│       ├── types.ts                  # TypeScript 타입 정의
│       ├── auth.ts                   # 세션 관리
│       ├── email.ts                  # 이메일 발송 (Resend)
│       ├── dashboard.ts              # 대시보드 통계 집계
│       ├── format.ts                 # 날짜/통화 포맷팅
│       ├── invoice-url.ts            # 견적서 URL 생성
│       ├── rate-limiter.ts           # 속도 제한
│       ├── utils.ts                  # cn() 클래스 병합
│       └── mock-data.ts              # 개발용 더미 데이터
│
├── .env.example                      # 환경 변수 템플릿
├── .env.local                        # 로컬 환경 변수 (미추적)
├── CLAUDE.md                         # 프로젝트 개발 지침
├── README.md                         # 이 파일
├── package.json                      # 의존성 및 스크립트
├── tsconfig.json                     # TypeScript 설정
├── tailwind.config.ts                # TailwindCSS 설정
├── components.json                   # shadcn/ui 설정
├── .eslintrc.json                    # ESLint 규칙
├── .prettierrc.json                  # Prettier 설정
└── docs/                             # 프로젝트 문서
    ├── PRD.md                        # 제품 요구사항
    ├── ROADMAP.md                    # v3.0 개발 로드맵
    ├── roadmaps/
    │   ├── ROADMAP_v1.md            # v1.0 MVP 로드맵
    │   └── ROADMAP_v2.md            # v2.0 고도화 로드맵
    ├── DEPLOYMENT.md                # 배포 가이드
    ├── OPERATIONS_GUIDE.md          # 운영 가이드
    ├── SECURITY_VERIFICATION.md     # 보안 검증
    └── ...
```

## 🚀 시작 가이드

### 사전 요구사항

- **Node.js**: 18.17.0 이상
- **npm**: 9.0.0 이상
- **Notion Integration**: [Notion Developers](https://www.notion.so/my-integrations)에서 생성
- **Resend 계정** (이메일 발송 기능용): [Resend](https://resend.com)

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 입력하세요:

```env
# Notion API
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_invoices_database_id_here
NOTION_REPORTS_DATABASE_ID=your_reports_database_id_here

# 관리자 인증
ADMIN_PASSWORD=your_secure_password_here

# 이메일 발송
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# 세션 보안
SESSION_SECRET=your_secure_session_secret_here

# 선택사항: 앱 URL (배포 환경)
NEXT_PUBLIC_APP_URL=https://invoice.example.com
```

> **📌 중요**: `.env.local` 파일은 Git에 커밋하지 마세요. 로컬 개발 환경에서만 사용됩니다.

### 설치 및 실행

#### 1단계: 의존성 설치

```bash
npm install
```

#### 2단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하면 홈페이지가 표시됩니다.

#### 3단계: 관리자 영역 접근

1. [http://localhost:3000/login](http://localhost:3000/login)으로 이동
2. `.env.local`에서 설정한 `ADMIN_PASSWORD` 입력
3. 대시보드로 리다이렉트되어 관리자 기능 이용 가능

### 주요 명령어

#### 개발 및 빌드

```bash
# 개발 서버 실행 (localhost:3000)
npm run dev

# TypeScript 타입 검사
npm run typecheck

# ESLint 코드 품질 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 코드 포맷팅
npm run format

# Prettier 포맷 검사 (수정 없음)
npm run format:check

# 전체 검사 실행 (lint + format:check + typecheck) - 커밋 전 필수
npm run check-all

# 프로덕션 빌드
npm run build

# 프로덕션 앱 실행 (로컬 테스트)
npm run start
```

#### Git Hooks (자동 실행)

- **pre-commit**: `npm run format && npm run lint:fix` — 커밋 전 자동 포맷팅 및 린트 수정
- **pre-push**: `npm run check-all` — 푸시 전 전체 검사 실행

### Notion 데이터베이스 설정

#### 1. Notion Integration 생성

1. [Notion Developers](https://www.notion.so/my-integrations)로 이동
2. **"New integration"** 클릭
3. Integration 이름 입력 (예: "Invoice System")
4. **"Internal Integration Token"** 복사 → `.env.local`의 `NOTION_API_KEY`에 저장

#### 2. 데이터베이스 연결

1. Notion에서 **견적서 데이터베이스** 생성 (예: "Invoices")
2. 데이터베이스 우측 상단 **"..."** → **"Add connections"** → 생성한 Integration 선택
3. 데이터베이스 URL에서 ID 추출 (32자 16진수)
4. `.env.local`의 `NOTION_DATABASE_ID`에 저장

#### 3. 신고 데이터베이스 설정

동일한 방식으로 **신고 데이터베이스** 생성 (예: "Reports")

- `.env.local`의 `NOTION_REPORTS_DATABASE_ID`에 저장

> 자세한 설정 절차는 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) 참고

## 📈 로드맵

### ✅ 완료됨

#### v1.0 MVP (Phase 1~4)

- 공개 견적서 조회 및 PDF 다운로드
- Notion API 연동 (단일 페이지 조회)
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- 에러 처리 및 유효성 검증

#### v2.0 고도화 (Phase 5~6)

- 관리자 레이아웃 골격 및 로그인 인증
- 견적서 목록 조회 (Notion 데이터베이스 쿼리)
- 링크 복사 기능 및 클립보드 지원
- 테이블 가시성 개선 (WCAG AA 대비 기준)

#### v3.0 관리자 대시보드 (Phase 1~3)

- **Task 601**: 관리자 세션 검증 강화 및 인증 우회 차단
- **Task 602**: 관리자 좌측 네비게이션 레이아웃 셸 구축
- **Task 603**: 관리자 하위 라우트 골격 및 페이지네이션 타입 정의
- **Task 604**: 대시보드 및 클라이언트 도메인 타입 설계
- **Task 605**: 이메일 공유 도메인 타입 및 발송 인터페이스 설계
- **Task 606**: 신고 관리 도메인 타입 및 데이터 구조 설계
- **Task 607**: 좌측 네비게이션 UI 및 반응형 완성
- **Task 608**: 대시보드 화면 UI 구현
- **Task 609**: 이메일 공유 UI 및 클라이언트 목록 화면 구현
- **Task 610**: 링크 복사 액션 개선 및 페이지네이션 UI 구현
- **Task 611**: 신고 관리 화면 UI 구현
- **Task 612**: 대시보드 데이터 집계 및 페이지네이션 연동
- **Task 613**: 이메일 발송 API 연동 및 보안 강화
- **Task 614**: 신고 데이터 연동 및 처리 기능 구현
- **Task 615**: v3.0 통합 테스트 및 보안 검증

### 🔄 진행 중

- Phase 4 (v3.0): 성능 최적화 및 배포

### ⬜ 향후 계획

#### Phase 7+ (v3.0+)

- 목록 검색 및 필터링
- 고급 페이지네이션 UI
- 견적서 성능 최적화

#### v4.0+ (향후 버전)

- 자동화된 테스트 스위트 (Jest/Vitest)
- 견적서 템플릿 관리
- 결제 연동
- 버전 관리 및 히스토리
- 다국어 지원

자세한 로드맵은 [docs/ROADMAP.md](docs/ROADMAP.md) 참고

## 📖 문서

| 문서                                                           | 설명                       |
| -------------------------------------------------------------- | -------------------------- |
| [CLAUDE.md](CLAUDE.md)                                         | 프로젝트 개발 지침 및 구조 |
| [docs/PRD.md](docs/PRD.md)                                     | 제품 요구사항 문서 (PRD)   |
| [docs/ROADMAP.md](docs/ROADMAP.md)                             | v3.0 개발 로드맵           |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                       | 배포 가이드 (Vercel)       |
| [docs/OPERATIONS_GUIDE.md](docs/OPERATIONS_GUIDE.md)           | 운영 및 트러블슈팅         |
| [docs/SECURITY_VERIFICATION.md](docs/SECURITY_VERIFICATION.md) | 보안 검증 체크리스트       |

## 🔐 보안 주요 사항

- ✅ **세션 검증**: 모든 관리자 경로는 서명된 세션 토큰으로 보호됨
- ✅ **입력 검증**: 서버 측 재검증으로 클라이언트 입력 신뢰 안 함
- ✅ **헤더 인젝션 차단**: 이메일 발송 시 개행 문자 제거
- ✅ **XSS 방지**: 사용자 입력이 HTML에 삽입될 때 이스케이프 처리
- ✅ **속도 제한**: 신고 접수 및 이메일 발송에 속도 제한 적용
- ✅ **HTTP-only 쿠키**: 자바스크립트 접근 불가능 (CSRF 방지)
- ✅ **환경 변수**: API 키는 `NEXT_PUBLIC_` 접두사 없이 서버 환경에서만 사용

자세한 보안 정보는 [docs/SECURITY_VERIFICATION.md](docs/SECURITY_VERIFICATION.md) 참고

## 💡 개발 워크플로우

### 새 페이지 추가

```bash
# src/app/[route]/page.tsx 생성 (자동 라우팅)
```

### 새 UI 컴포넌트 추가

```bash
# shadcn CLI 사용 (components.json 설정에 따라 생성됨)
npx shadcn-ui@latest add button  # 예시
```

### shadcn/ui 설정

- **Style**: base-nova
- **Base Color**: neutral
- **Icon Library**: lucide

### 타입 안전

```typescript
// src/lib/types.ts에 타입 정의
// 컴포넌트 props에 타입 명시
// TypeScript strict mode 활성화
```

## 🤝 협업 가이드

1. **기능 개발 시작 전**

   ```bash
   npm run check-all  # 전체 검사 실행
   ```

2. **코드 작성**
   - TypeScript strict mode 준수
   - 변수명/함수명: 영어 사용
   - 주석/문서: 한국어 사용

3. **커밋 전**

   ```bash
   npm run check-all  # 모든 검사 통과 필수
   npm run build      # 빌드 성공 필수
   ```

4. **커밋 메시지 형식**
   - 컨벤셔널 커밋 준수
   - 이모지와 한국어 사용
   - 예시: `✨ feat: 대시보드 통계 집계 기능 추가`

## 📝 라이선스

이 프로젝트는 비공개(Private) 프로젝트입니다.

---

**마지막 업데이트**: 2026-08-10  
**현재 버전**: v3.0 (Phase 3 완료)  
**개발자**: @awdzx
