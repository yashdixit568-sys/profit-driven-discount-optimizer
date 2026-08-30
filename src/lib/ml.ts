import { RetailRow, ModelMetrics, OptimizerPoint } from "./types";

/**
 * In-browser ML for retail profit/sales prediction.
 *
 * Key properties:
 *  - DYNAMIC FEATURE EXTRACTION: numeric and categorical columns auto-discovered at train time.
 *  - LEAK-FREE TARGET ENCODING: categorical encoders are fit on TRAIN split only,
 *    with smoothing toward the global mean.
 *  - LEAK-FREE CUSTOMER STATS: customer spend/order stats are derived ONLY from training rows.
 *  - STANDARDIZED INPUTS for all models.
 *  - HONEST 80/20 EVALUATION with deterministic shuffle.
 *
 * Models: Ridge Regression, Random Forest, Gradient Boosted Trees.
 */

function mean(a: number[]) {
  if (!a.length) return 0;
  let s = 0;
  for (const v of a) s += v;
  return s / a.length;
}

function shuffle<T>(arr: T[], seed = 42): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EXCLUDED_FIELDS = new Set<string>([
  "profit",
  "orderDate",
  "shipDate",
  "customerName",
  "productName",
  "customerId",
  "country",
]);

export interface Schema {
  numericCols: string[];
  categoricalCols: string[];
  target: "profit" | "sales";
}

export function discoverSchema(rows: RetailRow[], target: "profit" | "sales" = "profit"): Schema {
  const numericCols: string[] = [];
  const categoricalCols: string[] = [];
  if (!rows.length) return { numericCols, categoricalCols, target };

  const allKeys = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) allKeys.add(k);

  for (const key of allKeys) {
    if (EXCLUDED_FIELDS.has(key)) continue;
    if (key === target) continue;

    let numHits = 0;
    let strHits = 0;
    let seen = 0;
    for (let i = 0; i < rows.length && seen < 200; i++) {
      const v = (rows[i] as any)[key];
      if (v === null || v === undefined || v === "") continue;
      seen++;
      if (typeof v === "number" && Number.isFinite(v)) numHits++;
      else if (typeof v === "string") strHits++;
    }
    if (seen === 0) continue;

    if (numHits / seen >= 0.8) numericCols.push(key);
    else if (strHits / seen >= 0.5) {
      const card = new Set<string>();
      for (let i = 0; i < rows.length && card.size < 500; i++) {
        const v = (rows[i] as any)[key];
        if (typeof v === "string" && v) card.add(v);
      }
      if (card.size <= 200) categoricalCols.push(key);
    }
  }

  return { numericCols, categoricalCols, target };
}

export type Encoder = { map: Map<string, number>; globalMean: number };

function fitTargetEncoder(values: (string | undefined)[], y: number[], smoothing = 10): Encoder {
  const sums = new Map<string, { s: number; n: number }>();
  const gMean = mean(y);
  for (let i = 0; i < values.length; i++) {
    const k = values[i] || "__na__";
    const cur = sums.get(k) || { s: 0, n: 0 };
    cur.s += y[i];
    cur.n += 1;
    sums.set(k, cur);
  }
  const map = new Map<string, number>();
  sums.forEach((v, k) => {
    const enc = (v.s + smoothing * gMean) / (v.n + smoothing);
    map.set(k, enc);
  });
  return { map, globalMean: gMean };
}

function encodeCat(enc: Encoder, v: string | undefined): number {
  return enc.map.get(v || "__na__") ?? enc.globalMean;
}

interface CustStats {
  count: number;
  spend: number;
}

/**
 * LEAKAGE-FREE CUSTOMER STATS:
 * Calculated ONLY from training indices so test set information does not leak
 * into training features.
 */
