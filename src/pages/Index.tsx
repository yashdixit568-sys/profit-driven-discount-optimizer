import { useMemo, useState } from "react";
import { parseCsv, downloadCsv } from "@/lib/csv";
import { RetailRow, Filters, DatasetMeta } from "@/lib/types";
import {
  applyFilters,
  computeKPIs,
  generatePositiveFindings,
  generateAttentionFindings,
  generateBusinessRecommendation,
  generateExecutiveSummaryHeadline,
  fmtCurrency,
  fmtPercent,
  NumberFormatMode,
} from "@/lib/analytics";
import { trainAll, TrainedModels } from "@/lib/ml";
import { DEMO_CSV_DATA } from "@/lib/demoData";
import { toast } from "sonner";

import { CsvUploadHero } from "@/components/upload/CsvUploadHero";
import { DataCheckConfirmation } from "@/components/upload/DataCheckConfirmation";
import { AssistantSummaryHeader } from "@/components/dashboard/AssistantSummaryHeader";
import { BusinessAtAGlanceSimple } from "@/components/dashboard/BusinessAtAGlanceSimple";
import { WhatsGoingWell } from "@/components/dashboard/WhatsGoingWell";
import { WhatNeedsAttention } from "@/components/dashboard/WhatNeedsAttention";
import { WhatShouldYouDoAssistant } from "@/components/recommendations/WhatShouldYouDoAssistant";
import { TwoCoreCharts } from "@/components/charts/TwoCoreCharts";
import { FilterDialog } from "@/components/dashboard/FilterDialog";
import { AdvancedAnalysisCollapsible } from "@/components/advanced/AdvancedAnalysisCollapsible";
import { DataDrawer } from "@/components/data/DataDrawer";

type AppStep = "upload" | "data-check" | "overview";

