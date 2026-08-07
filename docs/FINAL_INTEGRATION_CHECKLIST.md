# 최종 통합 검증 및 배포 준비 가이드

## 프로젝트 완성도 평가

### MVP 필수 기능 완성

#### Phase 1-2: 기초 구축 ✅ (완료)

- [x] 홈페이지 (견적서 조회 입력)
- [x] 견적서 상세 페이지 (Notion 기반)
- [x] PDF 다운로드 기능 (인쇄)
- [x] 반응형 레이아웃
- [x] 라이트/다크 모드

#### Phase 3-4: 아키텍처 강화 ✅ (완료)

- [x] Notion API 연동
- [x] 타입 안전성 (TypeScript)
- [x] 성능 최적화 (ISR, React.cache)
- [x] 접근성 (WCAG AA)

#### Phase 5: 관리자 기초 ✅ (완료)

- [x] 관리자 레이아웃
- [x] 관리자 로딩/에러 페이지

#### Phase 6: 관리자 기능 완성 ✅ (완료)

- [x] Notion 데이터베이스 쿼리 함수
- [x] 에러 처리 및 폴백
- [x] 관리자 목록 UI (테이블/카드)
- [x] 링크 복사 기능
- [x] 로그인 페이지 및 API
- [x] 미들웨어 인증 보호
- [x] 로그아웃 기능

#### Phase 8: 통합 및 배포 준비 🚀 (진행 중)

- [x] E2E 테스트 시나리오
- [x] 성능 최적화 가이드
- [x] 보안 검증 체크리스트
- [x] 배포 및 운영 가이드
- [ ] 최종 통합 테스트
- [ ] 배포 실행

## 배포 전 최종 검증 단계

### 1단계: 코드 품질 검증

#### 타입 검사

```bash
npm run typecheck
# 예상: 0 errors
```

#### 린트 검사

```bash
npm run lint
# 예상: 0 errors
```

#### 포맷팅 검사

```bash
npm run format:check
# 예상: All matched files use Prettier code style!
```

#### 전체 검사

```bash
npm run check-all
# 예상: 모든 명령 성공 (exit 0)
```

#### 결과 기록

```
통과 날짜: ________
타입 검사: ✅ 통과
린트 검사: ✅ 통과
포맷팅: ✅ 통과
빌드: ✅ 통과
```

### 2단계: 빌드 검증

```bash
# 프로덕션 빌드
npm run build

# 예상 결과:
# Route (app)
# ├ ○ /                  (Static)
# ├ ○ /admin            (ISR: 1m)
# ├ ○ /login            (Static)
# ├ ƒ /api/auth/login   (Dynamic)
# ├ ƒ /api/auth/logout  (Dynamic)
# ├ ƒ /invoice/[...]    (Dynamic)
# └ ƒ Proxy (Middleware)
```

#### 빌드 성공 조건

- [x] 컴파일 오류 없음
- [x] 번들 크기 < 50kb (페이지당)
- [x] 모든 라우트 인식됨
- [x] Static/Dynamic 구분 정확

### 3단계: 로컬 성능 테스트

```bash
# 개발 서버 시작
npm run dev

# 각 페이지 로드 시간 측정
```

#### 성능 기준

- 홈페이지: < 2초
- 관리자 페이지: < 3초
- 상세 페이지: < 2.5초

#### 측정 방법

1. Chrome DevTools 열기 (F12)
2. Network 탭 선택
3. 페이지 새로고침
4. 로드 시간 확인 (Finish 시간)

#### 기록 템플릿

```
페이지 | 로드 시간 | 상태
-----|---------|----
홈페이지 | ___ ms | ✅
관리자 | ___ ms | ✅
상세 | ___ ms | ✅
```

### 4단계: 기능 통합 테스트

#### 홈페이지

- [ ] 페이지 로드 성공
- [ ] 견적서 ID 입력 필드 작동
- [ ] 더미 데이터로 테스트
- [ ] 상세 페이지 네비게이션
- [ ] 테마 토글 작동

#### 로그인

- [ ] /login 페이지 접근
- [ ] 틀린 비밀번호 입력 → 에러 메시지
- [ ] 올바른 비밀번호 입력 → /admin 리다이렉트
- [ ] 쿠키 설정 확인 (DevTools)

#### 관리자 페이지

- [ ] 미인증 접근 시 /login으로 리다이렉트
- [ ] 로그인 후 접근 성공
- [ ] 견적서 목록 표시
- [ ] 링크 복사 기능
- [ ] 상세 페이지 네비게이션

#### 로그아웃

- [ ] 관리자 메뉴 표시
- [ ] 로그아웃 클릭
- [ ] 홈페이지로 리다이렉트
- [ ] /admin 재접근 시 로그인 페이지로 리다이렉트

#### 보안 테스트

- [ ] HTTP-only 쿠키 확인 (DevTools)
- [ ] 쿠키 수동 삭제 후 /admin 접근 → 로그인 필요
- [ ] XSS 테스트: 입력값 이스케이프 확인
- [ ] CSRF 테스트: SameSite 쿠키 작동

### 5단계: 반응형 디자인 검증

#### 데스크톱 (1920×1080)

- [ ] 레이아웃 정상
- [ ] 테이블 뷰 표시 (관리자)
- [ ] 모든 버튼 접근 가능

#### 태블릿 (768×1024)

- [ ] 레이아웃 조정 정상
- [ ] 스크롤 가능

#### 모바일 (375×667)

- [ ] 카드 레이아웃 표시 (관리자)
- [ ] 터치 버튼 충분한 크기
- [ ] 스크롤 정상

### 6단계: 브라우저 호환성

#### Chrome (최신)

