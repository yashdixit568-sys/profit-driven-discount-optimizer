import { KPIs, fmtCurrency, fmtPercent, fmtNumber, NumberFormatMode } from "@/lib/analytics";

interface Props {
  kpis: KPIs;
  formatMode: NumberFormatMode;
}

export function BusinessAtAGlance({ kpis, formatMode }: Props) {
  const isProfitable = kpis.totalProfit >= 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-foreground tracking-tight">
          Your business at a glance
        </h2>
        <span className="text-xs text-muted-foreground">
          Showing in {formatMode === "compact" ? "₹ (Compact e.g. 5k / Lacs)" : "₹ (Full e.g. ₹5,000)"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Sales */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-muted-foreground">Total Sales</p>
          <p className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {fmtCurrency(kpis.totalSales, formatMode)}
          </p>
        </div>

        {/* Net Profit (ET Money Signature Green) */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-muted-foreground">Net Profit</p>
          <p
            className={`font-display text-2xl font-bold tracking-tight sm:text-3xl ${
              isProfitable ? "text-primary font-extrabold" : "text-destructive"
            }`}
          >
            {fmtCurrency(kpis.totalProfit, formatMode)}
          </p>
        </div>

        {/* Profit Margin */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-muted-foreground">Profit Margin</p>
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
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
          <p className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {fmtNumber(kpis.orders, formatMode)}
          </p>
        </div>
      </div>
    </section>
  );
}
