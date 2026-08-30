import { useState } from "react";
import { DatasetMeta } from "@/lib/types";
import { CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  meta: DatasetMeta;
}

export function DataQualityBanner({ meta }: Props) {
  const [expanded, setExpanded] = useState(false);

  const hasIssues =
    meta.duplicatesRemoved > 0 ||
    meta.excludedInvalidRows > 0 ||
    meta.missingFilled > 0 ||
    meta.warnings.length > 0 ||
    meta.defaultedFields.length > 0;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">DATA READY</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                Ready to analyze
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">{meta.rowCount.toLocaleString()}</strong> usable rows ·{" "}
              <strong>{meta.columnsDetected.length}</strong> columns detected
              {meta.duplicatesRemoved > 0 && ` · ${meta.duplicatesRemoved} duplicates removed`}
              {meta.excludedInvalidRows > 0 && ` · ${meta.excludedInvalidRows} invalid rows excluded`}
            </p>
          </div>
        </div>

        {hasIssues && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Info className="h-3.5 w-3.5" />
            {expanded ? "Hide issues" : "View data issues"}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>

      {expanded && hasIssues && (
        <div className="border-t border-primary/15 pt-3 space-y-2 text-xs">
          {meta.excludedInvalidRows > 0 && (
            <div className="flex items-start gap-2 text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>{meta.excludedInvalidRows} rows excluded:</strong> Missing or non-numeric Sales or Profit values.
              </span>
            </div>
          )}

          {meta.defaultedFields.map((df, i) => (
            <div key={i} className="flex items-start gap-2 text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span>{df}</span>
            </div>
          ))}

          {meta.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
