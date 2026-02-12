"use client";

import { cn } from "@/lib/utils";

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleButtonGroupProps {
  label: string;
  options: ToggleOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
}

export default function ToggleButtonGroup({
  label,
  options,
  value,
  onChange,
  multi = false,
}: ToggleButtonGroupProps) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  function handleClick(optionValue: string) {
    if (multi) {
      const current = selectedValues;
      if (current.includes(optionValue)) {
        onChange(current.filter((v) => v !== optionValue));
      } else {
        onChange([...current, optionValue]);
      }
    } else {
      onChange(selectedValues.includes(optionValue) ? "" : optionValue);
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
      <div className="bg-surface-2 rounded-lg p-0.5 inline-flex gap-0.5">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleClick(option.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                isSelected
                  ? "bg-surface-1 text-text shadow-sm"
                  : "text-text-muted hover:text-text"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
