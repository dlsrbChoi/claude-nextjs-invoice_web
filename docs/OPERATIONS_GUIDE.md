# 운영 가이드 - Notion 기반 견적서 관리 시스템

## 🚀 시스템 개요

**노션 기반 견적서 관리 시스템**은 Notion을 데이터베이스로 활용하여 프리랜서와 소규모 기업이 견적서를 손쉽게 발행하고 관리할 수 있는 시스템입니다.

### 주요 기능

- ✅ **Notion 데이터베이스 연동**: 별도의 서버 DB 없이 Notion을 데이터 소스로 사용
- ✅ **고유 URL 조회**: `/invoice/[notionPageId]` 형식의 공유 가능한 링크
- ✅ **PDF 다운로드**: 견적서를 PDF로 저장 및 인쇄
- ✅ **응답형 디자인**: 모바일/태블릿/데스크톱 모두 지원
- ✅ **라이트/다크 모드**: 사용자 선호도에 따른 테마 전환

---

## 📋 초기 설정 가이드

### 1단계: Notion Integration 생성

1. **Notion 설정 접속**
   - https://www.notion.so/my-integrations 방문
   - "새 통합" 또는 "+ New integration" 클릭

2. **통합 정보 설정**
   - 통합 이름: `Invoice Web`
   - 로고: (선택사항)
   - "제출" 클릭

3. **API 키 복사**
   - 생성된 통합의 "Secrets" 탭에서 `Internal Integration Token` 복사
   - 형식: `secret_xxxxxxxxxxxxx` 또는 `sk-xxxxxxxxxxxxx`
   - **주의**: 이 키를 공개하지 마세요!

4. **권한 설정**
   - "Capabilities" 탭에서 다음 권한 활성화:
     - ✅ Read content
     - ✅ Read user information over web (optional)
   - "Save" 클릭

### 2단계: Notion 데이터베이스 생성

#### A. Invoices 테이블 (견적서 마스터)

**위치**: Notion 워크스페이스의 아무곳이나 생성 가능

**테이블 구조**:

| Property 이름      | 타입     | 설명           | 예시                        |
| ------------------ | -------- | -------------- | --------------------------- |
| **제목**           | Title    | 견적서 제목    | "2026년 8월 웹개발 견적서"  |
| **client_name**    | Text     | 고객사명       | "ABC 회사"                  |
| **client_email**   | Email    | 고객 이메일    | "contact@abc.com"           |
| **invoice_number** | Text     | 송장/견적 번호 | "INV-2026-001"              |
| **issue_date**     | Date     | 발급일         | "2026-08-06"                |
| **valid_until**    | Date     | 유효 기간      | "2026-09-06"                |
| **status**         | Select   | 상태           | Draft/Sent/Viewed/Paid      |
| **total_amount**   | Number   | 총액           | 1500000                     |
| **notes**          | Text     | 비고/약관      | "30일 유효...", "선입금..." |
| **items**          | Relation | 항목 관계      | (Items DB와 연결)           |
| **currency**       | Text     | 통화           | "KRW", "USD"                |

#### B. Items 테이블 (견적서 항목)

**테이블 구조**:

| Property 이름   | 타입   | 설명      | 예시                                      |
| --------------- | ------ | --------- | ----------------------------------------- |
| **제목**        | Title  | 항목명    | "웹사이트 개발"                           |
| **description** | Text   | 상세 설명 | "반응형 웹사이트 개발 (모바일/태블릿/PC)" |
| **quantity**    | Number | 수량      | 1                                         |
| **unit_price**  | Number | 단가      | 1000000                                   |
| **amount**      | Number | 합계      | 1000000                                   |

### 3단계: Integration 권한 부여

1. **Invoices 테이블 공유 설정**
   - 테이블 옆 "Share" 또는 "..." 메뉴
   - "Invite" 클릭
   - 만든 Integration (`Invoice Web`)을 초대
   - 권한: "Edit" 선택

2. **Items 테이블 공유 설정**
   - 동일한 방식으로 `Invoice Web` Integration 초대

3. **페이지 ID 확인**
   - Notion 데이터베이스 페이지 URL에서 ID 추출
   - 예: `https://www.notion.so/xxxxxxxxxxxxxxxx?v=yyyyyyyy`
   - ID: `xxxxxxxxxxxxxxxx` (32자)

### 4단계: 환경 변수 설정

#### 로컬 개발 (`.env.local`)

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Vercel 배포 (Environment Variables)

1. **Vercel 대시보드** → 프로젝트 → Settings → Environment Variables
2. **변수 추가**:
   - Name: `NOTION_API_KEY`
   - Value: (Notion Integration Token)
   - Environments: Production, Preview, Development 모두 체크
3. **저장** 클릭

---

## 📊 견적서 발행 방법

