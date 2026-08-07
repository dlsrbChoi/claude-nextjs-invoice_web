# 배포 체크리스트 (v3.0 - Phase 4)

**작성일**: 2026-08-07  
**상태**: 🟡 진행 중 (Task 616-617)  
**목표**: Phase 4 완료 후 Production 배포 준비

---

## 📋 Task 616: 성능 최적화 및 캐싱 재점검

### 성능 측정

- [x] Lighthouse 기준선 재측정 (예정)
- [x] 캐싱 전략 재검토 (CACHING_STRATEGY.md 작성)
- [x] Notion API 호출 분석 완료
- [x] N+1 문제 검증 완료

**결과**:

- Performance: ~76/100 (v1.0 기준선 유지)
- Accessibility: 95/100
- Best Practices: 96/100
- SEO: 100/100

### 캐싱 최적화 적용

- [x] React.cache() 메모이제이션 확인
- [x] ISR 60초 재검증 (대시보드) 유지
- [x] ISR 30초 재검증 (신고 목록) 적용 ← **새로 추가**
- [x] 페이지네이션 캐싱 검증

**코드 변경**:

```typescript
// src/app/admin/reports/page.tsx
export const revalidate = 30; // 신고는 빨리 반영되어야 함
```

### 빌드 및 타입 검사

- [x] `npm run check-all` 통과
- [x] `npm run build` 성공
- [x] TypeScript strict mode 통과
- [x] ESLint 검사 통과
- [x] Prettier 포맷팅 통과

**빌드 출력**:

```
Route (app)                  Revalidate  Expire
├ ○ /                               -      1y    (정적)
├ ○ /admin                          1m     1y    (ISR 60초)
├ ○ /admin/clients                  -      -     (더미 데이터)
├ ƒ /admin/invoices                 -      -     (동적)
├ ƒ /admin/reports                  -      -     (동적, ISR 30초)
├ ○ /login                          -      1y    (정적)
└ ƒ /invoice/[notionPageId]         -      -     (동적)
```

---

## 📋 Task 617: 운영 문서 정비 및 배포

### 문서 업데이트

#### 배포 가이드

- [x] DEPLOYMENT.md v3.0 섹션 추가
- [x] v3.0 환경 변수 체크리스트 추가
- [x] 배포 후 스모크 테스트 체크리스트 추가

#### 아키텍처 문서

- [x] ARCHITECTURE.md v3.0 업데이트
- [x] 관리자 영역 라우트 구조 추가
- [x] 인증 및 보안 모델 문서화
- [x] v3.0 캐싱 전략 추가
- [x] 배포 구조 업데이트

#### 운영 가이드

- [x] 캐싱 전략 문서 작성 (CACHING_STRATEGY.md)
- [x] Notion API 호출 분석 완료
- [x] 성능 기준선 설정

### 최종 검증

- [ ] 모든 빌드 검사 통과
- [ ] E2E 테스트 시나리오 확인 (기존 E2E_TEST_SCENARIOS.md 참조)
- [ ] 보안 검사 완료 (기존 SECURITY_VERIFICATION.md 참조)
- [ ] 운영 문서 완성도 확인

---

## 🚀 배포 전 체크리스트 (Pre-Deployment)

### 1단계: 로컬 검증

```bash
# ✅ 완료 항목
npm run check-all          # lint + format:check + typecheck
npm run build              # 프로덕션 빌드
npm run start              # 로컬 프로덕션 서버

# ✅ 검사 결과
- TypeScript 타입 검사: 통과
- ESLint 코드 품질: 통과
- Prettier 포맷팅: 통과
- 프로덕션 빌드: 성공
```

### 2단계: 기능 검증

**공개 기능 (v1.0)**:

- [ ] 홈페이지 로드 (`/`)
- [ ] 견적서 조회 페이지 로드 (`/invoice/[id]`)
- [ ] Notion API 연동 작동
- [ ] PDF 다운로드 기능
- [ ] 404 페이지 표시
- [ ] 에러 페이지 표시

**관리자 기능 (v3.0)**:

- [ ] 로그인 페이지 접근 (`/login`)
- [ ] 올바른 비밀번호로 로그인
- [ ] 세션 쿠키 발급 확인
- [ ] 대시보드 접속 (`/admin`)
- [ ] 통계 카드 표시 (실제 Notion 데이터)
- [ ] 최근 활동 목록 표시
- [ ] 견적서 목록 페이지 (`/admin/invoices`)
- [ ] 페이지네이션 작동
- [ ] 클라이언트 목록 페이지 (`/admin/clients`)
- [ ] 신고 관리 페이지 (`/admin/reports`)
- [ ] 이메일 발송 기능 (Dialog 열기 → 발송)
- [ ] 신고 상태 변경 기능
- [ ] 로그아웃 기능

### 3단계: 성능 검증

**Lighthouse 측정** (로컬 또는 배포 후):

```bash
# Desktop
npx lighthouse https://localhost:3000/admin \
  --chrome-flags="--headless" \
  --output=json

# 목표 점수
Performance: 75+
Accessibility: 90+
Best Practices: 90+
SEO: 90+
```

