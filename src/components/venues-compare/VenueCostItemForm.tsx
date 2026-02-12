"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createVenueCostItem, updateVenueCostItem } from "@/actions/venue.actions";

interface VenueCostItemFormProps {
  venueOptionId: string;
  item?: {
    id: string;
    name: string;
    amount: number;
    notes: string | null;
  } | null;
  onClose: () => void;
}

export default function VenueCostItemForm({ venueOptionId, item, onClose }: VenueCostItemFormProps) {
  return (
    <form
      action={async (formData) => {
        if (item) {
          await updateVenueCostItem(formData);
        } else {
          await createVenueCostItem(formData);
        }
        onClose();
      }}
      className="space-y-4"
    >
      {item ? (
        <input type="hidden" name="id" value={item.id} />
      ) : (
        <input type="hidden" name="venueOptionId" value={venueOptionId} />
      )}

      <Input name="name" label="Bezeichnung" defaultValue={item?.name} required />

      <Input
        name="amount"
        label="Betrag (EUR)"
        type="number"
        step="0.01"
        defaultValue={item?.amount ?? 0}
        required
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Notizen</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={item?.notes || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200 placeholder:text-text-faint"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
        <Button type="submit">{item ? "Speichern" : "Hinzufügen"}</Button>
      </div>
    </form>
  );
}
