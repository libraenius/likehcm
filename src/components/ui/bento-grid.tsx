import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-3", className)}>
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  children,
}: {
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/bento rounded-xl border bg-card p-3 shadow-sm transition-colors hover:bg-muted/20",
        className,
      )}
    >
      {header}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title ? <div className="font-medium text-sm leading-tight truncate">{title}</div> : null}
          {description ? (
            <div className="text-xs text-muted-foreground leading-snug mt-0.5">
              {description}
            </div>
          ) : null}
        </div>
        {icon ? <div className="text-muted-foreground shrink-0">{icon}</div> : null}
      </div>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

