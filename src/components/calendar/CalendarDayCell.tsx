"use client";

import { cn } from "@/lib/utils";

interface CalendarDayCellProps {
  day: number | null;
  dateStr: string | null; // "YYYY-MM-DD"
  isToday: boolean;
  isWeddingDay: boolean;
  isSelected: boolean;
  taskCount: number;
  scheduleCount: number;
  onClick: () => void;
}

export default function CalendarDayCell({
  day,
  isToday,
  isWeddingDay,
  isSelected,
  taskCount,
  scheduleCount,
  onClick,
}: CalendarDayCellProps) {
  if (day === null) {
    return <div className="h-16 sm:h-20" />;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "h-16 sm:h-20 w-full rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 relative",
        isSelected
          ? "border-primary-400 bg-primary-50 ring-2 ring-primary-200"
          : "border-border hover:border-border hover:bg-surface-2",
        isToday && !isSelected && "border-primary-300 bg-primary-50/50",
        isWeddingDay && "border-red-300 bg-red-50"
      )}
    >
      <span
        className={cn(
          "text-sm font-medium",
          isToday && "text-primary-600",
          isWeddingDay && "text-red-600",
          !isToday && !isWeddingDay && "text-text"
        )}
      >
        {day}
      </span>

      {/* Event indicators */}
      <div className="flex items-center gap-1">
        {taskCount > 0 && (
          <span className="w-2 h-2 rounded-full bg-blue-500" title={`${taskCount} Aufgaben`} />
        )}
        {scheduleCount > 0 && (
          <span className="w-2 h-2 rounded-full bg-green-500" title={`${scheduleCount} Termine`} />
        )}
        {isWeddingDay && (
          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )}
      </div>
    </button>
  );
}
