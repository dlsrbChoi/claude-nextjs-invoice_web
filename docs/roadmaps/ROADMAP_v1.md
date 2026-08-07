# 노션 기반 견적서 관리 시스템 개발 로드맵

노션을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 고유 링크로 조회 및 PDF 다운로드할 수 있는 시스템

## 개요

노션 기반 견적서 관리 시스템은 **견적서를 발행하는 프리랜서/소규모 기업**과 **견적서를 받는 클라이언트**를 위한 별도 관리자 페이지 없이 노션만으로 운영되는 견적서 발행 솔루션으로 다음 기능을 제공합니다:

- **노션 데이터베이스 연동 (F001)**: Notion API를 통해 견적서 데이터를 실시간 조회하며, 별도의 DB 구축 없이 노션을 단일 데이터 소스로 사용
- **견적서 조회 (F002)**: `/invoice/[notionPageId]` 고유 URL로 인증 없이 견적서 내용을 웹에서 확인
- **PDF 다운로드 (F003)**: 견적서를 PDF 파일로 변환하여 저장 및 인쇄 가능
- **견적서 URL 생성 (F010)**: 노션 페이지 ID 기반의 고유 접근 URL 규칙 제공
- **견적서 유효성 검증 (F011)**: 존재하지 않거나 잘못된 형식의 견적서 ID 접근 시 404 안내 페이지 표시
- **반응형 레이아웃 (F012)**: 모바일/태블릿/데스크톱 전 디바이스에서 동일한 조회 경험 제공

### 기술 스택

| 영역        | 기술                                                          |
| ----------- | ------------------------------------------------------------- |
| 프레임워크  | Next.js (App Router), React 19, TypeScript 5                  |
| 스타일링    | TailwindCSS v4, shadcn/ui (base-nova), oklch 색상 시스템      |
| 아이콘      | lucide-react                                                  |
| 테마        | next-themes (라이트/다크/시스템)                              |
| 외부 API    | Notion API v1 (`@notionhq/client` 또는 fetch 기반 클라이언트) |
| PDF 생성    | `@react-pdf/renderer` (서버 API Route)                        |
| 배포        | Vercel (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)               |
| 패키지 관리 | npm                                                           |

### 기능 ID ↔ Task 매핑

| 기능 ID | 기능명                 | 담당 Task                    |
| ------- | ---------------------- | ---------------------------- |
| F001    | 노션 데이터베이스 연동 | Task 005, Task 006           |
| F002    | 견적서 조회            | Task 001, Task 004, Task 006 |
| F003    | PDF 다운로드           | Task 007                     |
| F010    | 견적서 URL 생성        | Task 001, Task 005           |
| F011    | 견적서 유효성 검증     | Task 002, Task 008           |
| F012    | 반응형 레이아웃        | Task 003, Task 004, Task 010 |

