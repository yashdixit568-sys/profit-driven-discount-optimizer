import { useState } from "react";
import { Filters, RetailRow, DatePreset } from "@/lib/types";
import { unique } from "@/lib/analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Filter, SlidersHorizontal, X } from "lucide-react";

interface Props {
  rows: RetailRow[];
  filters: Filters;
  filteredCount: number;
  onChange: (f: Filters) => void;
}

export function FilterBar({ rows, filters, filteredCount, onChange }: Props) {
  const [showMore, setShowMore] = useState(false);

  const cats = unique(rows, "category");
  const subs = unique(rows, "subCategory");
  const regs = unique(rows, "region");
  const segs = unique(rows, "segment");
  const ships = unique(rows, "shipMode");

  const reset = () =>
    onChange({
      category: "all",
      subCategory: "all",
      region: "all",
      segment: "all",
      shipMode: "all",
      datePreset: "all",
      dateRange: [null, null],
    });

  const activeFiltersCount =
    (filters.category !== "all" ? 1 : 0) +
    (filters.subCategory !== "all" ? 1 : 0) +
    (filters.region !== "all" ? 1 : 0) +
    (filters.segment !== "all" ? 1 : 0) +
    (filters.shipMode !== "all" ? 1 : 0) +
    (filters.datePreset !== "all" ? 1 : 0);

  const datePresets: { value: DatePreset; label: string }[] = [
    { value: "all", label: "All time" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "3m", label: "Last 3 months" },
    { value: "6m", label: "Last 6 months" },
    { value: "12m", label: "Last 12 months" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Filters & Scope</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMore(!showMore)}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showMore ? "Fewer filters" : "More filters"}
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={reset} className="h-8 gap-1 text-xs">
              <RotateCcw className="h-3 w-3" /> Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Primary Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Time Range</label>
          <Select
            value={filters.datePreset}
            onValueChange={(v) => onChange({ ...filters, datePreset: v as DatePreset })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {datePresets.map((dp) => (
                <SelectItem key={dp.value} value={dp.value}>
                  {dp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {cats.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
            <Select value={filters.category} onValueChange={(v) => onChange({ ...filters, category: v })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {cats.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {regs.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Region</label>
            <Select value={filters.region} onValueChange={(v) => onChange({ ...filters, region: v })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regs.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Secondary Filters (Expandable) */}
      {showMore && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border/50 pt-3">
          {subs.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Sub-Category</label>
              <Select value={filters.subCategory} onValueChange={(v) => onChange({ ...filters, subCategory: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-Categories</SelectItem>
                  {subs.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {segs.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Customer Segment</label>
              <Select value={filters.segment} onValueChange={(v) => onChange({ ...filters, segment: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  {segs.map((sg) => (
                    <SelectItem key={sg} value={sg}>
                      {sg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {ships.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Shipping Mode</label>
              <Select value={filters.shipMode} onValueChange={(v) => onChange({ ...filters, shipMode: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ship Modes</SelectItem>
                  {ships.map((sm) => (
                    <SelectItem key={sm} value={sm}>
                      {sm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-2 text-xs">
          <span className="text-muted-foreground">Showing {filteredCount.toLocaleString()} matching rows:</span>
          {filters.datePreset !== "all" && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5">
              Time: {datePresets.find((dp) => dp.value === filters.datePreset)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onChange({ ...filters, datePreset: "all" })} />
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5">
              Category: {filters.category}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onChange({ ...filters, category: "all" })} />
            </Badge>
          )}
          {filters.region !== "all" && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5">
              Region: {filters.region}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onChange({ ...filters, region: "all" })} />
            </Badge>
          )}
          {filters.subCategory !== "all" && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5">
              Sub-Category: {filters.subCategory}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onChange({ ...filters, subCategory: "all" })} />
            </Badge>
          )}
          {filters.segment !== "all" && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5">
              Segment: {filters.segment}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onChange({ ...filters, segment: "all" })} />
            </Badge>
          )}
          {filters.shipMode !== "all" && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5">
              Ship Mode: {filters.shipMode}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onChange({ ...filters, shipMode: "all" })} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
