# 📌 프로젝트 개요 및 Notion 데이터베이스 설정 요약

## 🎯 프로젝트 목표

**invoice-web**은 Notion을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 웹에서 고유 링크로 견적서를 조회하고 PDF로 다운로드할 수 있는 시스템입니다.

**핵심 가치:**

- 별도 관리자 페이지 없이 Notion만으로 운영
- API 중심의 확장 가능한 아키텍처
- 모바일/태블릿/데스크톱 반응형 지원
- 프리랜서/소규모 기업을 위한 간단한 견적서 발행 솔루션

---

## 📚 문서 구조

| 문서                | 목적                            | 대상               |
| ------------------- | ------------------------------- | ------------------ |
| **NOTION_SETUP.md** | Notion 데이터베이스 설정 가이드 | Notion 초기 설정자 |
| **ARCHITECTURE.md** | 프로젝트 기술 아키텍처          | 개발자             |
| **CLAUDE.md**       | AI 개발자 작업 가이드           | Claude Code        |
| **PRD.md**          | 제품 요구사항 정의              | 기획/개발          |
| **README.md**       | 프로젝트 실행 및 배포           | 모든 사용자        |

---

## 🗂️ Notion 데이터베이스 구조

### 필수 2개 데이터베이스

#### 1️⃣ **Invoices** (견적서 정보)

```
속성명              | 타입       | 필수 | 설명
─────────────────────────────────────────────────────────
제목               | Title      | ✅  | 견적서 제목
invoice_number    | Text       | ✅  | 견적서 번호 (INV-2026-001)
client_name       | Text       | ✅  | 클라이언트명
client_email      | Email      | ⭕  | 클라이언트 이메일
issue_date        | Date       | ✅  | 발행일 (YYYY-MM-DD)
valid_until       | Date       | ✅  | 유효기간 (YYYY-MM-DD)
status            | Select     | ✅  | 상태 (draft/sent/viewed/paid)
items             | Relation   | ✅  | InvoiceItems 데이터베이스와 연결
total_amount      | Number     | ✅  | 총 금액
notes             | Text       | ⭕  | 비고/특수사항
```

**Select 옵션 (status):**

- `draft` - 작성 중 (회색)
- `sent` - 발송됨 (파란색)
- `viewed` - 확인됨 (녹색)
- `paid` - 결제 완료 (빨간색)

#### 2️⃣ **InvoiceItems** (견적 항목)

```
속성명              | 타입       | 필수 | 설명
─────────────────────────────────────────────────────────
제목               | Title      | ✅  | 항목명 (예: "UI/UX 디자인")
description       | Text       | ⭕  | 항목 설명
quantity          | Number     | ✅  | 수량
unit_price        | Number     | ✅  | 단가
amount            | Formula    | ✅  | 금액 (수식: quantity × unit_price)
invoice_id        | Relation   | ✅  | Invoices 데이터베이스와 연결
```

**amount 필드 수식:**

```
prop("quantity") * prop("unit_price")
```

이 필드는 자동으로 수량 × 단가를 계산합니다.

---

## 🔑 Integration 설정 단계

### 1단계: Notion Integration 생성

```
https://www.notion.so/my-integrations
→ "새 통합 만들기" 클릭
→ 이름: invoice-web
→ 권한: read, update, insert 활성화
→ 토큰 복사
```

### 2단계: 환경 변수 설정

```bash
# .env.local 파일 생성
NOTION_API_KEY=ntn_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3단계: 데이터베이스 권한 부여

```
Invoices 데이터베이스 우측상단 공유
→ Integration (invoice-web) 추가
→ 권한: View, Update, Insert 활성화

InvoiceItems 데이터베이스도 동일하게 권한 부여
```

### 4단계: 샘플 데이터 추가

```
Invoices에 최소 1개 견적서 레코드 생성
InvoiceItems에 2-3개 항목 레코드 생성
각 항목의 invoice_id를 견적서와 연결
```

### 5단계: 테스트

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 Notion 페이지 ID 입력
http://localhost:3000/invoice/[pageId]
```

---

## 🏗️ 프로젝트 기술 스택

| 영역            | 기술                     | 버전    |
| --------------- | ------------------------ | ------- |
| 프레임워크      | Next.js                  | 16.2.12 |
| 런타임          | React                    | 19.2.4  |
| 언어            | TypeScript               | 5       |
| 스타일링        | TailwindCSS              | 4       |
| UI              | shadcn/ui (base-nova)    | -       |
| 컴포넌트 베이스 | @base-ui/react           | 1.6.0   |
| 아이콘          | lucide-react             | 1.28.0  |
| 테마            | next-themes              | 0.4.6   |
| 포매팅          | class-variance-authority | 0.7.1   |
| 클래스 병합     | tailwind-merge           | 3.6.0   |
| 토스트          | sonner                   | 2.0.7   |
| 호스팅          | Vercel                   | -       |

