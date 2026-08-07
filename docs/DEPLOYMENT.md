# 배포 가이드 - Vercel

## 🚀 배포 준비 체크리스트

### 1️⃣ 사전 요구사항

- [x] GitHub 계정 (저장소 연결용)
- [x] Vercel 계정 (vercel.com)
- [x] NOTION_API_KEY (Notion Integration에서 발급)
- [x] 로컬 빌드 성공 (`npm run build`)
- [x] `npm run check-all` 통과

### 2️⃣ 배포 프로세스

#### Step 1: Vercel 프로젝트 연결

1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **"Add New..." → "Project" 클릭**
3. **GitHub 저장소 선택**: `invoice-web`
4. **프로젝트 설정**:
   - Project Name: `invoice-web` (기본값)
   - Framework Preset: `Next.js` (자동 감지)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `npm install` (기본값)

#### Step 2: 환경 변수 등록

1. **프로젝트 설정 → "Environment Variables"**
2. **다음 변수를 추가** (v3.0 신규 변수 포함):

   ##### 필수 변수 (v1.0부터)

   ```
   Name: NOTION_API_KEY
   Value: [실제 Notion API 키 입력]
   Environment: Production, Preview, Development (모두 선택)
   ```

   ##### 필수 변수 (v3.0부터 추가)

   ```
   Name: ADMIN_PASSWORD
   Value: [관리자 로그인 비밀번호]
   Environment: Production, Preview, Development (모두 선택)

   Name: ADMIN_SESSION_SECRET
   Value: [32바이트 이상의 랜덤 문자열 (HMAC 서명 비밀키)]
   Environment: Production, Preview, Development (모두 선택)

   Name: NOTION_DATABASE_ID
   Value: [견적서 Notion 데이터베이스 ID]
   Environment: Production, Preview, Development (모두 선택)

   Name: NOTION_REPORTS_DATABASE_ID
   Value: [신고 Notion 데이터베이스 ID]
   Environment: Production, Preview, Development (모두 선택)
   ```

   ##### 선택 변수 (이메일 발송 기능)

   ```
   Name: EMAIL_API_KEY
   Value: [Resend API 키 (re_...)]
   Environment: Production, Preview, Development (모두 선택)

   Name: EMAIL_FROM_ADDRESS
   Value: [발신자 이메일 주소 (예: noreply@example.com)]
   Environment: Production, Preview, Development (모두 선택)
   ```

3. **저장** → "Deploy Now" 또는 자동 배포 시작

#### Step 3: 배포 모니터링

- Vercel 대시보드에서 배포 진행상황 확인
- Build 로그 확인 (에러 발생 시)
- Deployment 완료 후 Preview URL 생성

---

## 📋 배포 환경 구성

### Production 환경

- **URL**: `https://invoice-web.vercel.app` (자동 할당)
- **Domain**: 커스텀 도메인 추가 가능
- **배포 트리거**: `main` 브랜치 푸시 시 자동
- **환경 변수**: `NOTION_API_KEY` (Production)

### Preview 환경

- **URL**: `https://invoice-web-[branch].vercel.app`
- **배포 트리거**: Pull Request 생성 시 자동
- **환경 변수**: `NOTION_API_KEY` (Preview)

### Development 환경 (로컬)

- **URL**: `http://localhost:3000`
- **시작 명령어**: `npm run dev`
- **환경 변수**: `.env.local`에서 로드

---

## 🔒 보안 설정

### 환경 변수 보안

1. ✅ **Vercel 대시보드에서만 관리**
   - GitHub에 `.env.local` 커밋 금지
   - `.gitignore`에 `*.env.local` 포함됨

2. ✅ **API 키 노출 방지**
   - `src/lib/notion.ts`에서만 사용 (서버 함수)
   - 클라이언트 컴포넌트에서 직접 접근 불가

3. ✅ **빌드 프로세스 검증**
   - `npm run build` 시 `.next/static`에 API 키 노출 안 됨
   - 서버 함수는 런타임에만 `process.env` 접근

### NOTION_API_KEY 확인

```bash
# 빌드 후 클라이언트 번들에서 API 키 검사 (없어야 함)
grep -r "sk-" .next/static/

# 결과: 찾지 못함 ✅
```

---

## 📊 배포 후 검증

### 1️⃣ Production 환경 테스트

```bash
# Vercel에서 할당한 URL로 접속
https://invoice-web.vercel.app

# 테스트 항목
[ ] 홈 페이지 로드 (/)
[ ] 견적서 조회 페이지 로드 (/invoice/[id])
[ ] Notion API 연동 작동 확인
[ ] PDF 다운로드 기능 확인
[ ] 에러 페이지 표시 확인
```

### 2️⃣ 성능 측정

```bash
# Vercel Analytics 확인
# 대시보드 → Analytics → Web Vitals

# 확인 항목
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
```

### 3️⃣ 모니터링 설정

**Vercel 기본 제공**:

- 자동 빌드 로그
- 배포 알림 (이메일)
- 에러 추적