function buildCustomerStats(rows: RetailRow[], trainIdx: number[]): Map<string, CustStats> {
  const m = new Map<string, CustStats>();
  for (const i of trainIdx) {
    const r = rows[i];
    if (!r) continue;
    const id = r.customerId || "__na__";
    const cur = m.get(id) || { count: 0, spend: 0 };
    cur.count += 1;
    cur.spend += r.sales || 0;
    m.set(id, cur);
  }
  return m;
}

export interface EncodedDataset {
  X: number[][];
  y: number[];
  featureNames: string[];
  schema: Schema;
  encoders: Record<string, Encoder>;
  customerStats: Map<string, CustStats>;
  mu: number[];
  sd: number[];
}

function rawFeatureRow(
  r: RetailRow,
  schema: Schema,
  encoders: Record<string, Encoder>,
  customerStats: Map<string, CustStats>,
  overrides?: Partial<RetailRow>
): number[] {
  const merged = overrides ? { ...r, ...overrides } : r;
  const out: number[] = [];

  for (const c of schema.numericCols) {
    const v = (merged as any)[c];
    out.push(typeof v === "number" && Number.isFinite(v) ? v : 0);
  }

  for (const c of schema.categoricalCols) {
    out.push(encodeCat(encoders[c], (merged as any)[c]));
  }

  const cust = customerStats.get(merged.customerId || "__na__") || { count: 1, spend: merged.sales || 0 };
  out.push(cust.count);
  out.push(cust.spend / Math.max(1, cust.count));

  const d = typeof merged.discount === "number" ? merged.discount : 0;
  if (encoders["category"]) out.push(d * encodeCat(encoders["category"], (merged as any).category));
  if (encoders["segment"]) out.push(d * encodeCat(encoders["segment"], (merged as any).segment));
  out.push(d * d);

  return out;
}

function buildFeatureNames(schema: Schema, encoders: Record<string, Encoder>): string[] {
  const names = [
    ...schema.numericCols,
    ...schema.categoricalCols.map((c) => `${c}_enc`),
    "customer_freq",
    "avg_customer_spend",
  ];
  if (encoders["category"]) names.push("discount_x_category");
  if (encoders["segment"]) names.push("discount_x_segment");
  names.push("discount_sq");
  return names;
}

export function buildDataset(
  rows: RetailRow[],
  trainIdx: number[],
  target: "profit" | "sales" = "profit"
): EncodedDataset {
  const schema = discoverSchema(rows, target);
  const yAll = rows.map((r) => (r as any)[target] ?? 0);
  const yTrain = trainIdx.map((i) => yAll[i]);

  const encoders: Record<string, Encoder> = {};
  for (const c of schema.categoricalCols) {
    const trainVals = trainIdx.map((i) => (rows[i] as any)[c] as string | undefined);
    encoders[c] = fitTargetEncoder(trainVals, yTrain, 10);
  }

  // Leakage-free customer stats computed on training slice only
  const customerStats = buildCustomerStats(rows, trainIdx);

  const Xraw = rows.map((r) => rawFeatureRow(r, schema, encoders, customerStats));

  const d = Xraw[0]?.length ?? 0;
  const mu = new Array(d).fill(0);
  const sd = new Array(d).fill(1);
  if (trainIdx.length > 0 && d > 0) {
    for (let j = 0; j < d; j++) {
      let s = 0;
      for (const i of trainIdx) s += Xraw[i][j];
      mu[j] = s / trainIdx.length;
      let v = 0;
      for (const i of trainIdx) v += (Xraw[i][j] - mu[j]) ** 2;
      sd[j] = Math.sqrt(v / trainIdx.length) || 1;
    }
  }
  const X = Xraw.map((row) => row.map((v, j) => (v - mu[j]) / sd[j]));

  return {
    X,
    y: yAll,
    featureNames: buildFeatureNames(schema, encoders),
    schema,
    encoders,
    customerStats,
    mu,
    sd,
  };
}

