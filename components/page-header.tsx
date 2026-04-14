interface PageHeaderProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-6 px-8 pt-6 pb-4">
      <div>
        {eyebrow ? <div className="eyebrow mb-1">{eyebrow}</div> : null}
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">{title}</h1>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
