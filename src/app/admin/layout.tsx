/**
 * 관리자 라우트 레이아웃
 * 관리자 섹션 전용 레이아웃 (루트 레이아웃의 Header/Footer 재사용)
 * PageHeader는 각 페이지에서 개별적으로 렌더링하므로 여기서는 children을 그대로 전달
 *
 * 좌측 사이드바 + 우측 콘텐츠 2단 구조로 구성 (Task 602, F031)
 * - 데스크톱(md 이상): AdminSidebar가 고정 좌측 사이드바로 표시
 * - 모바일(md 미만): AdminMobileNav가 헤더 하단의 서랍형 메뉴 트리거로 표시
 */

import { AdminSidebar, AdminMobileNav } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row'>
      <AdminMobileNav />
      <AdminSidebar />
      <div className='min-w-0 flex-1'>{children}</div>
    </div>
  );
}
