"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ToggleButtonGroup from "@/components/ui/ToggleButtonGroup";
import { createPhoto, updatePhoto, deletePhoto } from "@/actions/photo.actions";
import { PHOTO_CATEGORY_LABELS } from "@/types";

interface PhotoData {
  id: string;
  title: string | null;
  url: string;
  description: string | null;
  category: string;
}

interface PhotoFormProps {
  projectId: string;
  photo?: PhotoData | null;
  onClose: () => void;
}

const categoryOptions = Object.entries(PHOTO_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

export default function PhotoForm({ projectId, photo, onClose }: PhotoFormProps) {
  const [category, setCategory] = useState<string | string[]>(photo?.category || "OTHER");

  async function handleSubmit(formData: FormData) {
    formData.set("category", typeof category === "string" ? category : category[0] || "OTHER");

    if (photo) {
      formData.set("id", photo.id);
      await updatePhoto(formData);
    } else {
      formData.set("projectId", projectId);
      await createPhoto(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!photo) return;
    const fd = new FormData();
    fd.set("id", photo.id);
    await deletePhoto(fd);
    onClose();
  }

  return (
    <form action={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
      <Input
        name="title"
        label="Titel"
        defaultValue={photo?.title || ""}
      />

      <Input
        name="url"
        label="URL"
        placeholder="https://..."
        defaultValue={photo?.url || ""}
        required
      />

      <ToggleButtonGroup
        label="Kategorie"
        options={categoryOptions}
        value={category}
        onChange={setCategory}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Beschreibung</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={photo?.description || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-yellow-50 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
        />
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          Speichern
        </Button>
        {photo && (
          <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-medium hover:text-red-600">
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}
