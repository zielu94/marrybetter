"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Modal from "@/components/ui/Modal";
import AddGuestWizard from "@/components/guests/AddGuestWizard";
import type { GuestWizardData } from "@/components/guests/AddGuestWizard";
import {
  createGuest,
  createGuestWizard,
  updateGuest,
  updateGuestStatus,
  updateRsvpStatus,
  deleteGuest,
  toggleInviteSent,
  bulkUpdateGuestStatus,
  bulkMarkInviteSent,
  createHousehold,
  removeFromHousehold,
  importGuestsFromCSV,
} from "@/actions/guest.actions";
import {
  GUEST_SOURCE_LABELS,
  GUEST_CATEGORY_LABELS,
  GUEST_ROLE_LABELS,
  GUEST_AGE_LABELS,
  GUEST_DIET_LABELS,
  GUEST_STATUS_LABELS,
  GUEST_TYPE_LABELS,
  RSVP_STATUS_LABELS,
} from "@/types";
import type { GuestSource, GuestCategory, GuestRole, GuestAge, GuestDiet, GuestStatus, GuestType, RsvpStatus } from "@/types";

// ── Types ─────────────────────────────────────────

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  source: string | null;
  category: string | null;
  role: string | null;
  age: string | null;
  diet: string | null;
  mealType: string;
  allergiesNote: string | null;
  status: string;
  rsvpStatus: string;
  guestType: string;
  tableNumber: number | null;
  notes: string | null;
  inviteSent: boolean;
  isWeddingParty: boolean;
  seatingTableName: string | null;
  householdId: string | null;
  householdName: string | null;
}

interface Household {
  id: string;
  name: string;
  guestIds: string[];
}

interface GuestPageClientProps {
  guests: Guest[];
  projectId: string;
  households: Household[];
}

// ── Constants ─────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  CONFIRMED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  DECLINED: "bg-surface-2 text-text-muted",
};

const RSVP_COLORS: Record<string, string> = {
  NOT_SENT: "bg-surface-2 text-text-faint",
  INVITED: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  ATTENDING: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  DECLINED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  MAYBE: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
};

const DIET_ICONS: Record<string, string> = {
  VEGAN: "\uD83C\uDF31",
  VEGETARIAN: "\uD83E\uDD66",
  PESCATARIAN: "\uD83D\uDC1F",
  GLUTEN_FREE: "\uD83C\uDF3E",
  NUT_FREE: "\uD83E\uDD5C",
  DAIRY_FREE: "\uD83E\uDD5B",
  FLEXITARIAN: "\uD83C\uDF7D\uFE0F",
  OTHER: "\u2753",
};

// ── Column Config ─────────────────────────────────

type ColumnKey = "rsvp" | "type" | "household" | "category" | "diet" | "table" | "contact" | "weddingParty";

interface ColumnDef {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: "rsvp", label: "RSVP", defaultVisible: true },
  { key: "type", label: "Typ", defaultVisible: true },
  { key: "household", label: "Haushalt", defaultVisible: true },
  { key: "category", label: "Gruppe", defaultVisible: true },
  { key: "diet", label: "Ernährung", defaultVisible: true },
  { key: "table", label: "Tisch", defaultVisible: true },
  { key: "contact", label: "Kontakt", defaultVisible: false },
  { key: "weddingParty", label: "Hochzeitsgesellschaft", defaultVisible: false },
];

// ── Main Component ────────────────────────────────

