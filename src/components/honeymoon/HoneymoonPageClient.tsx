"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import StatsCard from "@/components/ui/StatsCard";
import ToggleButtonGroup from "@/components/ui/ToggleButtonGroup";
import HoneymoonItemForm from "./HoneymoonItemForm";
import { HONEYMOON_CATEGORY_LABELS, HONEYMOON_STATUS_LABELS } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface HoneymoonItem {
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

interface HoneymoonPageClientProps {
  items: HoneymoonItem[];
  projectId: string;
}

const categoryFilterOptions = [
  { value: "", label: "Alle" },
  ...Object.entries(HONEYMOON_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

const statusFilterOptions = [
  { value: "", label: "Alle" },
  ...Object.entries(HONEYMOON_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

function getCategoryBadgeVariant(category: string): "default" | "success" | "warning" | "danger" | "info" {
  switch (category) {
    case "FLIGHT": return "info";
    case "HOTEL": return "warning";
    case "ACTIVITY": return "success";
    case "TRANSPORT": return "default";
    case "OTHER": return "default";
    default: return "default";
  }
}

function getStatusBadgeVariant(status: string): "default" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "PLANNED": return "warning";
    case "BOOKED": return "info";
    case "DONE": return "success";
    default: return "default";
  }
}

export default function HoneymoonPageClient({ items, projectId }: HoneymoonPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<HoneymoonItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | string[]>("");
  const [filterStatus, setFilterStatus] = useState<string | string[]>("");

  const filteredItems = useMemo(() => {
    const catVal = typeof filterCategory === "string" ? filterCategory : filterCategory[0] || "";
    const statusVal = typeof filterStatus === "string" ? filterStatus : filterStatus[0] || "";
    return items.filter((item) => {
      if (catVal && item.category !== catVal) return false;
      if (statusVal && item.status !== statusVal) return false;
      return true;
    });
  }, [items, filterCategory, filterStatus]);

  // Stats
  const gesamtkosten = items.reduce((sum, i) => sum + (i.cost || 0), 0);
  const geplant = items.filter((i) => i.status === "PLANNED").length;
  const gebucht = items.filter((i) => i.status === "BOOKED").length;
  const erledigt = items.filter((i) => i.status === "DONE").length;

  return (
    <>
      {/* Stats */}
      <Card padding="sm" className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          <StatsCard title="Gesamtkosten" value={formatCurrency(gesamtkosten)} />
          <StatsCard title="Geplant" value={geplant} className="border-l border-border" />
          <StatsCard title="Gebucht" value={gebucht} className="border-l border-border" />
          <StatsCard title="Erledigt" value={erledigt} className="border-l border-border" />
        </div>
      </Card>

      {/* Filters + Add */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <ToggleButtonGroup
          label="Kategorie"
          options={categoryFilterOptions}
          value={filterCategory}
          onChange={setFilterCategory}
        />
        <ToggleButtonGroup
          label="Status"
          options={statusFilterOptions}
          value={filterStatus}
          onChange={setFilterStatus}
        />
        <div className="ml-auto">
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            + Eintrag
          </Button>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              padding="sm"
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setEditingItem(item)}
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* Title & Category */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text truncate">{item.title}</h3>
                    <Badge variant={getCategoryBadgeVariant(item.category)}>
                      {HONEYMOON_CATEGORY_LABELS[item.category as keyof typeof HONEYMOON_CATEGORY_LABELS] || item.category}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                    {item.date && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(item.date)}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.location}
                      </span>
                    )}
                    {item.bookingRef && (
                      <span className="text-xs text-text-faint">Ref: {item.bookingRef}</span>
                    )}
                  </div>
                </div>

                {/* Cost */}
                <div className="text-right">
                  {item.cost != null && (
                    <p className="font-semibold text-text">{formatCurrency(item.cost)}</p>
                  )}
                </div>

                {/* Status */}
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {HONEYMOON_STATUS_LABELS[item.status as keyof typeof HONEYMOON_STATUS_LABELS] || item.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Keine Einträge gefunden." />
      )}

      {/* Modal */}
      <Modal
        open={showForm || !!editingItem}
        onClose={() => { setShowForm(false); setEditingItem(null); }}
        title={editingItem ? "Eintrag bearbeiten" : "Neuer Eintrag"}
      >
        <HoneymoonItemForm
          projectId={projectId}
          item={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      </Modal>
    </>
  );
}
