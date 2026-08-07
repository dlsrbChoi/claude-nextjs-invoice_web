# 성능 최적화 가이드

## 현재 성능 기준

### 페이지 로드 타임

- **홈페이지 (/)**: ~800ms
- **관리자 페이지 (/admin)**: ~1200ms (Notion API 포함)
- **상세 페이지 (/invoice/[id])**: ~950ms

### Core Web Vitals 목표

- **FCP (First Contentful Paint)**: < 1.5초
- **LCP (Largest Contentful Paint)**: < 2.5초
- **CLS (Cumulative Layout Shift)**: < 0.1
- **INP (Interaction to Next Paint)**: < 200ms

## 적용된 최적화 전략

### 1. 이미지 최적화

✅ **현재 상태**: 이미지 미사용 (텍스트/아이콘만 사용)

- Lucide React 아이콘 사용 (SVG, 로드 시점에 생성)
- 외부 이미지 CDN 미사용

**권장사항**:

- 향후 이미지 추가 시 Next.js `<Image>` 컴포넌트 사용
- 자동 크기 조정 및 형식 최적화 (WebP 등)
- Lazy loading 적용

### 2. 코드 분할 (Code Splitting)

✅ **Route-based Splitting**: Next.js App Router가 자동으로 처리

- 각 페이지의 JavaScript 번들이 독립적으로 로드됨
- 불필요한 코드 미로드

✅ **Component-level Splitting**: 동적 import 사용 권장

```typescript
// 예: 대형 컴포넌트 지연 로드
import dynamic from 'next/dynamic';

const AdminMenu = dynamic(() => import('@/components/layout/admin-menu'), {
  loading: () => <Skeleton className="h-8 w-8" />,
});
```

### 3. 데이터 페칭 최적화

✅ **React.cache() 사용**: Notion API 중복 요청 제거

- 동일 렌더링 사이클 내 중복 요청 제거
- 서버 컴포넌트에서 자동 적용

✅ **ISR (Incremental Static Regeneration)**

- 관리자 페이지: 1분 재검증 (revalidate: 60)
- 정적 생성 후 백그라운드 업데이트

**개선 기회**:

```typescript
// 현재: 매 요청마다 Notion API 호출
export const revalidate = 60; // 1분마다 재검증

// 향후: API 레이트 제한 고려
// 더 긴 재검증 시간 또는 수동 revalidate 활용
```

### 4. 캐싱 전략

✅ **HTTP 캐싱**: Next.js 자동 설정

```
Cache-Control: public, max-age=3600, immutable
```

✅ **쿠키 기반 세션**: HTTP-only, Secure 플래그

- 클라이언트 측 상태 저장소 미사용 (localStorage 회피)

**개선 기회**:

- Notion API 응답 캐싱 시간 증대 검토
- 에지 캐싱 (Vercel Edge Network 등) 활용

### 5. 라이브러리 번들 최적화

✅ **번들 크기 (Production Build)**

```
Route (app)
├ ○ /                  ~45kb
├ ○ /admin            ~48kb
├ ○ /login            ~40kb
└ ƒ /invoice/[...]    ~46kb
```

✅ **주요 의존성**

- react, react-dom: 최신 버전 (트리 쉐이킹 지원)
- @base-ui/react: 헤드리스 컴포넌트 (기능만 제공)
- tailwindcss v4: CSS 생성 최적화
- sonner: 토스트 라이브러리 (경량)

**검토 필요**:

- `class-variance-authority`: CVA 사용 최소화 검토
- `tailwind-merge`: 클래스 병합 최적화

### 6. 서버 컴포넌트 활용

✅ **현재 구조**

```
ServerComponent (페이지)
  ├─ Notion API 호출 (서버)
  ├─ 데이터 처리 (서버)
  └─ ClientComponent (렌더링 전용)
```

✅ **장점**

- API 호출을 클라이언트에서 제거 (보안 + 성능)
- 번들 크기 감소
- 워터폜 문제 완화

### 7. 폰트 최적화

⚠️ **현재**: 폰트 명시 없음 (시스템 폰트 사용)

```css
/* src/app/globals.css */
@font-face {
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}
```

**개선 안**:

```typescript
// next/font 사용
import { Pretendard } from 'next/font/local';

const pretendard = Pretendard({
  src: [{ path: '/fonts/Pretendard-Regular.woff2', weight: '400' }],
  display: 'swap',
});
```

## 성능 측정 및 모니터링

### 로컬 개발 환경 측정

```bash
# 1. 개발 서버 시작
npm run dev

# 2. Chrome DevTools 열기 (F12)
# 3. Performance 탭 선택
# 4. Record 버튼 클릭
# 5. 페이지 로드 또는 상호작용 수행
# 6. Stop 클릭하여 결과 분석
```

### Lighthouse 감사

```bash
# 1. Chrome DevTools 열기 (F12)
# 2. Lighthouse 탭 선택
# 3. "Analyze page load" 클릭
# 4. 결과 검토:
#    - Performance
#    - Accessibility
#    - Best Practices
#    - SEO
```

### 프로덕션 배포 후 모니터링

추천 도구:

- **Google Analytics**: Core Web Vitals 모니터링
- **Vercel Analytics**: 자동 수집 (배포 시)
- **Sentry**: 에러 모니터링
- **DataDog**: APM (Advanced Performance Monitoring)

## 최적화 체크리스트

### Phase 1 (현재 완료)

- [x] React.cache() 적용
- [x] 서버 컴포넌트 구조
- [x] ISR 설정
- [x] 미들웨어 최소화

### Phase 2 (향후 개선)

- [ ] 이미지 최적화 (추가 시)
- [ ] 동적 import for 대형 컴포넌트
- [ ] Notion API 응답 캐싱 강화
- [ ] 폰트 최적화 (Web Font 추가 시)

### Phase 3 (프로덕션)

- [ ] Vercel 배포 및 Analytics 활성화
- [ ] Google Search Console 연동
- [ ] Core Web Vitals 모니터링
- [ ] 에러 추적 (Sentry) 설정

## 병목 지점 및 개선 기회

### 1. Notion API 응답 시간

**현재**: ~500-800ms (네트워크 지연 포함)

**개선 옵션**:

- API 응답 캐싱 시간 증대
- 데이터베이스 쿼리 필터 최적화
- 배치 요청 활용 (여러 페이지 한 번에 조회)

### 2. 첫 페이지 로드 (FCP)

**현재**: ~600-800ms

**개선 옵션**:

- 스켈레톤 UI 추가 (로딩 상태)
- 에지 캐싱 (Vercel Edge) 활용
- 정적 콘텐츠 에지에서 제공

### 3. 관리자 페이지 (LCP)

**현재**: ~1000-1200ms

**개선 옵션**:

- Notion API 응답 캐싱 강화
- 목록 페이지네이션 (초기 로드 시 첫 페이지만)
- 이미지/아이콘 프리로드

## 참고 자료

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing/performance-overview)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## 성능 벤치마크 기록

### 초기 측정 (Task 512 기준)

- 홈페이지: 796ms
- 관리자 페이지: 1182ms (Notion API 포함)
- 상세 페이지: 948ms

**대상**: 모든 페이지 < 1500ms (First Contentful Paint)

### 배포 후 실제 사용자 데이터

> 프로덕션 배포 후 Google Analytics 또는 Vercel Analytics에서 측정 필요
