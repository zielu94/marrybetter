"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import { createVendor, updateVendor, updateVendorStatus, deleteVendor } from "@/actions/vendor.actions";
import {
  VENDOR_CATEGORY_LABELS,
  VENDOR_STATUS_LABELS,
  VENDOR_STATUS_ORDER,
  type VendorCategory,
  type VendorStatus,
} from "@/types";

// ── Types ─────────────────────────────────────────

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: string;
  estimatedCost: number | null;
  actualCost: number | null;
  nextAction: string | null;
  meetingDate: string | null;
  notes: string | null;
}

interface VendorPageClientProps {
  vendors: Vendor[];
  projectId: string;
}

// ── Constants ─────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  LOCATION: "bg-rose-50 text-rose-700",
  FOTO_VIDEO: "bg-blue-50 text-blue-700",
  MUSIK_DJ: "bg-purple-50 text-purple-700",
  FLORISTIK: "bg-emerald-50 text-emerald-700",
  CATERING: "bg-amber-50 text-amber-700",
  STYLING: "bg-pink-50 text-pink-700",
  PAPETERIE: "bg-indigo-50 text-indigo-700",
  DEKO_VERLEIH: "bg-teal-50 text-teal-700",
  TRANSPORT: "bg-surface-2 text-text-muted",
  UNTERKUNFT: "bg-cyan-50 text-cyan-700",
  TRAUREDNER: "bg-orange-50 text-orange-700",
  SONSTIGES: "bg-surface-2 text-text-muted",
};

const COLUMN_COLORS: Partial<Record<VendorStatus, { dot: string; bg: string }>> = {
  BOOKED: { dot: "bg-emerald-500", bg: "bg-emerald-50" },
  NOT_CHOSEN: { dot: "bg-text-faint", bg: "bg-surface-2" },
};

