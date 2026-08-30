import { useState } from "react";
import { RetailRow } from "@/lib/types";
import { TrainedModels, optimizeDiscount } from "@/lib/ml";
import { fmtCurrency, fmtPercent } from "@/lib/analytics";
import { Target, Info, Sparkles, HelpCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface Props {
  models: TrainedModels | null;
  rows: RetailRow[];
}

export function DiscountAdvisor({ models, rows }: Props) {
  const [maxDiscount, setMaxDiscount] = useState(0.8);
  const [showMethodology, setShowMethodology] = useState(false);

  if (!models || !rows.length) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 text-center space-y-2">
        <Target className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <h3 className="font-semibold text-base">Discount Recommendation Unavailable</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Training models on your dataset will generate an evidence-based recommended discount range.
        </p>
      </section>
    );
  }

  const optimizer = optimizeDiscount(models, rows, { maxDiscount, steps: 32 });
  const [rangeLow, rangeHigh] = optimizer.recommendedRange;
  const bestModelName = models.metrics.find((x, i) => ["ridge", "forest", "boost"][i] === models.best)?.name || "Gradient Boosting";

  const exportSimulation = () => {
    downloadCsv(
      "discount-simulation-results.csv",
      optimizer.points.map((p) => ({
        "Simulated Discount %": (p.discount * 100).toFixed(1),
        "Predicted Total Profit": p.predictedProfit.toFixed(2),
        "Predicted Total Sales": p.predictedSales.toFixed(2),
      }))
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">Discount Advisor</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMethodology(!showMethodology)}
          className="h-8 gap-1.5 text-xs text-muted-foreground"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {showMethodology ? "Hide calculation method" : "Learn how this was calculated"}
        </Button>
      </div>

      {showMethodology && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground space-y-2 leading-relaxed">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Info className="h-4 w-4 text-primary" /> Methodology & Methodology Assumptions:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Historical ML Model:</strong> A {bestModelName} regression model is fit on 80% of your historical transactions to capture category, customer, and shipping interactions.
            </li>
            <li>
              <strong>Sales Elasticity Assumption:</strong> The simulation incorporates a historical assumption that demand increases with discount level up to a simulated maximum.
            </li>
            <li>
              <strong>Profit Trade-off:</strong> Higher discounts increase overall volume, but beyond a critical threshold, margin erosion exceeds volume gains.
            </li>
            <li>
              <strong>Range Recommendation:</strong> Rather than a single rigid number, we provide a recommended range to account for real-world execution variance.
            </li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recommendation Box */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/90 via-primary to-primary-foreground/90 p-6 text-primary-foreground shadow-lg lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Evidence-Based Advisor</span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-primary-foreground/80 font-medium">
                Recommended Discount Range
              </p>
              <p className="font-display text-4xl font-extrabold tracking-tight mt-1">
                {(rangeLow * 100).toFixed(0)}% – {(rangeHigh * 100).toFixed(0)}%
              </p>
            </div>

            <p className="text-xs leading-relaxed text-primary-foreground/90 bg-white/10 p-3 rounded-lg backdrop-blur">
              Historical data suggests this range provides an optimal balance between driving order volume and protecting profit margins.
            </p>

            <div className="space-y-1.5 border-t border-white/20 pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-primary-foreground/80">Current Average Discount:</span>
                <span className="font-mono font-bold">{(optimizer.baseline.avgDiscount * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-foreground/80">Predicted Profit at Peak:</span>
                <span className="font-mono font-bold">{fmtCurrency(optimizer.best.predictedProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-foreground/80">Confidence Level:</span>
                <span className="font-semibold text-emerald-300">Medium–High ({bestModelName})</span>
              </div>
            </div>
          </div>

          <Button
            onClick={exportSimulation}
            variant="secondary"
            size="sm"
            className="mt-4 w-full gap-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export Simulation CSV
          </Button>
        </div>

        {/* Profit Curve Simulation Chart */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Simulated Total Profit Across Discount Levels</h3>
              <p className="text-xs text-muted-foreground">Evaluating total predicted profit from 0% to {(maxDiscount * 100).toFixed(0)}%</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="text-muted-foreground font-medium">Max Limit:</label>
              <input
                type="range"
                min={0.3}
                max={1.0}
                step={0.05}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(parseFloat(e.target.value))}
                className="w-24 accent-primary"
              />
              <span className="font-mono font-semibold text-foreground font-xs">{(maxDiscount * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer>
              <AreaChart data={optimizer.points}>
                <defs>
                  <linearGradient id="gOptArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="discount"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtCurrency(v)} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => fmtCurrency(v)}
                  labelFormatter={(l: number) => `Simulated Discount: ${(l * 100).toFixed(1)}%`}
                />
                <ReferenceLine
                  x={optimizer.best.discount}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{ value: "Peak Profit Range", position: "top", fill: "hsl(var(--primary))", fontSize: 11 }}
                />
                <Area type="monotone" dataKey="predictedProfit" name="Predicted Profit" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gOptArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