---

## 📊 데이터 흐름

### 사용자 여정

```
┌─ 견적서 작성자 (관리자)
│
├─ Notion에서 견적서 작성
│  ├─ Invoices DB에 레코드 생성
│  └─ InvoiceItems DB에 항목 생성
│
├─ 고유 링크 생성 (페이지 ID 기반)
│  └─ https://your-domain.com/invoice/[pageId]
│
└─ 클라이언트에게 링크 공유
   ↓
┌─ 클라이언트 (견적서 수신자)
│
├─ 링크 클릭 → 웹 브라우저에서 견적서 조회
│
├─ 견적서 내용 확인
│  ├─ 발급 정보
│  ├─ 클라이언트 정보
│  ├─ 항목별 세부 정보
│  └─ 총액
│
└─ PDF 다운로드 및 저장/인쇄
```

### 기술 흐름

```
Notion API
    ↓
Next.js 서버
    ├─ getInvoiceFromNotion() → 데이터 조회
    ├─ parseInvoiceFromNotionPage() → 데이터 변환
    └─ parseInvoiceItems() → 항목 추출
    ↓
TypeScript Invoice 객체
    ↓
React 컴포넌트
    ├─ InvoiceDetail → 견적서 렌더링
    ├─ InvoiceTable → 항목 테이블
    └─ formatCurrency() → 통화 포매팅
    ↓
HTML 렌더링 (클라이언트 브라우저)
```

---

## 🚀 개발 단계별 진행

### Phase 1: 애플리케이션 골격 ✅ 완료

- ✅ Task 001: 프로젝트 구조 및 라우팅
- ✅ Task 002: 타입 정의 및 인터페이스
- ✅ Task 003: 공통 컴포넌트 라이브러리
- ✅ Task 004: 견적서 화면 UI 완성 (더미 데이터)

### Phase 2: UI/UX 완성 🟡 진행 중

- 🟡 **Task 005: Notion 연동 기반 구축 및 URL 규칙 확립** (다음)
  - 환경 변수 설정 완료 ✅
  - Notion Integration 생성 필요 📋
  - 데이터베이스 속성 설정 필요 📋

- ⏳ Task 006: 견적서 데이터 조회 및 파싱 구현
  - Notion API 실제 연동
  - 데이터 변환 로직

- ⏳ Task 007: PDF 다운로드 기능 구현
  - @react-pdf/renderer 통합
  - PDF 생성 API

### Phase 3: 핵심 기능 최적화 ⏳ 예정

- Task 008: 견적서 유효성 검증 및 에러 처리
- Task 008-1: 통합 E2E 테스트
- Task 009: 성능 최적화 및 캐싱
- Task 010: 접근성 및 반응형 마감

### Phase 4: 배포 ⏳ 예정

- Task 011: 배포 파이프라인 구축 및 운영 준비

---

## 📋 Notion 설정 체크리스트

빠른 참조용 체크리스트:

- [ ] **Notion Integration 생성**
  - [ ] Integration 토큰 복사
  - [ ] `.env.local`에 `NOTION_API_KEY` 입력

- [ ] **Invoices 데이터베이스 생성 (10개 속성)**
  - [ ] 제목 (Title)
  - [ ] invoice_number (Text)
  - [ ] client_name (Text)
  - [ ] client_email (Email)
  - [ ] issue_date (Date)
  - [ ] valid_until (Date)
  - [ ] status (Select: draft/sent/viewed/paid)
  - [ ] items (Relation → InvoiceItems)
  - [ ] total_amount (Number)
  - [ ] notes (Text)

- [ ] **InvoiceItems 데이터베이스 생성 (6개 속성)**
  - [ ] 제목 (Title)
  - [ ] description (Text)
  - [ ] quantity (Number)
  - [ ] unit_price (Number)
  - [ ] amount (Formula: `prop("quantity") * prop("unit_price")`)
  - [ ] invoice_id (Relation → Invoices)

- [ ] **Integration 권한 부여**
  - [ ] Invoices DB 공유 → invoice-web Integration 추가
  - [ ] InvoiceItems DB 공유 → invoice-web Integration 추가