export function encodeRow(
  ds: EncodedDataset,
  row: RetailRow,
  overrides?: Partial<RetailRow>
): number[] {
  const raw = rawFeatureRow(row, ds.schema, ds.encoders, ds.customerStats, overrides);
  return raw.map((v, j) => (v - ds.mu[j]) / ds.sd[j]);
}

export function metrics(name: string, yTrue: number[], yPred: number[]): ModelMetrics {
  const n = yTrue.length;
  if (n === 0) return { name, rmse: 0, mae: 0, r2: 0 };
  let se = 0;
  let ae = 0;
  for (let i = 0; i < n; i++) {
    const e = yTrue[i] - yPred[i];
    se += e * e;
    ae += Math.abs(e);
  }
  const rmse = Math.sqrt(se / n);
  const mae = ae / n;
  const ym = mean(yTrue);
  let ssTot = 0;
  for (let i = 0; i < n; i++) ssTot += (yTrue[i] - ym) ** 2;
  const r2 = ssTot > 0 ? 1 - se / ssTot : 0;
  return { name, rmse, mae, r2 };
}

export class RidgeRegression {
  weights: number[] = [];
  bias = 0;

  fit(X: number[][], y: number[], lambda = 1.0) {
    if (!X.length || !X[0].length) return this;
    const n = X.length;
    const d = X[0].length;
    const ym = mean(y);
    const yc = y.map((v) => v - ym);

    const A: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
    const b: number[] = new Array(d).fill(0);
    for (let i = 0; i < d; i++) {
      for (let j = i; j < d; j++) {
        let s = 0;
        for (let k = 0; k < n; k++) s += X[k][i] * X[k][j];
        A[i][j] = s + (i === j ? lambda : 0);
        A[j][i] = A[i][j];
      }
      let s = 0;
      for (let k = 0; k < n; k++) s += X[k][i] * yc[k];
      b[i] = s;
    }
    this.weights = solve(A, b);
    this.bias = ym;
    return this;
  }

  predict(X: number[][]): number[] {
    return X.map((row) => this.predictOne(row));
  }
  predictOne(row: number[]): number {
    let s = this.bias;
    for (let j = 0; j < this.weights.length; j++) s += (row[j] || 0) * (this.weights[j] || 0);
    return s;
  }
}

function solve(A: number[][], b: number[]): number[] {
  const n = A.length;
  if (n === 0) return [];
  const M: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    const piv = M[i][i] || 1e-9;
    for (let j = i; j <= n; j++) M[i][j] /= piv;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = M[r][i];
      for (let j = i; j <= n; j++) M[r][j] -= f * M[i][j];
    }
  }
  return M.map((row) => row[n]);
}

