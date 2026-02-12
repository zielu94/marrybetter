"use client";

import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-input text-sm text-text",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400",
            "transition-all duration-150 placeholder:text-text-faint",
            "min-h-[80px] resize-y",
            error && "border-red-400 focus:ring-red-500/30 focus:border-red-400",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
export default TextArea;
