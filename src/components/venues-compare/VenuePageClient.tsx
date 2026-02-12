"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import { createVenue, updateVenue, updateVenueStatus, deleteVenue, createVenueCostItem, updateVenueCostItem, deleteVenueCostItem } from "@/actions/venue.actions";

// ── Types ─────────────────────────────────────────

interface CostItem {
  id: string;
  name: string;
  amount: number;
  notes: string | null;
}

interface Venue {
  id: string;
  name: string;
  status: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  capacity: number | null;
  imageUrl: string | null;
  pros: string | null;
  notes: string | null;
  visitDate: string | null;
  costItems: CostItem[];
}

interface VenuePageClientProps {
  projectId: string;
  venues: Venue[];
}

// ── Constants ─────────────────────────────────────

type VenueStatus = "IDENTIFIED" | "SHORTLISTED" | "VISITED" | "OFFER_RECEIVED" | "BOOKED" | "NOT_CHOSEN";

const VENUE_STATUS_LABELS: Record<VenueStatus, string> = {
  IDENTIFIED: "Entdeckt",
  SHORTLISTED: "Vorauswahl",
  VISITED: "Besichtigt",
  OFFER_RECEIVED: "Angebot erhalten",
  BOOKED: "Gebucht",
  NOT_CHOSEN: "Nicht gewaehlt",
};

const VENUE_STATUS_ORDER: VenueStatus[] = ["IDENTIFIED", "SHORTLISTED", "VISITED", "OFFER_RECEIVED", "BOOKED", "NOT_CHOSEN"];

const STATUS_COLORS: Record<VenueStatus, string> = {
  IDENTIFIED: "bg-surface-2 text-text-muted",
  SHORTLISTED: "bg-blue-50 text-blue-700",
  VISITED: "bg-indigo-50 text-indigo-700",
  OFFER_RECEIVED: "bg-amber-50 text-amber-700",
  BOOKED: "bg-emerald-50 text-emerald-700",
  NOT_CHOSEN: "bg-surface-2 text-text-muted",
};