const NEXT_ACTION_SUGGESTIONS: Record<string, string> = {
  IDENTIFIED: "E-Mail senden",
  CONTACTED: "Antwort abwarten",
  OFFER_RECEIVED: "Angebot prüfen",
  BOOKED: "Vertrag prüfen",
  NOT_CHOSEN: "",
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Main Component ────────────────────────────────

export default function VendorPageClient({ vendors, projectId }: VendorPageClientProps) {
  const [filterCategory, setFilterCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [draggedVendorId, setDraggedVendorId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  // Filter
  const filteredVendors = useMemo(() => {
    if (!filterCategory) return vendors;
    return vendors.filter((v) => v.category === filterCategory);
  }, [vendors, filterCategory]);

  const vendorsByStatus = useMemo(() => {
    const grouped: Record<string, Vendor[]> = {};
    for (const status of VENDOR_STATUS_ORDER) {
      grouped[status] = filteredVendors.filter((v) => v.status === status);
    }
    return grouped;
  }, [filteredVendors]);

  // Summary counts
  const bookedCount = vendors.filter((v) => v.status === "BOOKED").length;
  const activeCount = vendors.filter((v) => !["BOOKED", "NOT_CHOSEN"].includes(v.status)).length;
  const totalCost = vendors.reduce((s, v) => s + (v.actualCost || v.estimatedCost || 0), 0);

  // Active categories for filter chips
  const activeCategories = useMemo(() => {
    const cats = new Set(vendors.map((v) => v.category));
    return Array.from(cats).sort();
  }, [vendors]);

  // Drag handlers
  function handleDragStart(vendorId: string) {
    setDraggedVendorId(vendorId);
  }
  function handleDragOver(e: React.DragEvent, status: string) {
    e.preventDefault();
    setDragOverStatus(status);
  }
  function handleDragLeave() {
    setDragOverStatus(null);
  }
  async function handleDrop(targetStatus: string) {
    if (!draggedVendorId) return;
    const vendor = vendors.find((v) => v.id === draggedVendorId);
    if (!vendor || vendor.status === targetStatus) {
      setDraggedVendorId(null);
      setDragOverStatus(null);
      return;
    }
    const fd = new FormData();
    fd.set("id", draggedVendorId);
    fd.set("status", targetStatus);
    await updateVendorStatus(fd);
    setDraggedVendorId(null);
    setDragOverStatus(null);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ── Command Bar ────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-text tracking-tight">Dienstleister</h1>
            <p className="text-[13px] text-text-muted mt-0.5">
              {bookedCount > 0 && <span className="text-emerald-600 font-medium">{bookedCount} gebucht</span>}
              {bookedCount > 0 && activeCount > 0 && <span className="mx-1.5 text-text-faint">·</span>}
              {activeCount > 0 && <span>{activeCount} in Bearbeitung</span>}
              {(bookedCount > 0 || activeCount > 0) && totalCost > 0 && <span className="mx-1.5 text-text-faint">·</span>}
              {totalCost > 0 && <span>{formatCurrency(totalCost)} gesamt</span>}
              {vendors.length === 0 && <span>Noch keine Dienstleister hinzugefuegt</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-[13px] text-text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
            >
              PDF
            </button>
            <button
              onClick={() => { setShowAddModal(true); setAddStep(1); }}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              + Dienstleister
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory("")}
            className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
              filterCategory === ""
                ? "bg-gray-900 text-white"
                : "bg-surface-2 text-text-muted hover:bg-border"
            }`}
          >
            Alle
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? "" : cat)}
              className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-gray-900 text-white"
                  : "bg-surface-2 text-text-muted hover:bg-border"
              }`}
            >
              {VENDOR_CATEGORY_LABELS[cat as VendorCategory] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-Pane Layout ────────────────────── */}
      <div className="flex gap-6">
        {/* Left: Kanban Board */}
        <div className={`flex-1 overflow-x-auto ${selectedVendor ? "hidden lg:block" : ""}`}>
          <div className="flex gap-3 pb-4 min-w-max">
            {VENDOR_STATUS_ORDER.map((status) => {
              const statusVendors = vendorsByStatus[status] || [];
              const colColor = COLUMN_COLORS[status];
              const isDragOver = dragOverStatus === status;

              return (
                <div
                  key={status}
                  className={`flex-shrink-0 w-52 rounded-2xl transition-colors ${
                    isDragOver ? "bg-blue-50 ring-2 ring-blue-200" : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(status)}
                >
                  {/* Column Header */}
                  <div className={`rounded-xl px-3 py-2.5 mb-2 ${colColor?.bg || "bg-surface-2/80"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colColor?.dot || "bg-text-faint"}`} />
                      <h3 className="text-[13px] font-semibold text-text-muted tracking-wide">
                        {VENDOR_STATUS_LABELS[status]}
                      </h3>
                      <span className="ml-auto text-[12px] text-text-faint font-medium">{statusVendors.length}</span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 min-h-[60px]">
                    {statusVendors.map((vendor) => {
                      const catColor = CATEGORY_COLORS[vendor.category] || CATEGORY_COLORS.SONSTIGES;
                      const cost = vendor.actualCost || vendor.estimatedCost;
                      const isSelected = selectedVendor?.id === vendor.id;

                      return (
                        <div
                          key={vendor.id}
                          draggable
                          onDragStart={() => handleDragStart(vendor.id)}
                          onClick={() => setSelectedVendor(vendor)}
                          className={`bg-surface-1 rounded-xl p-3 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? "ring-2 ring-gray-900 shadow-md" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-sm font-semibold text-text leading-tight">{vendor.name}</span>
                            {cost != null && cost > 0 && (
                              <span className="text-[12px] text-text-muted font-medium whitespace-nowrap">
                                {formatCurrency(cost)}
                              </span>
                            )}
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${catColor}`}>
                            {VENDOR_CATEGORY_LABELS[vendor.category as VendorCategory] || vendor.category}
                          </span>
                          {vendor.nextAction && (
                            <p className="mt-1.5 text-[12px] text-text-faint flex items-center gap-1">
                              <span className="text-text-faint">&#8250;</span>
                              {vendor.nextAction}
                            </p>
                          )}
                          {vendor.meetingDate && (
                            <p className="mt-1 text-[11px] text-text-faint">
                              Termin: {formatDate(vendor.meetingDate)}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Empty state */}
                    {statusVendors.length === 0 && (
                      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                        <p className="text-[12px] text-text-faint">
                          Dienstleister hierher ziehen
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspector Panel */}
        {selectedVendor && (
          <VendorInspector
            vendor={selectedVendor}
            onClose={() => setSelectedVendor(null)}
          />
        )}
      </div>

      {/* ── Add Vendor Modal (Progressive) ────── */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setAddStep(1); }}
        title={addStep === 1 ? "Dienstleister hinzufügen" : "Details (optional)"}
      >
        <AddVendorForm
          projectId={projectId}
          step={addStep}
          onNextStep={() => setAddStep(2)}
          onClose={() => { setShowAddModal(false); setAddStep(1); }}
        />
      </Modal>
    </div>
  );
}

// ── Vendor Inspector ──────────────────────────────

function VendorInspector({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const statusIdx = VENDOR_STATUS_ORDER.indexOf(vendor.status as VendorStatus);

  async function handleSave(formData: FormData) {
    setSaving(true);
    formData.set("id", vendor.id);
    formData.set("category", vendor.category);
    await updateVendor(formData);
    setSaving(false);
  }

  async function handleDelete() {
    const fd = new FormData();
    fd.set("id", vendor.id);
    await deleteVendor(fd);
    onClose();
  }

  async function handleStatusChange(newStatus: string) {
    const fd = new FormData();
    fd.set("id", vendor.id);
    fd.set("status", newStatus);
    await updateVendorStatus(fd);
  }

  const catColor = CATEGORY_COLORS[vendor.category] || CATEGORY_COLORS.SONSTIGES;

  return (
    <div className="w-80 flex-shrink-0 bg-surface-1 rounded-2xl shadow-sm border border-border p-5 sticky top-4 max-h-[calc(100vh-6rem)] overflow-y-auto lg:block hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-text">{vendor.name}</h2>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${catColor}`}>
            {VENDOR_CATEGORY_LABELS[vendor.category as VendorCategory] || vendor.category}
          </span>
        </div>
        <button onClick={onClose} className="text-text-faint hover:text-text-muted p-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Status Stepper */}
      <div className="mb-5">
        <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-2 block">Status</label>
        <div className="flex flex-wrap gap-1">
          {VENDOR_STATUS_ORDER.map((s, i) => {
            const isCurrent = vendor.status === s;
            const isPast = i < statusIdx;
            const isBooked = s === "BOOKED";
            const isNotChosen = s === "NOT_CHOSEN";

            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  isCurrent
                    ? isBooked
                      ? "bg-emerald-100 text-emerald-800"
                      : isNotChosen
                        ? "bg-border text-text-muted"
                        : "bg-gray-900 text-white"
                    : isPast
                      ? "bg-surface-2 text-text-muted"
                      : "bg-surface-2 text-text-faint hover:bg-surface-2"
                }`}
              >
                {VENDOR_STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Form */}
      <form action={handleSave} className="space-y-4">
        <input type="hidden" name="status" value={vendor.status} />

        {/* Contact */}
        <div>
          <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Kontakt</label>
          <input
            name="contactName"
            defaultValue={vendor.contactName || ""}
            placeholder="Kontaktperson"
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 mb-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="email"
              type="email"
              defaultValue={vendor.email || ""}
              placeholder="E-Mail"
              className="px-3 py-2 rounded-lg border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            <input
              name="phone"
              defaultValue={vendor.phone || ""}
              placeholder="Telefon"
              className="px-3 py-2 rounded-lg border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        <input
          name="website"
          defaultValue={vendor.website || ""}
          placeholder="Website"
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />

        {/* Name (hidden since shown in header, but needed for form) */}
        <input type="hidden" name="name" value={vendor.name} />

        {/* Costs */}
        <div>
          <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Kosten</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-text-faint block mb-0.5">Geschaetzt</span>
              <input
                name="estimatedCost"
                type="number"
                step="0.01"
                defaultValue={vendor.estimatedCost ?? ""}
                placeholder="0,00"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div>
              <span className="text-[11px] text-text-faint block mb-0.5">Tatsaechlich</span>
              <input
                name="actualCost"
                type="number"
                step="0.01"
                defaultValue={vendor.actualCost ?? ""}
                placeholder="0,00"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
        </div>

        {/* Next Action */}
        <div>
          <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Nächster Schritt</label>
          <input
            name="nextAction"
            defaultValue={vendor.nextAction || ""}
            placeholder={NEXT_ACTION_SUGGESTIONS[vendor.status] || "z.B. Angebot prüfen"}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        {/* Meeting Date */}
        <div>
          <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Termin</label>
          <input
            name="meetingDate"
            type="date"
            defaultValue={vendor.meetingDate ? vendor.meetingDate.split("T")[0] : ""}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Notizen</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={vendor.notes || ""}
            placeholder="Notizen zu diesem Dienstleister..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
          />
        </div>

        {/* Budget Link */}
        <a
          href="/budget"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-[13px] font-medium hover:bg-amber-100 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v6M6 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Kosten im Budget erfassen
        </a>

        {/* Save & Delete */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 text-red-500 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors"
          >
            Löschen
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Add Vendor Form (Progressive 2-Step) ──────────

function AddVendorForm({
  projectId,
  step,
  onNextStep,
  onClose,
}: {
  projectId: string;
  step: number;
  onNextStep: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("IDENTIFIED");

  async function handleSubmitStep1() {
    if (!name || !category) return;
    onNextStep();
  }

  async function handleFinalSubmit(formData: FormData) {
    formData.set("projectId", projectId);
    formData.set("name", name);
    formData.set("category", category);
    formData.set("status", status);
    await createVendor(formData);
    onClose();
  }

  async function handleQuickSave() {
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("name", name);
    fd.set("category", category);
    fd.set("status", status);
    await createVendor(fd);
    onClose();
  }

  if (step === 1) {
    return (
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-text-muted mb-1.5 block">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Studio Lichtblick"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            autoFocus
          />
        </div>

        {/* Category Grid */}
        <div>
          <label className="text-sm font-medium text-text-muted mb-2 block">Kategorie *</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(VENDOR_CATEGORY_LABELS).map(([value, label]) => {
              const isSelected = category === value;
              const catColor = CATEGORY_COLORS[value] || "";
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition-all ${
                    isSelected
                      ? "bg-gray-900 text-white ring-2 ring-gray-900"
                      : `${catColor || "bg-surface-2 text-text-muted"} hover:ring-2 hover:ring-border`
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-text-muted mb-2 block">Status</label>
          <div className="flex flex-wrap gap-1.5">
            {VENDOR_STATUS_ORDER.filter((s) => s !== "NOT_CHOSEN").map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  status === s
                    ? "bg-gray-900 text-white"
                    : "bg-surface-2 text-text-muted hover:bg-border"
                }`}
              >
                {VENDOR_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleQuickSave}
            disabled={!name || !category}
            className="flex-1 px-4 py-2.5 bg-surface-2 text-text-muted text-sm font-medium rounded-xl hover:bg-border transition-colors disabled:opacity-40"
          >
            Jetzt speichern
          </button>
          <button
            type="button"
            onClick={handleSubmitStep1}
            disabled={!name || !category}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            Weiter mit Details
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Optional details
  return (
    <form action={handleFinalSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-text">{name}</span>
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${CATEGORY_COLORS[category] || ""}`}>
          {VENDOR_CATEGORY_LABELS[category as VendorCategory] || category}
        </span>
      </div>

      <input
        name="contactName"
        placeholder="Kontaktperson"
        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          name="email"
          type="email"
          placeholder="E-Mail"
          className="px-4 py-3 rounded-xl border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
        <input
          name="phone"
          placeholder="Telefon"
          className="px-4 py-3 rounded-xl border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
      </div>

      <input
        name="website"
        placeholder="Website"
        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          name="estimatedCost"
          type="number"
          step="0.01"
          placeholder="Geschätzte Kosten"
          className="px-4 py-3 rounded-xl border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
        <input
          name="actualCost"
          type="number"
          step="0.01"
          placeholder="Angebotspreis"
          className="px-4 py-3 rounded-xl border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
      </div>

      <textarea
        name="notes"
        rows={2}
        placeholder="Notizen..."
        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
      />

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          Speichern
        </button>
      </div>
    </form>
  );
}