### 1단계: Notion에서 견적서 작성

```
1. Invoices 테이블 → "+ New" 클릭
2. 다음 정보 입력:
   - 제목: "홍길동님 웹개발 견적서"
   - client_name: "홍길동"
   - client_email: "hong@example.com"
   - invoice_number: "INV-2026-001"
   - issue_date: 현재 날짜 선택
   - valid_until: 30일 후 날짜 선택
   - status: "Draft"
   - total_amount: 1500000
   - notes: 결제 조건 등 기타 정보
   - currency: "KRW" (또는 적절한 통화)

3. Items 테이블에서 항목 생성:
   - 제목: "웹개발"
   - quantity: 1
   - unit_price: 1500000
   - amount: 1500000

4. Invoices 테이블로 돌아가서:
   - items Relation 클릭
   - 생성한 "웹개발" 항목 선택
```

### 2단계: 견적서 URL 생성

```
1. Invoices 테이블에서 방금 생성한 견적서 행 찾기
2. 행의 "제목" 클릭해서 페이지 열기
3. 브라우저 URL에서 페이지 ID 확인:
   https://www.notion.so/xxxxxxxxxxxxxxxx?v=yyyyyyyy

4. 다음 형식으로 공유 URL 생성:
   https://invoice-web.vercel.app/invoice/xxxxxxxxxxxxxxxx

   (또는 로컬 개발 시: http://localhost:3000/invoice/xxxxxxxxxxxxxxxx)
```

### 3단계: 고객에게 링크 발송

```
이메일 템플릿:

제목: [견적서] 홍길동님 웹개발 서비스

본문:
안녕하세요,

아래 링크에서 견적서를 확인하실 수 있습니다:
https://invoice-web.vercel.app/invoice/xxxxxxxxxxxxxxxx

견적서는 30일간 유효합니다.

감사합니다.
```

### 4단계: PDF 다운로드

**고객이 할 일**:

1. 공유받은 링크 접속
2. "PDF 다운로드" 버튼 클릭
3. 인쇄 대화상자가 열리면:
   - 인쇄 방법: "PDF로 저장" 선택
   - 저장 클릭

**고객의 다른 옵션**:

- Chrome의 print preview에서 "이미지로 저장" (스크린샷)
- Ctrl+P (인쇄) → "Microsoft Print to PDF" 선택

---

## 🔄 상태 관리

### 견적서 상태 변경

Notion의 status 필드에서 다음 상태 전환:

```
Draft (작성 중)
  ↓
Sent (발송됨)
  ↓
Viewed (고객이 봤음)
  ↓
Paid (결제 완료)
```

### 상태별 의미

| 상태   | 의미                      | 표시 색상 |
| ------ | ------------------------- | --------- |
| Draft  | 아직 고객에게 보내지 않음 | 회색      |
| Sent   | 고객에게 발송함           | 파란색    |
| Viewed | 고객이 링크를 열어봤음    | 주황색    |
| Paid   | 결제 완료                 | 빨간색    |

---

## 🛠️ 트러블슈팅

### Q1: "요청하신 견적서를 찾을 수 없습니다" 에러

**원인**:

- 잘못된 페이지 ID 사용
- Notion Integration이 데이터베이스에 권한이 없음
- NOTION_API_KEY 환경 변수 오류

**해결방법**:

1. URL의 페이지 ID 확인 (32자 정확한지 확인)
2. Notion 데이터베이스 공유 설정 재확인:
   - "Share" → Integration 초대 권한 "Edit"
3. 환경 변수 재확인:
   ```bash
   # 로컬: .env.local 파일 확인
   # Vercel: Dashboard → Settings → Environment Variables
   ```

### Q2: "API 연결 시간이 초과되었습니다" 에러

**원인**:

- Notion API 서버가 느림
- 네트워크 연결 문제
- 60초 이상 걸리는 요청

**해결방법**:

1. 잠시 후 다시 시도
2. 개발자 도구 → Network 탭에서 요청 확인
3. Notion 상태 페이지 확인: status.notion.so

### Q3: 견적서는 로드되는데 항목(items)이 없어요

**원인**:

- Items 테이블이 Notion Integration에 공유되지 않음
- 잘못된 Relation 설정

**해결방법**:

1. Items 테이블도 Integration에 공유:
   - Items 테이블 → "Share" → `Invoice Web` 초대
2. Invoices의 items Relation 필드 재확인:
   - 올바른 Items 테이블과 연결되었는지 확인

### Q4: PDF를 다운로드할 수 없습니다

**원인**:

- 브라우저 인쇄 기능 차단됨
- 팝업 창이 차단되었음

**해결방법**:

1. 브라우저 설정 → 팝업 차단 해제
2. 다른 브라우저 시도 (Chrome 권장)
3. 수동 인쇄: Ctrl+P → "PDF로 저장"

