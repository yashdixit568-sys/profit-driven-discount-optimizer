import { describe, it, expect } from "vitest";
import { trainAll, optimizeDiscount } from "../lib/ml";
import { parseCsv } from "../lib/csv";
import { DEMO_CSV_DATA } from "../lib/demoData";

describe("ML Module", () => {
  it("trains models without data leakage and computes metrics", async () => {
    const { rows } = await parseCsv(DEMO_CSV_DATA);
    expect(rows.length).toBeGreaterThan(15);

    const models = trainAll(rows, "profit");
    expect(models.metrics.length).toBe(3);
    expect(models.trainIdx.length).toBeGreaterThan(0);
    expect(models.testIdx.length).toBeGreaterThan(0);

    // Verify dataset customerStats were built exclusively from trainIdx
    const customerStatsCount = Array.from(models.dataset.customerStats.values()).reduce(
      (acc, curr) => acc + curr.count,
      0
    );
    expect(customerStatsCount).toBe(models.trainIdx.length);

    // Verify optimizer
    const opt = optimizeDiscount(models, rows);
    expect(opt.recommendedRange[0]).toBeGreaterThanOrEqual(0);
    expect(opt.recommendedRange[1]).toBeGreaterThan(opt.recommendedRange[0]);
    expect(opt.points.length).toBe(34);
  });

  it("throws clear error for tiny datasets under 5 rows", () => {
    const tinyRows = [
      { sales: 100, profit: 20, discount: 0, quantity: 1, orderDate: null, shipDate: null },
      { sales: 200, profit: 40, discount: 0.1, quantity: 2, orderDate: null, shipDate: null },
    ];
    expect(() => trainAll(tinyRows as any)).toThrowError(/At least 5 usable data rows/);
  });
});
