"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { updateTotalBudget } from "@/actions/budget.actions";

interface CategorySpend {
  name: string;
  planned: number;
  actual: number;
  itemCount: number;
}

interface BudgetOverviewProps {
  projectId: string;
  totalBudget: number;
  totalPlanned: number;
  totalActual: number;
  categorySpending: CategorySpend[];
  overBudgetCount: number;
  unpaidCount: number;
  noBudgetCount: number;
}

// ── Progress Ring ──
function ProgressRing({ percent, size = 56, stroke = 5, color = "text-blue-500" }: { percent: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-border" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={color} />
    </svg>
  );
}

export default function BudgetOverview({
  projectId,
  totalBudget,
  totalPlanned,
  totalActual,
  categorySpending,
  overBudgetCount,
  unpaidCount,
  noBudgetCount,
}: BudgetOverviewProps) {
  const [editingBudget, setEditingBudget] = useState(false);
  const remaining = totalBudget - totalActual;
  const isOverBudget = remaining < 0;
  const usedPercent = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

  // Status label
  const statusLabel = isOverBudget
    ? "Über Budget"
    : usedPercent > 80
    ? "Am Limit"
    : "Auf Kurs";
  const statusColor = isOverBudget
    ? "bg-red-50 text-red-600"
    : usedPercent > 80
    ? "bg-amber-50 text-amber-700"
    : "bg-emerald-50 text-emerald-600";
  const ringColor = isOverBudget
    ? "text-red-500"
    : usedPercent > 80
    ? "text-amber-500"
    : "text-emerald-500";

  // Top 3 categories by spend
  const topCategories = [...categorySpending]
    .filter((c) => c.actual > 0 || c.planned > 0)
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 3);

  // Alerts
  const alerts: { label: string; color: string }[] = [];
  if (overBudgetCount > 0) {
    alerts.push({ label: `${overBudgetCount} Kategorie${overBudgetCount > 1 ? "n" : ""} über Budget`, color: "text-red-600 bg-red-50" });
  }
  if (unpaidCount > 0) {
    alerts.push({ label: `${unpaidCount} unbezahlte Position${unpaidCount > 1 ? "en" : ""}`, color: "text-amber-700 bg-amber-50" });
  }
  if (noBudgetCount > 0) {
    alerts.push({ label: `${noBudgetCount} Kategorie${noBudgetCount > 1 ? "n" : ""} ohne Budget`, color: "text-text-muted bg-surface-2" });
  }

  return (
    <div className="space-y-4">
      {/* ────────────────────────────────────────────────────
          BUDGET STORY HEADER
          ──────────────────────────────────────────────────── */}
      <div className="bg-surface-1 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text tracking-tight">Budget</h1>
            <p className="text-[14px] text-text-muted mt-0.5">
              {categorySpending.length} Kategorien &middot; {categorySpending.reduce((s, c) => s + c.itemCount, 0)} Positionen
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOverBudget ? "bg-red-500" : usedPercent > 80 ? "bg-amber-500" : "bg-emerald-500"}`} />
            {statusLabel}
          </span>
        </div>

        {/* Big 3 metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Geplant */}
          <div className="relative group">
            <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">Geplant</p>
            <p className="text-3xl font-bold text-text tracking-tight mt-1">
              {editingBudget ? "..." : formatCurrency(totalBudget)}
            </p>
            <p className="text-[12px] text-text-faint mt-0.5">{formatCurrency(totalPlanned)} in Kategorien</p>
            {!editingBudget && (
              <button
                onClick={() => setEditingBudget(true)}
                className="absolute top-0 right-0 p-1.5 rounded-lg text-text-faint hover:text-text-muted hover:bg-surface-2 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Budget bearbeiten"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {editingBudget && (
              <div className="absolute inset-0 bg-surface-1 rounded-xl shadow-lg p-4 z-10 border border-border">
                <form
                  action={async (formData) => {
                    await updateTotalBudget(formData);
                    setEditingBudget(false);
                  }}
                >
                  <input type="hidden" name="projectId" value={projectId} />
                  <Input
                    name="amount"
                    type="number"
                    step="100"
                    defaultValue={totalBudget}
                    label="Gesamtbudget (EUR)"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button type="submit" size="sm">Speichern</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingBudget(false)}>Abbrechen</Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Ausgegeben */}
          <div>
            <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">Ausgegeben</p>
            <p className={`text-3xl font-bold tracking-tight mt-1 ${isOverBudget ? "text-red-600" : "text-text"}`}>
              {formatCurrency(totalActual)}
            </p>
            <p className="text-[12px] text-text-faint mt-0.5">{usedPercent}% vom Budget</p>
          </div>

          {/* Verbleibend */}
          <div>
            <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">Verbleibend</p>
            <p className={`text-3xl font-bold tracking-tight mt-1 ${isOverBudget ? "text-red-600" : "text-emerald-600"}`}>
              {formatCurrency(Math.abs(remaining))}
            </p>
            <p className="text-[12px] text-text-faint mt-0.5">
              {isOverBudget ? "über Budget" : "verfügbar"}
            </p>
          </div>
        </div>

        {/* Thin progress bar */}
        {totalBudget > 0 && (
          <div className="mt-5">
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? "bg-red-500" : usedPercent > 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────
          ALERTS STRIP
          ──────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((alert) => (
            <span
              key={alert.label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${alert.color}`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {alert.label}
            </span>
          ))}
        </div>
      )}

      {/* ────────────────────────────────────────────────────
          2-COLUMN GRID: Overview Ring + Top Categories
          ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overview card with ring */}
        <div className="bg-surface-1 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-[13px] font-semibold text-text-faint uppercase tracking-wider mb-4">Überblick</h3>
          <div className="flex items-center gap-5">
            <div className="relative">
              <ProgressRing percent={usedPercent} size={72} stroke={6} color={ringColor} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[15px] font-bold text-text">{usedPercent}%</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-muted">Geplant</span>
                <span className="text-[13px] font-medium text-text tabular-nums">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-muted">Ausgegeben</span>
                <span className={`text-[13px] font-medium tabular-nums ${isOverBudget ? "text-red-600" : "text-text"}`}>{formatCurrency(totalActual)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-[13px] text-text-muted">Verbleibend</span>
                <span className={`text-[13px] font-semibold tabular-nums ${isOverBudget ? "text-red-600" : "text-emerald-600"}`}>{formatCurrency(remaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top categories card */}
        <div className="bg-surface-1 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-[13px] font-semibold text-text-faint uppercase tracking-wider mb-4">Top Kategorien</h3>
          {topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map((cat) => {
                const pct = cat.planned > 0 ? Math.min(100, Math.round((cat.actual / cat.planned) * 100)) : 0;
                const over = cat.actual > cat.planned && cat.planned > 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium text-text">{cat.name}</span>
                      <span className={`text-[12px] tabular-nums ${over ? "text-red-500 font-medium" : "text-text-faint"}`}>
                        {formatCurrency(cat.actual)} / {formatCurrency(cat.planned)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${over ? "bg-red-500" : pct > 80 ? "bg-amber-400" : "bg-blue-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-6 text-[13px] text-text-faint">
              Noch keine Ausgaben erfasst
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