const COMPARISON_CRITERIA = [
  { key: "capacity", label: "Kapazitaet", type: "number" as const },
  { key: "totalCost", label: "Gesamtkosten", type: "currency" as const },
  { key: "city", label: "Stadt / Region", type: "text" as const },
  { key: "address", label: "Adresse", type: "text" as const },
  { key: "status", label: "Status", type: "status" as const },
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Main Component ────────────────────────────────

export default function VenuePageClient({ projectId, venues }: VenuePageClientProps) {
  const [view, setView] = useState<"compare" | "list">("compare");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"overview" | "costs" | "notes">("overview");

  const maxReached = venues.length >= 5;

  // Summary
  const bookedVenue = venues.find((v) => v.status === "BOOKED");
  const shortlistedCount = venues.filter((v) => v.status === "SHORTLISTED").length;
  const needsVisit = venues.filter((v) => ["IDENTIFIED", "SHORTLISTED"].includes(v.status)).length;
  const needsOffer = venues.filter((v) => ["VISITED"].includes(v.status)).length;

  const allTotals = useMemo(() =>
    venues.map((v) => ({ id: v.id, total: v.costItems.reduce((s, i) => s + i.amount, 0) })),
    [venues]
  );
  const cheapestId = useMemo(() => {
    const withCost = allTotals.filter((t) => t.total > 0);
    if (withCost.length === 0) return null;
    return withCost.reduce((min, t) => t.total < min.total ? t : min).id;
  }, [allTotals]);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ── Command Bar ────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-text tracking-tight">Locations</h1>
            <p className="text-[13px] text-text-muted mt-0.5">
              Bis zu 5 Locations vergleichen ({venues.length}/5)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-surface-2 rounded-lg p-0.5">
              {(["compare", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 rounded-md text-[13px] font-medium transition-colors ${
                    view === v ? "bg-surface-1 text-text shadow-sm" : "text-text-muted hover:text-text"
                  }`}
                >
                  {v === "compare" ? "Vergleich" : "Liste"}
                </button>
              ))}
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-[13px] text-text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
            >
              PDF
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={maxReached}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              + Location
            </button>
          </div>
        </div>

        {/* Decision Strip */}
        {venues.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap text-[13px]">
            {bookedVenue && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                Gebucht: {bookedVenue.name}
              </span>
            )}
            {shortlistedCount > 0 && (
              <span className="text-blue-600 font-medium">{shortlistedCount} in der Vorauswahl</span>
            )}
            {needsVisit > 0 && (
              <span className="text-text-muted">{needsVisit} Besichtigungen planen</span>
            )}
            {needsOffer > 0 && (
              <span className="text-text-muted">{needsOffer} Angebote anfragen</span>
            )}
          </div>
        )}
      </div>

      {/* ── Two-Pane Layout ────────────────────── */}
      <div className="flex gap-6">
        {/* Left: Main Content */}
        <div className={`flex-1 min-w-0 ${selectedVenue ? "hidden lg:block" : ""}`}>
          {venues.length === 0 ? (
            <div className="bg-surface-1 rounded-2xl shadow-sm p-12 text-center">
              <div className="w-12 h-12 bg-surface-2 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-1">Noch keine Locations</h3>
              <p className="text-sm text-text-muted mb-4">Fügen Sie Ihre erste Location hinzu, um den Vergleich zu starten.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                + Location hinzufügen
              </button>
            </div>
          ) : view === "compare" ? (
            <>
              {/* Scorecards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {venues.map((venue) => {
                  const total = venue.costItems.reduce((s, i) => s + i.amount, 0);
                  const isCheapest = venue.id === cheapestId;
                  const isBooked = venue.status === "BOOKED";
                  const isSelected = selectedVenue?.id === venue.id;

                  return (
                    <div
                      key={venue.id}
                      onClick={() => { setSelectedVenue(venue); setInspectorTab("overview"); }}
                      className={`bg-surface-1 rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        isBooked ? "ring-2 ring-emerald-300" : isSelected ? "ring-2 ring-gray-900" : ""
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-text">{venue.name}</h3>
                          {venue.city && <p className="text-[12px] text-text-faint mt-0.5">{venue.city}</p>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${STATUS_COLORS[venue.status as VenueStatus] || STATUS_COLORS.IDENTIFIED}`}>
                          {VENUE_STATUS_LABELS[venue.status as VenueStatus] || venue.status}
                        </span>
                      </div>

                      {/* Key Metrics */}
                      <div className="flex items-center gap-4 mb-3">
                        {venue.capacity != null && venue.capacity > 0 && (
                          <div>
                            <span className="text-[11px] text-text-faint block">Kapazitaet</span>
                            <span className="text-sm font-semibold text-text">{venue.capacity} Gäste</span>
                          </div>
                        )}
                        <div className="ml-auto text-right">
                          <span className="text-[11px] text-text-faint block">Gesamtkosten</span>
                          <span className={`text-lg font-bold ${isCheapest ? "text-emerald-600" : "text-text"}`}>
                            {total > 0 ? formatCurrency(total) : "—"}
                          </span>
                          {isCheapest && total > 0 && (
                            <span className="block text-[10px] text-emerald-500 font-medium">Guenstigste</span>
                          )}
                        </div>
                      </div>

                      {/* Top 3 Cost Items */}
                      {venue.costItems.length > 0 && (
                        <div className="border-t border-border pt-2 mb-2">
                          {venue.costItems.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex justify-between text-[12px] py-0.5">
                              <span className="text-text-muted">{item.name}</span>
                              <span className="text-text font-medium">{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                          {venue.costItems.length > 3 && (
                            <p className="text-[11px] text-text-faint mt-0.5">+{venue.costItems.length - 3} weitere</p>
                          )}
                        </div>
                      )}

                      {/* Visit date */}
                      {venue.visitDate && (
                        <p className="text-[11px] text-text-faint mt-1">
                          Besichtigung: {formatDate(venue.visitDate)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Comparison Table */}
              {venues.length >= 2 && (
                <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-text">Kriterien-Vergleich</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-5 py-2.5 text-[12px] font-medium text-text-faint uppercase tracking-wider w-40">Kriterium</th>
                          {venues.map((v) => (
                            <th key={v.id} className="text-left px-4 py-2.5 text-[12px] font-semibold text-text">{v.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARISON_CRITERIA.map((criterion) => (
                          <tr key={criterion.key} className="border-b border-border last:border-0">
                            <td className="px-5 py-2.5 text-[13px] text-text-muted font-medium">{criterion.label}</td>
                            {venues.map((v) => {
                              let value = "";
                              const total = v.costItems.reduce((s, i) => s + i.amount, 0);
                              if (criterion.key === "capacity") value = v.capacity ? `${v.capacity} Gäste` : "—";
                              else if (criterion.key === "totalCost") value = total > 0 ? formatCurrency(total) : "—";
                              else if (criterion.key === "city") value = v.city || "—";
                              else if (criterion.key === "address") value = v.address || "—";
                              else if (criterion.key === "status") value = VENUE_STATUS_LABELS[v.status as VenueStatus] || v.status;

                              const isCheapestCell = criterion.key === "totalCost" && v.id === cheapestId && total > 0;

                              return (
                                <td key={v.id} className={`px-4 py-2.5 text-[13px] ${isCheapestCell ? "text-emerald-600 font-semibold" : "text-text"}`}>
                                  {criterion.key === "status" ? (
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${STATUS_COLORS[v.status as VenueStatus] || ""}`}>
                                      {value}
                                    </span>
                                  ) : value}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* List View */
            <div className="space-y-3">
              {venues.map((venue) => {
                const total = venue.costItems.reduce((s, i) => s + i.amount, 0);
                const isBooked = venue.status === "BOOKED";
                return (
                  <div
                    key={venue.id}
                    onClick={() => { setSelectedVenue(venue); setInspectorTab("overview"); }}
                    className={`bg-surface-1 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all ${
                      isBooked ? "ring-2 ring-emerald-300" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-text">{venue.name}</h3>
                          <p className="text-[12px] text-text-faint">{venue.city || venue.address || "Keine Adresse"}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${STATUS_COLORS[venue.status as VenueStatus] || ""}`}>
                          {VENUE_STATUS_LABELS[venue.status as VenueStatus] || venue.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        {venue.capacity != null && venue.capacity > 0 && (
                          <span className="text-text-muted">{venue.capacity} Gäste</span>
                        )}
                        <span className="font-bold text-text">{total > 0 ? formatCurrency(total) : "—"}</span>
                        <svg className="w-4 h-4 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Inspector Panel */}
        {selectedVenue && (
          <VenueInspector
            venue={selectedVenue}
            tab={inspectorTab}
            onTabChange={setInspectorTab}
            onClose={() => setSelectedVenue(null)}
          />
        )}
      </div>

      {/* ── Add Location Modal ─────────────────── */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Neue Location"
      >
        <AddVenueForm projectId={projectId} onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
}

// ── Venue Inspector ───────────────────────────────

function VenueInspector({
  venue,
  tab,
  onTabChange,
  onClose,
}: {
  venue: Venue;
  tab: "overview" | "costs" | "notes";
  onTabChange: (t: "overview" | "costs" | "notes") => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [showCostForm, setShowCostForm] = useState(false);
  const [editingCostItem, setEditingCostItem] = useState<CostItem | null>(null);
  const totalCost = venue.costItems.reduce((s, i) => s + i.amount, 0);
  const isBooked = venue.status === "BOOKED";

  async function handleSave(formData: FormData) {
    setSaving(true);
    formData.set("id", venue.id);
    await updateVenue(formData);
    setSaving(false);
  }

  async function handleStatusChange(newStatus: string) {
    const fd = new FormData();
    fd.set("id", venue.id);
    fd.set("status", newStatus);
    await updateVenueStatus(fd);
  }

  async function handleDelete() {
    const fd = new FormData();
    fd.set("id", venue.id);
    await deleteVenue(fd);
    onClose();
  }

  const tabs = [
    { key: "overview" as const, label: "Details" },
    { key: "costs" as const, label: `Kosten (${venue.costItems.length})` },
    { key: "notes" as const, label: "Notizen" },
  ];

  return (
    <div className="w-80 flex-shrink-0 bg-surface-1 rounded-2xl shadow-sm border border-border sticky top-4 max-h-[calc(100vh-6rem)] overflow-y-auto lg:block hidden">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold text-text">{venue.name}</h2>
            {venue.city && <p className="text-[12px] text-text-faint">{venue.city}</p>}
          </div>
          <button onClick={onClose} className="text-text-faint hover:text-text-muted p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Booked badge */}
        {isBooked && (
          <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Gebucht — Vertrag unterschrieben
          </div>
        )}

        {/* Status Stepper */}
        <div className="mt-3 mb-4">
          <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Status</label>
          <div className="flex flex-wrap gap-1">
            {VENUE_STATUS_ORDER.map((s) => {
              const isCurrent = venue.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    isCurrent
                      ? STATUS_COLORS[s]
                      : "bg-surface-2 text-text-faint hover:bg-surface-2"
                  }`}
                >
                  {VENUE_STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`px-3 py-2 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-gray-900 text-text"
                  : "border-transparent text-text-faint hover:text-text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 pt-4">
        {tab === "overview" && (
          <form action={handleSave} className="space-y-3">
            <input type="hidden" name="status" value={venue.status} />
            <input type="hidden" name="name" value={venue.name} />

            <div>
              <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1 block">Kontakt</label>
              <input name="contactName" defaultValue={venue.contactName || ""} placeholder="Kontaktperson" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 mb-2" />
              <div className="grid grid-cols-2 gap-2">
                <input name="email" type="email" defaultValue={venue.email || ""} placeholder="E-Mail" className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                <input name="phone" defaultValue={venue.phone || ""} placeholder="Telefon" className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              </div>
            </div>

            <input name="website" defaultValue={venue.website || ""} placeholder="Website" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-text-faint block mb-0.5">Stadt</span>
                <input name="city" defaultValue={venue.city || ""} placeholder="z.B. Muenchen" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              </div>
              <div>
                <span className="text-[11px] text-text-faint block mb-0.5">Kapazitaet</span>
                <input name="capacity" type="number" defaultValue={venue.capacity ?? ""} placeholder="Gäste" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              </div>
            </div>

            <input name="address" defaultValue={venue.address || ""} placeholder="Adresse" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />

            <div>
              <span className="text-[11px] text-text-faint block mb-0.5">Besichtigungstermin</span>
              <input name="visitDate" type="date" defaultValue={venue.visitDate ? venue.visitDate.split("T")[0] : ""} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            </div>

            {/* Budget Link */}
            <a
              href="/budget"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-[13px] font-medium hover:bg-amber-100 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v6M6 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Kosten im Budget erfassen
            </a>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
                {saving ? "Speichern..." : "Speichern"}
              </button>
              <button type="button" onClick={handleDelete} className="px-3 py-2 text-red-500 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors">
                Löschen
              </button>
            </div>
          </form>
        )}

        {tab === "costs" && (
          <div className="space-y-3">
            {/* Cost total */}
            <div className="text-center py-3 bg-surface-2 rounded-xl">
              <span className="text-[11px] text-text-faint block">Gesamtkosten</span>
              <span className="text-xl font-bold text-text">{totalCost > 0 ? formatCurrency(totalCost) : "—"}</span>
            </div>

            {/* Cost Items */}
            {venue.costItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 px-2 hover:bg-surface-2 rounded-lg group">
                <div>
                  <span className="text-sm text-text">{item.name}</span>
                  {item.notes && <span className="text-[11px] text-text-faint ml-1.5">({item.notes})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">{formatCurrency(item.amount)}</span>
                  <button onClick={() => setEditingCostItem(item)} className="text-text-faint hover:text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <form action={deleteVenueCostItem} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="text-text-faint hover:text-red-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {venue.costItems.length === 0 && (
              <p className="text-[13px] text-text-faint text-center py-4">Noch keine Kostenpositionen</p>
            )}

            <button
              onClick={() => setShowCostForm(true)}
              className="w-full px-3 py-2 text-[13px] text-text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors border border-dashed border-border"
            >
              + Kostenposition
            </button>

            {/* Cost Item Form Modal */}
            <Modal
              open={showCostForm || !!editingCostItem}
              onClose={() => { setShowCostForm(false); setEditingCostItem(null); }}
              title={editingCostItem ? "Kostenposition bearbeiten" : "Neue Kostenposition"}
            >
              <CostItemForm
                venueOptionId={venue.id}
                item={editingCostItem}
                onClose={() => { setShowCostForm(false); setEditingCostItem(null); }}
              />
            </Modal>
          </div>
        )}

        {tab === "notes" && (
          <form action={handleSave} className="space-y-4">
            <input type="hidden" name="status" value={venue.status} />
            <input type="hidden" name="name" value={venue.name} />

            <div>
              <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Vorteile / Pro</label>
              <textarea
                name="pros"
                rows={4}
                defaultValue={venue.pros || ""}
                placeholder="Ein Vorteil pro Zeile..."
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Notizen</label>
              <textarea
                name="notes"
                rows={4}
                defaultValue={venue.notes || ""}
                placeholder="Allgemeine Notizen..."
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              />
            </div>

            <button type="submit" disabled={saving} className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
              {saving ? "Speichern..." : "Speichern"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Add Venue Form ────────────────────────────────

function AddVenueForm({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  async function handleSubmit(formData: FormData) {
    formData.set("projectId", projectId);
    await createVenue(formData);
    onClose();
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-text mb-1.5 block">Name *</label>
        <input name="name" required placeholder="z.B. Schloss Nymphenburg" autoFocus className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-text mb-1.5 block">Stadt</label>
          <input name="city" placeholder="z.B. Muenchen" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        </div>
        <div>
          <label className="text-sm font-medium text-text mb-1.5 block">Kapazitaet</label>
          <input name="capacity" type="number" placeholder="Gäste" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-text mb-1.5 block">Kontaktperson</label>
        <input name="contactName" placeholder="Ansprechpartner" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input name="email" type="email" placeholder="E-Mail" className="px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        <input name="phone" placeholder="Telefon" className="px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
      </div>

      <input name="website" placeholder="Website" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />

      <button type="submit" className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
        Location hinzufügen
      </button>
    </form>
  );
}

// ── Cost Item Form ────────────────────────────────

function CostItemForm({ venueOptionId, item, onClose }: { venueOptionId: string; item: CostItem | null; onClose: () => void }) {
  async function handleSubmit(formData: FormData) {
    if (item) {
      formData.set("id", item.id);
      await updateVenueCostItem(formData);
    } else {
      formData.set("venueOptionId", venueOptionId);
      await createVenueCostItem(formData);
    }
    onClose();
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input name="name" required defaultValue={item?.name || ""} placeholder="z.B. Saalmiete" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
      <input name="amount" type="number" step="0.01" required defaultValue={item?.amount ?? ""} placeholder="Betrag in EUR" className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
      <textarea name="notes" rows={2} defaultValue={item?.notes || ""} placeholder="Notizen..." className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
      <button type="submit" className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
        Speichern
      </button>
    </form>
  );
}
