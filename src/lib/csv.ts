import Papa from "papaparse";
import { RetailRow, DatasetMeta } from "./types";

const ALIASES: Record<string, string[]> = {
  orderDate: ["order date", "orderdate", "order_date", "date", "transaction date", "invoice date"],
  shipDate: ["ship date", "shipdate", "ship_date", "delivery date", "dispatch date"],
  customerId: ["customer id", "customerid", "customer_id", "client id", "buyer id"],
  customerName: ["customer name", "customername", "customer_name", "customer", "client name", "buyer name"],
  segment: ["segment", "customer segment"],
  country: ["country", "nation"],
  city: ["city", "town"],
  state: ["state", "province"],
  region: ["region", "zone", "territory"],
  category: ["category", "department"],
  subCategory: ["sub-category", "subcategory", "sub category", "sub_category", "sub department"],
  productName: ["product name", "productname", "product_name", "product", "item name", "sku name"],
  shipMode: ["ship mode", "shipmode", "ship_mode", "shipping mode", "delivery mode"],
  sales: ["sales", "revenue", "amount", "net sales", "gross sales", "total sales", "order amount"],
  quantity: ["quantity", "qty", "units", "unit", "units sold", "count"],
  discount: ["discount", "disc", "discount %", "discount pct", "markdown", "rebate"],
  profit: ["profit", "margin", "gross profit", "net profit", "earnings", "income"],
};

const HARD_REQUIRED = ["sales", "profit"];
const OPTIONAL_WITH_DEFAULTS = ["quantity", "discount"];

function normalizeKey(k: string) {
  return k.trim().toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ");
}

function looseKey(k: string) {
  return normalizeKey(k).replace(/[^a-z0-9]/g, "");
}

function heuristicMatch(canon: string, headerNorm: string) {
  if (canon === "sales") return /sale|revenue|amount|turnover/.test(headerNorm);
  if (canon === "profit") return /profit|margin|earning|income/.test(headerNorm);
  if (canon === "discount") return /discount|markdown|rebate|disc/.test(headerNorm);
  if (canon === "quantity") return /quantity|qty|unit|count/.test(headerNorm);
  return false;
}

function buildHeaderMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const lowered = headers.map((h) => ({ raw: h, norm: normalizeKey(h), loose: looseKey(h) }));

  for (const [canon, aliases] of Object.entries(ALIASES)) {
    const aliasNorms = aliases.map(normalizeKey);
    const aliasLoose = aliases.map(looseKey);

    const exact = lowered.find((h) => aliasNorms.includes(h.norm));
    if (exact) {
      map[canon] = exact.raw;
      continue;
    }

    const loose = lowered.find((h) => aliasLoose.includes(h.loose));
    if (loose) {
      map[canon] = loose.raw;
      continue;
    }

    const heuristic = lowered.find((h) => heuristicMatch(canon, h.norm));
    if (heuristic) map[canon] = heuristic.raw;
  }

  return map;
}

function parseDate(v: unknown): Date | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = String(v).trim();

  const excelSerial = Number(s);
  if (!Number.isNaN(excelSerial) && excelSerial > 20000 && excelSerial < 80000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + excelSerial * 86400000);
  }

  let d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let [, a, b, y] = m;
    let yy = parseInt(y, 10);
    if (yy < 100) yy += 2000;
    const dayFirst = new Date(yy, parseInt(b, 10) - 1, parseInt(a, 10));
    if (!isNaN(dayFirst.getTime()) && parseInt(a, 10) <= 31) return dayFirst;
    const monthFirst = new Date(yy, parseInt(a, 10) - 1, parseInt(b, 10));
    if (!isNaN(monthFirst.getTime())) return monthFirst;
  }

  return null;
}

