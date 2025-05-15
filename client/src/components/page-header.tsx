interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}