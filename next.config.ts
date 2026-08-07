import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 동적 라우트 처리 설정
  // dynamicParams가 false일 경우, generateStaticParams에 없는 경로는 404 반환
  // 현재는 true로 설정하여 모든 경로에서 동적 생성 허용

  // 이미지 최적화
  images: {
    unoptimized: false,
  },

  // 헤더 캐싱
  //
  // ⚠️ 주의(Task 601에서 발견된 버그 수정): 이전에는 `/:path*`로 전체 경로에
  // `Cache-Control: public, max-age=3600`을 적용했다. 이 설정은 /admin 등
  // 인증이 필요한 경로의 **리다이렉트 응답(307)에도 그대로 적용**되어,
  // 브라우저가 "미인증 상태의 /admin → /login 리다이렉트" 응답을 1시간 동안
  // 캐시해버리는 문제를 일으켰다. 그 결과 로그인에 성공한 뒤에도 브라우저가
  // 캐시된 리다이렉트를 재생하여 실제 서버(및 proxy.ts의 세션 검증)에
  // 요청이 도달하지 못하고 계속 로그인 페이지로 튕기는 것처럼 보였다.
  //
  // 이 캐시 정책은 정적 공개 콘텐츠(`/`, `/invoice/[id]` 등)에만 적용하고,
  // 관리자·인증 관련 경로는 명시적으로 캐시하지 않도록 제외한다.
  headers: async () => {
    return [
      {
        // /admin, /api/admin, /login, /api/auth 는 이 캐시 정책에서 제외
        source: '/((?!admin|api/admin|login|api/auth).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // 인증 관련 경로는 항상 최신 상태로 서버에 재검증하도록 강제
        source: '/(admin|admin/:path*|api/admin/:path*|login|api/auth/:path*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
