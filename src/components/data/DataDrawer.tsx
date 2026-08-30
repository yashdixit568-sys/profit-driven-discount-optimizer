import { useState } from "react";
import { RetailRow } from "@/lib/types";
import { DataPreviewTable } from "@/components/data/DataPreviewTable";
import { NumberFormatMode } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Table, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  rows: RetailRow[];
  totalRows: number;
  formatMode: NumberFormatMode;
}

export function DataDrawer({ rows, totalRows, formatMode }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Table className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">Your data</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            <strong>{rows.length.toLocaleString("en-IN")}</strong> records active ({totalRows.toLocaleString("en-IN")} total)
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          {open ? "Hide data table" : "View data"}
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {open && (
        <div className="pt-2 border-t border-border/60">
          <DataPreviewTable rows={rows} totalDatasetRows={totalRows} formatMode={formatMode} />
        </div>
      )}
    </section>
  );
}
