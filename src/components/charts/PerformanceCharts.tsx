import { useState } from "react";
import { RetailRow } from "@/lib/types";
import {
  timeSeries,
  groupBy,
  discountBuckets,
  shippingDelayAnalysis,
  scatterDiscountVs,
  fmtCurrency,
  fmtNumber,
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
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";
import { ChartCard } from "@/components/KpiCard"; // wait, ChartCard is in components/ChartCard.tsx
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react";

interface Props {
  rows: RetailRow[];
}

export function PerformanceCharts({ rows }: Props) {
  const [showMore, setShowMore] = useState(false);

  const ts = timeSeries(rows, "month");
  const byCat = groupBy(rows, "category");
  const bySub = groupBy(rows, "subCategory").slice(0, 10);
  const byReg = groupBy(rows, "region");
  const bySeg = groupBy(rows, "segment");
  const buckets = discountBuckets(rows);
  const shipping = shippingDelayAnalysis(rows);
  const scatterProfit = scatterDiscountVs(rows, "profit");

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        <p className="font-semibold text-base">No data matches the selected filters.</p>
        <p className="text-xs mt-1">Try resetting or broadening your filter options.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Performance & Visual Trends</h2>
        <span className="text-xs text-muted-foreground">4 Core Visualizations</span>
      </div>

      {/* 4 CORE CHARTS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 1. Trend */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-card">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Monthly Revenue & Profit Growth</h3>
            <p className="text-xs text-muted-foreground">How sales and net profit evolve over time</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <AreaChart data={ts}>
                <defs>
                  <linearGradient id="gSalesCore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtNumber(v as number)} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => fmtCurrency(v)}
                />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gSalesCore)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="hsl(158, 80%, 40%)" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Category */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-card">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Category Profitability & Revenue</h3>
            <p className="text-xs text-muted-foreground">Comparing total sales vs profit across categories</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={byCat}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtNumber(v as number)} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => fmtCurrency(v)}
                />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="hsl(158, 80%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Discount vs Profit */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-card">
          <div>
            <h3 className="font-semibold text-sm text-foreground">How Profit Changes with Discount</h3>
            <p className="text-xs text-muted-foreground">Order-level scatter plot showing profit collapse at high discounts</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                  tickFormatter={(v) => fmtNumber(v as number)}
                />
                <ZAxis range={[20, 20]} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number, name) => (name === "Discount" ? `${(v * 100).toFixed(0)}%` : fmtCurrency(v))}
                />
                <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                <Scatter data={scatterProfit} fill="hsl(var(--primary))" fillOpacity={0.5} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Region */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-card">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Regional Sales & Profit Comparison</h3>
            <p className="text-xs text-muted-foreground">Performance across geographic regions</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={byReg}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtNumber(v as number)} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => fmtCurrency(v)}
                />
                <Bar dataKey="sales" name="Sales" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="hsl(158, 80%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECONDARY ANALYSIS TOGGLE */}
      <div className="pt-2 text-center">
        <Button
          variant="outline"
          onClick={() => setShowMore(!showMore)}
          className="gap-2 text-xs font-semibold"
        >
          <BarChart2 className="h-4 w-4" />
          {showMore ? "Hide Secondary Analysis" : "Show More Analysis"}
          {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {showMore && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 pt-2 border-t border-border">
          {/* Sub-categories */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Top 10 Sub-Categories by Revenue</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={bySub} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtNumber(v as number)} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: number) => fmtCurrency(v)}
                  />
                  <Bar dataKey="sales" name="Sales" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Discount Buckets */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Average Profit by Discount Bucket</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="discount" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtNumber(v as number)} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: number) => fmtCurrency(v)}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                  <Bar dataKey="avgProfit" name="Avg Profit" radius={[4, 4, 0, 0]}>
                    {buckets.map((b, i) => (
                      <Cell key={i} fill={b.avgProfit >= 0 ? "hsl(158, 80%, 40%)" : "hsl(var(--destructive))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Segment */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Customer Segment Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={bySeg}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtNumber(v as number)} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: number) => fmtCurrency(v)}
                  />
                  <Bar dataKey="sales" name="Sales" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="hsl(158, 80%, 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shipping Delay */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Shipping Delay vs Avg Profit</h3>
            <div className="h-64 w-full">
              {shipping.length ? (
                <ResponsiveContainer>
                  <LineChart data={shipping}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="delay" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => fmtNumber(v as number)} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(v: number) => fmtCurrency(v)}
                    />
                    <Line type="monotone" dataKey="avgProfit" name="Avg Profit" stroke="hsl(262, 83%, 58%)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Order & Ship Date columns required for shipping delay analysis
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