---

## 📱 사용자 경험 최적화

### 모바일 사용자를 위한 가이드

1. **모바일에서 보기**:
   - 모든 콘텐츠가 자동으로 적응함
   - 항목 테이블이 카드 형식으로 변환됨

2. **PDF 다운로드**:
   - iOS: Safari에서 "다운로드" → "PDF로 저장"
   - Android: Chrome에서 공유 → "PDF로 인쇄"

### 데스크톱 최적화

1. **테이블 뷰**: 항목이 표 형식으로 표시됨
2. **인쇄 최적화**: 헤더/버튼 없이 본문만 인쇄됨
3. **어두운 모드**: 자동 적용 또는 토글 버튼으로 전환

---

## 🔒 보안 주의사항

### 중요 ⚠️

1. **API 키 보호**
   - 절대 공개하지 마세요!
   - GitHub에 커밋하지 마세요
   - Vercel 대시보드에서만 관리

2. **Notion 권한 관리**
   - Integration은 필요한 테이블만 공유
   - 정기적으로 공유 권한 검토

3. **고객 데이터**
   - 이메일 주소 등 고객 정보는 Notion에만 저장
   - 클라이언트 브라우저에서 암호화되지 않음
   - 공유 링크는 랜덤하지 않으므로 조심스럽게 발송

---

## 🔴 신고 관리 운영 절차 (v3.0 신규)

### 신고 데이터베이스 설정 (초기 설정)

#### A. Reports 테이블 생성

**위치**: Notion 워크스페이스에서 새 데이터베이스 생성

**테이블 구조**:

| Property 이름 | 타입   | 설명                  | 필수 |
| ------------- | ------ | --------------------- | ---- |
| ID            | Title  | 신고 ID (자동 생성)   | ✅   |
| Email         | Text   | 신고자 이메일         | ✅   |
| Invoice ID    | Text   | 신고 대상 견적서 ID   | ✅   |
| Content       | Text   | 신고 내용             | ✅   |
| Status        | Select | pending / resolved    | ✅   |
| Created At    | Date   | 신고 생성 시각        | ✅   |
| Resolved At   | Date   | 신고 해결 시각 (선택) |      |

**Status 옵션**: `pending` (기본), `resolved`

#### B. Integration 권한 설정

1. Notion Settings → "My Integrations" 클릭
2. 등록한 Integration 선택
3. "Capabilities" → 다음 권한 활성화:
   - ✅ Read content
   - ✅ Update content (신고 상태 변경용)
4. Reports 테이블을 Integration과 공유:
   - Notion에서 Reports 테이블 열기
   - "Share" → Integration 선택 → 권한: Full access
5. `NOTION_REPORTS_DATABASE_ID` 복사:
   - Notion URL: `https://www.notion.so/{DATABASE_ID}?v=...`
   - DATABASE_ID를 환경 변수에 설정

#### C. .env.local 또는 Vercel에서 환경 변수 설정

```env
NOTION_REPORTS_DATABASE_ID=your_reports_database_id_here
```

### 일일 신고 모니터링

#### 1단계: 관리 대시보드 접근

1. `https://your-domain.com/admin` 접속
2. 로그인 (ADMIN_PASSWORD)
3. 사이드바에서 "처리할 신고" 배지 확인 (미처리 건수)

#### 2단계: 신고 목록 조회

1. 사이드바에서 "신고" 클릭 → `/admin/reports` 이동
2. 신고 목록 표시:
   - 신고자 이메일
   - 신고 대상 견적서 ID
   - 신고 내용 (일부)
   - 신고일시
   - 상태 (pending/resolved)

#### 3단계: 신고 상세 확인 및 상태 변경

1. 신고 항목 클릭 → 상세 Dialog 열기
2. 신고 내용 전체 확인
3. **상태 변경**:
   - 드롭다운에서 "resolved" 선택
   - "저장" 버튼 클릭
   - 성공 토스트 표시 확인
4. 목록으로 돌아가기 → 해당 신고가 "resolved"로 변경됨 확인
5. 사이드바 배지 자동 감소 확인

### 신고 처리 가이드

#### 신고 내용 분류

| 유형        | 대응                         | 예시                 |
| ----------- | ---------------------------- | -------------------- |
| 잘못된 가격 | 견적서 재발행 후 고객 안내   | "금액이 틀렸다"      |
| 누락된 항목 | 항목 추가 후 견적서 업데이트 | "배송료 없음"        |
| 품질 불만   | 고객과 협의                  | "서비스가 좋지 않다" |
| 스팸/악용   | 무시 후 resolved 처리        | 의심 신고            |
| 기타        | 추가 조사 후 대응            | 모호한 신고          |

#### 신고 처리 절차

