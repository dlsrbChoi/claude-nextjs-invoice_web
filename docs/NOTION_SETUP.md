# 🔧 Notion 데이터베이스 설정 가이드

이 문서는 invoice-web 프로젝트와 연동할 Notion 데이터베이스를 설정하는 방법을 설명합니다.

---

## 📋 프로젝트 개요

**invoice-web**은 Notion을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 웹에서 조회 및 PDF 다운로드할 수 있는 시스템입니다.

### 아키텍처 흐름
```
Notion 데이터베이스 (견적서 데이터)
         ↓
    Notion API
         ↓
Next.js 애플리케이션
         ↓
클라이언트 (웹 브라우저)
```

### 핵심 기능
- **F001**: Notion API를 통해 견적서 데이터 실시간 조회
- **F002**: 고유 URL로 견적서 조회 페이지 표시
- **F003**: 견적서를 PDF로 다운로드

---

## 🚀 1단계: Notion Integration 생성

### 1.1 Integration 토큰 생성

1. **Notion Integrations 페이지 방문**
   - https://www.notion.so/my-integrations 접속
   - 로그인 (없으면 회원가입)

2. **"새 통합 만들기" 클릭**
   - 통합 이름: `invoice-web` (또는 원하는 이름)
   - 로고 추가 (선택사항)

3. **권한 설정**
   다음 권한을 모두 **활성화**하세요:
   - `read` (데이터베이스 읽기) ✅
   - `update` (페이지 업데이트) ✅
   - `insert` (페이지 작성) ✅

4. **"제출" 클릭 후 토큰 복사**
   ```
   ntn_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   이 토큰을 안전한 곳에 저장하세요! (재확인 불가)

### 1.2 .env.local에 토큰 등록

`.env.local` 파일 생성 (`.env.example` 참고):
```env
NOTION_API_KEY=ntn_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📊 2단계: Notion 데이터베이스 구조 설계

### 2.1 데이터베이스 구조 개요

**2개 데이터베이스가 필요합니다:**
1. **Invoices** (견적서 정보)
2. **InvoiceItems** (견적 항목)

### 2.2 Invoices 데이터베이스 (견적서)

#### 생성 방법
1. Notion 워크스페이스 열기
2. **"+ 추가"** → **"데이터베이스"** → **"테이블"** 선택
3. 이름: `Invoices`

#### 속성 정의

| 속성명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| **제목** | Title | ✅ | 견적서 제목 | "웹사이트 리디자인" |
| **invoice_number** | Text | ✅ | 견적서 번호 | "INV-2026-001" |
| **client_name** | Text | ✅ | 클라이언트 회사명 | "ABC 주식회사" |
| **client_email** | Email | ⭕ | 클라이언트 이메일 | "contact@abc.com" |
| **issue_date** | Date | ✅ | 발행일 | 2026-08-01 |
| **valid_until** | Date | ✅ | 유효기간 | 2026-09-01 |
| **status** | Select | ✅ | 견적서 상태 | draft, sent, viewed, paid |
| **items** | Relation | ✅ | 관련 항목들 | InvoiceItems.invoice_id |
| **total_amount** | Number | ✅ | 총 금액 | 2500000 |
| **notes** | Text | ⭕ | 비고/특수사항 | "결제 조건: 50% 선금" |

#### 속성 설정 상세

**1. 제목 속성 (Title)**
```
속성명: 제목
타입: Title (기본값, 변경 불가)
예: "웹사이트 리디자인 프로젝트"
```

**2. invoice_number (Text)**
```
속성명: invoice_number
타입: Text
예: INV-2026-001
필수: ✅ Yes
```

**3. client_name (Text)**
```
속성명: client_name
타입: Text
예: 아름다운 카페 주식회사
필수: ✅ Yes
```

**4. client_email (Email)**
```
속성명: client_email
타입: Email
예: contact@beautifulcafe.com
필수: ⭕ No
```

**5. issue_date (Date)**
```
속성명: issue_date
타입: Date
날짜 형식: YYYY-MM-DD
예: 2026-08-01
필수: ✅ Yes
```

**6. valid_until (Date)**
```
속성명: valid_until
타입: Date
날짜 형식: YYYY-MM-DD
예: 2026-09-01
필수: ✅ Yes
```

**7. status (Select)**
```
속성명: status
타입: Select
옵션:
  - draft (작성 중) [회색]
  - sent (발송됨) [파란색]
  - viewed (확인됨) [녹색]
  - paid (결제 완료) [빨간색]
기본값: draft
필수: ✅ Yes
```

