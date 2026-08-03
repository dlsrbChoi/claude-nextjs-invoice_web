import { Separator } from '@/components/ui/separator'
import { Container } from './container'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <Container className="py-8">
        <Separator className="mb-8" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-foreground">Product</h3>
            <nav className="mt-4 space-y-2 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Docs
              </a>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Company</h3>
            <nav className="mt-4 space-y-2 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Blog
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Careers
              </a>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Legal</h3>
            <nav className="mt-4 space-y-2 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="block hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 Next.js Starter Kit. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