- [ ] **샘플 데이터 입력**
  - [ ] Invoices에 최소 1개 레코드
  - [ ] InvoiceItems에 2-3개 항목
  - [ ] 항목과 견적서 연결

- [ ] **로컬 테스트**
  - [ ] `npm run dev` 실행
  - [ ] 페이지 ID로 견적서 조회 테스트
  - [ ] 렌더링 확인

---

## 🔗 상세 참고 문서

더 자세한 내용은 다음 문서를 참고하세요:

1. **[NOTION_SETUP.md](./NOTION_SETUP.md)**
   - Notion Integration 생성 상세 가이드
   - 데이터베이스 속성 설정 상세
   - API 키 검증 방법
   - 문제 해결 (FAQ)

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - 전체 시스템 아키텍처 다이어그램
   - 데이터 흐름 상세 분석
   - 컴포넌트 계층 구조
   - 스타일링 아키텍처
   - 보안 아키텍처
   - 배포 아키텍처

3. **[CLAUDE.md](../CLAUDE.md)**
   - AI 개발자 작업 가이드
   - 프로젝트 구조 및 라우팅
   - 컴포넌트 계층
   - Notion 연동 규칙
   - 스타일링 규칙

4. **[PRD.md](./PRD.md)**
   - 제품 요구사항 정의
   - 기능 명세
   - 사용자 여정
   - 데이터 모델

5. **[README.md](../README.md)**
   - 프로젝트 실행 방법
   - 배포 방법
   - 개발 명령어

---

## ❓ 자주 묻는 질문

### Q1: Notion 데이터베이스를 먼저 만들어야 하나요?

**A:** 네, 다음 순서를 권장합니다:

1. Notion Integration 생성 및 API 키 복사
2. `.env.local` 파일에 API 키 설정
3. Invoices, InvoiceItems 데이터베이스 생성
4. Integration에 데이터베이스 접근 권한 부여
5. 로컬 개발 서버에서 테스트

### Q2: Integration 권한은 무엇을 주어야 하나요?

**A:** 최소한 다음 권한이 필요합니다:

- ✅ `read` (읽기) - 견적서 데이터 조회
- ✅ `update` (수정) - 향후 기능 확장
- ✅ `insert` (작성) - 향후 기능 확장

### Q3: Notion 데이터베이스 속성명이 정확해야 하나요?

**A:** 네, **정확하게 일치**해야 합니다. 현재 코드에서 다음 속성명을 사용합니다:

```python
# 정확한 속성명 (대소문자 구분)
title               # 제목
invoice_number      # 견적서 번호
client_name         # 클라이언트명
client_email        # 이메일
issue_date          # 발행일
valid_until         # 유효기간
status              # 상태
items               # 항목 (Relation)
total_amount        # 총액
notes               # 비고
```

Task 005에서 `NOTION_PROPERTY_NAMES` 상수를 추가할 예정입니다.

### Q4: 로컬에서 테스트할 때 더미 데이터를 사용하나요?

**A:** 현재 (Task 004) 더미 데이터를 사용하고 있습니다:

- `src/lib/mock-data.ts` - 샘플 견적서 3개
- `getInvoiceFromNotion()` - 먼저 더미 데이터 확인
- Task 006에서 실제 Notion API로 전환됩니다

### Q5: PDF 다운로드는 언제 구현되나요?

**A:** Task 007에서 구현됩니다:

- `@react-pdf/renderer` 라이브러리 사용
- 한글 폰트 임베딩 포함
- API Route로 PDF 생성
- 파일명 규칙: `견적서_[번호]_[클라이언트명].pdf`

---

## 🎯 다음 단계

### Task 005: Notion 연동 기반 구축 준비 사항

**필수 완료 항목:**

1. [ ] [NOTION_SETUP.md](./NOTION_SETUP.md) 따라 데이터베이스 설정
2. [ ] Notion Integration 생성 및 API 키 복사
3. [ ] `.env.local` 파일에 API 키 입력
4. [ ] Invoices, InvoiceItems 데이터베이스 생성
5. [ ] Integration에 권한 부여
6. [ ] 샘플 데이터 최소 1개 입력

**구현 계획:**

- 환경 변수 검증 강화
- `normalizeNotionPageId()` 3가지 형식 지원 (32자 hex, UUID, URL)
- `InvoiceLookup` 폼과 라우팅 연결
- Notion Integration 설정 가이드 추가

---

**📝 문서 버전**: v1.0
**📅 작성일**: 2026-08-06
**✅ 상태**: 프로젝트 개요 및 Notion 설정 완료
