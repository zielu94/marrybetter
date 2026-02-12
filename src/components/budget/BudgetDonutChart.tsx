"use client";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6",
  "#6366f1", "#ec4899", "#84cc16",
];

interface Segment {
  name: string;
  amount: number;
}

interface BudgetDonutChartProps {
  segments: Segment[];
  total: number;
  centerLabel: string;
  centerValue: string;
}

export default function BudgetDonutChart({ segments, total, centerLabel, centerValue }: BudgetDonutChartProps) {
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segments
  let cumulativePercent = 0;
  const arcs = segments.map((seg, i) => {
    const percent = total > 0 ? seg.amount / total : 0;
    const offset = circumference * (1 - cumulativePercent);
    const length = circumference * percent;
    cumulativePercent += percent;
    return {
      ...seg,
      color: COLORS[i % COLORS.length],
      offset,
      length,
      percent,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <circle
              key={arc.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          ))}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-text tracking-tight">{centerValue}</span>
          <span className="text-[11px] text-text-faint">{centerLabel}</span>
        </div>
      </div>

      {/* Legend */}
      {segments.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 w-full max-w-xs">
          {arcs.map((arc) => (
            <div key={arc.name} className="flex items-center gap-2 text-[12px]">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: arc.color }}
              />
              <span className="text-text-muted truncate">{arc.name}</span>
              <span className="ml-auto text-text font-medium tabular-nums">{Math.round(arc.percent * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
