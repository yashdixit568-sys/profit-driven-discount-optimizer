export interface RetailRow {
  orderDate: Date | null;
  shipDate: Date | null;
  customerId?: string;
  customerName?: string;
  segment?: string;
  country?: string;
  city?: string;
  state?: string;
  region?: string;
  category?: string;
  subCategory?: string;
  productName?: string;
  shipMode?: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
  // engineered
  shippingDelay?: number;
  month?: number;
  year?: number;
  weekday?: number;
}

export interface DatasetMeta {
  rowCount: number;
  originalRowCount: number;
  duplicatesRemoved: number;
  missingFilled: number;
  excludedInvalidRows: number;
  columnsDetected: string[];
  columnsMissing: string[];
  defaultedFields: string[];
  warnings: string[];
  dateFormatAmbiguity?: string;
}

export type DatePreset = "all" | "7d" | "30d" | "3m" | "6m" | "12m" | "custom";

export interface Filters {
  category: string;
  subCategory: string;
  region: string;
  segment: string;
  shipMode: string;
  datePreset: DatePreset;
  dateRange: [Date | null, Date | null];
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: "positive" | "warning" | "neutral" | "insight";
  metric?: string;
}

export interface ModelMetrics {
  name: string;
  rmse: number;
  mae: number;
  r2: number;
}

export interface OptimizerPoint {
  discount: number;
  predictedProfit: number;
  predictedSales: number;
}