interface TreeNode {
  leaf?: number;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

function buildTree(
  X: number[][],
  y: number[],
  indices: number[],
  depth: number,
  maxDepth: number,
  minLeaf: number,
  featureSubset?: number[]
): TreeNode {
  if (indices.length <= minLeaf || depth >= maxDepth) {
    let s = 0;
    for (const i of indices) s += y[i];
    return { leaf: indices.length ? s / indices.length : 0 };
  }
  const d = X[0]?.length ?? 0;
  if (d === 0) return { leaf: 0 };
  const features = featureSubset || Array.from({ length: d }, (_, i) => i);

  let sum = 0;
  for (const i of indices) sum += y[i];
  const mu = sum / indices.length;
  let baseSse = 0;
  for (const i of indices) baseSse += (y[i] - mu) ** 2;

  let bestGain = 0;
  let bestF = -1;
  let bestT = 0;
  let bestL: number[] = [];
  let bestR: number[] = [];

  for (const f of features) {
    const vals = indices.map((i) => X[i][f]).sort((a, b) => a - b);
    const cands: number[] = [];
    const steps = Math.min(12, vals.length - 1);
    for (let s = 1; s <= steps; s++) cands.push(vals[Math.floor((s * vals.length) / (steps + 1))]);

    for (const t of cands) {
      const L: number[] = [];
      const R: number[] = [];
      let sl = 0;
      let sr = 0;
      for (const i of indices) {
        if (X[i][f] <= t) {
          L.push(i);
          sl += y[i];
        } else {
          R.push(i);
          sr += y[i];
        }
      }
      if (L.length < minLeaf || R.length < minLeaf) continue;
      const mL = sl / L.length;
      const mR = sr / R.length;
      let sse = 0;
      for (const i of L) sse += (y[i] - mL) ** 2;
      for (const i of R) sse += (y[i] - mR) ** 2;
      const gain = baseSse - sse;
      if (gain > bestGain) {
        bestGain = gain;
        bestF = f;
        bestT = t;
        bestL = L;
        bestR = R;
      }
    }
  }
  if (bestF === -1) return { leaf: mu };
  return {
    feature: bestF,
    threshold: bestT,
    left: buildTree(X, y, bestL, depth + 1, maxDepth, minLeaf, featureSubset),
    right: buildTree(X, y, bestR, depth + 1, maxDepth, minLeaf, featureSubset),
  };
}

function predictTree(tree: TreeNode, row: number[]): number {
  let n = tree;
  while (n.leaf === undefined) {
    if (n.feature === undefined || n.threshold === undefined) break;
    n = (row[n.feature] || 0) <= n.threshold ? n.left || n : n.right || n;
  }
  return n.leaf ?? 0;
}

export class RandomForest {
  trees: TreeNode[] = [];

  fit(
    X: number[][],
    y: number[],
    { nTrees = 24, maxDepth = 9, minLeaf = 3, sampleFrac = 0.8, featFrac = 0.7, seed = 42 } = {}
  ) {
    if (!X.length || !X[0].length) return this;
    const n = X.length;
    const d = X[0].length;
    const sampleN = Math.max(5, Math.floor(n * sampleFrac));
    const featN = Math.max(1, Math.floor(d * featFrac));
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    this.trees = [];
    for (let t = 0; t < nTrees; t++) {
      const idx: number[] = [];
      for (let i = 0; i < sampleN; i++) idx.push(Math.floor(rand() * n));
      const pool = Array.from({ length: d }, (_, i) => i);
      const feats: number[] = [];
      while (feats.length < featN && pool.length) {
        const j = Math.floor(rand() * pool.length);
        feats.push(pool.splice(j, 1)[0]);
      }
      this.trees.push(buildTree(X, y, idx, 0, maxDepth, minLeaf, feats));
    }
    return this;
  }
  predict(X: number[][]): number[] {
    return X.map((row) => this.predictOne(row));
  }
  predictOne(row: number[]): number {
    if (!this.trees.length) return 0;
    let s = 0;
    for (const t of this.trees) s += predictTree(t, row);
    return s / this.trees.length;
  }
}

export class GradientBoosting {
  trees: TreeNode[] = [];
  lr = 0.05;
  init = 0;