1. **신고 내용 분석**: 유형 파악
2. **고객 연락**: 필요시 이메일로 문의
3. **해결**: 견적서 수정 또는 합의
4. **상태 변경**: `resolved`로 표시
5. **기록**: Notion DB에 자동 저장됨

### 이메일 발송 모니터링 (v3.0 신규)

#### 발송 이력 확인

v3.0부터는 이메일 발송 이력이 자동으로 Notion `Email Logs` 테이블에 기록됩니다.

##### Email Logs 테이블 구조

| Property 이름 | 타입   | 설명                  |
| ------------- | ------ | --------------------- |
| ID            | Title  | 로그 ID (자동 생성)   |
| From          | Text   | 발신자 이메일         |
| To            | Text   | 수신자 이메일         |
| Subject       | Text   | 이메일 제목           |
| Invoice ID    | Text   | 관련 견적서 ID        |
| Status        | Select | sent / failed         |
| Sent At       | Date   | 발송 시각             |
| Error         | Text   | 오류 메시지 (실패 시) |

#### 발송 장애 대응

**증상**: 이메일 발송 실패 (429 또는 오류)

**확인 사항**:

1. `EMAIL_API_KEY` 설정 여부 (Resend API 키)
2. `EMAIL_FROM_ADDRESS` 설정 여부
3. 수신자 이메일 주소 유효성
4. 분당 5건 제한 초과 여부 (429)

**해결책**:

1. 환경 변수 재확인
2. Resend 대시보드에서 API 키 상태 확인
3. 메일 서버 로그 확인 (Resend 대시보드)
4. 60초 대기 후 재시도 (분당 제한 초과시)

### 정기 점검 (주간 / 월간)

#### 주간 점검 (매주 금요일)

- [ ] 미처리 신고 0건 확인 (또는 정당한 이유 문서화)
- [ ] 이메일 발송 이력에서 실패 항목 확인
- [ ] 대시보드 통계 정상 표시 확인

#### 월간 점검 (매월 1일)

- [ ] Notion Integration 권한 재검토
- [ ] 신고 데이터 백업 (선택)
- [ ] Email Logs 테이블 아카이빙 (성능상 필요시)
- [ ] API 사용량 확인 (Notion, Resend)

---

## 📞 지원 및 문제 보고

### 버그 리포팅

문제 발생 시:

1. 개발자 도구 (F12) → Console 탭에서 에러 메시지 확인
2. 환경 변수 설정 재확인
3. 로컬에서 `npm run dev` 후 테스트

### 로그 확인

**Vercel 배포 로그**:

- Vercel 대시보드 → 프로젝트 → Deployments → 로그 확인

**로컬 개발**:

```bash
npm run dev
# Terminal에서 에러 메시지 확인
```

---

## 📈 성능 및 모니터링

### Vercel Analytics

- Vercel 대시보드 → Analytics
- 확인 항목:
  - **LCP** (Largest Contentful Paint): 7.6s (Notion API 대기 시간 포함)
  - **FID** (First Input Delay): < 100ms
  - **CLS** (Cumulative Layout Shift): 0.006

### 기준값

| 지표 | 현재    | 목표    | 상태                 |
| ---- | ------- | ------- | -------------------- |
| LCP  | 7.6s    | < 2.5s  | ⚠️ (Notion API 의존) |
| FID  | < 100ms | < 100ms | ✅                   |
| CLS  | 0.006   | < 0.1   | ✅                   |

**참고**: LCP가 높은 이유는 Notion API 응답 시간 (4~5초) 때문입니다. 캐싱으로 부분 완화되지만, API 지연은 외부 요인입니다.

---

## 🎯 체크리스트

### 초기 설정

- [ ] Notion Integration 생성 완료
- [ ] API 키 복사 및 안전하게 보관
- [ ] Invoices 테이블 생성 완료
- [ ] Items 테이블 생성 완료
- [ ] Integration에 테이블 공유 완료
- [ ] 환경 변수 설정 완료 (.env.local 또는 Vercel)

### 첫 견적서 발행

- [ ] Notion에서 견적서 작성 완료
- [ ] 항목(items) 추가 완료
- [ ] 페이지 ID 확인 완료
- [ ] 공유 URL 생성 완료
- [ ] 고객에게 링크 발송 완료
- [ ] 고객이 PDF 다운로드 가능 확인

### 운영 중 확인

- [ ] 매주 Vercel 로그 확인
- [ ] 월 1회 Notion 권한 검토
- [ ] 월 1회 API 키 로그 확인

---

## 📚 참고 자료

- **Notion API 문서**: https://developers.notion.com
- **Next.js 가이드**: https://nextjs.org/docs
- **Vercel 배포 가이드**: https://vercel.com/docs

---

**✅ Task 011-4 완료** - 운영 가이드 작성 완료

**🎉 Phase 4 모든 작업 완료!**
