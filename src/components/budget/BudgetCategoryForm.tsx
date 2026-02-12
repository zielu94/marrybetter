"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createBudgetCategory } from "@/actions/budget.actions";

interface BudgetCategoryFormProps {
  projectId: string;
  onClose: () => void;
}

export default function BudgetCategoryForm({ projectId, onClose }: BudgetCategoryFormProps) {
  return (
    <form
      action={async (formData) => {
        await createBudgetCategory(formData);
        onClose();
      }}
      className="space-y-4"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <Input name="name" label="Kategoriename" required placeholder="z.B. Dekoration" />
      <Input name="plannedAmount" label="Geplantes Budget (EUR)" type="number" step="100" defaultValue={0} />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
        <Button type="submit">Hinzufügen</Button>
      </div>
    </form>
  );
}
