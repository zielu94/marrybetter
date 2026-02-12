"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ProgressBar from "@/components/ui/ProgressBar";
import PackingItemForm from "./PackingItemForm";
import { togglePackingStatus } from "@/actions/packing.actions";
import {
  PACKING_CATEGORY_LABELS,
  PACKING_STATUS_LABELS,
  type PackingStatus,
  type PackingCategory,
} from "@/types";

interface PackingItem {
  id: string;
  name: string;
  category: string;
  personInCharge: string | null;
  status: string;
}

interface PackingPageClientProps {
  items: PackingItem[];
  projectId: string;
}

function getStatusBadgeVariant(
  status: string
): "default" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "DONE":
      return "success";
    case "PACKED":
      return "info";
    default:
      return "default";
  }
}

function CheckboxIcon({ status }: { status: string }) {
  if (status === "DONE") {
    return (
      <svg
        className="w-5 h-5 text-green-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  if (status === "PACKED") {
    return (
      <svg
        className="w-5 h-5 text-blue-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  }
  return (
    <svg
      className="w-5 h-5 text-text-faint"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </svg>
  );
}

export default function PackingPageClient({
  items,
  projectId,
}: PackingPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [addCategory, setAddCategory] = useState<string | undefined>(undefined);

  const weddingItems = useMemo(
    () => items.filter((i) => i.category === "WEDDING_WEEKEND"),
    [items]
  );
  const honeymoonItems = useMemo(
    () => items.filter((i) => i.category === "HONEYMOON"),
    [items]
  );

  function getProgress(categoryItems: PackingItem[]) {
    const total = categoryItems.length;
    const done = categoryItems.filter(
      (i) => i.status === "PACKED" || i.status === "DONE"
    ).length;
    return { done, total };
  }

  const weddingProgress = getProgress(weddingItems);
  const honeymoonProgress = getProgress(honeymoonItems);

  async function handleToggle(itemId: string) {
    const fd = new FormData();
    fd.set("id", itemId);
    await togglePackingStatus(fd);
  }

  function renderSection(
    label: string,
    categoryItems: PackingItem[],
    progress: { done: number; total: number },
    categoryKey: string
  ) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">{label}</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setAddCategory(categoryKey);
              setShowForm(true);
            }}
          >
            + Item hinzufügen
          </Button>
        </div>

        {progress.total > 0 && (
          <div className="mb-4">
            <ProgressBar value={progress.done} max={progress.total} />
            <p className="text-xs text-text-muted mt-1">
              {progress.done} von {progress.total} eingepackt
            </p>
          </div>
        )}

        <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden">
          {categoryItems.length > 0 ? (
            <div className="divide-y divide-border">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors"
                >
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="flex-shrink-0"
                  >
                    <CheckboxIcon status={item.status} />
                  </button>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="flex-1 flex items-center justify-between text-left min-w-0"
                  >
                    <span
                      className={`text-sm font-medium truncate ${
                        item.status === "DONE"
                          ? "text-text-faint line-through"
                          : "text-text"
                      }`}
                    >
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {item.personInCharge && (
                        <span className="text-xs text-text-faint">
                          {item.personInCharge}
                        </span>
                      )}
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {PACKING_STATUS_LABELS[item.status as PackingStatus] ||
                          item.status}
                      </Badge>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Noch keine Items vorhanden."
              description="Füge dein erstes Item hinzu."
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {renderSection(
        PACKING_CATEGORY_LABELS.WEDDING_WEEKEND,
        weddingItems,
        weddingProgress,
        "WEDDING_WEEKEND"
      )}
      {renderSection(
        PACKING_CATEGORY_LABELS.HONEYMOON,
        honeymoonItems,
        honeymoonProgress,
        "HONEYMOON"
      )}

      {/* Form Modal */}
      <Modal
        open={showForm || !!editingItem}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
          setAddCategory(undefined);
        }}
        title={editingItem ? "Item bearbeiten" : "Item hinzufügen"}
      >
        <PackingItemForm
          projectId={projectId}
          item={editingItem}
          defaultCategory={addCategory}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
            setAddCategory(undefined);
          }}
        />
      </Modal>
    </>
  );
}
