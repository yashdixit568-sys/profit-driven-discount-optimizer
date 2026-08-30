import { useState, useMemo } from "react";
import { RetailRow } from "@/lib/types";
import { downloadCsv, rowsForExport } from "@/lib/csv";
import { fmtCurrency, NumberFormatMode } from "@/lib/analytics";
import { Search, Download, Table, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  rows: RetailRow[];
  totalDatasetRows: number;
  formatMode?: NumberFormatMode;
}

export function DataPreviewTable({ rows, totalDatasetRows, formatMode = "compact" }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const searched = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase().trim();
    return rows.filter(
      (r) =>
        r.customerName?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.subCategory?.toLowerCase().includes(q) ||
        r.region?.toLowerCase().includes(q) ||
        r.segment?.toLowerCase().includes(q) ||
        r.productName?.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(searched.length / pageSize));
  const slice = useMemo(
    () => searched.slice(page * pageSize, (page + 1) * pageSize),
    [searched, page, pageSize]
  );

  const cols: { key: keyof RetailRow; label: string; fmt?: (v: unknown) => string }[] = [
    { key: "orderDate", label: "Date", fmt: (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : "—") },
    { key: "customerName", label: "Customer" },
    { key: "segment", label: "Segment" },
    { key: "region", label: "Region" },
    { key: "category", label: "Category" },
    { key: "subCategory", label: "Sub-Cat" },
    { key: "sales", label: "Sales", fmt: (v) => fmtCurrency(Number(v), formatMode) },
    { key: "quantity", label: "Qty" },
    { key: "discount", label: "Discount", fmt: (v) => `${(Number(v) * 100).toFixed(0)}%` },
    { key: "profit", label: "Profit", fmt: (v) => fmtCurrency(Number(v), formatMode) },
  ];

  const handleExportFiltered = () => {
    downloadCsv("retailiq-filtered-data.csv", rowsForExport(searched));
  };

  return (
    <section className="rounded-xl border border-border bg-card shadow-2xs space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Table className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-base text-foreground">Data Inspector</h3>
            <p className="text-xs text-muted-foreground">
              Showing <strong>{searched.length.toLocaleString("en-IN")}</strong> records (filtered from {totalDatasetRows.toLocaleString("en-IN")} total)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search customer, category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="h-9 pl-8 text-xs"
            />
          </div>

          <Button variant="outline" size="sm" onClick={handleExportFiltered} className="h-9 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export Filtered CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-semibold">
            <tr>
              {cols.map((c) => (
                <th key={String(c.key)} className="px-3.5 py-2.5 text-left font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slice.length > 0 ? (
              slice.map((r, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  {cols.map((c) => {
                    const v = r[c.key];
                    return (
                      <td key={String(c.key)} className="px-3.5 py-2 text-foreground font-medium">
                        {v == null || v === "" ? <span className="text-muted-foreground/60">—</span> : c.fmt ? c.fmt(v) : String(v)}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={cols.length} className="px-4 py-8 text-center text-muted-foreground">
                  No records matching search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>
          Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
