# 타입 정의 및 인터페이스 설계 분석

## 📊 Notion 데이터베이스 구조 분석

### 1. Invoices 테이블 구조

**CSV 헤더 분석:**

```
제목, client_email, client_name, invoice_number, issue_date, items, notes, status, total_amount, valid_until
```

**Notion Properties 매핑:**

| 필드명         | Notion 타입 | 설명                             | 값 예시                      |
| -------------- | ----------- | -------------------------------- | ---------------------------- |
| 제목           | Title       | 견적서 제목                      | "웹사이트 리디자인 프로젝트" |
| client_email   | Email       | 클라이언트 이메일                | "contact@beautifulcafe.com"  |
| client_name    | Text        | 클라이언트 이름                  | "아름다운 카페 주식회사"     |
| invoice_number | Text        | 견적서 번호                      | "INV-2026-001"               |
| issue_date     | Date        | 발급일                           | "2026년 8월 1일"             |
| items          | Relation    | InvoiceItems 테이블과의 관계     | [Link to items]              |
| notes          | Text        | 비고/조건                        | "결제 조건: 계약금 50%..."   |
| status         | Select      | 상태 (draft, sent, viewed, paid) | "draft (작성 중)"            |
| total_amount   | Number      | 총액                             | "₩2,500,000"                 |
| valid_until    | Date        | 유효기간 만료일                  | "2026년 9월 1일"             |

### 2. InvoiceItems 테이블 구조

**CSV 헤더 분석:**

```
제목, amount, description, invoice_id, quantity, unit_price
```

**Notion Properties 매핑:**

| 필드명      | Notion 타입 | 설명                         | 값 예시                 |
| ----------- | ----------- | ---------------------------- | ----------------------- |
| 제목        | Title       | 항목명                       | "React 프론트엔드 개발" |
| amount      | Number      | 총액 (quantity × unit_price) | 600000                  |
| description | Text        | 상세 설명                    | "80시간 기반 개발"      |
| invoice_id  | Relation    | Invoices 테이블과의 역관계   | [Link to invoice]       |
| quantity    | Number      | 수량                         | 2                       |
| unit_price  | Number      | 단가                         | "₩300,000"              |

---

## 🔄 현재 타입 정의 vs 실제 데이터 비교

### 현재 타입 정의 (types.ts)

```typescript
export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  description?: string;
}

export interface Invoice {
  id: string;
  notionPageId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid';
  createdAt: string;
  updatedAt: string;
}
```

### 문제점 분석

#### **1. 필드명 불일치**

| 현재 타입     | Notion 데이터  | 비고             |
| ------------- | -------------- | ---------------- |
| `dueDate`     | `valid_until`  | ❌ 필드명이 다름 |
| `clientName`  | `client_name`  | ✓ 매핑 가능      |
| `clientEmail` | `client_email` | ✓ 매핑 가능      |
| `issueDate`   | `issue_date`   | ✓ 매핑 가능      |

#### **2. 데이터 타입 문제**

- **issue_date**: "2026년 8월 1일" (한글 문자열)
  - 현재: ISO 8601 형식 기대 (2026-08-01)
  - 개선: `NotionDateProperty` 타입으로 유연한 파싱 필요

- **total_amount**: "₩2,500,000" (통화 기호 포함 문자열)
  - 현재: Number 타입
  - 개선: 숫자 추출 함수 필요

- **status**: "draft (작성 중)" (선택지에 설명 포함)
  - 현재: 'draft' | 'sent' | 'viewed' | 'paid'
  - 개선: 상태값 정규화 필요

#### **3. 항목(items) 관계 처리**

- 현재: `InvoiceItem[]` 배열로 직접 포함
- Notion: Relation 필드로 다른 테이블 참조
- 개선: Relation 데이터 구조 정의 필요

---

## ✅ 개선된 타입 정의

### 1. Notion 데이터 구조 정의

```typescript
/**
 * Notion 텍스트 속성 (Text, Title, Rich Text)
 */
interface NotionTextProperty {
  type: 'title' | 'rich_text';
  title?: Array<{ plain_text: string; href?: string | null }>;
  rich_text?: Array<{ plain_text: string; href?: string | null }>;
}

/**
 * Notion 날짜 속성 (유연한 포맷 지원)
 */
interface NotionDateProperty {
  type: 'date';
  date: {
    start: string; // ISO 8601 또는 한글 형식
    end?: string | null;
    time_zone?: string | null;
  };
}

/**
 * Notion 선택지 속성
 */
interface NotionSelectProperty {
  type: 'select';
  select: {
    id: string;
    name: string;
    color: string;
  } | null;
}

/**
 * Notion 숫자 속성
 */
interface NotionNumberProperty {
  type: 'number';
  number: number | null;
}

/**
 * Notion 이메일 속성
 */
interface NotionEmailProperty {
  type: 'email';
  email: string | null;
}

/**
 * Notion Relation 속성 (다른 테이블 참조)
 */
interface NotionRelationProperty {
  type: 'relation';
  relation: Array<{
    id: string;
  }>;
}

/**
 * Notion 페이지 속성 (모든 타입 통합)
 */
type NotionProperty =
  | NotionTextProperty
  | NotionDateProperty
  | NotionSelectProperty
  | NotionNumberProperty
  | NotionEmailProperty
  | NotionRelationProperty
  | { type: string; [key: string]: unknown };

/**
 * Notion 페이지 구조
 */
interface NotionPageData {
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: { object: string; id: string };
  last_edited_by: { object: string; id: string };
  cover?: { type: string; external?: { url: string } } | null;
  icon?: { type: string; emoji: string } | null;
  parent: {
    type: 'database_id' | 'page_id' | 'workspace' | 'block';
    database_id?: string;
    page_id?: string;
  };
  archived: boolean;
  properties: Record<string, NotionProperty>;
  url: string;
  public_url?: string | null;
}
```