**8. items (Relation)**
```
속성명: items
타입: Relation
연결 대상: InvoiceItems 데이터베이스
역관계: invoice_id (자동 생성)
필수: ✅ Yes
```

**9. total_amount (Number)**
```
속성명: total_amount
타입: Number
형식: Number (123456)
필수: ✅ Yes
예: 2500000
```

**10. notes (Text)**
```
속성명: notes
타입: Text (또는 Rich Text)
예: "결제 조건: 계약금 50%, 완료 시 50% 잔금"
필수: ⭕ No
```

---

### 2.3 InvoiceItems 데이터베이스 (항목)

#### 생성 방법
1. Notion 워크스페이스에서 **"+ 추가"** → **"데이터베이스"** → **"테이블"**
2. 이름: `InvoiceItems`

#### 속성 정의

| 속성명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| **제목** | Title | ✅ | 항목명 | "UI/UX 디자인" |
| **description** | Text | ⭕ | 항목 설명 | "메인 페이지 10페이지" |
| **quantity** | Number | ✅ | 수량 | 1 |
| **unit_price** | Number | ✅ | 단가 | 500000 |
| **amount** | Formula | ✅ | 금액 (자동 계산) | `prop("quantity") * prop("unit_price")` |
| **invoice_id** | Relation | ✅ | 연결된 견적서 | Invoices.items |

#### 속성 설정 상세

**1. 제목 속성 (Title)**
```
속성명: 제목
타입: Title
예: "React 프론트엔드 개발"
```

**2. description (Text)**
```
속성명: description
타입: Text (또는 Rich Text)
예: "80시간 기반 개발"
필수: ⭕ No
```

**3. quantity (Number)**
```
속성명: quantity
타입: Number
형식: Number (123456)
예: 2
필수: ✅ Yes
```

**4. unit_price (Number)**
```
속성명: unit_price
타입: Number
형식: Number (123456)
예: 300000
필수: ✅ Yes
```

**5. amount (Formula)** ⭐ **중요**
```
속성명: amount
타입: Formula
수식: prop("quantity") * prop("unit_price")
필수: ✅ Yes (자동 계산)
```
> 이 필드는 수량 × 단가를 자동 계산합니다.

**6. invoice_id (Relation)**
```
속성명: invoice_id
타입: Relation
연결 대상: Invoices 데이터베이스
역관계: items (Invoices.items와 자동 연결)
필수: ✅ Yes
```

---

## 🔗 3단계: Integration 권한 설정

### 3.1 데이터베이스 접근 권한 부여

Integration이 생성한 후, 각 데이터베이스에 접근 권한을 부여해야 합니다.

#### Invoices 데이터베이스에 권한 부여

1. Invoices 데이터베이스 페이지 열기
2. **우측 상단 "공유"** 버튼 클릭
3. **"초대"** 섹션에서 생성한 Integration 검색
4. `invoice-web` Integration 선택 후 **"추가"**
5. 권한 선택:
   - ✅ View (읽기)
   - ✅ Update (수정)
   - ✅ Insert (작성)

#### InvoiceItems 데이터베이스에 권한 부여

같은 방법으로 InvoiceItems 데이터베이스에도 권한 부여하세요.

---

## 📝 4단계: 테스트 데이터 입력

### 4.1 Invoices 데이터베이스에 샘플 데이터 추가

**첫 번째 견적서**
| 필드 | 값 |
|------|-----|
| 제목 | 웹사이트 리디자인 프로젝트 |
| invoice_number | INV-2026-001 |
| client_name | 아름다운 카페 주식회사 |
| client_email | contact@beautifulcafe.com |
| issue_date | 2026-08-01 |
| valid_until | 2026-08-31 |
| status | sent |
| total_amount | 2150000 |
| notes | 결제 조건: 계약금 50%, 완료 시 50% 잔금 |

### 4.2 InvoiceItems 데이터베이스에 항목 추가

**첫 번째 항목**
| 필드 | 값 |
|------|-----|
| 제목 | UI/UX 디자인 |
| description | 메인페이지 및 서브페이지 UI/UX 디자인 (10페이지) |
| quantity | 1 |
| unit_price | 500000 |
| invoice_id | 웹사이트 리디자인 프로젝트 (위의 견적서 선택) |

**두 번째 항목**
| 필드 | 값 |
|------|-----|
| 제목 | React 프론트엔드 개발 |
| description | 리액트 기반 프론트엔드 개발 (80시간 기준) |
| quantity | 2 |
| unit_price | 300000 |
| invoice_id | 웹사이트 리디자인 프로젝트 |

