import { RetailRow, Filters, Insight, DatePreset } from "./types";
import { TrainedModels, optimizeDiscount } from "./ml";

export type NumberFormatMode = "compact" | "full";

export function applyFilters(rows: RetailRow[], f: Filters): RetailRow[] {
  if (!rows.length) return [];

  let maxDate: Date | null = null;
  if (f.datePreset !== "all" && f.datePreset !== "custom") {
    for (const r of rows) {
      if (r.orderDate && (!maxDate || r.orderDate > maxDate)) {
        maxDate = r.orderDate;
      }
    }
  }

  let cutoffDate: Date | null = null;
  if (maxDate && f.datePreset !== "all" && f.datePreset !== "custom") {
    cutoffDate = new Date(maxDate.getTime());
    const daysMap: Record<Exclude<DatePreset, "all" | "custom">, number> = {
      "7d": 7,
      "30d": 30,
      "3m": 90,
      "6m": 180,
      "12m": 365,
    };
    const days = daysMap[f.datePreset as keyof typeof daysMap] || 30;
    cutoffDate.setDate(cutoffDate.getDate() - days);
  }

  return rows.filter((r) => {
    if (f.category !== "all" && r.category !== f.category) return false;
    if (f.subCategory !== "all" && r.subCategory !== f.subCategory) return false;
    if (f.region !== "all" && r.region !== f.region) return false;
    if (f.segment !== "all" && r.segment !== f.segment) return false;
    if (f.shipMode !== "all" && r.shipMode !== f.shipMode) return false;

    if (f.datePreset === "custom") {
      if (f.dateRange[0] && r.orderDate && r.orderDate < f.dateRange[0]) return false;
      if (f.dateRange[1] && r.orderDate && r.orderDate > f.dateRange[1]) return false;
    } else if (cutoffDate && r.orderDate) {
      if (r.orderDate < cutoffDate) return false;
    }
    return true;
  });
}

export function cleanLabel(val: unknown, fallback = "Other"): string {
  if (val == null || val === "" || String(val).toLowerCase() === "unknown") {
    return fallback;
  }
  return String(val).trim();
}

export function unique(rows: RetailRow[], key: keyof RetailRow): string[] {
  const s = new Set<string>();
  for (const r of rows) {
    const v = r[key];
    if (v != null && v !== "") s.add(cleanLabel(v));
  }
  return Array.from(s).sort();
}

/**
 * Format Indian Rupees (₹) with either Compact (e.g. ₹5k, ₹4.06 L, ₹1.2 Cr)
 * or Full (e.g. ₹5,000, ₹4,06,000)
 */
export function fmtCurrency(n: number, mode: NumberFormatMode = "compact"): string {
  if (isNaN(n) || !isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (mode === "compact") {
    if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)} Cr`;
    if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(2)} L`;
    if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}k`;
    return `${sign}₹${abs.toFixed(0)}`;
  } else {
    const formatted = Math.round(abs).toLocaleString("en-IN");
    return `${sign}₹${formatted}`;
  }
}

export function fmtNumber(n: number, mode: NumberFormatMode = "compact"): string {
  if (isNaN(n) || !isFinite(n)) return "0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (mode === "compact") {
    if (abs >= 10_000_000) return `${sign}${(abs / 10_000_000).toFixed(2)} Cr`;
    if (abs >= 100_000) return `${sign}${(abs / 100_000).toFixed(2)} L`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}k`;
    return `${sign}${abs.toFixed(0)}`;
  } else {
    return `${sign}${Math.round(abs).toLocaleString("en-IN")}`;
  }
}

export function fmtPercent(n: number, digits = 1): string {
  if (isNaN(n) || !isFinite(n)) return "0.0%";
  return `${(n * 100).toFixed(digits)}%`;
}

export interface KPIs {
  totalSales: number;
  totalProfit: number;
  avgDiscount: number;
  totalQty: number;
  profitMargin: number;
  topSalesCategory: string;
  topProfitCategory: string;
  topRegion: string;
  orders: number;
}

