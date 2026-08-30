import { Insight } from "@/lib/types";

interface Props {
  insights: Insight[];
}

export function WhatsGoingOn({ insights }: Props) {
  if (!insights.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-base font-bold text-foreground tracking-tight">
        What’s going on?
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {insights.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 space-y-2 shadow-xs transition-colors hover:border-primary/40"
          >
            <div className="space-y-1.5">
              <h3 className="font-semibold text-sm leading-snug text-foreground">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
            {item.metric && (
              <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[11px] text-muted-foreground">
                <span>Key metric</span>
                <span className="font-semibold text-foreground font-mono">{item.metric}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
