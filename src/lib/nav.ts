export interface NavItem {
  label: string
  href: string
  external?: boolean
}

export const navItems: NavItem[] = [
  { label: '기능', href: '/#features' },
  { label: '문서', href: '/docs' },
  { label: '예제', href: '/examples' },
  { label: 'GitHub', href: 'https://github.com', external: true },
]
