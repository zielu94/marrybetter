import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatsCard({ title, value, subtitle, icon, className }: StatsCardProps) {
  return (
    <div className={cn("px-4 py-3", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-text-muted font-normal">{title}</p>
          <p className="mt-0.5 text-xl font-semibold text-text tracking-tight">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-red-500">{subtitle}</p>}
        </div>
        {icon && <div className="text-primary-500">{icon}</div>}
      </div>
    </div>
  );
}