- [ ] 모든 기능 정상

#### Firefox (최신)

- [ ] 모든 기능 정상

#### Safari (최신)

- [ ] 모든 기능 정상

#### Edge (최신)

- [ ] 모든 기능 정상

### 7단계: Lighthouse 감사

```bash
# Chrome DevTools 열기 (F12)
# Lighthouse 탭 선택
# "Analyze page load" 클릭
```

#### 목표 점수

- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90

#### 개선 사항 기록

```
페이지 | 성능 | 접근성 | 권장사항
-----|-----|------|------
/ | __ | __ | __
/admin | __ | __ | __
/login | __ | __ | __
```

### 8단계: 보안 감사

#### 의존성 검사

```bash
npm audit
# 예상: 0 vulnerabilities
```

#### 환경 변수 확인

```bash
# .env.example 검증
cat .env.example

# 필수 변수:
# NOTION_API_KEY (프로덕션용)
# NOTION_DATABASE_ID
# ADMIN_PASSWORD (강력한 비밀번호)
# NEXT_PUBLIC_APP_URL
```

#### 보안 헤더 확인

```
https://securityheaders.com/?q=your-domain.com
```

### 9단계: 환경 변수 설정

#### 로컬 개발

```
.env.local (gitignore 포함)
- NOTION_API_KEY
- NOTION_DATABASE_ID
- ADMIN_PASSWORD
- NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 프로덕션 (Vercel)

```
Vercel 대시보드 > Settings > Environment Variables
- NOTION_API_KEY (프로덕션)
- NOTION_DATABASE_ID (프로덕션)
- ADMIN_PASSWORD (강력한 비밀번호)
- NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 10단계: 최종 배포 준비

#### 소스 코드 정리

- [ ] 콘솔 로그 제거 (production 전용 제외)
- [ ] 주석 검토 및 필요시 추가
- [ ] 사용되지 않는 코드 제거

#### 커밋 정리

```bash
git log --oneline | head -20
# 최근 커밋 확인
```

#### 태그 생성

```bash
git tag -a v1.0.0 -m "MVP Release"
git push origin v1.0.0
```

#### 배포 브랜치

```bash
# main 브랜치 확인
git branch -a | grep main

# 모든 변경사항 push 확인
git status
# 예상: nothing to commit, working tree clean
```

## 배포 실행 선택지

### 선택지 1: Vercel (권장)

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 링크 (초회만)
vercel link

# 4. 프로덕션 배포
vercel --prod

# 5. URL 확인
# > Production: https://your-project.vercel.app
```

### 선택지 2: AWS EC2

```bash
# EC2 배포 가이드는 DEPLOYMENT_GUIDE.md 참고
```

### 선택지 3: Docker + Kubernetes

```bash
# Docker 배포 가이드는 DEPLOYMENT_GUIDE.md 참고
```

## 배포 후 검증

### 즉시 확인 (배포 후 5분)

- [ ] 사이트 접근 가능 (HTTPS)
- [ ] 홈페이지 로드
- [ ] 로그인 페이지 접근
- [ ] 관리자 페이지 접근 (미인증 → 리다이렉트)

### 상세 검증 (배포 후 30분)

- [ ] 전체 기능 테스트
- [ ] 성능 측정
- [ ] Lighthouse 재감사
- [ ] 에러 로그 확인

### 모니터링 설정 (배포 후 24시간)

- [ ] Google Analytics 데이터 수집 확인
- [ ] Error tracking (Sentry) 설정
- [ ] Uptime monitoring 활성화
- [ ] Performance monitoring 검증

## 배포 후 운영

### 주간 작업

- [ ] 에러 로그 검토
- [ ] 사용자 피드백 수집
- [ ] 성능 메트릭 모니터링

### 월간 작업

- [ ] npm audit 실행
- [ ] 의존성 업데이트
- [ ] 보안 패치 적용

### 분기별 작업

- [ ] Lighthouse 재감사
- [ ] 새로운 기능 계획
- [ ] 사용자 분석 리뷰

## 최종 체크리스트 (배포 전)

```
코드 품질
[ ] npm run check-all 통과
[ ] npm run build 성공
[ ] npm audit 0 vulnerabilities

기능 검증
[ ] 모든 페이지 로드 성공
[ ] 로그인/로그아웃 정상
[ ] 관리자 기능 정상
[ ] 링크 복사 정상

성능
[ ] Lighthouse 점수 ≥ 90
[ ] 페이지 로드 < 3초

보안
[ ] 환경 변수 모두 설정
[ ] HTTPS 준비 완료
[ ] 보안 헤더 설정

배포
[ ] 배포 환경 선택
[ ] 환경 변수 설정
[ ] 도메인 준비
[ ] DNS 설정 (필요시)

배포 후
[ ] 모니터링 설정
[ ] 에러 트래킹 활성화
[ ] 팀 공지
```

## 지원 및 문제 해결

### 배포 실패 시

1. 빌드 로그 확인
2. 환경 변수 재확인
3. git status 확인
4. npm run build 로컬 테스트

### 배포 후 문제 시

1. 에러 로그 확인 (Console, DevTools)
2. 환경 변수 확인
3. 캐시 무효화 (브라우저 Ctrl+Shift+Delete)
4. 롤백 검토

### 연락처

- 기술 지원: [프로젝트 이슈](https://github.com/your-username/invoice-web/issues)
- 문서: [README.md](../README.md)

## 축하합니다! 🎉

MVP 개발이 완료되었습니다. 이 체크리스트를 따라 안전하게 배포하세요.

**다음 단계**:

1. 이 모든 체크리스트 완료
2. 배포 실행
3. 모니터링 및 피드백 수집
4. 지속적 개선
