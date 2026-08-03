'use client'

import { useCopyToClipboard } from 'usehooks-ts'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const [copiedText, copy] = useCopyToClipboard()
  const isCopied = copiedText === code

  return (
    <div className="relative rounded-lg border border-border bg-muted/50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted">
        <span className="text-xs text-muted-foreground font-medium">{language}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => copy(code)}
          title={isCopied ? '복사됨' : '복사하기'}
        >
          {isCopied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-foreground whitespace-pre-wrap break-words">{code}</code>
      </pre>
    </div>
  )
}
