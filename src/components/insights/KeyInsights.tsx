import { Insight } from "@/lib/types";
import { Sparkles, TrendingUp, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  insights: Insight[];
}

export function KeyInsights({ insights }: Props) {
  if (!insights.length) return null;

  const iconMap = {
    positive: CheckCircle2,
    warning: AlertTriangle,
    neutral: Info,
    insight: TrendingUp,
  };

  const styleMap = {
    positive: "border-emerald-500/20 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200",
    warning: "border-amber-500/20 bg-amber-500/5 text-amber-950 dark:text-amber-200",
    neutral: "border-blue-500/20 bg-blue-500/5 text-blue-950 dark:text-blue-200",
    insight: "border-primary/20 bg-primary/5 text-foreground",
  };

  const badgeMap = {
    positive: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    neutral: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    insight: "bg-primary/15 text-primary",
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold text-foreground">What Should I Know?</h2>
        <span className="text-xs text-muted-foreground">· Dynamic Key Insights</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((item) => {
          const Icon = iconMap[item.type] || Info;
          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md",
                styleMap[item.type]
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm leading-tight text-foreground flex items-center gap-1.5">
                    <Icon className="h-4 w-4 shrink-0" /> {item.title}
                  </span>
                  {item.metric && (
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0", badgeMap[item.type])}>
                      {item.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