const Index = () => {
  const [step, setStep] = useState<AppStep>("upload");
  const [rows, setRows] = useState<RetailRow[] | null>(null);
  const [meta, setMeta] = useState<DatasetMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<TrainedModels | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const initialFormatMode: NumberFormatMode =
    import.meta.env.VITE_DEFAULT_FORMAT_MODE === "full" ? "full" : "compact";
  const [formatMode, setFormatMode] = useState<NumberFormatMode>(initialFormatMode);

  const [filters, setFilters] = useState<Filters>({
    category: "all",
    subCategory: "all",
    region: "all",
    segment: "all",
    shipMode: "all",
    datePreset: "all",
    dateRange: [null, null],
  });

  const filtered = useMemo(() => (rows ? applyFilters(rows, filters) : []), [rows, filters]);
  const kpis = useMemo(() => computeKPIs(filtered), [filtered]);

  const headline = useMemo(
    () => (filtered.length ? generateExecutiveSummaryHeadline(filtered, kpis, formatMode) : ""),
    [filtered, kpis, formatMode]
  );
  const positiveFindings = useMemo(
    () => (filtered.length ? generatePositiveFindings(filtered, kpis, formatMode) : []),
    [filtered, kpis, formatMode]
  );
  const attentionFindings = useMemo(
    () => (filtered.length ? generateAttentionFindings(filtered, kpis, formatMode) : []),
    [filtered, kpis, formatMode]
  );
  const recommendation = useMemo(
    () => (filtered.length ? generateBusinessRecommendation(filtered, kpis, formatMode, models) : null),
    [filtered, kpis, formatMode, models]
  );

  const activeFilterCount =
    (filters.category !== "all" ? 1 : 0) +
    (filters.subCategory !== "all" ? 1 : 0) +
    (filters.region !== "all" ? 1 : 0) +
    (filters.segment !== "all" ? 1 : 0) +
    (filters.shipMode !== "all" ? 1 : 0) +
    (filters.datePreset !== "all" ? 1 : 0);

  async function handleFile(text: string, name: string) {
    setLoading(true);
    setModels(null);
    try {
      const { rows: parsed, meta: m } = await parseCsv(text);
      setRows(parsed);
      setMeta(m);
      setStep("data-check");
      toast.success(`Read ${parsed.length.toLocaleString("en-IN")} rows from ${name}`);
      if (parsed.length > 10) {
        setTimeout(() => trainModels(parsed), 50);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to parse CSV";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleTryDemo() {
    handleFile(DEMO_CSV_DATA, "sample-retail-data.csv");
  }

  async function trainModels(data: RetailRow[]) {
    if (data.length < 10) return;
    try {
      await new Promise((r) => setTimeout(r, 30));
      const m = trainAll(data, "profit");
      setModels(m);
    } catch (e) {
      console.warn("Model evaluation note:", e);
    }
  }

  function exportSummary() {
    if (!rows || !recommendation) return;
    const lines = [
      "RetailIQ — Business Overview Report",
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      "",
      `Headline: ${headline}`,
      "",
      "=== Business at a Glance ===",
      `Sales: ${fmtCurrency(kpis.totalSales, formatMode)}`,
      `Profit: ${fmtCurrency(kpis.totalProfit, formatMode)}`,
      `Margin: ${fmtPercent(kpis.profitMargin)}`,
      `Orders: ${kpis.orders.toLocaleString("en-IN")}`,
      "",
      "=== What's Going Well? ===",
      ...positiveFindings.map((p, i) => `${i + 1}. ${p}`),
      "",
      "=== What Needs Attention? ===",
      ...attentionFindings.map((a, i) => `${i + 1}. ${a}`),
      "",
      "=== What Should You Do? ===",
      `Advice: ${recommendation.headline}`,
      `Why: ${recommendation.why}`,
      recommendation.categoryAdvice ? `Category Tip: ${recommendation.categoryAdvice}` : "",
      `Current Average Discount: ${recommendation.currentAvgDiscount}`,
      `Confidence: ${recommendation.confidence}`,
    ].filter(Boolean);

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "retailiq-business-summary.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const resetAll = () => {
    setRows(null);
    setMeta(null);
    setModels(null);
    setStep("upload");
  };

  // ========== SCREEN 1: LANDING & UPLOAD ==========
  if (step === "upload" || !rows) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                ₹
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Retail<span className="text-primary">IQ</span>
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Business Assistant</span>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-2xl">
          <CsvUploadHero onFile={handleFile} onTryDemo={handleTryDemo} loading={loading} />
        </main>

        <footer className="border-t border-border/50 py-5 text-center text-xs text-muted-foreground">
          RetailIQ · Private in-browser business assistant
        </footer>
      </div>
    );
  }

  // ========== SCREEN 2: DATA CHECK CONFIRMATION ==========
  if (step === "data-check" && meta) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                ₹
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Retail<span className="text-primary">IQ</span>
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Data Confirmation</span>
          </div>
        </header>

        <main className="container mx-auto px-6 py-10 max-w-xl">
          <DataCheckConfirmation
            rows={rows}
            meta={meta}
            formatMode={formatMode}
            onProceed={() => setStep("overview")}
            onReset={resetAll}
          />
        </main>

        <footer className="border-t border-border/50 py-5 text-center text-xs text-muted-foreground">
          RetailIQ · Checking data validity before analysis
        </footer>
      </div>
    );
  }

  // ========== SCREEN 3: MAIN BUSINESS OVERVIEW ==========
  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="container mx-auto max-w-4xl px-6 pt-6 space-y-7">
        {/* Assistant Header & Dynamic Headline */}
        <AssistantSummaryHeader
          headline={headline}
          activeFilterCount={activeFilterCount}
          rowCount={rows.length}
          formatMode={formatMode}
          onFormatModeChange={setFormatMode}
          onOpenFilters={() => setFilterOpen(true)}
          onExportSummary={exportSummary}
          onResetData={resetAll}
        />

        {/* Section 1: Business at a Glance (Sales, Profit, Margin, Orders) */}
        <BusinessAtAGlanceSimple kpis={kpis} formatMode={formatMode} />

        {/* Section 2: What's going well? */}
        <WhatsGoingWell findings={positiveFindings} />

        {/* Section 3: What needs attention? */}
        <WhatNeedsAttention findings={attentionFindings} />

        {/* Section 4: What should you do? */}
        {recommendation && <WhatShouldYouDoAssistant recommendation={recommendation} />}

        {/* Section 5: Visual Summary (Max 2 Core Charts + Expandable Details) */}
        <TwoCoreCharts rows={filtered} formatMode={formatMode} />

        {/* Section 6: Your Data (On-Demand) */}
        <DataDrawer rows={filtered} totalRows={rows.length} formatMode={formatMode} />

        {/* Section 7: Advanced Analysis (On-Demand) */}
        <AdvancedAnalysisCollapsible models={models} rowCount={rows.length} />

        {/* Filter Modal */}
        <FilterDialog
          open={filterOpen}
          onOpenChange={setFilterOpen}
          rows={rows}
          filters={filters}
          onChange={setFilters}
        />

        <footer className="pt-8 text-center text-xs text-muted-foreground border-t border-border/50">
          RetailIQ Assistant · 100% private in-browser analysis · All calculations in Indian Rupees (₹)
        </footer>
      </main>
    </div>
  );
};

export default Index;
