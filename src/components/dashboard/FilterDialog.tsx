import { useState } from "react";
import { Filters, RetailRow, DatePreset } from "@/lib/types";
import { unique } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: RetailRow[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function FilterDialog({ open, onOpenChange, rows, filters, onChange }: Props) {
  const [showMore, setShowMore] = useState(false);

  const cats = unique(rows, "category");
  const subs = unique(rows, "subCategory");
  const regs = unique(rows, "region");
  const segs = unique(rows, "segment");
  const ships = unique(rows, "shipMode");

  const reset = () => {
    onChange({
      category: "all",
      subCategory: "all",
      region: "all",
      segment: "all",
      shipMode: "all",
      datePreset: "all",
      dateRange: [null, null],
    });
  };

  const datePresets: { value: DatePreset; label: string }[] = [
    { value: "all", label: "All time" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "3m", label: "Last 3 months" },
    { value: "6m", label: "Last 6 months" },
    { value: "12m", label: "Last 12 months" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Filter your data
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Focus insights and recommendations on specific periods or categories.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Date Preset */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Time Period</label>
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

          {/* Category */}
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

          {/* Region */}
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

          {/* Secondary Filters Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              {showMore ? "Fewer options" : "More filters (Sub-Category, Segment, Ship Mode)"}
              {showMore ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showMore && (
            <div className="space-y-3 border-t border-border pt-3">
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-xs text-muted-foreground">
              <RotateCcw className="h-3 w-3" /> Reset all
            </Button>
            <Button size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