---

## 🔑 5단계: API 키 검증

### 5.1 로컬 개발 서버에서 테스트

```bash
# 1. 환경 변수 설정 확인
cat .env.local
# NOTION_API_KEY=ntn_XXX...

# 2. 개발 서버 시작
npm run dev

# 3. 브라우저에서 http://localhost:3000 접속
# 4. Notion 페이지 ID 입력하여 견적서 조회 테스트
```

### 5.2 페이지 ID 찾기

Notion에서 견적서 페이지의 ID를 찾는 방법:

1. **Invoices 데이터베이스 열기**
2. 추가한 견적서 레코드 클릭하여 상세 페이지 열기
3. **우측 상단 "공유" → "링크 복사"** (또는 주소창 URL 복사)
4. URL 형식: `https://www.notion.so/Title-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=xxx`
5. 마지막 32자 부분이 **페이지 ID**
   ```
   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 5.3 localhost에서 테스트

브라우저 주소창에 입력:
```
http://localhost:3000/invoice/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🎯 6단계: 데이터 매핑 확인

### 코드에서의 데이터 매핑

`src/lib/notion.ts`에서 다음과 같이 Notion 속성과 Application 필드를 매핑합니다:

```typescript
// Notion Property → Application Field
const title = extractTextProperty(properties, 'title')              // 제목
const clientName = extractTextProperty(properties, 'client_name')   // 클라이언트명
const clientEmail = extractTextProperty(properties, 'client_email') // 이메일
const issueDate = extractDateProperty(properties, 'issue_date')     // 발행일
const validUntil = extractDateProperty(properties, 'valid_until')   // 유효기간
const status = extractSelectProperty(properties, 'status')          // 상태
const totalAmount = properties.total_amount?.number || 0            // 총액
const notes = extractTextProperty(properties, 'notes')              // 비고
```

**중요**: Notion 속성명은 정확하게 일치해야 합니다!

---

## ⚠️ 문제 해결

### Q1: "NOTION_API_KEY 환경 변수가 설정되지 않았습니다" 오류

**해결**:
1. `.env.local` 파일이 프로젝트 루트에 존재하는지 확인
2. `NOTION_API_KEY=ntn_...` 정확히 입력되어 있는지 확인
3. 개발 서버를 **재시작** (`npm run dev`)

### Q2: "요청하신 견적서를 찾을 수 없습니다" 404 오류

**해결**:
1. 페이지 ID가 올바른지 확인
2. Integration이 Invoices 데이터베이스에 접근 권한이 있는지 확인
3. Notion에서 해당 레코드가 삭제되지 않았는지 확인

### Q3: 항목이 표시되지 않음

**해결**:
1. InvoiceItems 데이터베이스에 항목 레코드 추가했는지 확인
2. `invoice_id` 필드에 올바른 견적서가 연결되어 있는지 확인
3. Integration이 InvoiceItems 데이터베이스에 접근 권한이 있는지 확인

### Q4: 데이터가 변경되었는데 웹에 반영되지 않음

**해결**:
1. 페이지 새로고침 (Ctrl+R 또는 Cmd+R)
2. 브라우저 캐시 삭제
3. Task 009에서 캐싱 전략 최적화 예정

---

## 📚 참고 자료

- [Notion API 문서](https://developers.notion.com/)
- [Notion Integration 가이드](https://www.notion.so/Integrations-and-connected-apps-42e13b69c9ca4dd4a7e9a43cae1c0e56)
- [프로젝트 README.md](../README.md)
- [프로젝트 CLAUDE.md](../CLAUDE.md)

---

## ✅ 체크리스트

Notion 설정을 완료했는지 확인하세요:

- [ ] Notion Integration 생성 및 토큰 획득
- [ ] `.env.local`에 `NOTION_API_KEY` 입력
- [ ] `Invoices` 데이터베이스 생성 (10개 속성)
- [ ] `InvoiceItems` 데이터베이스 생성 (6개 속성)
- [ ] Integration에 두 데이터베이스 접근 권한 부여
- [ ] 샘플 데이터 입력 (최소 1개 견적서 + 2개 항목)
- [ ] localhost에서 페이지 ID로 견적서 조회 테스트

모든 항목을 완료하면 **Task 005: Notion 연동 기반 구축** 시작 준비 완료! 🚀

---

**📝 문서 버전**: v1.0
**📅 작성일**: 2026-08-06
**🔄 상태**: Notion 데이터베이스 설정 완료 (Task 005 준비)