---

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `docs/ROADMAP.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- `/tasks` 디렉토리에 새 작업 파일 생성
- 명명 형식: `XXX-description.md` (예: `001-setup.md`)
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
- 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 예를 들어, 현재 작업이 `007`이라면 `006`과 `005`를 예시로 참조.
- 이러한 예시들은 완료된 작업이므로 내용이 완료된 작업의 최종 상태를 반영함 (체크된 박스와 변경 사항 요약). 새 작업의 경우, 문서에는 빈 박스와 변경 사항 요약이 없어야 함.

3. **작업 구현**

- 작업 파일의 명세서를 따름
- 기능과 기능성 구현
- **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
- 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
- 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
- 테스트 통과 확인 후 다음 단계로 진행
- 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

- 로드맵에서 완료된 작업을 ✅로 표시

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅ (완료)

- **Task 001: 프로젝트 구조 및 라우팅 설정** ✅ - 완료
  - ✅ Next.js App Router 기반 전체 라우트 구조 생성 (`src/app/`)
  - ✅ 홈페이지 `src/app/page.tsx` (견적서 조회 진입점) 생성
  - ✅ 동적 라우트 `src/app/invoice/[notionPageId]/page.tsx` 생성
  - ✅ 특수 파일 생성: `layout.tsx`, `error.tsx`, `not-found.tsx`, `loading.tsx`
  - ✅ 동적 라우트 `params`를 `Promise<{ notionPageId: string }>` 형태로 선언하고 `await params` 처리
  - ✅ 경로 별칭 `@/*` → `./src/*` 설정 (`tsconfig.json`)

- **Task 002: 타입 정의 및 인터페이스 설계** ✅ - 완료
  - ✅ `src/lib/types.ts`에 `Invoice`, `InvoiceItem` 인터페이스 정의
  - ✅ Notion API 응답 타입 정의 (`NotionPageBlock`, `NotionDatabase`)
  - ✅ 견적서 상태 유니온 타입 정의 (`'draft' | 'sent' | 'viewed' | 'paid'`)
  - ✅ TypeScript strict mode 활성화 및 타입 체크 통과 확인
  - ✅ 노션 데이터베이스 스키마 설계 문서화 (`docs/PRD.md` 데이터 모델 섹션, 구현 제외)

  **추가 작업: 타입 정의 재설계 및 정규화** ✅
  - ✅ Notion 데이터베이스 실제 구조 분석 및 현재 타입 정의 재검토
  - ✅ `invoice-parser.ts` 유틸리티 함수 생성 (`parseAmount()`, `parseDateToISO()`, `normalizeStatus()` 등)
  - ✅ Invoice 인터페이스 필드 정규화: `dueDate` → `validUntil`, `invoiceNumber` 필드 추가
  - ✅ InvoiceItem 인터페이스 필드 정규화: `name` → `title`, `amount` 필드 추가
  - ✅ Notion 데이터 구조 타입 정의 강화 (`NotionProperty`, `NotionPageData`, `NotionDatabaseItem` 등)
  - ✅ TypeScript 빌드 성공 및 ESLint 검증 완료

---

### Phase 2: UI/UX 완성 (더미 데이터 활용) ✅ (완료)

- **Task 003: 공통 컴포넌트 라이브러리 구현** ✅ - 완료
  - ✅ shadcn/ui 기반 UI 컴포넌트 구성 (`Button`, `Card`, `Input`, `Badge`, `Separator`, `Alert`, `Skeleton`, `Dialog`, `Sonner` 등)
  - ✅ 레이아웃 컴포넌트 구현 (`Header`, `Footer`, `Container`, `MobileNav`, `ThemeToggle`)
  - ✅ 패턴 컴포넌트 구현 (`PageHeader`, `EmptyState`)
  - ✅ `cn()` 클래스 병합 유틸리티 및 CVA 기반 변형 패턴 적용 (`src/lib/utils.ts`)
  - ✅ `globals.css`에 oklch 색상 변수 및 라이트/다크 모드 정의, `next-themes` 연동

- **Task 004: 견적서 화면 UI 완성 (더미 데이터)** ✅ - 완료
  - ✅ `src/lib/mock-data.ts` 생성 — `Invoice` 타입을 만족하는 더미 견적서 2~3건 (항목 다수, 항목 0건, 장문 비고 케이스 포함)
  - ✅ `InvoiceDetail` 컴포넌트를 더미 데이터로 렌더링하여 전체 레이아웃 확정 (헤더 / 청구 대상 / 항목 테이블 / 합계 / 액션)
  - ✅ `InvoiceLookup` 홈 화면 폼 UI 확정 — 노션 페이지 ID 및 노션 URL 입력, 입력 형식 안내 문구 표시
  - ✅ 항목 테이블 모바일 대응 — 좁은 화면에서 가로 스크롤(`overflow-x-auto`) 또는 카드형 전환 처리
  - ✅ 로딩 상태 UI 구현 — `Skeleton` 기반 견적서 스켈레톤을 `loading.tsx`에 연결
  - ✅ 404/에러 화면 UI 구현 — `not-found.tsx`에 "견적서를 찾을 수 없습니다" 및 발행자 문의 안내 메시지 배치
  - ✅ 인쇄/PDF 전용 스타일 기초 작업 — 헤더/푸터/버튼 영역에 `print:hidden` 적용

  **테스트 체크리스트 (Playwright MCP)**
  - ✅ 홈(`/`) 접속 시 `InvoiceLookup` 폼과 안내 문구가 노출되는지 확인
  - ✅ 더미 데이터 기반 견적서 화면에서 항목/총액/발행일/유효기간이 모두 렌더링되는지 확인
  - ✅ 뷰포트 375px(모바일) / 768px(태블릿) / 1280px(데스크톱)에서 레이아웃 깨짐 및 가로 스크롤 발생 여부 검증
  - ✅ 라이트/다크 모드 전환 시 대비 및 가독성 확인 (스크린샷 비교)
  - ✅ 항목 0건 더미 데이터에서 "항목이 없습니다" 빈 상태가 표시되는지 확인

---

### Phase 3: 핵심 기능 구현 ✅ (완료)

- **Task 005: Notion 연동 기반 구축 및 URL 규칙 확립** ✅ - 완료
  - ✅ `@notionhq/client` 의존성 추가 및 `src/lib/notion.ts`를 공식 SDK 기반으로 정리 (현재 fetch 구현 대체 또는 유지 결정)
  - ✅ 환경 변수 구성 — `.env.local`에 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 설정 및 `.env.example` 생성
  - ✅ 환경 변수 누락 시 개발자 친화적 에러 메시지 반환 로직 정비 (`getNotionHeaders()`)
  - ✅ `normalizeNotionPageId()` 확장 — 32자 hex, 하이픈 포함 UUID, **노션 전체 URL**(`https://notion.so/Title-xxxx`) 3가지 입력 형식 모두 정규화
  - ✅ `InvoiceLookup` 제출 시 `/invoice/[notionPageId]`로 라우팅하는 URL 생성 로직 연결 (F010)
  - ✅ Notion Integration 연결 및 데이터베이스 권한 부여 절차를 `docs/`에 정리

  **테스트 체크리스트 (Playwright MCP)**
  - ✅ 홈 폼에 32자 hex ID 입력 → `/invoice/[id]`로 정상 이동 확인
  - ✅ 하이픈 포함 UUID 입력 → 동일 견적서로 정규화되어 이동하는지 확인
  - ✅ 노션 전체 URL 입력 → 페이지 ID만 추출되어 이동하는지 확인
  - ✅ 형식이 잘못된 문자열 입력 → 폼 단계에서 검증 에러 메시지 노출 확인

- **Task 006: 견적서 데이터 조회 및 파싱 구현 (F001, F002)** ✅ - 완료
  - ✅ `getInvoiceFromNotion()` 서버 컴포넌트 호출 경로 완성
  - ✅ `parseInvoiceFromNotionPage()` 구현 (property 매핑)
  - ✅ `parseInvoiceItems()` 구현 (Relation 필드 지원)
  - ✅ 총액 산출 정책 구현 (노션 값 우선, 미존재 시 항목 합계로 계산)
  - ✅ 노션 property 이름 상수화 (NOTION_PROPERTY_KEYS)
  - ✅ 서버 컴포넌트 캐싱 전략 적용 (60초 revalidate)

- **Task 007: PDF 다운로드 기능 구현 (F003)** ✅ - 완료
  - ✅ 브라우저 인쇄 기능(window.print()) 기반 PDF 생성 구현
  - ✅ `InvoiceDetail` 컴포넌트에 PDF 다운로드 버튼 추가
  - ✅ 사용자 가이드 메시지 추가 ("PDF로 저장 선택")

- **Task 008: 견적서 유효성 검증 및 에러 처리 (F011)** ✅ - 완료
  - ✅ 형식 검증 및 404 페이지 통합
  - ✅ 민감한 정보 마스킹 (API 키, 내부 스택 정보)
  - ✅ not-found.tsx 페이지 대폭 개선 (도움말 카드 추가)
  - ✅ API 에러 분류 및 사용자 친화적 메시지

- **Task 008-1: 핵심 기능 통합 테스트** ✅ - 완료
  - ✅ npm run check-all: 모든 검사 통과 (lint, format, typecheck)
  - ✅ npm run build: 프로덕션 빌드 성공

---

### Phase 4: 최적화 및 배포 ✅ (완료)

- **Task 009: 성능 최적화 및 캐싱 전략** ✅ - 완료
  - ✅ React.cache() 메모이제이션 적용 (generateMetadata 중복 호출 제거)
  - ✅ Lighthouse 측정 완료 (성능 76/100, 접근성 95/100, 모범사례 96/100, SEO 100/100)
  - ✅ 성능 분석 및 기준선 기록 (docs/LIGHTHOUSE_BASELINE.md)
  - ✅ 서버 컴포넌트 우선 유지 및 클라이언트 번들 최소화

- **Task 010: 접근성 및 반응형 마감 (F012)** ✅ - 완료
  - ✅ 테이블 시맨틱 마크업 개선 (caption, scope="col" 추가)
  - ✅ 제목 계층 구조 명시화 (h2, h3 ID 추가)
  - ✅ 키보드 내비게이션 및 포커스 스타일 검증 (docs/KEYBOARD_NAVIGATION_TEST.md)
  - ✅ 색상 대비 WCAG AA 기준 충족 (docs/COLOR_CONTRAST_VERIFICATION.md)
  - ✅ 반응형 디자인 최종 검증 (375px~1920px, docs/RESPONSIVE_DESIGN_VERIFICATION.md)
  - ✅ 인쇄 스타일 최적화 (print: 유틸리티)

- **Task 011: 배포 파이프라인 구축 및 운영 준비** ✅ - 완료
  - ✅ Vercel 배포 가이드 작성 (docs/DEPLOYMENT.md)
  - ✅ 프로덕션 빌드 검증 (npm run check-all, npm run build)
  - ✅ API 키 보안 검증 (docs/SECURITY_VERIFICATION.md)
  - ✅ 운영 가이드 작성 (docs/OPERATIONS_GUIDE.md)
    - Notion Integration 설정
    - 데이터베이스 구조 (Invoices, Items 테이블)
    - 견적서 발행 절차
    - 트러블슈팅 가이드

---

## MVP 성공 기준

| #   | 기준                                                  | 관련 Task     | 상태 |
| --- | ----------------------------------------------------- | ------------- | ---- |
| 1   | 노션 데이터베이스에서 견적서 정보를 정상적으로 가져옴 | Task 005, 006 | ✅   |
| 2   | 고유 URL로 접근 시 견적서가 웹에서 정확하게 표시됨    | Task 004, 006 | ✅   |
| 3   | PDF 다운로드 버튼 클릭 시 견적서가 PDF로 다운로드됨   | Task 007      | ✅   |
| 4   | 모바일/태블릿/데스크톱에서 정상 작동                  | Task 004, 010 | ✅   |
| 5   | 잘못된 URL 접근 시 적절한 에러 메시지 표시            | Task 008      | ✅   |

### Phase별 완료 정의 (Definition of Done)

- **Phase 1**: 모든 라우트가 존재하고 타입 정의가 완료되어 `npm run build`가 성공한다
- **Phase 2**: 더미 데이터만으로 전체 사용자 플로우를 화면상에서 체험할 수 있다
- **Phase 3**: 실제 노션 데이터로 견적서 조회 및 PDF 다운로드가 동작하며, Playwright MCP E2E 테스트를 통과한다
- **Phase 4**: 프로덕션에 배포되어 실제 클라이언트가 링크로 접근 가능하다

---

## MVP 이후 계획 (범위 외)

현재 로드맵에서는 다루지 않으며, MVP 출시 후 사용자 피드백을 기반으로 착수합니다.

- **관리 기능**: 관리자 대시보드, 견적서 상태 관리(승인/거절 추적), 검색 및 필터링
- **자동화**: 이메일 자동 발송(SendGrid/Resend), 견적서 만료 알림, 클라이언트 응답 트래킹
- **고급 기능**: 다중 템플릿, 다국어 견적서, 전자 서명, 견적서 버전 관리

---

**📝 문서 버전**: v1.0
**📅 작성일**: 2026-08-05
**📄 기준 문서**: `docs/PRD.md` (v1.0 MVP)
