"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createFoodItem, updateFoodItem } from "@/actions/food.actions";

interface FoodItemFormProps {
  foodCategoryId: string;
  item?: {
    id: string;
    name: string;
    quantity: number | null;
    unitPrice: number | null;
    totalPrice: number | null;
    notes: string | null;
  } | null;
  onClose: () => void;
}

export default function FoodItemForm({ foodCategoryId, item, onClose }: FoodItemFormProps) {
  return (
    <form
      action={async (formData) => {
        if (item) {
          await updateFoodItem(formData);
        } else {
          await createFoodItem(formData);
        }
        onClose();
      }}
      className="space-y-4"
    >
      {item ? (
        <input type="hidden" name="id" value={item.id} />
      ) : (
        <input type="hidden" name="foodCategoryId" value={foodCategoryId} />
      )}

      <Input name="name" label="Name" defaultValue={item?.name} required />

      <div className="grid grid-cols-3 gap-4">
        <Input
          name="quantity"
          label="Menge"
          type="number"
          defaultValue={item?.quantity ?? ""}
        />
        <Input
          name="unitPrice"
          label="Einzelpreis (EUR)"
          type="number"
          step="0.01"
          defaultValue={item?.unitPrice ?? ""}
        />
        <Input
          name="totalPrice"
          label="Gesamt (EUR)"
          type="number"
          step="0.01"
          defaultValue={item?.totalPrice ?? ""}
        />
      </div>

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
