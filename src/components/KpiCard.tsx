import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  gradient?: "emerald" | "sky" | "amber" | "rose" | "navy";
  index?: number;
}

const grads: Record<string, string> = {
  emerald: "bg-gradient-emerald",
  sky: "bg-gradient-sky",
  amber: "bg-gradient-amber",
  rose: "bg-gradient-rose",
  navy: "bg-gradient-navy",
};

export function KpiCard({ label, value, sub, icon: Icon, gradient = "emerald", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-elegant"
    >
      <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-20", grads[gradient])} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md", grads[gradient])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
