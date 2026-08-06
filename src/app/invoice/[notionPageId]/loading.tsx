import { Skeleton } from '@/components/ui/skeleton'
import { Container } from '@/components/layout/container'
import { Card } from '@/components/ui/card'

export default function InvoiceLoading() {
  return (
    <>
      <div className="bg-muted/50 py-12 print:hidden">
        <Container>
          <Skeleton className="h-10 w-2/3 mb-2" />
          <Skeleton className="h-5 w-1/2" />
        </Container>
      </div>

      <Container className="py-8">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-muted/50">
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-8 w-48" />
          </Card>

          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </Container>
    </>
  )
}