export default function GuestPageClient({ guests, projectId, households }: GuestPageClientProps) {
  // UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [householdName, setHouseholdName] = useState("");

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(() =>
    new Set(ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key))
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // CSV Import
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDiet, setFilterDiet] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const [filterInviteSent, setFilterInviteSent] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("");
  const [filterGuestType, setFilterGuestType] = useState("");
  const [filterHousehold, setFilterHousehold] = useState("");

  // ── Computed ───────────────────────────────────

  const stats = useMemo(() => {
    const total = guests.length;
    const confirmed = guests.filter((g) => g.status === "CONFIRMED").length;
    const declined = guests.filter((g) => g.status === "DECLINED").length;
    const pending = guests.filter((g) => g.status === "PENDING").length;
    const invitesSent = guests.filter((g) => g.inviteSent).length;
    const rsvpRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
    // RSVP stats
    const rsvpAttending = guests.filter((g) => g.rsvpStatus === "ATTENDING").length;
    const rsvpDeclined = guests.filter((g) => g.rsvpStatus === "DECLINED").length;
    const rsvpMaybe = guests.filter((g) => g.rsvpStatus === "MAYBE").length;
    const rsvpInvited = guests.filter((g) => g.rsvpStatus === "INVITED").length;
    const rsvpNotSent = guests.filter((g) => g.rsvpStatus === "NOT_SENT").length;
    // Household stats
    const householdCount = households.length;
    const weddingParty = guests.filter((g) => g.isWeddingParty).length;
    return { total, confirmed, declined, pending, invitesSent, rsvpRate, rsvpAttending, rsvpDeclined, rsvpMaybe, rsvpInvited, rsvpNotSent, householdCount, weddingParty };
  }, [guests, households]);

  // Action center items
  const actionItems = useMemo(() => {
    const items: { label: string; count: number; action: string; color: string }[] = [];
    const pendingRsvp = guests.filter((g) => g.status === "PENDING" && g.inviteSent).length;
    if (pendingRsvp > 0) items.push({ label: "RSVP ausstehend", count: pendingRsvp, action: "Nachfassen", color: "bg-amber-50 text-amber-700 border-amber-100" });
    const missingAddress = guests.filter((g) => !g.address && g.status !== "DECLINED").length;
    if (missingAddress > 0) items.push({ label: "Adresse fehlt", count: missingAddress, action: "Anfragen", color: "bg-blue-50 text-blue-700 border-blue-100" });
    const missingDiet = guests.filter((g) => !g.diet && g.status === "CONFIRMED").length;
    if (missingDiet > 0) items.push({ label: "Essenswunsch fehlt", count: missingDiet, action: "Erfragen", color: "bg-purple-50 text-purple-700 border-purple-100" });
    const notSeated = guests.filter((g) => !g.seatingTableName && g.status === "CONFIRMED").length;
    if (notSeated > 0) items.push({ label: "Nicht platziert", count: notSeated, action: "Sitzplan", color: "bg-rose-50 text-rose-700 border-rose-100" });
    const notInvited = guests.filter((g) => !g.inviteSent).length;
    if (notInvited > 0) items.push({ label: "Nicht eingeladen", count: notInvited, action: "Einladen", color: "bg-slate-50 text-slate-600 border-slate-100" });
    return items;
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (statusFilter !== "ALL" && g.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = `${g.firstName} ${g.lastName}`.toLowerCase();
        const email = (g.email || "").toLowerCase();
        const household = (g.householdName || "").toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !household.includes(q)) return false;
      }
      if (filterCategory && g.category !== filterCategory) return false;
      if (filterRole && g.role !== filterRole) return false;
      if (filterDiet && (!g.diet || !g.diet.includes(filterDiet))) return false;
      if (filterSource && g.source !== filterSource) return false;
      if (filterAge && g.age !== filterAge) return false;
      if (filterInviteSent === "true" && !g.inviteSent) return false;
      if (filterInviteSent === "false" && g.inviteSent) return false;
      if (filterRsvp && g.rsvpStatus !== filterRsvp) return false;
      if (filterGuestType && g.guestType !== filterGuestType) return false;
      if (filterHousehold && g.householdId !== filterHousehold) return false;
      return true;
    });
  }, [guests, statusFilter, searchQuery, filterCategory, filterRole, filterDiet, filterSource, filterAge, filterInviteSent, filterRsvp, filterGuestType, filterHousehold]);

  const selectedGuest = useMemo(() => guests.find((g) => g.id === selectedId) ?? null, [guests, selectedId]);

  const hasActiveFilters = filterCategory || filterRole || filterDiet || filterSource || filterAge || filterInviteSent || filterRsvp || filterGuestType || filterHousehold;

  // ── Handlers ──────────────────────────────────

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === filteredGuests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map((g) => g.id)));
    }
  }, [filteredGuests, selectedIds.size]);

  function getNextAction(g: Guest): { label: string; color: string } | null {
    if (!g.inviteSent) return { label: "Einladen", color: "text-blue-600" };
    if (g.status === "PENDING") return { label: "Nachfassen", color: "text-amber-600" };
    if (g.status === "CONFIRMED" && !g.diet) return { label: "Essenswunsch", color: "text-purple-600" };
    if (g.status === "CONFIRMED" && !g.seatingTableName) return { label: "Platzieren", color: "text-rose-600" };
    if (g.status === "CONFIRMED" && !g.address) return { label: "Adresse anfragen", color: "text-blue-600" };
    return null;
  }

  async function handleExportCSV() {
    const headers = ["Vorname", "Nachname", "E-Mail", "Telefon", "Adresse", "Status", "Gruppe", "Rolle", "Ernährung", "Tisch", "Einladung"];
    const rows = filteredGuests.map((g) => [
      g.firstName, g.lastName, g.email || "", g.phone || "", g.address || "",
      GUEST_STATUS_LABELS[g.status as GuestStatus] || g.status,
      g.category ? GUEST_CATEGORY_LABELS[g.category as GuestCategory] || g.category : "",
      g.role ? GUEST_ROLE_LABELS[g.role as GuestRole] || g.role : "",
      g.diet || "", g.seatingTableName || "", g.inviteSent ? "Ja" : "Nein",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "gästeliste.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleBulkAction(action: string) {
    const ids = Array.from(selectedIds).join(",");
    const fd = new FormData();
    fd.set("ids", ids);
    if (action === "MARK_INVITED") {
      await bulkMarkInviteSent(fd);
    } else {
      fd.set("status", action);
      await bulkUpdateGuestStatus(fd);
    }
    setSelectedIds(new Set());
    setShowBulkMenu(false);
  }

  function handleActionCardClick(action: string) {
    // Set smart filters based on action
    setStatusFilter("ALL");
    setFilterCategory(""); setFilterRole(""); setFilterDiet(""); setFilterSource(""); setFilterAge(""); setFilterInviteSent("");

    if (action === "Nachfassen") { setStatusFilter("PENDING"); setFilterInviteSent("true"); }
    else if (action === "Anfragen") { setFilterInviteSent(""); /* Show all missing address — can't filter by address directly, but statusFilter already works */ }
    else if (action === "Erfragen") { setStatusFilter("CONFIRMED"); }
    else if (action === "Sitzplan") { window.location.href = "/seating"; }
    else if (action === "Einladen") { setFilterInviteSent("false"); }
  }

  async function handleWizardSave(wizardGuests: GuestWizardData[]) {
    if (!wizardGuests.length) return;
    const firstGuest = wizardGuests[0];
    const result = await createGuestWizard({
      projectId,
      guestType: firstGuest.guestType,
      guests: wizardGuests.map((g) => ({
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email,
        phone: g.phone,
        age: g.age,
        diet: g.diet?.join(","),
        allergiesNote: g.allergiesNote,
        isWeddingParty: g.isWeddingParty,
        notes: g.notes,
      })),
      address: {
        address: firstGuest.address,
        city: firstGuest.city,
        zip: firstGuest.zip,
        country: firstGuest.country,
      },
    });
    if (!result.success) {
      console.error(result.error);
    }
  }

  async function handleRsvpChange(guestId: string, newRsvp: string) {
    await updateRsvpStatus(guestId, newRsvp);
  }

  async function handleCreateHousehold() {
    if (selectedIds.size < 2 || !householdName.trim()) return;
    const result = await createHousehold({
      projectId,
      name: householdName.trim(),
      guestIds: Array.from(selectedIds),
    });
    if (result.success) {
      setSelectedIds(new Set());
      setShowHouseholdModal(false);
      setHouseholdName("");
    }
  }

  async function handleRemoveFromHousehold(guestId: string) {
    await removeFromHousehold(guestId);
  }

  function toggleColumn(key: ColumnKey) {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) { setCsvImporting(false); return; }

      // Parse header
      const headers = lines[0].split(/[,;]/).map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
      const firstNameIdx = headers.findIndex((h) => h === "vorname" || h === "firstname" || h === "first_name" || h === "first name");
      const lastNameIdx = headers.findIndex((h) => h === "nachname" || h === "lastname" || h === "last_name" || h === "last name");
      const emailIdx = headers.findIndex((h) => h === "email" || h === "e-mail");
      const phoneIdx = headers.findIndex((h) => h === "telefon" || h === "phone" || h === "tel");
      const categoryIdx = headers.findIndex((h) => h === "gruppe" || h === "category" || h === "kategorie");
      const sourceIdx = headers.findIndex((h) => h === "quelle" || h === "source" || h === "seite");
      const dietIdx = headers.findIndex((h) => h === "ernährung" || h === "ernaehrung" || h === "diet" || h === "diät");
      const notesIdx = headers.findIndex((h) => h === "notizen" || h === "notes" || h === "anmerkungen");

      if (firstNameIdx === -1) {
        alert("CSV muss eine Spalte \"Vorname\" oder \"firstName\" enthalten.");
        setCsvImporting(false);
        return;
      }

      const parsedGuests = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
        const firstName = cols[firstNameIdx]?.trim();
        if (!firstName) continue;
        parsedGuests.push({
          firstName,
          lastName: lastNameIdx >= 0 ? cols[lastNameIdx]?.trim() || "" : "",
          email: emailIdx >= 0 ? cols[emailIdx]?.trim() : undefined,
          phone: phoneIdx >= 0 ? cols[phoneIdx]?.trim() : undefined,
          category: categoryIdx >= 0 ? cols[categoryIdx]?.trim() : undefined,
          source: sourceIdx >= 0 ? cols[sourceIdx]?.trim() : undefined,
          diet: dietIdx >= 0 ? cols[dietIdx]?.trim() : undefined,
          notes: notesIdx >= 0 ? cols[notesIdx]?.trim() : undefined,
        });
      }

      if (parsedGuests.length === 0) {
        alert("Keine gültigen Gäste in der CSV-Datei gefunden.");
        setCsvImporting(false);
        return;
      }

      const result = await importGuestsFromCSV({ projectId, guests: parsedGuests });
      if (result.success) {
        setShowCsvImport(false);
      } else {
        alert(result.error || "Fehler beim Importieren.");
      }
    } catch (err) {
      console.error("CSV import error:", err);
      alert("Fehler beim Lesen der CSV-Datei.");
    }
    setCsvImporting(false);
    if (csvInputRef.current) csvInputRef.current.value = "";
  }

  // ── Render ────────────────────────────────────

  return (
    <div className="flex gap-6">
      {/* ── Main Column ───────────────────────── */}
      <div className={`flex-1 min-w-0 ${selectedGuest ? "max-w-[calc(100%-340px)]" : ""}`}>

        {/* Command Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-text">Gäste</h1>
              <p className="text-[13px] text-text-faint mt-0.5">
                {stats.total} Gäste · {stats.confirmed} zugesagt · {stats.rsvpRate}% Quote
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* CSV Import */}
              <button
                onClick={() => csvInputRef.current?.click()}
                className="px-3 py-1.5 text-[13px] text-text-muted hover:text-text bg-surface-1 border border-border rounded-lg hover:bg-surface-2 transition-colors"
              >
                {csvImporting ? "Importiert..." : "Import"}
              </button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                className="hidden"
              />
              {/* Column Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnPicker(!showColumnPicker)}
                  className="px-3 py-1.5 text-[13px] text-text-muted hover:text-text bg-surface-1 border border-border rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Spalten
                </button>
                {showColumnPicker && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowColumnPicker(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-surface-1 border border-border rounded-xl shadow-lg z-20 py-2 min-w-[200px]">
                      <div className="px-3 py-1.5 text-[11px] text-text-faint font-medium uppercase tracking-wider">Spalten anpassen</div>
                      {ALL_COLUMNS.map((col) => (
                        <button
                          key={col.key}
                          onClick={() => toggleColumn(col.key)}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-text-muted hover:bg-surface-2 transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            visibleColumns.has(col.key)
                              ? "bg-primary-600 border-primary-600"
                              : "border-border"
                          }`}>
                            {visibleColumns.has(col.key) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {col.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-[13px] text-text-muted hover:text-text bg-surface-1 border border-border rounded-lg hover:bg-surface-2 transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => setShowAddWizard(true)}
                className="px-3.5 py-1.5 text-[13px] font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                + Gast
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-surface-2 rounded-2xl overflow-hidden mb-4">
            {[
              { label: "Gesamt", value: stats.total, color: "text-text" },
              { label: "Eingeladen", value: stats.invitesSent, color: "text-blue-600" },
              { label: "Zugesagt", value: stats.confirmed, color: "text-emerald-600" },
              { label: "Abgesagt", value: stats.declined, color: "text-text-faint" },
              { label: "Ausstehend", value: stats.pending, color: "text-amber-600" },
              { label: "Quote", value: `${stats.rsvpRate}%`, color: "text-text" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-surface-1 px-4 py-3 text-center">
                <div className={`text-lg font-semibold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[11px] text-text-faint mt-0.5">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* RSVP Visual Status Bar */}
          {stats.total > 0 && (
            <div className="mb-4">
              <div className="flex h-2 rounded-full overflow-hidden bg-surface-2">
                {stats.rsvpAttending > 0 && (
                  <div
                    className="bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(stats.rsvpAttending / stats.total) * 100}%` }}
                    title={`Zusage: ${stats.rsvpAttending}`}
                  />
                )}
                {stats.rsvpMaybe > 0 && (
                  <div
                    className="bg-amber-400 transition-all duration-500"
                    style={{ width: `${(stats.rsvpMaybe / stats.total) * 100}%` }}
                    title={`Vielleicht: ${stats.rsvpMaybe}`}
                  />
                )}
                {stats.rsvpInvited > 0 && (
                  <div
                    className="bg-blue-400 transition-all duration-500"
                    style={{ width: `${(stats.rsvpInvited / stats.total) * 100}%` }}
                    title={`Eingeladen: ${stats.rsvpInvited}`}
                  />
                )}
                {stats.rsvpNotSent > 0 && (
                  <div
                    className="bg-surface-border transition-all duration-500"
                    style={{ width: `${(stats.rsvpNotSent / stats.total) * 100}%` }}
                    title={`Nicht gesendet: ${stats.rsvpNotSent}`}
                  />
                )}
                {stats.rsvpDeclined > 0 && (
                  <div
                    className="bg-red-400 transition-all duration-500"
                    style={{ width: `${(stats.rsvpDeclined / stats.total) * 100}%` }}
                    title={`Absage: ${stats.rsvpDeclined}`}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-[11px] text-text-faint flex-wrap">
                {stats.rsvpAttending > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Zusage ({stats.rsvpAttending})
                  </div>
                )}
                {stats.rsvpMaybe > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    Vielleicht ({stats.rsvpMaybe})
                  </div>
                )}
                {stats.rsvpInvited > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    Eingeladen ({stats.rsvpInvited})
                  </div>
                )}
                {stats.rsvpNotSent > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-surface-border" />
                    Nicht gesendet ({stats.rsvpNotSent})
                  </div>
                )}
                {stats.rsvpDeclined > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    Absage ({stats.rsvpDeclined})
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 mb-4">
            {(["ALL", "PENDING", "CONFIRMED", "DECLINED"] as const).map((s) => {
              const labels: Record<string, string> = { ALL: "Alle", PENDING: "Ausstehend", CONFIRMED: "Zugesagt", DECLINED: "Abgesagt" };
              const counts: Record<string, number> = { ALL: stats.total, PENDING: stats.pending, CONFIRMED: stats.confirmed, DECLINED: stats.declined };
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                    statusFilter === s ? "bg-primary-600 text-white" : "text-text-muted hover:bg-surface-2"
                  }`}
                >
                  {labels[s]} ({counts[s]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Center */}
        {actionItems.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {actionItems.slice(0, 4).map((item) => (
              <button
                key={item.label}
                onClick={() => handleActionCardClick(item.action)}
                className={`${item.color} border rounded-xl px-3.5 py-3 text-left hover:shadow-sm transition-all group`}
              >
                <div className="text-lg font-semibold">{item.count}</div>
                <div className="text-[12px] opacity-80 mb-1.5">{item.label}</div>
                <div className="text-[11px] font-medium opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {item.action}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Smart Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name oder E-Mail suchen..."
              className="w-full pl-9 pr-3 py-1.5 text-[13px] border border-border rounded-lg bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-border"
            />
          </div>

          {/* Primary filter chips */}
          <FilterChip
            label="Gruppe"
            value={filterCategory}
            options={Object.entries(GUEST_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            onChange={setFilterCategory}
          />
          <FilterChip
            label="Rolle"
            value={filterRole}
            options={Object.entries(GUEST_ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            onChange={setFilterRole}
          />
          <FilterChip
            label="Ernährung"
            value={filterDiet}
            options={Object.entries(GUEST_DIET_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            onChange={setFilterDiet}
          />

          {/* More filters toggle */}
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`px-2.5 py-1.5 text-[12px] rounded-lg border transition-colors ${
              showMoreFilters || hasActiveFilters ? "border-border bg-surface-2 text-text" : "border-border text-text-faint hover:text-text-muted"
            }`}
          >
            {showMoreFilters ? "Weniger" : "Mehr Filter"}
            {hasActiveFilters && !showMoreFilters && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] bg-primary-600 text-white rounded-full">
                {[filterCategory, filterRole, filterDiet, filterSource, filterAge, filterInviteSent, filterRsvp, filterGuestType, filterHousehold].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={() => { setFilterCategory(""); setFilterRole(""); setFilterDiet(""); setFilterSource(""); setFilterAge(""); setFilterInviteSent(""); setFilterRsvp(""); setFilterGuestType(""); setFilterHousehold(""); }}
              className="text-[12px] text-text-faint hover:text-text-muted"
            >
              Zurücksetzen
            </button>
          )}
        </div>

        {/* More Filters Drawer */}
        {showMoreFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap pl-0.5">
            <FilterChip
              label="RSVP"
              value={filterRsvp}
              options={Object.entries(RSVP_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              onChange={setFilterRsvp}
            />
            <FilterChip
              label="Gast-Typ"
              value={filterGuestType}
              options={Object.entries(GUEST_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              onChange={setFilterGuestType}
            />
            <FilterChip
              label="Quelle"
              value={filterSource}
              options={Object.entries(GUEST_SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              onChange={setFilterSource}
            />
            <FilterChip
              label="Alter"
              value={filterAge}
              options={Object.entries(GUEST_AGE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              onChange={setFilterAge}
            />
            <FilterChip
              label="Einladung"
              value={filterInviteSent}
              options={[{ value: "true", label: "Gesendet" }, { value: "false", label: "Nicht gesendet" }]}
              onChange={setFilterInviteSent}
            />
            {households.length > 0 && (
              <FilterChip
                label="Haushalt"
                value={filterHousehold}
                options={households.map((h) => ({ value: h.id, label: h.name }))}
                onChange={setFilterHousehold}
              />
            )}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mb-3 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-[13px]">
            <span className="font-medium">{selectedIds.size} ausgewählt</span>
            <div className="flex-1" />
            {selectedIds.size >= 2 && (
              <button onClick={() => { setHouseholdName(""); setShowHouseholdModal(true); }} className="px-2.5 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Haushalt gruppieren
              </button>
            )}
            <button onClick={() => handleBulkAction("MARK_INVITED")} className="px-2.5 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              Als eingeladen markieren
            </button>
            <button onClick={() => handleBulkAction("CONFIRMED")} className="px-2.5 py-1 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-colors">
              Zugesagt
            </button>
            <button onClick={() => handleBulkAction("DECLINED")} className="px-2.5 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              Abgesagt
            </button>
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Exportieren
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-1 text-white/60 hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Guest Table */}
        <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden border border-border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredGuests.length && filteredGuests.length > 0}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded border-border text-primary-600 focus:ring-primary-500/20"
                  />
                </th>
                <th className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider p-3">Name</th>
                {visibleColumns.has("rsvp") && <th className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider p-3">RSVP</th>}
                {visibleColumns.has("type") && <th className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider p-3 hidden sm:table-cell">Typ</th>}
                {visibleColumns.has("household") && <th className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider p-3 hidden md:table-cell">Haushalt</th>}
                {visibleColumns.has("category") && <th className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider p-3 hidden md:table-cell">Gruppe</th>}
                {visibleColumns.has("diet") && <th className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider p-3 hidden lg:table-cell">Ernährung</th>}
                {visibleColumns.has("table") && <th className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider p-3 hidden lg:table-cell">Tisch</th>}
                {visibleColumns.has("contact") && <th className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider p-3 hidden lg:table-cell">Kontakt</th>}
                {visibleColumns.has("weddingParty") && <th className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider p-3 hidden sm:table-cell">HP</th>}
                <th className="text-right text-[11px] font-medium text-text-faint uppercase tracking-wider p-3">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => {
                const nextAction = getNextAction(guest);
                const isSelected = selectedIds.has(guest.id);
                return (
                  <tr
                    key={guest.id}
                    onClick={() => setSelectedId(guest.id)}
                    className={`border-b border-border cursor-pointer transition-colors ${
                      selectedId === guest.id ? "bg-surface-2" : "hover:bg-surface-2/50"
                    } ${isSelected ? "bg-blue-50/30" : ""}`}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(guest.id)}
                        className="w-3.5 h-3.5 rounded border-border text-primary-600 focus:ring-primary-500/20"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="font-medium text-text">{guest.firstName} {guest.lastName}</div>
                        {guest.isWeddingParty && (
                          <span className="inline-flex px-1.5 py-0.5 text-[9px] font-semibold rounded bg-primary-500/10 text-primary-500 uppercase tracking-wider">HP</span>
                        )}
                      </div>
                      {guest.email && <div className="text-[11px] text-text-faint mt-0.5">{guest.email}</div>}
                    </td>
                    {visibleColumns.has("rsvp") && (
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <RsvpChip guestId={guest.id} rsvpStatus={guest.rsvpStatus} onChange={handleRsvpChange} />
                      </td>
                    )}
                    {visibleColumns.has("type") && (
                      <td className="p-3 hidden sm:table-cell">
                        <span className="text-[11px] text-text-muted">
                          {GUEST_TYPE_LABELS[guest.guestType as GuestType] || guest.guestType}
                        </span>
                      </td>
                    )}
                    {visibleColumns.has("household") && (
                      <td className="p-3 hidden md:table-cell">
                        {guest.householdName ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                            <svg className="w-3 h-3 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            {guest.householdName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-faint">-</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.has("category") && (
                      <td className="p-3 hidden md:table-cell">
                        {guest.category && (
                          <span className="text-[12px] text-text-muted">
                            {GUEST_CATEGORY_LABELS[guest.category as GuestCategory] || guest.category}
                          </span>
                        )}
                        {guest.role && (
                          <span className="text-[11px] text-text-faint ml-1">
                            ({GUEST_ROLE_LABELS[guest.role as GuestRole] || guest.role})
                          </span>
                        )}
                      </td>
                    )}
                    {visibleColumns.has("diet") && (
                      <td className="p-3 hidden lg:table-cell">
                        {guest.diet ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[13px]">{DIET_ICONS[guest.diet.split(",")[0]] || ""}</span>
                            <span className="text-[11px] text-text-muted">
                              {guest.diet.split(",").map((d) => GUEST_DIET_LABELS[d.trim() as GuestDiet] || d.trim()).join(", ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-text-faint">-</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.has("table") && (
                      <td className="p-3 hidden lg:table-cell">
                        {guest.seatingTableName ? (
                          <span className="text-[12px] text-text-muted">{guest.seatingTableName}</span>
                        ) : (
                          <span className="text-[11px] text-text-faint">-</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.has("contact") && (
                      <td className="p-3 hidden lg:table-cell">
                        {guest.email || guest.phone ? (
                          <div className="text-[11px] text-text-muted">
                            {guest.email && <div>{guest.email}</div>}
                            {guest.phone && <div className="text-text-faint">{guest.phone}</div>}
                          </div>
                        ) : (
                          <span className="text-[11px] text-text-faint">-</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.has("weddingParty") && (
                      <td className="p-3 hidden sm:table-cell">
                        {guest.isWeddingParty ? (
                          <span className="inline-flex px-1.5 py-0.5 text-[9px] font-semibold rounded bg-primary-500/10 text-primary-500 uppercase tracking-wider">HP</span>
                        ) : (
                          <span className="text-[11px] text-text-faint">-</span>
                        )}
                      </td>
                    )}
                    <td className="p-3 text-right">
                      {nextAction && (
                        <span className={`text-[11px] font-medium ${nextAction.color} flex items-center justify-end gap-0.5`}>
                          {nextAction.label}
                          <svg className="w-3 h-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredGuests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-text-faint text-3xl mb-2">{"\uD83D\uDC65"}</div>
              <p className="text-sm text-text-faint">Keine Gäste gefunden.</p>
              <button onClick={() => setShowAddWizard(true)} className="mt-3 text-[13px] text-text font-medium hover:underline">
                + Ersten Gast hinzufügen
              </button>
            </div>
          )}
        </div>
        <div className="text-[11px] text-text-faint mt-2 text-right">
          {filteredGuests.length} von {guests.length} Gäste
        </div>
      </div>

      {/* ── Right Inspector ───────────────────── */}
      {selectedGuest && (
        <GuestInspector
          guest={selectedGuest}
          projectId={projectId}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* ── Add Guest Wizard ──────────────────── */}
      <AddGuestWizard
        open={showAddWizard}
        onClose={() => setShowAddWizard(false)}
        projectId={projectId}
        onSave={handleWizardSave}
      />

      {/* ── Household Group Modal ─────────────── */}
      <Modal open={showHouseholdModal} onClose={() => setShowHouseholdModal(false)} title="Haushalt erstellen">
        <div className="space-y-4">
          <p className="text-[13px] text-text-muted">
            {selectedIds.size} Gäste werden zu einem Haushalt zusammengefasst.
          </p>
          <div>
            <label className="text-[11px] text-text-faint mb-1 block">Haushaltsname *</label>
            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="z.B. Familie Müller"
              className="w-full text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-surface-input text-text"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHouseholdModal(false)}
              className="flex-1 py-2 text-[13px] font-medium text-text-muted bg-surface-2 rounded-lg hover:bg-surface-2/80 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleCreateHousehold}
              disabled={!householdName.trim()}
              className="flex-1 py-2 text-[13px] font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Haushalt erstellen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── RSVP Chip (inline dropdown) ───────────────────

function RsvpChip({ guestId, rsvpStatus, onChange }: { guestId: string; rsvpStatus: string; onChange: (id: string, status: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full transition-colors ${RSVP_COLORS[rsvpStatus] || "bg-surface-2 text-text-muted"}`}
      >
        {RSVP_STATUS_LABELS[rsvpStatus as RsvpStatus] || rsvpStatus}
        <svg className={`w-2.5 h-2.5 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-surface-1 border border-border rounded-xl shadow-lg z-20 py-1 min-w-[130px]">
            {(Object.entries(RSVP_STATUS_LABELS) as [string, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { onChange(guestId, key); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-surface-2 transition-colors ${
                  rsvpStatus === key ? "text-text font-medium" : "text-text-muted"
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${RSVP_COLORS[key]?.split(" ")[0] || "bg-surface-2"}`} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Filter Chip Component ─────────────────────────

function FilterChip({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`px-2.5 py-1.5 text-[12px] rounded-lg border transition-colors flex items-center gap-1 ${
          value ? "border-border bg-surface-2 text-text font-medium" : "border-border text-text-faint hover:text-text-muted hover:border-border"
        }`}
      >
        {activeLabel || label}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-surface-1 border border-border rounded-xl shadow-lg z-20 py-1 min-w-[140px]">
            {value && (
              <button
                onClick={() => { onChange(""); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-[12px] text-text-faint hover:bg-surface-2"
              >
                Alle anzeigen
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-surface-2 ${
                  value === opt.value ? "text-text font-medium" : "text-text-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Guest Inspector ───────────────────────────────

function GuestInspector({ guest, projectId, onClose }: { guest: Guest; projectId: string; onClose: () => void }) {
  const [tab, setTab] = useState<"details" | "notes">("details");

  // Local form state
  const [firstName, setFirstName] = useState(guest.firstName);
  const [lastName, setLastName] = useState(guest.lastName);
  const [email, setEmail] = useState(guest.email || "");
  const [phone, setPhone] = useState(guest.phone || "");
  const [address, setAddress] = useState(guest.address || "");
  const [source, setSource] = useState(guest.source || "");
  const [category, setCategory] = useState(guest.category || "");
  const [role, setRole] = useState(guest.role || "");
  const [age, setAge] = useState(guest.age || "");
  const [diet, setDiet] = useState(guest.diet || "");
  const [notes, setNotes] = useState(guest.notes || "");

  // Reset when guest changes
  const [prevId, setPrevId] = useState(guest.id);
  if (guest.id !== prevId) {
    setPrevId(guest.id);
    setFirstName(guest.firstName);
    setLastName(guest.lastName);
    setEmail(guest.email || "");
    setPhone(guest.phone || "");
    setAddress(guest.address || "");
    setSource(guest.source || "");
    setCategory(guest.category || "");
    setRole(guest.role || "");
    setAge(guest.age || "");
    setDiet(guest.diet || "");
    setNotes(guest.notes || "");
    setTab("details");
  }

  async function handleStatusChange(status: string) {
    const fd = new FormData();
    fd.set("id", guest.id);
    fd.set("status", status);
    await updateGuestStatus(fd);
  }

  async function handleToggleInvite() {
    const fd = new FormData();
    fd.set("id", guest.id);
    await toggleInviteSent(fd);
  }

  async function handleSave() {
    const fd = new FormData();
    fd.set("id", guest.id);
    fd.set("firstName", firstName);
    fd.set("lastName", lastName);
    fd.set("email", email);
    fd.set("phone", phone);
    fd.set("address", address);
    fd.set("source", source);
    fd.set("category", category);
    fd.set("role", role);
    fd.set("age", age);
    fd.set("diet", diet);
    fd.set("status", guest.status);
    fd.set("inviteSent", guest.inviteSent ? "true" : "false");
    fd.set("tableNumber", guest.tableNumber ? String(guest.tableNumber) : "");
    fd.set("notes", notes);
    await updateGuest(fd);
  }

  async function handleDelete() {
    const fd = new FormData();
    fd.set("id", guest.id);
    await deleteGuest(fd);
    onClose();
  }

  return (
    <div className="w-[320px] flex-shrink-0 hidden lg:block sticky top-6 self-start">
      <div className="bg-surface-1 rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text">{guest.firstName} {guest.lastName}</h3>
            <button onClick={onClose} className="text-text-faint hover:text-text-muted p-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {(["PENDING", "CONFIRMED", "DECLINED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                  guest.status === s ? STATUS_COLORS[s] : "bg-surface-2 text-text-faint hover:bg-surface-2 hover:text-text-muted"
                }`}
              >
                {GUEST_STATUS_LABELS[s as GuestStatus]}
              </button>
            ))}
          </div>

          {/* Invite toggle */}
          <button
            onClick={handleToggleInvite}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] transition-colors ${
              guest.inviteSent ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-surface-2 text-text-muted hover:bg-surface-2"
            }`}
          >
            <span>{guest.inviteSent ? "Einladung gesendet" : "Einladung nicht gesendet"}</span>
            <span className="text-[11px]">{guest.inviteSent ? "\u2713" : "Senden"}</span>
          </button>

          {/* Household info */}
          {guest.householdName && (
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg mt-2 text-[12px]">
              <svg className="w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-text-muted">{guest.householdName}</span>
            </div>
          )}

          {/* Guest type badge */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-text-faint">Typ:</span>
            <span className="text-[11px] text-text-muted font-medium">{GUEST_TYPE_LABELS[guest.guestType as GuestType] || guest.guestType}</span>
            {guest.isWeddingParty && (
              <span className="inline-flex px-1.5 py-0.5 text-[9px] font-semibold rounded bg-primary-500/10 text-primary-500 uppercase tracking-wider">Hochzeitsgesellschaft</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["details", "notes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-[12px] font-medium transition-colors ${
                tab === t ? "text-text border-b-2 border-primary-600" : "text-text-faint hover:text-text-muted"
              }`}
            >
              {t === "details" ? "Details" : "Notizen"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {tab === "details" && (
            <div className="space-y-3">
              {/* Name */}
              <div className="grid grid-cols-2 gap-2">
                <InspectorField label="Vorname" value={firstName} onChange={setFirstName} />
                <InspectorField label="Nachname" value={lastName} onChange={setLastName} />
              </div>

              {/* Contact */}
              <InspectorField label="E-Mail" value={email} onChange={setEmail} type="email" />
              <InspectorField label="Telefon" value={phone} onChange={setPhone} />
              <InspectorField label="Adresse" value={address} onChange={setAddress} />

              {/* Classifications */}
              <InspectorSelect
                label="Gruppe"
                value={category}
                onChange={setCategory}
                options={Object.entries(GUEST_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              />
              <InspectorSelect
                label="Rolle"
                value={role}
                onChange={setRole}
                options={Object.entries(GUEST_ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              />
              <InspectorSelect
                label="Quelle"
                value={source}
                onChange={setSource}
                options={Object.entries(GUEST_SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              />
              <InspectorSelect
                label="Alter"
                value={age}
                onChange={setAge}
                options={Object.entries(GUEST_AGE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              />

              {/* Diet */}
              <InspectorSelect
                label="Ernährung"
                value={diet}
                onChange={setDiet}
                options={Object.entries(GUEST_DIET_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              />

              {/* Seating */}
              {guest.seatingTableName ? (
                <div className="flex items-center justify-between p-2.5 bg-surface-2 rounded-lg">
                  <div>
                    <div className="text-[11px] text-text-faint">Tisch</div>
                    <div className="text-[13px] text-text font-medium">{guest.seatingTableName}</div>
                  </div>
                  <a href="/seating" className="text-[11px] text-text-muted hover:text-text flex items-center gap-0.5">
                    Sitzplan
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              ) : (
                <a
                  href="/seating"
                  className="flex items-center justify-between p-2.5 bg-surface-2 rounded-lg text-[12px] text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                >
                  <span>Gast platzieren</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </a>
              )}

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full py-2 text-[13px] font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors mt-2"
              >
                Speichern
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                className="w-full py-1.5 text-[12px] text-red-400 hover:text-red-600 transition-colors"
              >
                Gast entfernen
              </button>
            </div>
          )}

          {tab === "notes" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-text-faint mb-1 block">Notizen</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  placeholder="Notizen zu diesem Gast..."
                  className="w-full text-[13px] text-text border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-border resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-2 text-[13px] font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Speichern
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inspector Field ───────────────────────────────

function InspectorField({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] text-text-faint mb-0.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[13px] text-text border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-border"
      />
    </div>
  );
}

function InspectorSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-[11px] text-text-faint mb-0.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[13px] text-text border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-border bg-surface-1"
      >
        <option value="">-</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