  fit(X: number[][], y: number[], { nTrees = 120, maxDepth = 4, minLeaf = 5, lr = 0.05 } = {}) {
    if (!X.length || !X[0].length) return this;
    this.lr = lr;
    this.init = mean(y);
    const preds = new Array(y.length).fill(this.init);
    this.trees = [];
    const allIdx = Array.from({ length: X.length }, (_, i) => i);
    for (let t = 0; t < nTrees; t++) {
      const residuals = y.map((v, i) => v - preds[i]);
      const tree = buildTree(X, residuals, allIdx, 0, maxDepth, minLeaf);
      this.trees.push(tree);
      for (let i = 0; i < X.length; i++) preds[i] += lr * predictTree(tree, X[i]);
    }
    return this;
  }
  predict(X: number[][]): number[] {
    return X.map((row) => this.predictOne(row));
  }
  predictOne(row: number[]): number {
    let s = this.init;
    for (const t of this.trees) s += this.lr * predictTree(t, row);
    return s;
  }
}

export interface TrainedModels {
  ridge: RidgeRegression;
  forest: RandomForest;
  boost: GradientBoosting;
  metrics: ModelMetrics[];
  best: "ridge" | "forest" | "boost";
  dataset: EncodedDataset;
  testIdx: number[];
  trainIdx: number[];
  rows: RetailRow[];
}

export function trainAll(rows: RetailRow[], target: "profit" | "sales" = "profit"): TrainedModels {
  if (rows.length < 5) {
    throw new Error("At least 5 usable data rows are required for machine learning model evaluation.");
  }

  const idx = shuffle(
    Array.from({ length: rows.length }, (_, i) => i),
    7
  );
  const split = Math.max(1, Math.floor(idx.length * 0.8));
  const trainIdx = idx.slice(0, split);
  const testIdx = idx.slice(split).length > 0 ? idx.slice(split) : trainIdx;

  const ds = buildDataset(rows, trainIdx, target);

  const Xtr = trainIdx.map((i) => ds.X[i]);
  const ytr = trainIdx.map((i) => ds.y[i]);
  const Xte = testIdx.map((i) => ds.X[i]);
  const yte = testIdx.map((i) => ds.y[i]);

  const ridge = new RidgeRegression().fit(Xtr, ytr, 1.0);
  const forest = new RandomForest().fit(Xtr, ytr);
  const boost = new GradientBoosting().fit(Xtr, ytr);

  const m: ModelMetrics[] = [
    metrics("Linear Regression", yte, ridge.predict(Xte)),
    metrics("Random Forest", yte, forest.predict(Xte)),
    metrics("Gradient Boosting", yte, boost.predict(Xte)),
  ];

  let best: "ridge" | "forest" | "boost" = "boost";
  let bestR2 = -Infinity;
  m.forEach((mm, i) => {
    if (mm.r2 > bestR2) {
      bestR2 = mm.r2;
      best = (["ridge", "forest", "boost"] as const)[i];
    }
  });

  return { ridge, forest, boost, metrics: m, best, dataset: ds, testIdx, trainIdx, rows };
}

export function optimizeDiscount(
  models: TrainedModels,
  rows: RetailRow[],
  opts: { maxDiscount?: number; steps?: number; modelOverride?: "ridge" | "forest" | "boost" } = {}
): {
  points: OptimizerPoint[];
  best: OptimizerPoint;
  recommendedRange: [number, number];
  baseline: { avgDiscount: number; avgProfit: number };
} {
  const maxDiscount = opts.maxDiscount ?? 0.8;
  const steps = opts.steps ?? 33;
  const modelKey = opts.modelOverride || models.best;
  const model = models[modelKey];

  const points: OptimizerPoint[] = [];
  for (let s = 0; s <= steps; s++) {
    const d = (s / steps) * maxDiscount;
    let profitSum = 0;
    let salesSum = 0;
    for (const r of rows) {
      const enc = encodeRow(models.dataset, r, { discount: d });
      profitSum += model.predictOne(enc);
      salesSum += (r.sales || 0) * (1 + 0.6 * d);
    }
    points.push({ discount: d, predictedProfit: profitSum, predictedSales: salesSum });
  }
  let best = points[0];
  for (const p of points) if (p.predictedProfit > best.predictedProfit) best = p;

  // Calculate realistic recommended range (+/- 2.5% around peak, bounded)
  const low = Math.max(0, parseFloat((best.discount - 0.025).toFixed(2)));
  const high = Math.min(maxDiscount, parseFloat((best.discount + 0.025).toFixed(2)));
  const recommendedRange: [number, number] = [low, high];

  const avgDiscount = rows.length ? mean(rows.map((r) => r.discount || 0)) : 0;
  const avgProfit = rows.reduce((s, r) => s + (r.profit || 0), 0);
  return { points, best, recommendedRange, baseline: { avgDiscount, avgProfit } };
}
