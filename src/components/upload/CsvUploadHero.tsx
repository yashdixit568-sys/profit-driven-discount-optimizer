import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, PlayCircle, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCsvTemplate } from "@/lib/csv";
import { cn } from "@/lib/utils";

interface Props {
  onFile: (text: string, name: string) => void;
  onTryDemo: () => void;
  loading?: boolean;
}

export function CsvUploadHero({ onFile, onTryDemo, loading }: Props) {
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
    noClick: false,
  });

  const handleDownloadTemplate = () => {
    const template = generateCsvTemplate();
    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "retailiq-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-xl text-center space-y-6 py-6">
      {/* App Header */}
      <div className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold shadow-xs">
          ₹
        </div>
        <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          Retail<span className="text-primary">IQ</span>
        </h1>
        <p className="text-sm font-medium text-foreground">
          Turn your sales data into simple business answers.
        </p>
        <p className="text-xs text-muted-foreground">
          Upload your sales data and RetailIQ will summarize what matters.
        </p>
      </div>

      {/* Simple Upload Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all bg-card shadow-2xs",
          isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border/80 hover:border-primary/50 hover:bg-muted/20"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {loading ? "Reading your file…" : isDragActive ? "Drop CSV here" : "Upload your sales CSV"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Drag & drop or click to browse</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 p-2.5 text-xs font-medium text-destructive">{error}</p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button onClick={open} size="default" className="gap-2 text-xs font-semibold shadow-xs">
          <Upload className="h-4 w-4" /> Upload CSV
        </Button>
        <Button onClick={onTryDemo} variant="outline" size="default" className="gap-2 text-xs font-semibold border-border/80">
          <PlayCircle className="h-4 w-4 text-primary" /> Try Demo Dataset
        </Button>
        <Button onClick={handleDownloadTemplate} variant="ghost" size="default" className="gap-1.5 text-xs text-muted-foreground">
          <Download className="h-3.5 w-3.5" /> Template
        </Button>
      </div>
    </div>
  );
}
