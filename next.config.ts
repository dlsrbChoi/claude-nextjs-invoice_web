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
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
