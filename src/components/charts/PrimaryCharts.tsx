import { useState } from "react";
import { RetailRow } from "@/lib/types";
import {
  timeSeries,
  groupBy,
  discountBuckets,
  scatterDiscountVs,
  fmtCurrency,
  fmtNumber,
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

export function PrimaryCharts({ rows, formatMode }: Props) {
  const [showMore, setShowMore] = useState(false);

  const ts = timeSeries(rows, "month");
  const byCat = groupBy(rows, "category");
  const buckets = discountBuckets(rows);
  const scatterProfit = scatterDiscountVs(rows, "profit");

  if (!rows.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-foreground tracking-tight">
          See what’s happening
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMore(!showMore)}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <BarChart2 className="h-3.5 w-3.5" />
          {showMore ? "Show fewer charts" : "See more charts"}
          {showMore ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* 2 PRIMARY CHARTS (ET Money Color Palette: Indigo Blue & Emerald Green) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chart 1: Sales over time */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Sales over time</h3>
            <p className="text-xs text-muted-foreground">Monthly sales and profit trend (₹)</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <AreaChart data={ts}>
                <defs>
                  <linearGradient id="gSalesPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4C6EF5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4C6EF5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtCurrency(v as number, formatMode)} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtCurrency(v, formatMode)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="sales" name="Sales (₹)" stroke="#4C6EF5" strokeWidth={2} fill="url(#gSalesPrimary)" />
                <Area type="monotone" dataKey="profit" name="Profit (₹)" stroke="#00B386" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Which categories make the most money? (ET Money style Bar Chart) */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Which categories make the most money?</h3>
            <p className="text-xs text-muted-foreground">Sales vs net profit across departments</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={byCat}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtCurrency(v as number, formatMode)} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtCurrency(v, formatMode)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sales" name="Sales (₹)" fill="#4C6EF5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit (₹)" fill="#D99B26" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECONDARY CHARTS (COLLAPSIBLE) */}
      {showMore && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 pt-2 border-t border-border/60">
          {/* How discounts impact individual order profit */}
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
            <div>
              <h3 className="font-semibold text-sm text-foreground">How discounts impact individual order profit</h3>
              <p className="text-xs text-muted-foreground">Each point represents a transaction (₹)</p>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                  <XAxis
                    type="number"
                    dataKey="discount"
                    name="Discount"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <YAxis
                    type="number"
                    dataKey="value"
                    name="Profit"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(v) => fmtCurrency(v as number, formatMode)}
                  />
                  <ZAxis range={[20, 20]} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, name) => (name === "Discount" ? `${(v * 100).toFixed(0)}%` : fmtCurrency(v, formatMode))}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                  <Scatter data={scatterProfit} fill="#4C6EF5" fillOpacity={0.5} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average profit per discount range */}
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Average profit by discount range</h3>
              <p className="text-xs text-muted-foreground">Notice when average returns turn negative (₹)</p>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                  <XAxis dataKey="discount" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtCurrency(v as number, formatMode)} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => fmtCurrency(v, formatMode)}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                  <Bar dataKey="avgProfit" name="Avg Profit (₹)" radius={[4, 4, 0, 0]}>
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