function parseNum(v: unknown): number {
  if (v == null || v === "") return NaN;
  if (typeof v === "number") return v;
  let s = String(v).trim();
  s = s.replace(/[$₹€£\s]/g, "");
  if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(s)) s = s.replace(/\./g, "").replace(/,/g, ".");
  else if (/^-?\d+,\d+$/.test(s)) s = s.replace(/,/g, ".");
  else s = s.replace(/,/g, "");
  s = s.replace(/%$/, "");
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}

export interface ParseResult {
  rows: RetailRow[];
  meta: DatasetMeta;
}

export function parseCsv(text: string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (res) => {
        try {
          const headers = res.meta.fields || [];
          const headerMap = buildHeaderMap(headers);
          const warnings: string[] = [];
          const defaultedFields: string[] = [];

          const missingHard = HARD_REQUIRED.filter((r) => !headerMap[r]);
          if (missingHard.length) {
            return reject(
              new Error(
                `Missing essential columns: ${missingHard.join(", ")}. The app needs at least Sales and Profit columns to analyze data.`
              )
            );
          }

          const missingOptional = OPTIONAL_WITH_DEFAULTS.filter((r) => !headerMap[r]);
          if (missingOptional.includes("quantity")) {
            warnings.push("No Quantity column found — defaulting quantity to 1.");
          }
          if (missingOptional.includes("discount")) {
            warnings.push("No Discount column found — defaulting discount to 0%.");
          }

          const original = res.data.length;
          const seen = new Set<string>();
          let dupes = 0;
          let filled = 0;
          let excludedInvalid = 0;
          let defaultedQtyCount = 0;
          let defaultedDiscCount = 0;
          const rows: RetailRow[] = [];

          const mappedRawHeaders = new Set(Object.values(headerMap));
          const extraHeaders = headers.filter((h) => !mappedRawHeaders.has(h));
          const extraIsNumeric: Record<string, boolean> = {};
          for (const h of extraHeaders) {
            let num = 0;
            let seenN = 0;
            for (let i = 0; i < res.data.length && seenN < 100; i++) {
              const v = res.data[i][h];
              if (v == null || v === "") continue;
              seenN++;
              const n = parseNum(v);
              if (!isNaN(n)) num++;
            }
            extraIsNumeric[h] = seenN > 0 && num / seenN >= 0.8;
          }

          for (const r of res.data) {
            const key = JSON.stringify(r);
            if (seen.has(key)) {
              dupes++;
              continue;
            }
            seen.add(key);

            const get = (canon: string) => (headerMap[canon] ? r[headerMap[canon]] : undefined);

            const sales = parseNum(get("sales"));
            const rawQuantity = parseNum(get("quantity"));
            let discount = parseNum(get("discount"));
            const profit = parseNum(get("profit"));

            if (isNaN(sales) || isNaN(profit)) {
              excludedInvalid++;
              continue;
            }

            let quantity = rawQuantity;
            if (isNaN(quantity) || quantity <= 0) {
              quantity = 1;
              defaultedQtyCount++;
              filled++;
            }

            if (!isNaN(discount) && discount > 1) discount = discount / 100;
            if (isNaN(discount) || discount < 0) {
              discount = 0;
              defaultedDiscCount++;
              filled++;
            }

            const orderDate = parseDate(get("orderDate"));
            const shipDate = parseDate(get("shipDate"));
            let shippingDelay: number | undefined = undefined;
            if (orderDate && shipDate) {
              shippingDelay = Math.max(0, Math.round((shipDate.getTime() - orderDate.getTime()) / 86400000));
            }

            const row: RetailRow = {
              orderDate,
              shipDate,
              customerId: get("customerId") ? String(get("customerId")) : undefined,
              customerName: get("customerName") ? String(get("customerName")) : undefined,
              segment: get("segment") ? String(get("segment")) : undefined,
              country: get("country") ? String(get("country")) : undefined,
              city: get("city") ? String(get("city")) : undefined,
              state: get("state") ? String(get("state")) : undefined,
              region: get("region") ? String(get("region")) : undefined,
              category: get("category") ? String(get("category")) : undefined,
              subCategory: get("subCategory") ? String(get("subCategory")) : undefined,
              productName: get("productName") ? String(get("productName")) : undefined,
              shipMode: get("shipMode") ? String(get("shipMode")) : undefined,
              sales,
              quantity,
              discount,
              profit,
              shippingDelay,
              month: orderDate ? orderDate.getMonth() + 1 : undefined,
              year: orderDate ? orderDate.getFullYear() : undefined,
              weekday: orderDate ? orderDate.getDay() : undefined,
            };

            for (const h of extraHeaders) {
              const raw = r[h];
              if (raw == null || raw === "") continue;
              const extraKey = normalizeKey(h).replace(/\s+/g, "_");
              if (extraIsNumeric[h]) {
                const n = parseNum(raw);
                if (!isNaN(n)) (row as any)[extraKey] = n;
              } else {
                (row as any)[extraKey] = String(raw);
              }
            }

            rows.push(row);
          }

          if (rows.length === 0) {
            return reject(new Error("No valid rows could be parsed from the CSV after numeric validation."));
          }

          if (defaultedQtyCount > 0) {
            defaultedFields.push(`${defaultedQtyCount} rows had missing/invalid Quantity (defaulted to 1).`);
          }
          if (defaultedDiscCount > 0) {
            defaultedFields.push(`${defaultedDiscCount} rows had missing/invalid Discount (defaulted to 0%).`);
          }
          if (excludedInvalid > 0) {
            warnings.push(`${excludedInvalid} rows excluded due to invalid/missing Sales or Profit numbers.`);
          }
          if (!headerMap.orderDate) warnings.push("No Order Date column found — date-based filtering will be disabled.");
          if (!headerMap.category) warnings.push("No Category column found — category breakdowns will be simplified.");

          resolve({
            rows,
            meta: {
              rowCount: rows.length,
              originalRowCount: original,
              duplicatesRemoved: dupes,
              missingFilled: filled,
              excludedInvalidRows: excludedInvalid,
              columnsDetected: headers,
              columnsMissing: [...missingHard, ...missingOptional],
              defaultedFields,
              warnings,
            },
          });
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function rowsForExport(rows: RetailRow[]): Record<string, unknown>[] {
  return rows.map((r) => ({
    "Order Date": r.orderDate ? r.orderDate.toISOString().slice(0, 10) : "",
    "Ship Date": r.shipDate ? r.shipDate.toISOString().slice(0, 10) : "",
    "Customer ID": r.customerId ?? "",
    "Customer Name": r.customerName ?? "",
    Segment: r.segment ?? "",
    Country: r.country ?? "",
    City: r.city ?? "",
    State: r.state ?? "",
    Region: r.region ?? "",
    Category: r.category ?? "",
    "Sub-Category": r.subCategory ?? "",
    "Product Name": r.productName ?? "",
    "Ship Mode": r.shipMode ?? "",
    Sales: r.sales,
    Quantity: r.quantity,
    Discount: r.discount,
    Profit: r.profit,
    "Shipping Delay (days)": r.shippingDelay ?? "",
  }));
}

export function generateCsvTemplate(): string {
  const sampleHeaders = [
    "Order Date",
    "Ship Date",
    "Customer ID",
    "Customer Name",
    "Segment",
    "Region",
    "Category",
    "Sub-Category",
    "Product Name",
    "Sales",
    "Quantity",
    "Discount",
    "Profit",
  ];
  const sampleRow = [
    "2026-01-15",
    "2026-01-18",
    "CUST-101",
    "Acme Corp",
    "Corporate",
    "West",
    "Technology",
    "Phones",
    "Smartphone Pro",
    "799.99",
    "2",
    "0.10",
    "159.99",
  ];
  return `${sampleHeaders.join(",")}\n${sampleRow.join(",")}`;
}
