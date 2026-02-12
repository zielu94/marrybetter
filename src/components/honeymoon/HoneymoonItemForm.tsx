"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ToggleButtonGroup from "@/components/ui/ToggleButtonGroup";
import { createHoneymoonItem, updateHoneymoonItem, deleteHoneymoonItem } from "@/actions/honeymoon.actions";
import { HONEYMOON_CATEGORY_LABELS, HONEYMOON_STATUS_LABELS } from "@/types";

interface HoneymoonItemData {
  id: string;
  title: string;
  category: string;
  date: string | Date | null;
  location: string | null;
  bookingRef: string | null;
  cost: number | null;
  status: string;
  notes: string | null;
}

interface HoneymoonItemFormProps {
  projectId: string;
  item?: HoneymoonItemData | null;
  onClose: () => void;
}

const categoryOptions = Object.entries(HONEYMOON_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(HONEYMOON_STATUS_LABELS).map(([value, label]) => ({ value, label }));

function formatDateForInput(date: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

export default function HoneymoonItemForm({ projectId, item, onClose }: HoneymoonItemFormProps) {
  const [category, setCategory] = useState<string | string[]>(item?.category || "ACTIVITY");
  const [status, setStatus] = useState<string | string[]>(item?.status || "PLANNED");

  async function handleSubmit(formData: FormData) {
    formData.set("category", typeof category === "string" ? category : category[0] || "ACTIVITY");
    formData.set("status", typeof status === "string" ? status : status[0] || "PLANNED");

    if (item) {
      formData.set("id", item.id);
      await updateHoneymoonItem(formData);
    } else {
      formData.set("projectId", projectId);
      await createHoneymoonItem(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!item) return;
    const fd = new FormData();
    fd.set("id", item.id);
    await deleteHoneymoonItem(fd);
    onClose();
  }

  return (
    <form action={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
      <Input
        name="title"
        label="Titel"
        defaultValue={item?.title || ""}
        required
      />

      <ToggleButtonGroup
        label="Kategorie"
        options={categoryOptions}
        value={category}
        onChange={setCategory}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="date"
          label="Datum"
          type="date"
          defaultValue={formatDateForInput(item?.date ?? null)}
        />
        <Input
          name="location"
          label="Ort"
          defaultValue={item?.location || ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="bookingRef"
          label="Buchungsreferenz"
          defaultValue={item?.bookingRef || ""}
        />
        <Input
          name="cost"
          label="Kosten (EUR)"
          type="number"
          step="0.01"
          min="0"
          defaultValue={item?.cost ?? ""}
        />
      </div>

      <ToggleButtonGroup
        label="Status"
        options={statusOptions}
        value={status}
        onChange={setStatus}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Notizen</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={item?.notes || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-yellow-50 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
        />
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          Speichern
        </Button>
        {item && (
          <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-medium hover:text-red-600">
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}
