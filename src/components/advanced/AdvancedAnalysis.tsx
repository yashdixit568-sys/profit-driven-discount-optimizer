import { useState } from "react";
import { TrainedModels } from "@/lib/ml";
import { Brain, ChevronDown, ChevronUp, Cpu, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  models: TrainedModels | null;
  training: boolean;
  onTrain: () => void;
}

export function AdvancedAnalysis({ models, training, onTrain }: Props) {
  const [expanded, setExpanded] = useState(false);

  const bestModel = models
    ? models.metrics.find((x, i) => ["ridge", "forest", "boost"][i] === models.best)
    : null;

  const getQualityText = (r2?: number) => {
    if (r2 == null) return "Pending";
    if (r2 > 0.8) return "Excellent";
    if (r2 > 0.5) return "Good";
    if (r2 > 0.2) return "Moderate";
    return "Basic";
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-foreground">Advanced Analysis & Predictive Models</h3>
              <Badge variant="outline" className="text-xs">
                Optional
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {models
                ? `Prediction Quality: ${getQualityText(bestModel?.r2)} · Best Model: ${bestModel?.name || "Gradient Boosting"}`
                : "Evaluate predictive machine learning models on your dataset"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!models && (
            <Button onClick={onTrain} disabled={training} size="sm" className="gap-2 text-xs">
              <Cpu className="h-3.5 w-3.5" />
              {training ? "Training models…" : "Run ML Evaluation"}
            </Button>
          )}

          {models && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 gap-1.5 text-xs text-muted-foreground"
            >
              {expanded ? "Hide technical details" : "View technical details"}
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {training && (
        <div className="rounded-lg bg-muted/40 p-4 text-center text-xs text-muted-foreground animate-pulse">
          Training Linear Regression, Random Forest, and Gradient Boosting models on 80/20 train/test split…
        </div>
      )}

      {expanded && models && (
        <div className="space-y-3 border-t border-border pt-4 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>
              Trained on <strong>{models.trainIdx.length}</strong> rows (80%) · Evaluated on <strong>{models.testIdx.length}</strong> held-out rows (20%)
            </span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Leakage-free target & customer feature encoding
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {models.metrics.map((m, i) => {
              const isBest = ["ridge", "forest", "boost"][i] === models.best;
              return (
                <div
                  key={m.name}
                  className={`rounded-lg border p-3.5 ${
                    isBest ? "border-primary/50 bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-foreground text-sm">{m.name}</p>
                    {isBest && (
                      <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground uppercase">
                        Best Fit
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-border/50">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">RMSE</p>
                      <p className="font-mono text-xs font-bold text-foreground">{m.rmse.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">MAE</p>
                      <p className="font-mono text-xs font-bold text-foreground">{m.mae.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">R² Score</p>
                      <p className="font-mono text-xs font-bold text-foreground">{m.r2.toFixed(3)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
