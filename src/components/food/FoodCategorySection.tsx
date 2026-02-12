"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { deleteFoodCategory, deleteFoodItem } from "@/actions/food.actions";
import FoodItemForm from "./FoodItemForm";

interface FoodItem {
  id: string;
  name: string;
  quantity: number | null;
  unitPrice: number | null;
  totalPrice: number | null;
  notes: string | null;
}

interface FoodCategorySectionProps {
  category: {
    id: string;
    name: string;
    items: FoodItem[];
  };
}

export default function FoodCategorySection({ category }: FoodCategorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const categoryTotal = category.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <Card padding="sm" className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-surface-2 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-text-faint transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="text-left">
            <p className="font-medium text-text">{category.name}</p>
            <p className="text-xs text-text-muted">{category.items.length} Positionen</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-text">{formatCurrency(categoryTotal)}</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-3 py-2">
          {category.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium text-right">Menge</th>
                    <th className="py-2 pr-4 font-medium text-right">Einzelpreis</th>
                    <th className="py-2 pr-4 font-medium text-right">Gesamt</th>
                    <th className="py-2 font-medium w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {category.items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-2 border-b border-border">
                      <td className="py-2 pr-4">
                        <span className="text-text">{item.name}</span>
                        {item.notes && <span className="text-text-faint ml-2 text-xs">({item.notes})</span>}
                      </td>
                      <td className="py-2 pr-4 text-right text-text-muted">
                        {item.quantity ?? "-"}
                      </td>
                      <td className="py-2 pr-4 text-right text-text-muted">
                        {item.unitPrice != null ? formatCurrency(item.unitPrice) : "-"}
                      </td>
                      <td className="py-2 pr-4 text-right font-medium text-text">
                        {item.totalPrice != null ? formatCurrency(item.totalPrice) : "-"}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-text-faint hover:text-primary-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <form action={deleteFoodItem}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className="text-text-faint hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-faint py-2">Noch keine Positionen</p>
          )}

          <div className="flex gap-2 mt-2 pt-2 border-t border-border">
            <Button size="sm" variant="ghost" onClick={() => setShowItemForm(true)}>
              + Position hinzufügen
            </Button>
            <form action={deleteFoodCategory} className="ml-auto">
              <input type="hidden" name="id" value={category.id} />
              <Button size="sm" variant="ghost" type="submit" className="text-red-500 hover:text-red-600">
                Kategorie löschen
              </Button>
            </form>
          </div>
        </div>
      )}

      <Modal
        open={showItemForm || !!editingItem}
        onClose={() => { setShowItemForm(false); setEditingItem(null); }}
        title={editingItem ? "Position bearbeiten" : "Neue Position"}
      >
        <FoodItemForm
          foodCategoryId={category.id}
          item={editingItem}
          onClose={() => { setShowItemForm(false); setEditingItem(null); }}
        />
      </Modal>
    </Card>
  );
}