**추가 옵션** (나중에 고려):

- Sentry: 에러 로깅
- DataDog: APM 모니터링
- New Relic: 성능 추적

---

## 🔄 배포 후 워크플로우

### 로컬 개발 → 배포

```bash
# 1. 로컬에서 작업
npm run dev
# ...작업...

# 2. 테스트
npm run check-all
npm run build

# 3. 커밋 & 푸시
git add .
git commit -m "✨ feat: 새로운 기능"
git push origin main

# 4. Vercel 자동 배포
# → Vercel 대시보드에서 배포 진행 확인
# → Production 환경 업데이트
```

### 긴급 핫픽스

```bash
# 배포 후 버그 발견 시
git checkout -b hotfix/issue-name
# ...버그 수정...
git push origin hotfix/issue-name

# Pull Request 생성
# → Preview 환경에서 테스트
# → main 병합
# → 자동 배포
```

---

## 📞 문제 해결

### 빌드 실패

**증상**: "Build failed"
**원인 확인**:

1. Vercel 대시보드 → Builds → 실패한 배포 클릭
2. Build logs 확인
3. 일반적인 원인:
   - TypeScript 오류: `npm run typecheck` 로컬에서 확인
   - ESLint 오류: `npm run lint` 로컬에서 확인
   - 누락된 환경 변수: `NOTION_API_KEY` 설정 확인

### 런타임 에러

**증상**: "500 Internal Server Error"
**원인 확인**:

1. Vercel 대시보드 → Functions → 로그 확인
2. Notion API 연결 테스트:
   ```bash
   curl -H "Authorization: Bearer $NOTION_API_KEY" \
        https://api.notion.com/v1/pages/[test-id]
   ```
3. 환경 변수 설정 재확인

### API 키 노출

**확인 방법**:

```bash
# 클라이언트 번들에서 API 키 검사
curl https://invoice-web.vercel.app/_next/static/chunks/main.js | grep "sk-"

# 결과: 찾지 못함 ✅
```

---

---

## 🚀 v3.0 배포 체크리스트 (Phase 4)

### 배포 전 최종 검증

**빌드 및 테스트**:

```bash
# 1. 전체 검사 실행
npm run check-all

# 2. 프로덕션 빌드 검증
npm run build

# 3. 결과 확인
# ✅ lint 통과
# ✅ format 통과
# ✅ typecheck 통과
# ✅ build 성공
```

**성능 및 보안**:

- [x] Lighthouse 기준선 측정 (v3.0)
- [x] 캐싱 전략 재검토 (CACHING_STRATEGY.md)
- [x] Notion API 호출 최적화 확인
- [x] 신고 목록 ISR 30초 조정
- [x] 모든 보안 검사 통과

### 배포 환경 설정

**Vercel 환경 변수** (v3.0 필수):

```
# 필수 변수 (v1.0)
NOTION_API_KEY=sk-...

# 필수 변수 (v3.0 추가)
ADMIN_PASSWORD=***
ADMIN_SESSION_SECRET=[32+ bytes]
NOTION_DATABASE_ID=***
NOTION_REPORTS_DATABASE_ID=***

# 선택 변수 (이메일)
EMAIL_API_KEY=re_...
EMAIL_FROM_ADDRESS=noreply@example.com
NEXT_PUBLIC_APP_URL=https://invoice-web.vercel.app
```

### 배포 후 스모크 테스트

```
[ ] 홈페이지 로드 (/)
[ ] 로그인 페이지 접근 (/login)
[ ] 관리자 대시보드 (/admin)
[ ] 견적서 목록 (/admin/invoices)
[ ] 신고 관리 (/admin/reports)
[ ] 이메일 공유 기능
[ ] 견적서 조회 (/invoice/[id])
[ ] PDF 다운로드
[ ] 404 페이지 확인
```

---

## 🎯 최종 배포 상태

**v3.0 - 2026-08-07**

- **Repository**: GitHub (invoice-web)
- **Production URL**: `https://invoice-web.vercel.app`
- **Domain**: (커스텀 도메인 설정 가능)
- **Status**: ✅ 배포 준비 완료
- **Environment Variables**: ✅ v3.0 업데이트 완료
- **Build**: ✅ 성공 (Turbopack 최적화)
- **Performance**: ✅ Lighthouse 기준 충족
- **Security**: ✅ 모든 검사 통과

---

## 📝 배포 히스토리

### v1.0 (초기)

- ✅ Vercel 기본 배포
- ✅ Notion API 연동
- ✅ PDF 다운로드 기능

### v2.0 (Phase 2)

- ✅ 관리자 영역 추가
- ✅ 세션 인증
- ✅ 이메일 발송 기능

### v3.0 (Phase 3~4) - 현재

- ✅ 신고 관리 시스템
- ✅ 성능 최적화 (캐싱 전략)
- ✅ 운영 가이드 완성

---

**✅ Task 617 진행 중** - 배포 문서 v3.0 업데이트 완료
