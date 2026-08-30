import { useState } from "react";
import { DatasetMeta, RetailRow } from "@/lib/types";
import { fmtCurrency, computeKPIs, NumberFormatMode } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ArrowRight, RotateCcw } from "lucide-react";

interface Props {
  rows: RetailRow[];
  meta: DatasetMeta;
  formatMode: NumberFormatMode;
  onProceed: () => void;
  onReset: () => void;
}

export function DataCheckConfirmation({ rows, meta, formatMode, onProceed, onReset }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const kpis = computeKPIs(rows);

  const hasWarnings =
    meta.excludedInvalidRows > 0 || meta.defaultedFields.length > 0 || meta.warnings.length > 0;

  return (
    <div className="mx-auto max-w-lg space-y-6 py-6 text-center">
      {/* Header */}
      <div className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 font-bold">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Your data is ready ✅
        </h2>
        <p className="font-medium text-sm text-foreground">
          {kpis.orders.toLocaleString("en-IN")} orders · {fmtCurrency(kpis.totalSales, formatMode)} sales · {fmtCurrency(kpis.totalProfit, formatMode)} profit
        </p>
      </div>

      {/* Quality Checklist Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 text-left space-y-3 shadow-2xs">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          Data Quality Check
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <span className="text-emerald-600">✓</span>
            <span>{meta.rowCount.toLocaleString("en-IN")} usable rows detected</span>
          </div>

          <div className="flex items-center gap-2 text-foreground font-medium">
            <span className="text-emerald-600">✓</span>
            <span>
              {meta.duplicatesRemoved > 0
                ? `${meta.duplicatesRemoved} duplicate rows removed`
                : "No duplicate rows"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-foreground font-medium">
            <span className="text-emerald-600">✓</span>
            <span>All essential sales & profit columns recognized</span>
          </div>

          {meta.excludedInvalidRows > 0 && (
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <span>⚠</span>
              <span>{meta.excludedInvalidRows} invalid rows excluded</span>
            </div>
          )}
        </div>

        {hasWarnings && (
          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              {showDetails ? "Hide details" : "View details"}
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showDetails && (
              <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
                {meta.defaultedFields.map((df, i) => (
                  <p key={i}>• {df}</p>
                ))}
                {meta.warnings.map((w, i) => (
                  <p key={i}>• {w}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="ghost" size="default" onClick={onReset} className="text-xs text-muted-foreground">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Upload different file
        </Button>
        <Button size="lg" onClick={onProceed} className="gap-2 text-xs font-semibold shadow-xs">
          See my results <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
