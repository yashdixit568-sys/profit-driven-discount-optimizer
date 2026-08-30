interface Props {
  findings: string[];
}

export function WhatsGoingWell({ findings }: Props) {
  if (!findings.length) return null;

  return (
    <section className="space-y-2.5">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
        What’s going well?
      </h2>

      <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2.5 shadow-2xs">
        {findings.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs text-foreground font-medium leading-relaxed">
            <span className="text-base leading-none shrink-0 mt-0.5">⭐</span>
            <span>{item.replace(/^⭐\s*/, "")}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
