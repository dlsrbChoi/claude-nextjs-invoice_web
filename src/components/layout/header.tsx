'use client'

import Link from 'next/link'
import { Container } from './container'
import { MobileNav } from './mobile-nav'
import { ThemeToggle } from './theme-toggle'
import { navItems } from '@/lib/nav'

export function Header() {

  return (
    <header className="border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg">
            Next.js Starter
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  )
}
