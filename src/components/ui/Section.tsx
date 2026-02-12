import { cn } from "@/lib/utils";

interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({ title, description, children, className }: SectionProps) {
  return (
    <div className={cn(className)}>
      {title && (
        <h2 className="text-lg font-semibold text-text tracking-tight mb-3">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-sm text-text-muted -mt-1.5 mb-3">{description}</p>
      )}
      <div>{children}</div>
    </div>
  );
}