### 2. 도메인 타입 정의 (실제 비즈니스 로직용)

```typescript
/**
 * 견적서 항목
 * Notion InvoiceItems 테이블에서 파싱
 */
export interface InvoiceItem {
  id: string; // Notion page ID
  title: string; // 제목 (항목명)
  description: string; // 상세 설명
  quantity: number; // 수량
  unitPrice: number; // 단가 (숫자만)
  amount: number; // 총액 (quantity × unitPrice)
  invoiceId?: string; // 관련 견적서 ID
}

/**
 * 견적서
 * Notion Invoices 테이블에서 파싱
 */
export interface Invoice {
  id: string; // Notion page ID
  notionPageId: string; // Notion 페이지 URL 파라미터용
  title: string; // 제목
  invoiceNumber: string; // 견적서 번호 (INV-2026-001)
  clientName: string; // 클라이언트 이름
  clientEmail: string; // 클라이언트 이메일
  issueDate: string; // 발급일 (ISO 8601: YYYY-MM-DD)
  validUntil: string; // 유효기간 만료일 (ISO 8601)
  items: InvoiceItem[]; // 항목 배열
  notes?: string; // 비고 (결제 조건 등)
  totalAmount: number; // 총액 (숫자만)
  currency: string; // 통화 코드 (KRW, USD 등)
  status: InvoiceStatus; // 상태
  createdAt: string; // 생성 일시
  updatedAt: string; // 수정 일시
}

/**
 * 견적서 상태
 */
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid';

/**
 * 견적서 상태 매핑
 */
export const INVOICE_STATUS_MAP: Record<string, InvoiceStatus> = {
  'draft (작성 중)': 'draft',
  draft: 'draft',
  sent: 'sent',
  viewed: 'viewed',
  paid: 'paid',
};
```

---

## 🔧 파싱 함수 설계

### 1. 텍스트 속성 추출 (개선)

```typescript
/**
 * Notion 텍스트 속성에서 평문 추출
 * 여러 형식 (title, rich_text) 모두 지원
 */
export function extractTextFromProperty(prop: NotionProperty | undefined): string | null {
  if (!prop) return null;

  if (prop.type === 'title' && 'title' in prop) {
    const title = prop as NotionTextProperty;
    return title.title?.map((t) => t.plain_text).join('') ?? null;
  }

  if (prop.type === 'rich_text' && 'rich_text' in prop) {
    const richText = prop as NotionTextProperty;
    return richText.rich_text?.map((t) => t.plain_text).join('') ?? null;
  }

  return null;
}
```

### 2. 날짜 파싱 (개선 - 한글 포맷 지원)

```typescript
/**
 * Notion 날짜를 ISO 8601 형식으로 변환
 * 지원: "2026년 8월 1일", "2026-08-01", "Aug 1, 2026"
 */
export function parseDateToISO(dateStr: string): string {
  // 한글 포맷: "2026년 8월 1일"
  const koreanMatch = dateStr.match(/(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일/);
  if (koreanMatch) {
    const [, year, month, day] = koreanMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // ISO 포맷: "2026-08-01"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // 영문 포맷: "Aug 1, 2026"
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  // 파싱 실패
  throw new Error(`날짜 형식을 인식할 수 없습니다: ${dateStr}`);
}
```

### 3. 숫자 추출 (통화 기호 제거)

```typescript
/**
 * 통화 기호가 포함된 숫자 문자열을 숫자로 변환
 * 지원: "₩2,500,000", "2,500,000", "2500000", "$1,000"
 */
export function parseAmount(amountStr: string): number {
  // 모든 비숫자 문자 제거 (숫자와 마이너스 부호만 유지)
  const numericStr = amountStr.replace(/[^\d\-]/g, '');
  const parsed = parseInt(numericStr, 10);

  if (isNaN(parsed)) {
    throw new Error(`금액 형식을 인식할 수 없습니다: ${amountStr}`);
  }

  return parsed;
}
```

### 4. 상태값 정규화

