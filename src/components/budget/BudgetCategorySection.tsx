"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { deleteBudgetCategory, deleteBudgetItem } from "@/actions/budget.actions";
import { PAYMENT_STATUS_LABELS } from "@/types";
import type { PaymentStatus } from "@/types";
import BudgetItemForm from "./BudgetItemForm";

interface BudgetItem {
  id: string;
  name: string;
  plannedAmount: number;
  actualAmount: number;
  paymentStatus: string;
  notes: string | null;
}

interface BudgetCategorySectionProps {
  category: {
    id: string;
    name: string;
    plannedAmount: number;
    budgetItems: BudgetItem[];
  };
  projectId: string;
}

const statusBadgeVariant: Record<string, "default" | "warning" | "info" | "success"> = {
  UNPAID: "default",
  DEPOSIT_PAID: "warning",
  PARTIALLY_PAID: "info",
  FULLY_PAID: "success",
};

export default function BudgetCategorySection({ category, projectId }: BudgetCategorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const actualTotal = category.budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
  const plannedTotal = category.budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0) || category.plannedAmount;
  const pct = plannedTotal > 0 ? Math.min(100, Math.round((actualTotal / plannedTotal) * 100)) : 0;
  const isOver = actualTotal > plannedTotal && plannedTotal > 0;

  return (
    <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header — clickable row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg
            className={`w-3.5 h-3.5 text-text-faint transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <div className="text-left min-w-0">
            <p className="text-[14px] font-semibold text-text">{category.name}</p>
            <p className="text-[12px] text-text-faint">
              {category.budgetItems.length} Position{category.budgetItems.length !== 1 ? "en" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          {/* Status chip */}
          {isOver && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-[11px] font-medium text-red-600">
              Über Budget
            </span>
          )}

          {/* Amounts */}
          <div className="text-right">
            <p className={`text-[14px] font-semibold tabular-nums ${isOver ? "text-red-600" : "text-text"}`}>
              {formatCurrency(actualTotal)}
            </p>
            <p className="text-[12px] text-text-faint tabular-nums">
              von {formatCurrency(plannedTotal)}
            </p>
          </div>

          {/* Mini progress */}
          <div className="w-16 hidden sm:block">
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${isOver ? "bg-red-500" : pct > 80 ? "bg-amber-400" : "bg-blue-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-text-faint text-right mt-0.5 tabular-nums">{pct}%</p>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Items */}
          {category.budgetItems.length > 0 ? (
            <div className="divide-y divide-border">
              {category.budgetItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-2/50 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-text">{item.name}</span>
                      <Badge variant={statusBadgeVariant[item.paymentStatus] || "default"}>
                        {PAYMENT_STATUS_LABELS[item.paymentStatus as PaymentStatus] || item.paymentStatus}
                      </Badge>
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-text-faint mt-0.5 line-clamp-1">{item.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-[13px] font-medium text-text tabular-nums">{formatCurrency(item.actualAmount)}</p>
                      <p className="text-[11px] text-text-faint tabular-nums">{formatCurrency(item.plannedAmount)} geplant</p>
                    </div>

                    {/* Actions — visible on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 rounded-lg text-text-faint hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <form action={deleteBudgetItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="p-1.5 rounded-lg text-text-faint hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-text-faint text-center py-6">Noch keine Positionen</p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-2/30">
            <button
              onClick={() => setShowItemForm(true)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Position hinzufügen
            </button>
            <form action={deleteBudgetCategory}>
              <input type="hidden" name="id" value={category.id} />
              <button type="submit" className="text-[12px] text-text-faint hover:text-red-500 transition-colors">
                Kategorie löschen
              </button>
            </form>
          </div>
        </div>
      )}

      <Modal
        open={showItemForm || !!editingItem}
        onClose={() => { setShowItemForm(false); setEditingItem(null); }}
        title={editingItem ? "Position bearbeiten" : "Neue Position"}
      >
        <BudgetItemForm
          categoryId={category.id}
          item={editingItem}
          onClose={() => { setShowItemForm(false); setEditingItem(null); }}
        />
      </Modal>
    </div>
  );
}