export function computeKPIs(rows: RetailRow[]): KPIs {
  if (!rows.length) {
    return {
      totalSales: 0,
      totalProfit: 0,
      avgDiscount: 0,
      totalQty: 0,
      profitMargin: 0,
      topSalesCategory: "—",
      topProfitCategory: "—",
      topRegion: "—",
      orders: 0,
    };
  }
  let s = 0,
    p = 0,
    d = 0,
    q = 0;
  const salesByCat = new Map<string, number>();
  const profitByCat = new Map<string, number>();
  const byReg = new Map<string, number>();

  for (const r of rows) {
    s += r.sales || 0;
    p += r.profit || 0;
    d += r.discount || 0;
    q += r.quantity || 0;
    const cat = cleanLabel(r.category);
    const reg = cleanLabel(r.region);
    salesByCat.set(cat, (salesByCat.get(cat) || 0) + (r.sales || 0));
    profitByCat.set(cat, (profitByCat.get(cat) || 0) + (r.profit || 0));
    byReg.set(reg, (byReg.get(reg) || 0) + (r.sales || 0));
  }

  const top = (m: Map<string, number>) => {
    let best = "—",
      bv = -Infinity;
    m.forEach((v, k) => {
      if (v > bv) {
        bv = v;
        best = k;
      }
    });
    return best;
  };

  return {
    totalSales: s,
    totalProfit: p,
    avgDiscount: rows.length ? d / rows.length : 0,
    totalQty: q,
    profitMargin: s > 0 ? p / s : 0,
    topSalesCategory: top(salesByCat),
    topProfitCategory: top(profitByCat),
    topRegion: top(byReg),
    orders: rows.length,
  };
}

export interface TimeSeriesPoint {
  date: string;
  sales: number;
  profit: number;
}

/**
 * Smart adaptive time series:
 * If date range <= 45 days or rows <= 30 with distinct dates, groups by day (e.g. "10 Jan").
 * Otherwise groups by month (e.g. "2026-01").
 */
export function timeSeries(
  rows: RetailRow[],
  forcedGranularity?: "auto" | "month" | "day"
): TimeSeriesPoint[] {
  const validRows = rows.filter((r) => r.orderDate instanceof Date && !isNaN(r.orderDate.getTime()));
  if (!validRows.length) return [];

  let useDaily = false;
  if (forcedGranularity === "day") {
    useDaily = true;
  } else if (forcedGranularity === "month") {
    useDaily = false;
  } else {
    let minD = validRows[0].orderDate.getTime();
    let maxD = validRows[0].orderDate.getTime();
    for (const r of validRows) {
      const t = r.orderDate.getTime();
      if (t < minD) minD = t;
      if (t > maxD) maxD = t;
    }
    const spanDays = (maxD - minD) / (1000 * 60 * 60 * 24);
    if (spanDays <= 45 || validRows.length <= 30) {
      useDaily = true;
    }
  }

  const map = new Map<string, { date: string; sales: number; profit: number; timestamp: number }>();
  for (const r of validRows) {
    let key: string;
    let label: string;
    let ts: number;

    if (useDaily) {
      key = r.orderDate.toISOString().slice(0, 10);
      label = r.orderDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      ts = new Date(key).getTime();
    } else {
      key = `${r.orderDate.getFullYear()}-${String(r.orderDate.getMonth() + 1).padStart(2, "0")}`;
      label = r.orderDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      ts = new Date(`${key}-01`).getTime();
    }

    const cur = map.get(key) || { date: label, sales: 0, profit: 0, timestamp: ts };
    cur.sales += r.sales || 0;
    cur.profit += r.profit || 0;
    map.set(key, cur);
  }

  return Array.from(map.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ date, sales, profit }) => ({ date, sales, profit }));
}

