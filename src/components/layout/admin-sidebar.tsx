'use client';

/**
 * 관리자 좌측 네비게이션 사이드바
 * 대시보드/견적서/클라이언트/신고 4개 메뉴 항목을 제공
 *
 * - 데스크톱(md 이상): 고정 좌측 사이드바
 * - 모바일(md 미만): Sheet 기반 서랍형 메뉴 (신규 UI 의존성 없이 기존 컴포넌트 재사용)
 *
 * 이동(내비게이션)은 이 컴포넌트가 담당하고, 계정 액션(로그아웃)은
 * 기존 `AdminMenu`(우측 상단 드롭다운)가 담당하도록 역할을 분리한다.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import {
  LayoutDashboard,
  FileText,
  Users,
  Flag,
  Menu,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** 신고 메뉴 미처리 건수 (Task 614에서 동적 로드) */
// 클라이언트 컴포넌트이므로 기본값을 표시하고, 필요시 useEffect로 갱신

/** 사이드바 접힘 상태를 저장하는 로컬스토리지 키 */
const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

interface AdminNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badgeKey?: 'reports'; // 동적 배지를 로드할 메뉴 항목 표시
}

/**
 * 관리자 메뉴 항목 정의
 * 순서: 대시보드 → 견적서 → 클라이언트 → 신고
 * Task 614: 신고 관리의 배지는 동적으로 로드됨
 */
const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/invoices', label: '견적서', icon: FileText },
  { href: '/admin/clients', label: '클라이언트', icon: Users },
  { href: '/admin/reports', label: '신고 관리', icon: Flag, badgeKey: 'reports' },
];

/**
 * 현재 경로가 해당 메뉴 항목의 활성 상태인지 판단
 * '/admin'은 정확히 일치할 때만 활성화(그렇지 않으면 모든 하위 경로에서 대시보드가 활성 표시됨)
 * 그 외 항목은 접두사 일치로 하위 경로도 활성 처리
 */
function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  onNavigate,
  collapsed,
  dynamicBadges,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  dynamicBadges?: Record<string, number>;
}) {
  return (
    <nav aria-label='관리자 메뉴' className='flex flex-col gap-1'>
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;
        const badge = item.badgeKey ? dynamicBadges?.[item.badgeKey] : undefined;

        const link = (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              collapsed && 'justify-center px-2',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <span className='relative shrink-0'>
              <Icon className='h-4 w-4' aria-hidden='true' />
              {collapsed && badge ? (
                <span
                  className='absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-semibold text-destructive-foreground'
                  aria-hidden='true'
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              ) : null}
            </span>
            {!collapsed && (
              <span className='flex flex-1 items-center justify-between'>
                {item.label}
                {badge ? (
                  <Badge variant='destructive' className='ml-2'>
                    {badge}
                  </Badge>
                ) : null}
              </span>
            )}
          </Link>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={link} />
              <TooltipContent side='right'>
                {item.label}
                {badge ? ` (미처리 ${badge}건)` : ''}
              </TooltipContent>
            </Tooltip>
          );
        }

        return link;
      })}
    </nav>
  );
}

/**
 * 데스크톱용 고정 좌측 사이드바 (md 이상에서만 표시)
 * 접기/펼치기 상태는 로컬스토리지에 저장되어 새로고침 후에도 유지된다
 * Task 614: 미처리 신고 배지를 동적으로 로드
 */
export function AdminSidebar() {
  const pathname = usePathname() ?? '/admin';
  const [collapsed, setCollapsed] = useLocalStorage(SIDEBAR_COLLAPSED_KEY, false);
  const [dynamicBadges] = useState<Record<string, number>>({});

  // Task 614: 미처리 신고 건수 로드는 향후 구현
  // 현재: 서버 컴포넌트에서 badge값을 props로 전달받는 방식 권장

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col md:border-r md:border-border md:py-6 md:pr-4 md:transition-[width] md:duration-150',
        collapsed ? 'md:w-16' : 'md:w-56'
      )}
    >
      <div
        className={cn(
          'mb-4 flex items-center px-3',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!collapsed && (
          <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            관리자 메뉴
          </span>
        )}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
              />
            }
          >
            {collapsed ? (
              <ChevronsRight className='h-4 w-4' aria-hidden='true' />
            ) : (
              <ChevronsLeft className='h-4 w-4' aria-hidden='true' />
            )}
          </TooltipTrigger>
          <TooltipContent side='right'>{collapsed ? '펼치기' : '접기'}</TooltipContent>
        </Tooltip>
      </div>
      <NavLinks pathname={pathname} collapsed={collapsed} dynamicBadges={dynamicBadges} />
    </aside>
  );
}

/**
 * 모바일용 서랍형 메뉴 (md 미만에서만 표시)
 * 헤더 하단에 메뉴 버튼을 배치하고, 클릭 시 좌측에서 Sheet가 열림
 */
export function AdminMobileNav() {
  const pathname = usePathname() ?? '/admin';
  const [open, setOpen] = useState(false);
  const [dynamicBadges] = useState<Record<string, number>>({});

  // Task 614: 미처리 신고 건수 로드는 향후 구현

  return (
    <div className='flex items-center justify-between border-b border-border px-4 py-3 md:hidden'>
      <span className='text-sm font-semibold text-muted-foreground'>관리자 메뉴</span>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant='outline' size='sm' className='gap-2'>
              <Menu className='h-4 w-4' />
              메뉴
            </Button>
          }
        />
        <SheetContent side='left'>
          <SheetHeader>
            <SheetTitle>관리자 메뉴</SheetTitle>
          </SheetHeader>
          <div className='px-4 pb-4'>
            <NavLinks
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              dynamicBadges={dynamicBadges}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
