/**
 * Notion API와 견적서 관련 타입 정의
 */

/**
 * 견적서 상태
 */
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid';

/**
 * 견적서 상태 매핑 (Notion select 필드값 → InvoiceStatus)
 */
export const INVOICE_STATUS_MAP: Record<string, InvoiceStatus> = {
  'draft (작성 중)': 'draft',
  draft: 'draft',
  sent: 'sent',
  viewed: 'viewed',
  paid: 'paid',
};

/**
 * 견적서 항목
 * Notion InvoiceItems 테이블에서 파싱됨
 */
export interface InvoiceItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  invoiceId?: string;
}

/**
 * 견적서
 * Notion Invoices 테이블에서 파싱됨
 */
export interface Invoice {
  id: string;
  notionPageId: string;
  title: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  validUntil: string;
  items: InvoiceItem[];
  notes?: string;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 견적서 요약 정보 (관리자 목록 화면용)
 * 상세 항목(items)을 제외한 견적서 정보
 */
export type InvoiceSummary = Omit<Invoice, 'items'>;

/**
 * 견적서 목록 조회 결과
 * 페이지네이션을 위한 커서 기반 정보 포함
 */
export interface InvoiceListResult {
  invoices: InvoiceSummary[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * 커서 기반 페이지네이션 상태 (F034, Task 603)
 *
 * Notion Database Query API는 "다음" 방향의 커서(`next_cursor`)만 제공하며
 * 뒤로 가기(이전 페이지)용 커서를 별도로 제공하지 않는다. 따라서 "이전" 이동은
 * 지금까지 방문한 커서를 스택(`prevCursors`)에 누적해두었다가, 마지막 커서를
 * 꺼내 그 지점으로 재조회하는 방식으로 구현한다.
 *
 * 예) 1페이지(cursor=undefined) → 2페이지 이동 시 prevCursors=[undefined],
 *     cursor=<1페이지의 nextCursor> → "이전" 클릭 시 prevCursors에서 pop하여
 *     그 값을 새 cursor로 사용
 *
 * 이 상태는 URL의 searchParams에 직렬화되어 새로고침·공유 시에도 페이지 위치가
 * 보존되도록 한다 (실제 연동은 Task 612의 범위).
 */
export interface PaginationState {
  /** 현재 페이지 조회에 사용된 커서. 첫 페이지는 undefined */
  cursor?: string;
  /** 지금까지 방문한 이전 커서들의 스택 (뒤로 가기용) */
  prevCursors: (string | undefined)[];
  /** 다음 페이지 존재 여부 (Notion API의 has_more) */
  hasMore: boolean;
}

/**
 * 대시보드 통계 요약 (F030, Task 604)
 * 견적서 목록 조회 결과(`InvoiceListResult`/`InvoiceSummary[]`)를 집계하여 산출한다.
 * N+1을 피하기 위해 항목(items) relation을 순회하지 않고, 목록 property 값만 사용한다 (Task 612에서 구현).
 */
export interface DashboardStats {
  /** 전체 견적서 건수 */
  totalInvoices: number;
  /** 상태별 건수 (draft/sent/viewed/paid) */
  invoicesByStatus: Record<InvoiceStatus, number>;
  /** 전체 견적 금액 합계 (currency 혼재 시 단순 합산 — 통화 다중화는 이번 범위 밖) */
  totalAmount: number;
  /** 고유 클라이언트 수 (clientName 기준 집계) */
  totalClients: number;
}

/**
 * 최근 활동 종류 (Task 604)
 * 노션에 별도의 활동 로그가 없으므로, v3.0에서는 견적서의 createdAt/updatedAt을
 * 활동으로 해석하는 범위로 한정한다.
 * - 'issued': createdAt 기준 신규 발행으로 해석
 * - 'updated': updatedAt이 createdAt과 달라 갱신이 있었던 것으로 해석
 * 이 구분은 실제 감사 로그가 아닌 추정치이므로, 화면에는 "추정" 임을 표기하는 것을 권장한다.
 */
export type ActivityType = 'issued' | 'updated';

/**
 * 최근 활동 항목 (F030, Task 604)
 */
export interface ActivityItem {
  /** 활동 종류 */
  type: ActivityType;
  /** 대상 견적서 요약 (제목·번호·클라이언트 등 표시에 필요한 최소 정보) */
  invoice: Pick<
    InvoiceSummary,
    'id' | 'notionPageId' | 'title' | 'invoiceNumber' | 'clientName' | 'status'
  >;
  /** 활동 발생 시각 (ISO 문자열, createdAt 또는 updatedAt) */
  occurredAt: string;
}

/**
 * 클라이언트 요약 정보 (F030, Task 604)
 *
 * 클라이언트 도출 전략: 별도의 클라이언트 전용 Notion DB를 신설하지 않고,
 * 견적서 목록의 `clientName`을 기준으로 그룹핑하여 집계하는 방식을 채택한다
 * (v3.0 권장안). 신규 DB 없이 시작할 수 있고, 기존 `getInvoiceListFromNotion()`
 * 데이터만으로 파생 가능하다는 것이 근거다. 클라이언트를 독립 엔티티로
 * 정식 관리해야 할 필요(예: 클라이언트별 메모, 다중 이메일)가 생기면
 * 이후 버전에서 전용 DB 도입을 재검토한다.
 */
export interface ClientSummary {
  /** 클라이언트명 (그룹핑 키) */
  clientName: string;
  /** 대표 이메일 (가장 최근 견적서의 clientEmail 사용) */
  clientEmail: string;
  /** 해당 클라이언트에게 발행된 견적서 건수 */
  invoiceCount: number;
  /** 누적 견적 금액 합계 */
  totalAmount: number;
  /** 가장 최근 거래일 (issueDate 기준 내림차순 최상단) */
  lastTransactionDate: string;
}

/**
 * 이메일 공유 입력 검증 규칙 (F033, Task 605)
 * 클라이언트(UI)와 서버(API 라우트) 양쪽에서 동일한 상한을 적용하기 위해
 * 상수로 명문화한다. 서버 측 재검증은 Task 613에서 구현한다.
 */
export const EMAIL_SHARE_LIMITS = {
  /** 제목 최대 길이 (문자 수) */
  SUBJECT_MAX_LENGTH: 100,
  /** 본문 최대 길이 (문자 수) */
  MESSAGE_MAX_LENGTH: 2000,
  /** 이메일 형식 검증 정규식 (RFC 5322 간소화 버전) */
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** 헤더 인젝션 방지: 수신자·제목에서 금지되는 개행 문자 패턴 */
  FORBIDDEN_HEADER_CHARS: /[\r\n]/,
} as const;

/**
 * 이메일 공유 요청 (F033, Task 605)
 * 관리자가 견적서 공유 링크를 클라이언트에게 이메일로 발송할 때 사용하는 입력값
 */
export interface EmailShareRequest {
  /** 발송 대상 견적서의 Notion 페이지 ID */
  notionPageId: string;
  /** 수신자 이메일. 기본값은 해당 견적서의 clientEmail (Task 609에서 자동 채움) */
  recipientEmail: string;
  /** 메일 제목 */
  subject: string;
  /** 메일 본문 (공유 링크는 서버에서 자동 삽입되므로 본문에는 안내 메시지만 포함) */
  message: string;
}

/**
 * 이메일 발송 결과 (F033, Task 605)
 */
export interface EmailSendResult {
  /** 발송 성공 여부 */
  success: boolean;
  /** 이메일 제공자가 반환한 메시지 ID (성공 시) */
  providerMessageId?: string;
  /** 실패 사유 (실패 시, 사용자 친화적 메시지) */
  failureReason?: string;
}

/**
 * 신고 처리 상태 (F035, Task 606)
 */
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

/**
 * 신고 (F035, Task 606)
 *
 * ## 데이터 저장소 결정
 * 노션에 `Reports` 데이터베이스를 신설하는 방식을 기본안으로 채택한다.
 * 필요한 속성(컬럼) 스키마는 `docs/NOTION_SETUP.md`에 문서화한다 (아래 참조).
 *
 * ## 접수 경로 범위 확정
 * v3.0에서는 **관리자 수동 등록으로 한정**한다. 공개 접수(비인증 사용자가 직접
 * 신고를 제출하는 경로)는 이번 범위에 포함하지 않는다. 공개 접수를 허용할 경우
 * 속도 제한·봇 방지(CAPTCHA 등)가 추가로 필요하므로, 그 필요성이 확인되면
 * 별도 Task로 분리해 착수한다.
 */
export interface Report {
  /** 신고 ID (Notion 페이지 ID) */
  id: string;
  /** 대상 견적서의 Notion 페이지 ID */
  targetNotionPageId: string;
  /** 대상 견적서 표시용 정보 (제목·번호 등, 목록에서 링크 텍스트로 사용) */
  targetInvoiceTitle: string;
  /** 신고 사유 */
  reason: string;
  /** 신고자 이름 또는 식별 정보 (제3자 입력이므로 렌더링 시 반드시 이스케이프) */
  reporterName: string;
  /** 신고자 이메일 (선택, 회신용) */
  reporterEmail?: string;
  /** 접수 시각 (ISO 문자열) */
  submittedAt: string;
  /** 처리 상태 */
  status: ReportStatus;
  /** 처리 이력 메모 (선택) */
  resolutionNote?: string;
}

/**
 * 신고 목록 조회 결과 (Task 606)
 * 기존 `InvoiceListResult`와 동일한 커서 구조로 일관성을 유지한다.
 */
export interface ReportListResult {
  reports: Report[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Notion 속성(Property) 타입들
 */

export interface NotionTextProperty {
  type: 'title' | 'rich_text';
  title?: Array<{ plain_text: string; href?: string | null }>;
  rich_text?: Array<{ plain_text: string; href?: string | null }>;
}

export interface NotionDateProperty {
  type: 'date';
  date: {
    start: string;
    end?: string | null;
    time_zone?: string | null;
  };
}

export interface NotionSelectProperty {
  type: 'select';
  select: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface NotionNumberProperty {
  type: 'number';
  number: number | null;
}

export interface NotionEmailProperty {
  type: 'email';
  email: string | null;
}

export interface NotionRelationProperty {
  type: 'relation';
  relation: Array<{
    id: string;
  }>;
}

export type NotionProperty =
  | NotionTextProperty
  | NotionDateProperty
  | NotionSelectProperty
  | NotionNumberProperty
  | NotionEmailProperty
  | NotionRelationProperty
  | { type: string; [key: string]: unknown };

/**
 * Notion 페이지 데이터 구조
 */
export interface NotionPageData {
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

export interface NotionPageBlock {
  object: string;
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: string;
    id: string;
  };
  last_edited_by: {
    object: string;
    id: string;
  };
  has_children: boolean;
  archived: boolean;
  type: string;
  [key: string]: unknown;
}

export interface NotionDatabase {
  object: string;
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: string;
    id: string;
  };
  last_edited_by: {
    object: string;
    id: string;
  };
  title: Array<{
    type: string;
    text: {
      content: string;
      link: string | null;
    };
  }>;
  description: unknown[];
  icon: null | {
    type: string;
    emoji: string;
  };
  cover: null | {
    type: string;
    external: {
      url: string;
    };
  };
  properties: Record<string, unknown>;
  parent: {
    type: string;
    page_id?: string;
    database_id?: string;
    workspace?: boolean;
  };
  url: string;
  public_url: string | null;
}
