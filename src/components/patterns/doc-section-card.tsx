import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocSectionCardProps {
  icon: LucideIcon
  title: string
  description: string
  items: string[]
  href?: string
  linkLabel?: string
}

export function DocSectionCard({
  icon: Icon,
  title,
  description,
  items,
  href,
  linkLabel,
}: DocSectionCardProps) {
  return (
    <Card className="border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="text-sm text-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        {href && linkLabel && (
          <Button
            nativeButton={false}
            className="mt-4 w-full"
            render={
              <Link href={href} className={cn('inline-flex items-center justify-center')} />
            }
          >
            {linkLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