export function groupBy(rows: RetailRow[], key: keyof RetailRow) {
  const map = new Map<string, { name: string; sales: number; profit: number; quantity: number }>();
  for (const r of rows) {
    const k = cleanLabel(r[key]);
    const cur = map.get(k) || { name: k, sales: 0, profit: 0, quantity: 0 };
    cur.sales += r.sales || 0;
    cur.profit += r.profit || 0;
    cur.quantity += r.quantity || 0;
    map.set(k, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.sales - a.sales);
}

export function discountBuckets(rows: RetailRow[]) {
  const buckets = new Map<string, { discount: string; profit: number; sales: number; count: number }>();
  for (const r of rows) {
    const d = r.discount || 0;
    const b = d === 0 ? "0%" : `${Math.floor(d * 10) * 10}-${Math.floor(d * 10) * 10 + 10}%`;
    const cur = buckets.get(b) || { discount: b, profit: 0, sales: 0, count: 0 };
    cur.profit += r.profit || 0;
    cur.sales += r.sales || 0;
    cur.count += 1;
    buckets.set(b, cur);
  }
  const order = ["0%", "0-10%", "10-20%", "20-30%", "30-40%", "40-50%", "50-60%", "60-70%", "70-80%", "80-90%", "90-100%"];
  return Array.from(buckets.values())
    .map((b) => ({
      ...b,
      avgProfit: b.count ? b.profit / b.count : 0,
      avgSales: b.count ? b.sales / b.count : 0,
    }))
    .sort((a, b) => order.indexOf(a.discount) - order.indexOf(b.discount));
}

export function scatterDiscountVs(rows: RetailRow[], field: "profit" | "sales") {
  if (!rows.length) return [];
  const step = Math.max(1, Math.floor(rows.length / 600));
  const pts: { discount: number; value: number }[] = [];
  for (let i = 0; i < rows.length; i += step) {
    pts.push({ discount: rows[i].discount || 0, value: rows[i][field] || 0 });
  }
  return pts;
}

/**
 * Top Headline: Fact + Observation.
 * e.g. "You made ₹500 in profit from ₹5,000 in sales. Your highest-discount order resulted in a ₹100 loss."
 */
export function generateExecutiveSummaryHeadline(
  rows: RetailRow[],
  kpis: KPIs,
  mode: NumberFormatMode = "compact"
): string {
  if (!rows.length) return "No sales records currently match your selection.";

  const factPart = `You made ${fmtCurrency(kpis.totalProfit, mode)} in net profit from ${fmtCurrency(kpis.totalSales, mode)} in sales (${fmtPercent(kpis.profitMargin)} margin).`;

  // Look for high-discount loss observation
  const lossOrders = rows.filter((r) => (r.discount || 0) >= 0.25 && (r.profit || 0) < 0);
  if (lossOrders.length > 0) {
    const worst = lossOrders.reduce((prev, curr) => ((curr.profit || 0) < (prev.profit || 0) ? curr : prev), lossOrders[0]);
    const discPct = (worst.discount * 100).toFixed(0);
    const lossAmt = fmtCurrency(Math.abs(worst.profit || 0), mode);
    return `${factPart} Your highest-discount order (${discPct}%) resulted in a ${lossAmt} loss.`;
  }

  // Look for category contrast observation if distinct
  const byCat = groupBy(rows, "category");
  if (byCat.length > 1) {
    const topSales = byCat.reduce((a, b) => (b.sales > a.sales ? b : a), byCat[0]);
    const topProfit = byCat.reduce((a, b) => (b.profit > a.profit ? b : a), byCat[0]);
    if (topSales.name !== topProfit.name && topProfit.profit > 0) {
      return `${factPart} ${topSales.name} generated the most sales, while ${topProfit.name} generated the most profit.`;
    }
  }

  return factPart;
}

/**
 * Section 2: "What's going well?" (1–3 precise positive observations)
 * Explicitly separates Highest Sales from Highest Profit and Highest Margin.
 */
export function generatePositiveFindings(
  rows: RetailRow[],
  kpis: KPIs,
  mode: NumberFormatMode = "compact"
): string[] {
  if (!rows.length) return [];
  const findings: string[] = [];

  const byCat = groupBy(rows, "category");
  if (byCat.length > 0 && kpis.totalSales > 0) {
    const topSales = byCat.reduce((a, b) => (b.sales > a.sales ? b : a), byCat[0]);
    const topProfit = byCat.reduce((a, b) => (b.profit > a.profit ? b : a), byCat[0]);

    if (topSales.name === topProfit.name) {
      findings.push(
        `⭐ ${topSales.name} led both sales (${fmtCurrency(topSales.sales, mode)}) and profit (${fmtCurrency(topProfit.profit, mode)}).`
      );
    } else {
      findings.push(
        `⭐ ${topProfit.name} generated the highest profit — ${fmtCurrency(topProfit.profit, mode)}.`
      );
      findings.push(
        `⭐ ${topSales.name} generated the highest sales — ${fmtCurrency(topSales.sales, mode)}.`
      );
    }
  }

  // Highest margin region
  const byReg = groupBy(rows, "region");
  if (byReg.length > 1) {
    let bestReg = byReg[0];
    let bestMargin = -Infinity;
    for (const r of byReg) {
      const margin = r.sales > 0 ? r.profit / r.sales : -1;
      if (margin > bestMargin) {
        bestMargin = margin;
        bestReg = r;
      }
    }
    if (bestMargin > 0.1) {
      findings.push(
        `⭐ ${bestReg.name} region had the highest profit margin at ${fmtPercent(bestMargin)} on ${fmtCurrency(bestReg.sales, mode)} in sales.`
      );
    }
  }

  // Full price baseline
  if (findings.length < 3) {
    const zeroDisc = rows.filter((r) => (r.discount || 0) === 0);
    if (zeroDisc.length > 0) {
      const zdProfit = zeroDisc.reduce((a, b) => a + (b.profit || 0), 0);
      const zdSales = zeroDisc.reduce((a, b) => a + (b.sales || 0), 0);
      const zdMargin = zdSales > 0 ? zdProfit / zdSales : 0;
      if (zdMargin > 0) {
        findings.push(
          `⭐ Orders sold at full price maintained a solid ${fmtPercent(zdMargin)} average profit margin.`
        );
      }
    }
  }

  return findings.slice(0, 3);
}

/**
 * Section 3: "What needs attention?" (1–3 precise problem observations)
 * Non-causal, grounded in exact data rows.
 */
export function generateAttentionFindings(
  rows: RetailRow[],
  kpis: KPIs,
  mode: NumberFormatMode = "compact"
): string[] {
  if (!rows.length) return [];
  const findings: string[] = [];

  // High discount losses
  const lossOrders = rows.filter((r) => (r.discount || 0) >= 0.25 && (r.profit || 0) < 0);
  if (lossOrders.length === 1) {
    const o = lossOrders[0];
    const discPct = (o.discount * 100).toFixed(0);
    const lossAmt = fmtCurrency(Math.abs(o.profit || 0), mode);
    findings.push(`⚠️ The ${discPct}% discount order resulted in a ${lossAmt} loss.`);
  } else if (lossOrders.length > 1) {
    const totalLoss = lossOrders.reduce((a, b) => a + Math.abs(b.profit || 0), 0);
    const worst = lossOrders.reduce((prev, curr) => ((curr.profit || 0) < (prev.profit || 0) ? curr : prev), lossOrders[0]);
    const worstDisc = (worst.discount * 100).toFixed(0);
    const worstLoss = fmtCurrency(Math.abs(worst.profit || 0), mode);
    findings.push(
      `⚠️ ${lossOrders.length} orders with 25%+ discount resulted in ${fmtCurrency(totalLoss, mode)} in combined losses (e.g. ${worstDisc}% discount order lost ${worstLoss}).`
    );
  }

  // Category with high sales but weak / zero profit
  const byCat = groupBy(rows, "category");
  for (const cat of byCat) {
    const margin = cat.sales > 0 ? cat.profit / cat.sales : 0;
    if (cat.sales >= 500 && margin <= 0.05) {
      findings.push(
        `⚠️ ${cat.name} generated ${fmtCurrency(cat.sales, mode)} in sales but only ${fmtCurrency(cat.profit, mode)} profit (${fmtPercent(margin)} margin).`
      );
      break;
    }
  }

  // Higher discount overall correlation observation
  const highDisc = rows.filter((r) => (r.discount || 0) >= 0.2);
  const lowDisc = rows.filter((r) => (r.discount || 0) < 0.1);
  if (highDisc.length > 0 && lowDisc.length > 0 && findings.length < 3) {
    const highAvgP = highDisc.reduce((a, b) => a + (b.profit || 0), 0) / highDisc.length;
    const lowAvgP = lowDisc.reduce((a, b) => a + (b.profit || 0), 0) / lowDisc.length;
    if (highAvgP < lowAvgP) {
      findings.push(
        `⚠️ Orders with higher discounts averaged lower profit (${fmtCurrency(highAvgP, mode)}) than low-discount orders (${fmtCurrency(lowAvgP, mode)}).`
      );
    }
  }

  return findings.slice(0, 3);
}

export interface BusinessRecommendation {
  headline: string;
  why: string;
  categoryAdvice?: string;
  currentAvgDiscount: string;
  observation?: string;
  confidence: string;
  confidenceTier: "low" | "moderate" | "high";
  modelEstimate?: {
    range: string;
    predictedProfit: string;
  };
}

/**
 * Section 4: "What should you do?" (Separates Practical Advice, Why Evidence, and Model Estimates)
 */
export function generateBusinessRecommendation(
  rows: RetailRow[],
  kpis: KPIs,
  mode: NumberFormatMode = "compact",
  models: TrainedModels | null = null
): BusinessRecommendation {
  const avgDisc = rows.length ? rows.reduce((a, b) => a + (b.discount || 0), 0) / rows.length : 0;
  const avgDiscText = fmtPercent(avgDisc);

  // Confidence Tier & Labeling based on sample size
  let confidence = "High";
  let confidenceTier: "low" | "moderate" | "high" = "high";

  if (rows.length <= 10) {
    confidence = `Low — based on only ${rows.length} orders (directional insight only)`;
    confidenceTier = "low";
  } else if (rows.length <= 50) {
    confidence = `Low — based on ${rows.length} orders`;
    confidenceTier = "low";
  } else if (rows.length <= 500) {
    confidence = `Moderate — based on ${rows.length.toLocaleString("en-IN")} orders`;
    confidenceTier = "moderate";
  } else {
    confidence = `More reliable historical pattern (${rows.length.toLocaleString("en-IN")} orders)`;
    confidenceTier = "high";
  }

  // Core practical advice
  const headline = rows.length <= 10 ? "Consider keeping discounts lower." : "Keep most promotional discounts in the 0–10% range.";

  // Transparent "Why?" explanation
  const lossOrders = rows.filter((r) => (r.discount || 0) >= 0.25 && (r.profit || 0) < 0);
  let why = "Your lower-discount orders were historically profitable, while higher discounts tended to erode net margins.";
  if (lossOrders.length > 0) {
    const worst = lossOrders.reduce((prev, curr) => ((curr.profit || 0) < (prev.profit || 0) ? curr : prev), lossOrders[0]);
    const discPct = (worst.discount * 100).toFixed(0);
    const lossAmt = fmtCurrency(Math.abs(worst.profit || 0), mode);
    why = `Your lower-discount orders remained profitable, while the ${discPct}% discount order resulted in a ${lossAmt} loss.`;
  }

  // Category advice if applicable
  let categoryAdvice: string | undefined = undefined;
  const byCat = groupBy(rows, "category");
  if (byCat.length > 0) {
    const lowMarginCat = byCat.find((c) => c.sales >= 500 && c.profit / c.sales < 0.08);
    if (lowMarginCat) {
      categoryAdvice = `Consider reviewing discount depths for ${lowMarginCat.name} before running further promotions.`;
    }
  }

  // Model estimate from ML (only if rows > 10 and models available)
  let modelEstimate: { range: string; predictedProfit: string } | undefined = undefined;
  if (models && rows.length > 10) {
    const opt = optimizeDiscount(models, rows);
    const low = (opt.recommendedRange[0] * 100).toFixed(0);
    const high = (opt.recommendedRange[1] * 100).toFixed(0);
    modelEstimate = {
      range: `${low}% – ${high}%`,
      predictedProfit: fmtCurrency(opt.best.predictedProfit, mode),
    };
  }

  return {
    headline,
    why,
    categoryAdvice,
    currentAvgDiscount: avgDiscText,
    confidence,
    confidenceTier,
    modelEstimate,
  };
}

/**
 * Backward compatibility for legacy insight calls
 */
export function generateInsights(
  rows: RetailRow[],
  kpis: KPIs,
  mode: NumberFormatMode = "compact"
): Insight[] {
  const positives = generatePositiveFindings(rows, kpis, mode);
  const attentions = generateAttentionFindings(rows, kpis, mode);
  const combined: Insight[] = [];

  for (let i = 0; i < positives.length; i++) {
    combined.push({
      id: `pos-${i}`,
      title: positives[i],
      description: positives[i],
      type: "positive",
    });
  }
  for (let i = 0; i < attentions.length; i++) {
    combined.push({
      id: `att-${i}`,
      title: attentions[i],
      description: attentions[i],
      type: "warning",
    });
  }

  return combined.slice(0, 3);
}
