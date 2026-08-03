import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export function LayoutPatternsDemo() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">반응형 그리드</h3>
        <p className="text-sm text-muted-foreground mb-4">
          모바일에서는 1열, 태블릿에서는 2열, 데스크톱에서는 3열로 표시됩니다
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">Card {i}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  반응형 레이아웃 예제
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="text-lg font-semibold mb-4">섹션 구분 (Separator)</h3>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h4 className="font-semibold text-sm mb-2">Section 1</h4>
            <p className="text-xs text-muted-foreground">
              Separator를 사용하여 시각적으로 섹션을 구분합니다
            </p>
          </div>
          <Separator />
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h4 className="font-semibold text-sm mb-2">Section 2</h4>
            <p className="text-xs text-muted-foreground">
              각 섹션을 명확하게 분리할 수 있습니다
            </p>
          </div>
          <Separator />
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h4 className="font-semibold text-sm mb-2">Section 3</h4>
            <p className="text-xs text-muted-foreground">
              다양한 레이아웃 패턴을 조합해서 사용할 수 있습니다
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="text-lg font-semibold mb-4">Badge와 함께 사용</h3>
        <div className="space-y-4">
          {['Feature 1', 'Feature 2', 'Feature 3'].map((feature) => (
            <div key={feature} className="p-4 border rounded-lg flex items-center justify-between">
              <span className="font-medium text-sm">{feature}</span>
              <Badge variant="secondary">New</Badge>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="text-lg font-semibold mb-4">다양한 너비의 컨테이너</h3>
        <div className="space-y-4">
          <div className="w-full bg-primary/10 p-4 rounded-lg">
            <p className="text-xs font-mono text-muted-foreground">w-full (100%)</p>
          </div>
          <div className="w-4/5 bg-secondary/10 p-4 rounded-lg">
            <p className="text-xs font-mono text-muted-foreground">w-4/5 (80%)</p>
          </div>
          <div className="w-3/5 bg-primary/10 p-4 rounded-lg">
            <p className="text-xs font-mono text-muted-foreground">w-3/5 (60%)</p>
          </div>
          <div className="w-2/5 bg-secondary/10 p-4 rounded-lg">
            <p className="text-xs font-mono text-muted-foreground">w-2/5 (40%)</p>
          </div>
        </div>
      </section>
    </div>
  )
}
