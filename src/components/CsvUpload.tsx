import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFile: (text: string, name: string) => void;
  loading?: boolean;
}

export function CsvUpload({ onFile, loading }: Props) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (files: File[]) => {
      setError(null);
      const f = files[0];
      if (!f) return;
      if (!f.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a .csv file");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onFile(String(reader.result || ""), f.name);
      reader.onerror = () => setError("Could not read file");
      reader.readAsText(f);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all",
          "bg-gradient-card shadow-card",
          isDragActive
            ? "border-primary bg-primary/5 shadow-glow scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/40"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-all",
              isDragActive ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
            )}
          >
            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
          </div>
          <div className="space-y-1">
            <p className="font-display text-xl font-semibold text-foreground">
              {loading ? "Analyzing your dataset…" : isDragActive ? "Drop your CSV here" : "Drop your retail CSV here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or <span className="text-primary font-medium">browse files</span> · supports Superstore-style data
            </p>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {["Order Date", "Sales", "Quantity", "Discount", "Profit", "Category", "Region"].map((c) => (
              <span key={c} className="rounded-full border border-border bg-background/60 px-3 py-1">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
      </motion.div>

      {error && (
        <p className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: FileSpreadsheet, title: "Auto-detect columns", desc: "We map common header variants for you." },
          { icon: Sparkles, title: "Built-in ML models", desc: "Linear, Random Forest & Gradient Boosting." },
          { icon: Upload, title: "Runs in your browser", desc: "Your data never leaves the page." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-card">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
