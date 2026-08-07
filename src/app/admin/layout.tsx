/**
 * 관리자 라우트 레이아웃
 * 관리자 섹션 전용 레이아웃 (루트 레이아웃의 Header/Footer 재사용)
 * PageHeader는 각 페이지에서 개별적으로 렌더링하므로 여기서는 children을 그대로 전달
 */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
