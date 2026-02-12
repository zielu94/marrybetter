"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { createBudgetItem, updateBudgetItem } from "@/actions/budget.actions";
import { PAYMENT_STATUS_LABELS } from "@/types";
import type { PaymentStatus } from "@/types";

interface BudgetItemFormProps {
  categoryId: string;
  item?: {
    id: string;
    name: string;
    plannedAmount: number;
    actualAmount: number;
    paymentStatus: string;
    notes: string | null;
  } | null;
  onClose: () => void;
}

const paymentStatusOptions = Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function BudgetItemForm({ categoryId, item, onClose }: BudgetItemFormProps) {
  return (
    <form
      action={async (formData) => {
        if (item) {
          await updateBudgetItem(formData);
        } else {
          await createBudgetItem(formData);
        }
        onClose();
      }}
      className="space-y-4"
    >
      {item ? (
        <input type="hidden" name="id" value={item.id} />
      ) : (
        <input type="hidden" name="categoryId" value={categoryId} />
      )}

      <Input name="name" label="Name" defaultValue={item?.name} required />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="plannedAmount"
          label="Geplant (EUR)"
          type="number"
          step="0.01"
          defaultValue={item?.plannedAmount ?? 0}
        />
        <Input
          name="actualAmount"
          label="Tatsaechlich (EUR)"
          type="number"
          step="0.01"
          defaultValue={item?.actualAmount ?? 0}
        />
      </div>

      <Select
        name="paymentStatus"
        label="Zahlungsstatus"
        options={paymentStatusOptions}
        defaultValue={item?.paymentStatus || "UNPAID"}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Notizen</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={item?.notes || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
        <Button type="submit">{item ? "Speichern" : "Hinzufügen"}</Button>
      </div>
    </form>
  );
}
