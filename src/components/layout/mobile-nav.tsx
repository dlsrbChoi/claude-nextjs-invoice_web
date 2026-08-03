'use client'

import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { navItems } from '@/lib/nav'

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">메뉴 열기</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px]">
        <div className="mb-4">
          <Link href="/" className="font-semibold text-lg">
            Next.js Starter
          </Link>
        </div>
        <nav className="space-y-3">
          {navItems.map((item) => (
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
