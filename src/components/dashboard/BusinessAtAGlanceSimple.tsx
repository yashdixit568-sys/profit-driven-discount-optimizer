import { useState } from "react";
import { KPIs, fmtCurrency, fmtPercent, fmtNumber, NumberFormatMode } from "@/lib/analytics";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  kpis: KPIs;
  formatMode: NumberFormatMode;
}

export function BusinessAtAGlanceSimple({ kpis, formatMode }: Props) {
  const [openExplanation, setOpenExplanation] = useState(false);
  const isProfitable = kpis.totalProfit >= 0;
  const marginPerHundred = Math.round(kpis.profitMargin * 100);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Your Business at a Glance
        </h2>
        <button
          type="button"
          onClick={() => setOpenExplanation(true)}
          className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>What do these numbers mean?</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Sales */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-muted-foreground">Sales</p>
          <p className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {fmtCurrency(kpis.totalSales, formatMode)}
          </p>
        </div>

        {/* Profit */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-muted-foreground">Profit</p>
          <p
            className={`font-display text-2xl font-bold tracking-tight sm:text-3xl ${
              isProfitable ? "text-primary font-bold" : "text-destructive"
            }`}
          >
            {fmtCurrency(kpis.totalProfit, formatMode)}
          </p>
        </div>

        {/* Margin */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-muted-foreground">Margin</p>
          <p
            className={`font-display text-2xl font-bold tracking-tight sm:text-3xl ${
              kpis.profitMargin >= 0.15
                ? "text-primary font-bold"
                : kpis.profitMargin >= 0
                ? "text-foreground"
                : "text-destructive"
            }`}
          >
            {fmtPercent(kpis.profitMargin)}
          </p>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-muted-foreground">Orders</p>
          <p className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {fmtNumber(kpis.orders, formatMode)}
          </p>
        </div>
      </div>

      {/* Explanation dialog */}
      <Dialog open={openExplanation} onOpenChange={setOpenExplanation}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Understanding your numbers</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              A quick explanation of your core business metrics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 text-xs text-muted-foreground pt-1 leading-relaxed">
            <p>
              • <strong>Sales:</strong> Total money received across all {kpis.orders} orders ({fmtCurrency(kpis.totalSales, formatMode)}).
            </p>
            <p>
              • <strong>Profit:</strong> What remains after costs and discounts ({fmtCurrency(kpis.totalProfit, formatMode)}).
            </p>
            <p>
              • <strong>Margin ({fmtPercent(kpis.profitMargin)}):</strong> You keep about <strong className="text-foreground">₹{marginPerHundred} in profit for every ₹100 in sales</strong>.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