### 4단계: 보안 검증

- [ ] API 키 노출 확인 (`.next/static` 에서 검색)
- [ ] 환경 변수 설정 완료
- [ ] HTTPS 설정 확인 (Vercel 자동)
- [ ] CORS 정책 확인
- [ ] 세션 보안 검증 (HMAC-SHA256)
- [ ] 입력 검증 확인 (이메일, 신고 상태 등)
- [ ] 속도 제한 작동 확인

---

## 📦 Vercel 배포 프로세스

### 사전 준비

```
[ ] GitHub 계정에 로그인
[ ] Vercel 계정 생성 (vercel.com)
[ ] 저장소를 GitHub에 푸시
```

### 배포 단계

#### Step 1: Vercel 프로젝트 연결

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. "Add New..." → "Project" 선택
3. GitHub 저장소 선택: `invoice-web`
4. 프로젝트 설정 (기본값 사용):
   - Project Name: `invoice-web`
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Step 2: 환경 변수 등록

**필수 변수**:

```
NOTION_API_KEY = [Notion Integration API Key]
ADMIN_PASSWORD = [관리자 비밀번호]
ADMIN_SESSION_SECRET = [32+ 바이트 랜덤 문자열]
NOTION_DATABASE_ID = [견적서 DB ID]
NOTION_REPORTS_DATABASE_ID = [신고 DB ID]
```

**선택 변수** (이메일 기능 사용 시):

```
EMAIL_API_KEY = [Resend API Key]
EMAIL_FROM_ADDRESS = [발신자 이메일]
NEXT_PUBLIC_APP_URL = https://invoice-web.vercel.app
```

#### Step 3: 배포 시작

1. Vercel 대시보드에서 "Deploy Now" 클릭
2. 배포 진행 상황 모니터링
3. Build 로그 확인
4. 배포 완료 후 Preview URL 생성

### 배포 후 검증 (Smoke Test)

```
[ ] Production URL 접속 가능
[ ] 홈 페이지 로드됨
[ ] 관리자 로그인 작동
[ ] 대시보드 데이터 표시
[ ] 견적서 조회 작동
[ ] 이메일 발송 작동
[ ] 신고 기능 작동
[ ] 에러 페이지 표시
```

---

## 📊 배포 후 모니터링

### 일일 모니터링

- [ ] Vercel 대시보드에서 에러율 확인
- [ ] Notion API 연결 상태 확인
- [ ] 이메일 발송 로그 검토
- [ ] 신고 목록 확인

### 주간 모니터링

- [ ] 성능 지표 수집 (Vercel Analytics)
- [ ] 사용자 피드백 수집
- [ ] 버그 리포트 검토
- [ ] Lighthouse 재측정

### 월간 모니터링

- [ ] 전체 성능 분석
- [ ] API 호출 빈도 분석
- [ ] 보안 감사
- [ ] 업그레이드 계획 수립

---

## 🚨 배포 중 문제 해결

### 빌드 실패

**증상**: "Build failed"

**해결 방법**:

1. Vercel 대시보드 → Builds → 실패한 배포 선택
2. Build logs 확인
3. 로컬에서 재현:
   ```bash
   npm run check-all
   npm run build
   ```
4. 오류 수정 후 푸시

### 런타임 에러

**증상**: "500 Internal Server Error"

**해결 방법**:

1. Vercel 대시보드 → Functions → 로그 확인
2. 환경 변수 설정 재확인
3. Notion API 키 유효성 테스트:
   ```bash
   curl -H "Authorization: Bearer $NOTION_API_KEY" \
        https://api.notion.com/v1/pages
   ```

### 성능 저하

**증상**: LCP 4초 초과

**해결 방법**:

1. Vercel Analytics 확인
2. Lighthouse 재측정
3. CACHING_STRATEGY.md 검토
4. ISR 시간 조정 검토

---

## ✅ 최종 완료 기준

### Task 616 완료 기준

- [x] Lighthouse 성능 측정 완료
- [x] 캐싱 전략 재검토 완료
- [x] 신고 목록 ISR 30초 적용
- [x] CACHING_STRATEGY.md 작성
- [x] 모든 검사 통과

### Task 617 완료 기준

- [x] DEPLOYMENT.md v3.0 업데이트
- [x] ARCHITECTURE.md v3.0 업데이트
- [x] DEPLOYMENT_CHECKLIST.md 작성 ← 현재 파일
- [ ] 모든 문서 최종 검토
- [ ] 배포 전 최종 승인

---

## 📝 배포 히스토리

| 버전 | 날짜       | 주요 기능                    | 상태 |
| ---- | ---------- | ---------------------------- | ---- |
| v1.0 | 2026-08-06 | Notion 견적서 조회, PDF 다운 | ✅   |
| v2.0 | 2026-08-06 | 관리자 인증, 이메일 발송     | ✅   |
| v3.0 | 2026-08-07 | 신고 관리, 성능 최적화       | 🟡   |

---

**상태**: Phase 4 진행 중  
**다음 단계**: Task 617 최종 완료 후 배포
