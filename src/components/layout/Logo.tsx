import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  /** "dark" = original white logo (for dark bg), "light" = dark text version (for light bg) */
  variant?: "dark" | "light";
}

export default function Logo({ size = "md", variant = "light" }: LogoProps) {
  const heights: Record<string, string> = {
    sm: "h-6",
    md: "h-7",
    lg: "h-9",
    xl: "h-12",
  };

  return (
    <img
      src="/images/logo.png"
      alt="MarryBetter.com"
      className={cn(
        heights[size],
        "w-auto object-contain",
        variant === "light" && "invert"
      )}
    />
  );
}
