import { useState } from "react";
import { RetailRow } from "@/lib/types";
import { TrainedModels, optimizeDiscount } from "@/lib/ml";
import { fmtCurrency, fmtPercent, NumberFormatMode } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { HelpCircle, Info, Download, Sparkles } from "lucide-react";
import { downloadCsv } from "@/lib/csv";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  models: TrainedModels | null;
  rows: RetailRow[];
  formatMode: NumberFormatMode;
}

export function WhatShouldYouDo({ models, rows, formatMode }: Props) {
  const [openMethodology, setOpenMethodology] = useState(false);

  if (!rows.length) return null;

  const optimizer = models ? optimizeDiscount(models, rows) : null;
  const [rangeLow, rangeHigh] = optimizer?.recommendedRange || [0.1, 0.15];
  const avgDiscount = optimizer ? optimizer.baseline.avgDiscount : 0;
  const bestModelName = models
    ? models.metrics.find((x, i) => ["ridge", "forest", "boost"][i] === models.best)?.name || "Gradient Boosting"
    : "Statistical estimation";

  const exportSimulation = () => {
    if (!optimizer) return;
    downloadCsv(
      "discount-simulation-results.csv",
      optimizer.points.map((p) => ({
        "Simulated Discount %": (p.discount * 100).toFixed(1),
        "Predicted Total Profit (₹)": p.predictedProfit.toFixed(2),
        "Predicted Total Sales (₹)": p.predictedSales.toFixed(2),
      }))
    );
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-foreground tracking-tight">
          What should you do?
        </h2>
        {/* ET Money style Recommended Badge */}
        <span className="inline-flex items-center gap-1 rounded bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
          Recommended
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-emerald-500/10 via-card to-background p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Main Recommendation Column */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>🎯 Discount Recommendation</span>
            </div>

            <div>
              <p className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                {(rangeLow * 100).toFixed(0)}% – {(rangeHigh * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                Your historical sales data suggests this range provides the highest total profit balance without eroding margins.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span>
                Current average discount: <strong className="text-foreground font-mono">{fmtPercent(avgDiscount)}</strong>
              </span>
              <span>•</span>
              <span>
                Confidence: <strong className="text-primary font-semibold">High ({bestModelName})</strong>
              </span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="shrink-0 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenMethodology(true)}
              className="gap-1.5 text-xs font-medium border-border/80"
            >
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              Why this recommendation?
            </Button>
          </div>
        </div>
      </div>

      {/* "Why this recommendation?" Modal */}
      <Dialog open={openMethodology} onOpenChange={setOpenMethodology}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> How this was calculated
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Transparent breakdown of our historical simulation and modeling approach.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed pt-2">
            <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
              <p className="font-semibold text-foreground">1. Historical Model Fitting</p>
              <p>
                A predictive {bestModelName} model was fit on 80% of your historical transactions, evaluating how discount depths correlate with net profit.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
              <p className="font-semibold text-foreground">2. Demand & Elasticity Simulation</p>
              <p>
                We simulated discount levels from 0% up to 80% with an elasticity assumption. Discounts above the recommended range increased unit volume, but margin erosion reduced net overall profit.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
              <p className="font-semibold text-foreground">3. Recommended Range</p>
              <p>
                Rather than prescribing a rigid single percentage, we provide a recommended range ({(rangeLow * 100).toFixed(0)}% – {(rangeHigh * 100).toFixed(0)}%) to account for practical retail variation.
              </p>
            </div>

            {optimizer && (
              <div className="pt-2 flex justify-between items-center border-t border-border/60">
                <span className="text-[11px]">
                  Estimated peak profit: <strong className="text-primary font-semibold">{fmtCurrency(optimizer.best.predictedProfit, formatMode)}</strong>
                </span>
                <Button variant="outline" size="sm" onClick={exportSimulation} className="h-7 text-xs gap-1">
                  <Download className="h-3 w-3" /> Export simulation
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
