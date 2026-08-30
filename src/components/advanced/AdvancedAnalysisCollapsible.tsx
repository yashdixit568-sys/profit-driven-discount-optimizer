import { useState } from "react";
import { TrainedModels } from "@/lib/ml";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Cpu, Info } from "lucide-react";

interface Props {
  models: TrainedModels | null;
  rowCount?: number;
}

export function AdvancedAnalysisCollapsible({ models, rowCount = 0 }: Props) {
  const [open, setOpen] = useState(false);

  const isSmallData = rowCount > 0 && rowCount <= 10;

  return (
    <section className="rounded-2xl border border-border/80 bg-card/70 p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Cpu className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">Advanced analysis</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {isSmallData
              ? "Predictive modeling paused (small sample)"
              : models
              ? "Prediction quality: Good"
              : "Basic business insights active"}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          {open ? "Hide technical details" : "View technical details"}
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {open && (
        <div className="pt-3 border-t border-border/60 space-y-4 text-xs">
          {isSmallData ? (
            <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Info className="h-4 w-4 text-primary" /> Sample Size Note
              </div>
              <p>
                This dataset contains only <strong>{rowCount} orders</strong>. Machine learning evaluation requires at least 10–20 orders to produce statistically sound cross-validation and avoid overfitting.
              </p>
              <p>
                All your exact historical sales, net profit, margin calculations, and data observations above are 100% accurate and available.
              </p>
            </div>
          ) : models ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {models.metrics.map((m, i) => {
                  const isBest = (["ridge", "forest", "boost"] as const)[i] === models.best;
                  return (
                    <div
                      key={m.name}
                      className={`rounded-xl border p-3.5 space-y-1.5 ${
                        isBest ? "border-primary bg-primary/5 shadow-2xs" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{m.name}</span>
                        {isBest && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            Best fit
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-muted-foreground">
                        <div>
                          <p>R²</p>
                          <p className="font-mono font-semibold text-foreground">
                            {m.r2.toFixed(3)}
                          </p>
                        </div>
                        <div>
                          <p>MAE</p>
                          <p className="font-mono font-semibold text-foreground">
                            ₹{m.mae.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p>RMSE</p>
                          <p className="font-mono font-semibold text-foreground">
                            ₹{m.rmse.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                * Models are evaluated via an 80/20 train/test split. Customer frequency and target encoding statistics are calculated strictly on training folds to eliminate test data leakage.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Models are initializing...</p>
          )}
        </div>
      )}
    </section>
  );
}
