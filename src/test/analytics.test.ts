import { describe, it, expect } from "vitest";
import {
  computeKPIs,
  applyFilters,
  generatePositiveFindings,
  generateAttentionFindings,
  generateBusinessRecommendation,
  generateExecutiveSummaryHeadline,
  timeSeries,
  fmtCurrency,
  fmtPercent,
} from "../lib/analytics";
import { RetailRow, Filters } from "../lib/types";

// The exact 5-row reference dataset from the prompt
const fiveRowDataset: RetailRow[] = [
  {
    orderDate: new Date("2026-01-01"),
    shipDate: new Date("2026-01-03"),
    customerId: "C1",
    category: "Technology",
    subCategory: "Phones",
    region: "West",
    segment: "Consumer",
    sales: 1000,
    profit: 200,
    quantity: 2,
    discount: 0.0, // 0%
    shippingDelay: 2,
  },
  {
    orderDate: new Date("2026-01-02"),
    shipDate: new Date("2026-01-05"),
    customerId: "C2",
    category: "Furniture",
    subCategory: "Chairs",
    region: "East",
    segment: "Corporate",
    sales: 800,
    profit: 100,
    quantity: 1,
    discount: 0.1, // 10%
    shippingDelay: 3,
  },
  {
    orderDate: new Date("2026-01-03"),
    shipDate: new Date("2026-01-06"),
    customerId: "C3",
    category: "Office Supplies",
    subCategory: "Paper",
    region: "South",
    segment: "Consumer",
    sales: 500,
    profit: 50,
    quantity: 3,
    discount: 0.2, // 20%
    shippingDelay: 3,
  },
  {
    orderDate: new Date("2026-01-04"),
    shipDate: new Date("2026-01-07"),
    customerId: "C4",
    category: "Technology",
    subCategory: "Accessories",
    region: "West",
    segment: "Corporate",
    sales: 1200,
    profit: 250,
    quantity: 2,
    discount: 0.05, // 5%
    shippingDelay: 3,
  },
  {
    orderDate: new Date("2026-01-05"),
    shipDate: new Date("2026-01-10"),
    customerId: "C5",
    category: "Furniture",
    subCategory: "Tables",
    region: "East",
    segment: "Consumer",
    sales: 1500,
    profit: -100,
    quantity: 4,
    discount: 0.3, // 30%
    shippingDelay: 5,
  },
];

describe("Refinement 3 — 5-Row Reference Dataset Precision & Truthfulness", () => {
  it("computes exact factual KPIs on 5-row dataset", () => {
    const kpis = computeKPIs(fiveRowDataset);
    expect(kpis.totalSales).toBe(5000);
    expect(kpis.totalProfit).toBe(500);
    expect(kpis.orders).toBe(5);
    expect(kpis.profitMargin).toBeCloseTo(0.1, 4); // 10%
    expect(kpis.avgDiscount).toBeCloseTo(0.13, 4); // (0 + 0.1 + 0.2 + 0.05 + 0.3)/5 = 0.13 (13%)
    expect(kpis.topSalesCategory).toBe("Furniture"); // Furniture = 2300, Technology = 2200
    expect(kpis.topProfitCategory).toBe("Technology"); // Technology = 450, Furniture = 0
  });

  it("generates positive findings distinguishing highest sales vs highest profit", () => {
    const kpis = computeKPIs(fiveRowDataset);
    const pos = generatePositiveFindings(fiveRowDataset, kpis, "compact");

    // Must identify Technology as highest profit
    expect(pos.some((p) => p.includes("Technology") && p.includes("highest profit"))).toBe(true);

    // Must identify Furniture as highest sales
    expect(pos.some((p) => p.includes("Furniture") && p.includes("highest sales"))).toBe(true);

    // Must NOT claim Furniture is highest profit or strongest overall
    expect(pos.some((p) => p.includes("Furniture") && p.includes("highest profit"))).toBe(false);
  });

  it("generates attention findings with exact 30% discount loss and Furniture profit issue", () => {
    const kpis = computeKPIs(fiveRowDataset);
    const att = generateAttentionFindings(fiveRowDataset, kpis, "compact");

    // 30% discount loss observation
    expect(att.some((a) => a.includes("30% discount") && a.includes("loss"))).toBe(true);

    // Furniture high sales but zero profit observation
    expect(att.some((a) => a.includes("Furniture") && a.includes("₹0 profit"))).toBe(true);
  });

  it("generates low-confidence recommendation for 5-row dataset without over-precise false optimums", () => {
    const kpis = computeKPIs(fiveRowDataset);
    const rec = generateBusinessRecommendation(fiveRowDataset, kpis, "compact", null);

    expect(rec.confidence).toContain("Low — based on only 5 orders");
    expect(rec.confidenceTier).toBe("low");
    expect(rec.headline).toBe("Consider keeping discounts lower.");
    expect(rec.why).toContain("30% discount order resulted in a");
  });

  it("generates combined Fact + Observation dynamic headline", () => {
    const kpis = computeKPIs(fiveRowDataset);
    const headline = generateExecutiveSummaryHeadline(fiveRowDataset, kpis, "compact");

    expect(headline).toContain("You made ₹500 in net profit from ₹5.0k in sales (10.0% margin).");
    expect(headline).toContain("30%");
    expect(headline).toContain("loss");
  });

  it("adapts time series to daily granularity for short date spans", () => {
    const ts = timeSeries(fiveRowDataset, "auto");
    expect(ts.length).toBe(5); // 5 distinct days: 1 Jan to 5 Jan
  });
});
