"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:opacity-40 disabled:cursor-not-allowed",
          {
            "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-md shadow-primary-600/25": variant === "primary",
            "bg-surface-1 text-text border border-border hover:bg-surface-2 active:bg-surface-muted shadow-sm": variant === "secondary",
            "border border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 active:bg-primary-100 dark:active:bg-primary-900/50": variant === "outline",
            "text-text-muted hover:bg-surface-2 active:bg-surface-muted": variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md shadow-red-500/25": variant === "danger",
          },
          {
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-sm min-h-[44px]": size === "lg",
          },
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
