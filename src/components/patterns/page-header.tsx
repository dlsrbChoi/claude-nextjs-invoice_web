interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="py-8 md:py-12 lg:py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
    </div>
  )
}
