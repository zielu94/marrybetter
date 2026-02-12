import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantClasses = {
  default: "bg-surface-2 text-text-muted",
  success: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  warning: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  danger: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  info: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
};

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
