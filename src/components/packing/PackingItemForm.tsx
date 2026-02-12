"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ToggleButtonGroup from "@/components/ui/ToggleButtonGroup";
import {
  createPackingItem,
  updatePackingItem,
  deletePackingItem,
} from "@/actions/packing.actions";
import {
  PACKING_CATEGORY_LABELS,
  PACKING_STATUS_LABELS,
} from "@/types";

interface PackingItemData {
  id: string;
  name: string;
  category: string;
  personInCharge: string | null;
  status: string;
}

interface PackingItemFormProps {
  projectId: string;
  item?: PackingItemData | null;
  defaultCategory?: string;
  onClose: () => void;
}

const categoryOptions = Object.entries(PACKING_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);
const statusOptions = Object.entries(PACKING_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

export default function PackingItemForm({
  projectId,
  item,
  defaultCategory,
  onClose,
}: PackingItemFormProps) {
  const [category, setCategory] = useState<string | string[]>(
    item?.category || defaultCategory || "WEDDING_WEEKEND"
  );
  const [status, setStatus] = useState<string | string[]>(
    item?.status || "PENDING"
  );

  async function handleSubmit(formData: FormData) {
    formData.set("category", typeof category === "string" ? category : "WEDDING_WEEKEND");
    formData.set("status", typeof status === "string" ? status : "PENDING");

    if (item) {
      formData.set("id", item.id);
      await updatePackingItem(formData);
    } else {
      formData.set("projectId", projectId);
      await createPackingItem(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!item) return;
    const fd = new FormData();
    fd.set("id", item.id);
    await deletePackingItem(fd);
    onClose();
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-5 max-h-[70vh] overflow-y-auto px-1"
    >
      <Input
        name="name"
        label="Name"
        defaultValue={item?.name || ""}
        required
      />

      <ToggleButtonGroup
        label="Kategorie"
        options={categoryOptions}
        value={category}
        onChange={setCategory}
      />

      <Input
        name="personInCharge"
        label="Verantwortlich"
        defaultValue={item?.personInCharge || ""}
      />

      <ToggleButtonGroup
        label="Status"
        options={statusOptions}
        value={status}
        onChange={setStatus}
      />

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          Speichern
        </Button>
        {item && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 text-sm font-medium hover:text-red-600"
          >
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}
