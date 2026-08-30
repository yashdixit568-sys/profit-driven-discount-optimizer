import { Button } from "@/components/ui/button";
import { Sparkles, SlidersHorizontal, FileDown, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NumberFormatMode } from "@/lib/analytics";

interface Props {
  headline: string;
  activeFilterCount: number;
  rowCount: number;
  formatMode: NumberFormatMode;
  onFormatModeChange: (mode: NumberFormatMode) => void;
  onOpenFilters: () => void;
  onExportSummary: () => void;
  onResetData: () => void;
}

export function AssistantSummaryHeader({
  headline,
  activeFilterCount,
  rowCount,
  formatMode,
  onFormatModeChange,
  onOpenFilters,
  onExportSummary,
  onResetData,
}: Props) {
  return (
    <header className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
            ₹
          </div>
          <div>
            <h1 className="font-display text-base font-bold leading-tight text-foreground">
              RetailIQ Assistant
            </h1>
            <p className="text-[11px] text-muted-foreground">{rowCount.toLocaleString("en-IN")} sales records analyzed</p>
          </div>
        </div>

        {/* Right action group: Currency Format Toggle + Filters + Summary */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format mode selector: 5k vs 5000 */}
          <div className="flex items-center rounded-lg border border-border/80 bg-card p-1 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => onFormatModeChange("compact")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                formatMode === "compact"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-[11px]">₹ 5k</span>
            </button>
            <button
              type="button"
              onClick={() => onFormatModeChange("full")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                formatMode === "full"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-[11px]">₹ 5000</span>
            </button>
          </div>

          <Button
            variant={activeFilterCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={onOpenFilters}
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-background text-foreground">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={onExportSummary} className="h-8 gap-1.5 text-xs border-border/80">
            <FileDown className="h-3.5 w-3.5" /> Summary
          </Button>

          <Button variant="ghost" size="sm" onClick={onResetData} className="h-8 gap-1 text-xs text-muted-foreground">
            <RotateCcw className="h-3 w-3" /> Change Data
          </Button>
        </div>
      </div>

      {/* "Here's what I found" callout box */}
      <div className="rounded-2xl border border-primary/20 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 space-y-1.5 shadow-2xs">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Here’s what I found</span>
        </div>
        <p className="font-display text-lg font-bold leading-snug text-foreground sm:text-xl">
          {headline}
        </p>
      </div>
    </header>
  );
}
