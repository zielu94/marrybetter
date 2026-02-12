import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ value, max, className, showLabel = true }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOverBudget = value > max;

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-surface-2 rounded-full h-1.5">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-amber-500" : "bg-primary-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && (
        <p className={cn("text-xs mt-1", isOverBudget ? "text-red-500" : "text-text-faint")}>
          {percentage.toFixed(0)}%
        </p>
      )}
    </div>
  );
}