```typescript
/**
 * Notion select 필드의 상태값을 InvoiceStatus로 변환
 * 지원: "draft (작성 중)", "draft", "sent" 등
 */
export function normalizeStatus(statusStr: string): InvoiceStatus {
  const normalized = statusStr.toLowerCase().trim();

  // 한글 설명 제거: "draft (작성 중)" → "draft"
  const baseStatus = normalized.split('(')[0].trim();

  if (baseStatus in INVOICE_STATUS_MAP) {
    return INVOICE_STATUS_MAP[baseStatus];
  }

  // 기본값
  return 'draft';
}
```

### 5. Invoice 파싱 함수 (통합)

```typescript
/**
 * Notion 페이지 데이터를 Invoice 객체로 변환
 */
export async function parseInvoiceFromNotionPage(pageData: NotionPageData): Promise<Invoice> {
  const props = pageData.properties;

  // 필수 필드 추출
  const title = extractTextFromProperty(props['제목']) ?? 'Untitled';
  const clientName = extractTextFromProperty(props['client_name']) ?? 'Unknown Client';
  const clientEmail = extractEmailFromProperty(props['client_email']) ?? '';
  const invoiceNumber = extractTextFromProperty(props['invoice_number']) ?? '';

  // 날짜 파싱
  const issueDate =
    parseDateFromProperty(props['issue_date']) ?? new Date().toISOString().split('T')[0];
  const validUntil = parseDateFromProperty(props['valid_until']) ?? issueDate;

  // 상태 파싱
  const statusStr = extractSelectFromProperty(props['status']) ?? 'draft';
  const status = normalizeStatus(statusStr);

  // 항목 로드 (Relation 참조)
  const items = await loadRelatedItems(pageData.id, props['items']);

  // 총액 계산
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // 비고
  const notes = extractTextFromProperty(props['notes']) ?? '';

  // 통화 (기본값: KRW)
  const currency = extractSelectFromProperty(props['통화']) ?? 'KRW';

  return {
    id: pageData.id,
    notionPageId: pageData.id,
    title,
    invoiceNumber,
    clientName,
    clientEmail,
    issueDate,
    validUntil,
    items,
    notes,
    totalAmount,
    currency,
    status,
    createdAt: pageData.created_time,
    updatedAt: pageData.last_edited_time,
  };
}

/**
 * Relation 필드를 통해 관련 항목 로드
 */
async function loadRelatedItems(
  invoiceId: string,
  relationProp?: NotionProperty
): Promise<InvoiceItem[]> {
  if (!relationProp || relationProp.type !== 'relation') {
    return [];
  }

  const relatedItemIds = (relationProp as NotionRelationProperty).relation.map((r) => r.id);

  // 각 항목 페이지 로드
  const items = await Promise.all(
    relatedItemIds.map((itemId) => fetchAndParseInvoiceItem(itemId, invoiceId))
  );

  return items.filter((item): item is InvoiceItem => item !== null);
}
```

---

## 📋 마이그레이션 체크리스트

### Phase 1: 타입 정의 업데이트 (즉시)

- [ ] `src/lib/types.ts` 업데이트 (새로운 인터페이스 추가)
- [ ] Notion 데이터 구조 인터페이스 추가
- [ ] `InvoiceStatus` 타입 정의 추가

### Phase 2: 파싱 함수 구현 (Task 006)

- [ ] `parseAmount()` 함수 구현
- [ ] `parseDateToISO()` 함수 구현 (한글 지원)
- [ ] `normalizeStatus()` 함수 구현
- [ ] `loadRelatedItems()` 함수 구현
- [ ] `parseInvoiceFromNotionPage()` 통합 함수 구현

### Phase 3: 더미 데이터 업데이트

- [ ] `mock-data.ts`에서 `dueDate` → `validUntil` 필드명 변경
- [ ] `invoiceNumber` 필드 추가
- [ ] 통화 기호 제거 (₩2,500,000 → 2500000)

### Phase 4: 컴포넌트 업데이트

- [ ] `InvoiceDetail` 컴포넌트 필드명 동기화
- [ ] `format.ts`의 포맷팅 함수 업데이트

### Phase 5: 테스트

- [ ] TypeScript 컴파일 검증
- [ ] 더미 데이터로 UI 렌더링 확인
- [ ] 실제 Notion API 데이터 파싱 테스트

---

## 🎯 결론

### 주요 변경사항

1. **필드명 정규화**: `dueDate` → `validUntil`, `invoiceNumber` 추가
2. **데이터 타입 강화**: 통화 기호 자동 제거, 날짜 다양한 포맷 지원
3. **Notion API 구조화**: Notion 고유의 데이터 구조를 명시적으로 정의
4. **에러 처리 개선**: 파싱 실패 시 구체적인 에러 메시지 제공

### 호환성

- 기존 더미 데이터는 마이너한 수정으로 호환 가능
- 실제 Notion API 연동 시 최소한의 변경 필요
- TypeScript strict mode 완전 준수
