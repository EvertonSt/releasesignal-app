import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export function MetricCard({
  label, value, change, changeLabel, icon, tooltip, onClick, className,
}: {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 transition-all hover:shadow-md", onClick && "cursor-pointer hover:border-primary/30", className)} onClick={onClick} title={tooltip}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {change !== undefined && (
          <span className={cn("flex items-center gap-0.5 text-sm font-medium mb-1", change > 0 ? "text-success" : change < 0 ? "text-destructive" : "text-muted-foreground")}>
            {change > 0 ? <ArrowUp className="h-3 w-3" /> : change < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      {changeLabel && <p className="mt-2 text-xs text-muted-foreground">{changeLabel}</p>}
    </div>
  );
}
