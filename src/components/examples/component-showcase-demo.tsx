'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

export function ComponentShowcaseDemo() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Button size="xs">XS</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🔔</Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Card Component</h3>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            This is a card component with header and content sections.
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Avatar</h3>
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
            <AvatarFallback>FX</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" />
            <AvatarFallback>AN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Alert</h3>
        <Alert>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components and dependencies to your app.
          </AlertDescription>
        </Alert>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Dialog</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog component. You can put any content here.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm">Dialog content goes here</p>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Tooltip</h3>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            Hover me
          </TooltipTrigger>
          <TooltipContent>
            This is a tooltip!
          </TooltipContent>
        </Tooltip>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Dropdown Menu</h3>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
            Menu
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
    </div>
  )
}
