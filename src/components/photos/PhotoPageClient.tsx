"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ToggleButtonGroup from "@/components/ui/ToggleButtonGroup";
import PhotoForm from "./PhotoForm";
import { PHOTO_CATEGORY_LABELS } from "@/types";

interface Photo {
  id: string;
  title: string | null;
  url: string;
  description: string | null;
  category: string;
}

interface PhotoPageClientProps {
  photos: Photo[];
  projectId: string;
}

const categoryFilterOptions = [
  { value: "", label: "Alle" },
  ...Object.entries(PHOTO_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

function getCategoryBadgeVariant(category: string): "default" | "success" | "warning" | "danger" | "info" {
  switch (category) {
    case "ENGAGEMENT": return "warning";
    case "CEREMONY": return "success";
    case "RECEPTION": return "info";
    case "OTHER": return "default";
    default: return "default";
  }
}

export default function PhotoPageClient({ photos, projectId }: PhotoPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | string[]>("");

  const filteredPhotos = useMemo(() => {
    const catVal = typeof filterCategory === "string" ? filterCategory : filterCategory[0] || "";
    if (!catVal) return photos;
    return photos.filter((p) => p.category === catVal);
  }, [photos, filterCategory]);

  return (
    <>
      {/* Filter + Add */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <ToggleButtonGroup
          label="Kategorie filtern"
          options={categoryFilterOptions}
          value={filterCategory}
          onChange={setFilterCategory}
        />
        <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
          + Foto
        </Button>
      </div>

      {/* Gallery Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setEditingPhoto(photo)}
              className="group relative bg-surface-1 rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] relative bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.title || "Foto"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".placeholder")) {
                      const placeholder = document.createElement("div");
                      placeholder.className = "placeholder absolute inset-0 flex items-center justify-center text-text-faint";
                      placeholder.innerHTML = `<svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-end justify-between">
                  <p className="text-white font-medium text-sm truncate">
                    {photo.title || "Ohne Titel"}
                  </p>
                  <Badge variant={getCategoryBadgeVariant(photo.category)} className="ml-2 shrink-0">
                    {PHOTO_CATEGORY_LABELS[photo.category as keyof typeof PHOTO_CATEGORY_LABELS] || photo.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Keine Fotos gefunden."
          action={
            <Button size="sm" onClick={() => setShowForm(true)}>
              + Foto hinzufügen
            </Button>
          }
        />
      )}

      {/* Modal */}
      <Modal
        open={showForm || !!editingPhoto}
        onClose={() => { setShowForm(false); setEditingPhoto(null); }}
        title={editingPhoto ? "Foto bearbeiten" : "Neues Foto"}
      >
        <PhotoForm
          projectId={projectId}
          photo={editingPhoto}
          onClose={() => { setShowForm(false); setEditingPhoto(null); }}
        />
      </Modal>
    </>
  );
}
