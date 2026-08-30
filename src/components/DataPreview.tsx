import { RetailRow } from "@/lib/types";
import { useMemo, useState } from "react";

interface Props {
  rows: RetailRow[];
}

export function DataPreview({ rows }: Props) {
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const totalPages = Math.ceil(rows.length / pageSize);
  const slice = useMemo(() => rows.slice(page * pageSize, (page + 1) * pageSize), [rows, page]);

  const cols: { key: keyof RetailRow; label: string; fmt?: (v: unknown) => string }[] = [
    { key: "orderDate", label: "Order Date", fmt: (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : "—") },
    { key: "customerName", label: "Customer" },
    { key: "segment", label: "Segment" },
    { key: "region", label: "Region" },
    { key: "category", label: "Category" },
    { key: "subCategory", label: "Sub-Cat" },
    { key: "sales", label: "Sales", fmt: (v) => `$${Number(v).toFixed(2)}` },
    { key: "quantity", label: "Qty" },
    { key: "discount", label: "Disc", fmt: (v) => `${(Number(v) * 100).toFixed(0)}%` },
    { key: "profit", label: "Profit", fmt: (v) => `$${Number(v).toFixed(2)}` },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <h3 className="font-display text-base font-semibold">Dataset Preview</h3>
          <p className="text-xs text-muted-foreground">First rows of your cleaned data</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded border border-border px-2 py-1 disabled:opacity-30"
          >
            Prev
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="rounded border border-border px-2 py-1 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {cols.map((c) => (
                <th key={String(c.key)} className="px-4 py-2.5 text-left font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted/30">
                {cols.map((c) => {
                  const v = r[c.key];
                  return (
                    <td key={String(c.key)} className="px-4 py-2.5 text-foreground">
                      {v == null || v === "" ? <span className="text-muted-foreground">—</span> : c.fmt ? c.fmt(v) : String(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
