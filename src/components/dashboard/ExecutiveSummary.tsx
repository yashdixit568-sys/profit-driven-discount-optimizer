import { KPIs, fmtCurrency, fmtNumber, fmtPercent } from "@/lib/analytics";
import { DollarSign, TrendingUp, Percent, ShoppingBag } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";

interface Props {
  kpis: KPIs;
}

export function ExecutiveSummary({ kpis }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Executive Summary</h2>
        <span className="text-xs text-muted-foreground">High-level Business Performance</span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          index={0}
          label="Total Sales"
          value={fmtCurrency(kpis.totalSales)}
          sub="Total revenue generated"
          icon={DollarSign}
          gradient="emerald"
        />
        <KpiCard
          index={1}
          label="Total Profit"
          value={fmtCurrency(kpis.totalProfit)}
          sub={`Net margin: ${fmtPercent(kpis.profitMargin)}`}
          icon={TrendingUp}
          gradient="sky"
        />
        <KpiCard
          index={2}
          label="Profit Margin"
          value={fmtPercent(kpis.profitMargin)}
          sub={`Target: >15.0%`}
          icon={Percent}
          gradient="amber"
        />
        <KpiCard
          index={3}
          label="Total Orders"
          value={fmtNumber(kpis.orders)}
          sub={`Avg order: ${fmtCurrency(kpis.orders ? kpis.totalSales / kpis.orders : 0)}`}
          icon={ShoppingBag}
          gradient="rose"
        />
      </div>
    </section>
  );
}
