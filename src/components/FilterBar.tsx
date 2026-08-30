import { Filters, RetailRow } from "@/lib/types";
import { unique } from "@/lib/analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface Props {
  rows: RetailRow[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function FilterBar({ rows, filters, onChange }: Props) {
  const cats = unique(rows, "category");
  const subs = unique(rows, "subCategory");
  const regs = unique(rows, "region");
  const segs = unique(rows, "segment");
  const ships = unique(rows, "shipMode");

  const reset = () =>
    onChange({ category: "all", subCategory: "all", region: "all", segment: "all", shipMode: "all", dateRange: [null, null] });

  const Sel = ({ label, value, opts, onValueChange }: { label: string; value: string; opts: string[]; onValueChange: (v: string) => void }) => (
    <div className="min-w-[140px] flex-1">
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {opts.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-end gap-3">
        {cats.length > 0 && <Sel label="Category" value={filters.category} opts={cats} onValueChange={(v) => onChange({ ...filters, category: v })} />}
        {subs.length > 0 && <Sel label="Sub-Category" value={filters.subCategory} opts={subs} onValueChange={(v) => onChange({ ...filters, subCategory: v })} />}
        {regs.length > 0 && <Sel label="Region" value={filters.region} opts={regs} onValueChange={(v) => onChange({ ...filters, region: v })} />}
        {segs.length > 0 && <Sel label="Segment" value={filters.segment} opts={segs} onValueChange={(v) => onChange({ ...filters, segment: v })} />}
        {ships.length > 0 && <Sel label="Ship Mode" value={filters.shipMode} opts={ships} onValueChange={(v) => onChange({ ...filters, shipMode: v })} />}
        <Button variant="outline" size="sm" onClick={reset} className="h-9">
          <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
        </Button>
      </div>
    </div>
  );
}
