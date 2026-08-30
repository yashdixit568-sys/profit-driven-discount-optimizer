import { BusinessRecommendation } from "@/lib/analytics";

interface Props {
  recommendation: BusinessRecommendation;
}

export function WhatShouldYouDoAssistant({ recommendation }: Props) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          What should you do?
        </h2>
        <span className="text-[11px] text-muted-foreground font-medium">
          Actionable Advice
        </span>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-3.5 shadow-2xs">
        {/* Recommendation Headline */}
        <div className="flex items-start gap-2.5">
          <span className="text-xl leading-none mt-0.5">🎯</span>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {recommendation.headline}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Average discount across your orders is <strong className="text-foreground font-mono">{recommendation.currentAvgDiscount}</strong>.
            </p>
          </div>
        </div>

        {/* Why? Explanation */}
        <div className="rounded-xl bg-card/90 p-3.5 space-y-1 border border-border/60">
          <p className="text-xs font-bold text-foreground">Why?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {recommendation.why}
          </p>
        </div>

        {/* Category Tip if applicable */}
        {recommendation.categoryAdvice && (
          <div className="rounded-xl bg-card/90 p-3 text-xs text-foreground border border-border/60 font-medium">
            💡 <strong>Category Tip:</strong> {recommendation.categoryAdvice}
          </div>
        )}

        {/* Model Estimate (if available) & Confidence Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-primary/20 text-xs text-muted-foreground">
          {recommendation.modelEstimate ? (
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                Simulation estimate
              </span>
              <span>
                Optimal historical range: <strong className="text-foreground font-semibold">{recommendation.modelEstimate.range}</strong>
              </span>
            </div>
          ) : (
            <span className="text-[11px] italic">
              Simple historical observation (predictive modeling skipped for small dataset)
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <span>Confidence:</span>
            <span
              className={`font-semibold ${
                recommendation.confidenceTier === "high"
                  ? "text-primary"
                  : recommendation.confidenceTier === "moderate"
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-muted-foreground"
              }`}
            >
              {recommendation.confidence}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
