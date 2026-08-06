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
