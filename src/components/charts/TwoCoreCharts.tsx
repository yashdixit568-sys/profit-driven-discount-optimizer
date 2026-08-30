import { useState } from "react";
import { RetailRow } from "@/lib/types";
import {
  timeSeries,
  groupBy,
  discountBuckets,
  scatterDiscountVs,
  fmtCurrency,
  NumberFormatMode,
} from "@/lib/analytics";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react";

interface Props {
  rows: RetailRow[];
  formatMode: NumberFormatMode;
}

export function TwoCoreCharts({ rows, formatMode }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const ts = timeSeries(rows, "auto");
  const byCat = groupBy(rows, "category");
  const buckets = discountBuckets(rows);
  const scatterProfit = scatterDiscountVs(rows, "profit");

  if (!rows.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Visual Summary
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <BarChart2 className="h-3.5 w-3.5" />
          {showDetails ? "Hide details" : "Explore details"}
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {/* 2 Core Visualizations */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Chart 1: Sales over time */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm text-foreground">Sales over time</h3>
            <p className="text-[11px] text-muted-foreground">
              💡 <em>Sales and net profit trend over time ({ts.length} data points)</em>
            </p>
          </div>
          <div className="h-48 w-full pt-1">
            <ResponsiveContainer>
              <AreaChart data={ts}>
                <defs>
                  <linearGradient id="gSalesCoreTwo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4C6EF5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4C6EF5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => fmtCurrency(v as number, formatMode)} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => fmtCurrency(v, formatMode)}
                />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#4C6EF5" strokeWidth={2} fill="url(#gSalesCoreTwo)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#00B386" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Do discounts reduce profit? */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm text-foreground">Do discounts reduce profit?</h3>
            <p className="text-[11px] text-muted-foreground">
              💡 <em>Higher-discount orders are associated with lower profit in this dataset</em>
            </p>
          </div>
          <div className="h-48 w-full pt-1">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  type="number"
                  dataKey="discount"
                  name="Discount"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <YAxis
                  type="number"
                  dataKey="value"
                  name="Profit"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickFormatter={(v) => fmtCurrency(v as number, formatMode)}
                />
                <ZAxis range={[25, 25]} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number, name) => (name === "Discount" ? `${(v * 100).toFixed(0)}%` : fmtCurrency(v, formatMode))}
                />
                <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                <Scatter data={scatterProfit} fill="#4C6EF5" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary charts on click */}
      {showDetails && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-border/60">
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
            <div className="space-y-0.5">
              <h3 className="font-semibold text-sm text-foreground">Which categories make the most money?</h3>
              <p className="text-[11px] text-muted-foreground">
                💡 <em>Compare sales revenue vs net profit per category</em>
              </p>
            </div>
            <div className="h-48 w-full pt-1">
              <ResponsiveContainer>
                <BarChart data={byCat}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => fmtCurrency(v as number, formatMode)} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => fmtCurrency(v, formatMode)}
                  />
                  <Bar dataKey="sales" name="Sales" fill="#4C6EF5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#D99B26" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
            <div className="space-y-0.5">
              <h3 className="font-semibold text-sm text-foreground">Average Profit by Discount Range</h3>
              <p className="text-[11px] text-muted-foreground">
                💡 <em>Observe when average returns turn negative</em>
              </p>
            </div>
            <div className="h-48 w-full pt-1">
              <ResponsiveContainer>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="discount" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => fmtCurrency(v as number, formatMode)} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => fmtCurrency(v, formatMode)}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                  <Bar dataKey="avgProfit" name="Avg Profit" radius={[4, 4, 0, 0]}>
                    {buckets.map((b, i) => (
                      <Cell key={i} fill={b.avgProfit >= 0 ? "#00B386" : "hsl(var(--destructive))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
