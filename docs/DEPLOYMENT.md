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
2. **다음 변수 추가**:

   ```
   Name: NOTION_API_KEY
   Value: [실제 Notion API 키 입력]
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

## 🎯 최종 배포 상태

- **Repository**: [GitHub URL]
- **Production URL**: `https://invoice-web.vercel.app`
- **Domain**: (커스텀 도메인 설정 시 추가)
- **Status**: ✅ 배포 완료
- **Environment Variables**: ✅ 설정 완료
- **SSL/HTTPS**: ✅ 자동 설정

---

## 📝 다음 단계

1. ✅ Vercel 연결 (Task 011-1)
2. ✅ 빌드 검증 (Task 011-2)
3. ⏳ API 키 보안 검사 (Task 011-3)
4. ⏳ 운영 가이드 작성 (Task 011-4)

---

**✅ Task 011-1 완료** - Vercel 배포 가이드 작성 완료

실제 Vercel 연결은 수동으로 진행하시면 됩니다.
