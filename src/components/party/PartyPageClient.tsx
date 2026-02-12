"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import {
  createPartyMember,
  updatePartyMember,
  deletePartyMember,
} from "@/actions/party.actions";
import {
  WEDDING_PARTY_ROLE_LABELS,
  WEDDING_PARTY_SIDE_LABELS,
} from "@/types";
import type { WeddingPartyRole, WeddingPartySide } from "@/types";

// ── Types ─────────────────────────────────────────

interface GuestRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  inviteSent: boolean;
  diet: string | null;
  seatingTableName: string | null;
}

interface PartyMember {
  id: string;
  name: string;
  role: string;
  side: string | null;
  notes: string | null;
  guestId: string | null;
  guest: GuestRef | null;
}

interface AvailableGuest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  alreadyInParty: boolean;
}

interface PartyPageClientProps {
  members: PartyMember[];
  availableGuests: AvailableGuest[];
  projectId: string;
}

// ── Constants ─────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  DECLINED: "bg-surface-2 text-text-muted",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ausstehend",
  CONFIRMED: "Zugesagt",
  DECLINED: "Abgesagt",
};

const ROLE_HIERARCHY: string[] = [
  "MAID_OF_HONOR", "BEST_MAN", "BRIDESMAID", "GROOMSMAN",
  "FLOWER_GIRL", "RING_BEARER", "MC", "OFFICIANT", "USHER", "OTHER",
];

// ── Main Component ────────────────────────────────

export default function PartyPageClient({ members, availableGuests, projectId }: PartyPageClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sideFilter, setSideFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"side" | "role">("side");

  const selectedMember = useMemo(() => members.find((m) => m.id === selectedId) ?? null, [members, selectedId]);

  const filteredMembers = useMemo(() => {
    if (sideFilter === "ALL") return members;
    if (sideFilter === "NONE") return members.filter((m) => !m.side);
    return members.filter((m) => m.side === sideFilter);
  }, [members, sideFilter]);

  // Group by side
  const sideGroups = useMemo(() => {
    const groups: { key: string; label: string; members: PartyMember[] }[] = [];
    const bride = filteredMembers.filter((m) => m.side === "BRIDE");
    const groom = filteredMembers.filter((m) => m.side === "GROOM");
    const none = filteredMembers.filter((m) => !m.side);
    if (bride.length > 0) groups.push({ key: "BRIDE", label: "Brautseite", members: bride });
    if (groom.length > 0) groups.push({ key: "GROOM", label: "Bräutigamseite", members: groom });
    if (none.length > 0) groups.push({ key: "NONE", label: "Ohne Zuordnung", members: none });
    return groups;
  }, [filteredMembers]);

  // Group by role
  const roleGroups = useMemo(() => {
    const byRole = new Map<string, PartyMember[]>();
    for (const m of filteredMembers) {
      const arr = byRole.get(m.role) || [];
      arr.push(m);
      byRole.set(m.role, arr);
    }
    return ROLE_HIERARCHY
      .filter((r) => byRole.has(r))
      .map((r) => ({
        key: r,
        label: WEDDING_PARTY_ROLE_LABELS[r as WeddingPartyRole] || r,
        members: byRole.get(r)!,
      }));
  }, [filteredMembers]);

  const groups = viewMode === "side" ? sideGroups : roleGroups;

  const brideCount = members.filter((m) => m.side === "BRIDE").length;
  const groomCount = members.filter((m) => m.side === "GROOM").length;

  return (
    <div className="flex gap-6">
      {/* ── Main Column ───────────────────────── */}
      <div className={`flex-1 min-w-0 ${selectedMember ? "max-w-[calc(100%-340px)]" : ""}`}>

        {/* Command Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold text-text">Hochzeitsgesellschaft</h1>
              <p className="text-[13px] text-text-faint mt-0.5">
                {members.length} Mitglieder · {brideCount} Brautseite · {groomCount} Bräutigamseite
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex bg-surface-2 rounded-lg p-0.5">
                {(["side", "role"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-colors ${
                      viewMode === v ? "bg-surface-1 text-text shadow-sm" : "text-text-faint hover:text-text-muted"
                    }`}
                  >
                    {v === "side" ? "Seite" : "Rolle"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 text-[13px] font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                + Mitglied
              </button>
            </div>
          </div>

          {/* Side Segmented Control */}
          <div className="flex items-center gap-1">
            {[
              { value: "ALL", label: "Alle", count: members.length },
              { value: "BRIDE", label: "Brautseite", count: brideCount },
              { value: "GROOM", label: "Bräutigamseite", count: groomCount },
              { value: "NONE", label: "Ohne Zuordnung", count: members.filter((m) => !m.side).length },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSideFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  sideFilter === opt.value ? "bg-gray-900 text-white" : "text-text-muted hover:bg-surface-2"
                }`}
              >
                {opt.label} ({opt.count})
              </button>
            ))}
          </div>
        </div>

        {/* Groups */}
        {groups.map((group) => (
          <div key={group.key} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wider">{group.label}</h2>
              <span className="text-[11px] text-text-faint">({group.members.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isSelected={selectedId === member.id}
                  onClick={() => setSelectedId(member.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-3xl text-text-faint mb-2">{"\uD83D\uDC65"}</div>
            <p className="text-sm text-text-faint mb-3">Noch keine Mitglieder</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[13px] font-medium text-text hover:underline"
            >
              + Erstes Mitglied hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* ── Right Inspector ───────────────────── */}
      {selectedMember && (
        <MemberInspector
          member={selectedMember}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* ── Add Member Modal ──────────────────── */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Mitglied hinzufügen">
        <AddMemberForm
          projectId={projectId}
          availableGuests={availableGuests}
          onClose={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}

// ── Member Card ───────────────────────────────────

function MemberCard({ member, isSelected, onClick }: { member: PartyMember; isSelected: boolean; onClick: () => void }) {
  const guest = member.guest;
  const rsvpStatus = guest?.status || "PENDING";
  const roleLabel = WEDDING_PARTY_ROLE_LABELS[member.role as WeddingPartyRole] || member.role;

  return (
    <button
      onClick={onClick}
      className={`bg-surface-1 rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-all w-full border ${
        isSelected ? "border-border shadow-md" : "border-border"
      }`}
    >
      {/* Top: Name + Role */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-text">{member.name}</h3>
          {member.side && (
            <span className="text-[11px] text-text-faint">
              {WEDDING_PARTY_SIDE_LABELS[member.side as WeddingPartySide]}
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium text-text-muted bg-surface-2 px-2 py-0.5 rounded-full flex-shrink-0">
          {roleLabel}
        </span>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${STATUS_COLORS[rsvpStatus]}`}>
          {STATUS_LABELS[rsvpStatus] || rsvpStatus}
        </span>
        {guest?.inviteSent && (
          <span className="text-[10px] text-emerald-500 font-medium">Eingeladen</span>
        )}
      </div>

      {/* Contact + Links row */}
      <div className="flex items-center gap-3 text-[11px] text-text-faint">
        {(guest?.email || member.guest === null) && (
          <span className="truncate max-w-[140px]">{guest?.email || ""}</span>
        )}
        {guest?.seatingTableName && (
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            {guest.seatingTableName}
          </span>
        )}
      </div>

      {member.notes && (
        <p className="text-[11px] text-text-faint mt-2 line-clamp-1">{member.notes}</p>
      )}
    </button>
  );
}

// ── Member Inspector ──────────────────────────────

function MemberInspector({ member, onClose }: { member: PartyMember; onClose: () => void }) {
  const [role, setRole] = useState(member.role);
  const [side, setSide] = useState(member.side || "");
  const [notes, setNotes] = useState(member.notes || "");

  // Reset when member changes
  const [prevId, setPrevId] = useState(member.id);
  if (member.id !== prevId) {
    setPrevId(member.id);
    setRole(member.role);
    setSide(member.side || "");
    setNotes(member.notes || "");
  }

  const guest = member.guest;

  async function handleSave() {
    const fd = new FormData();
    fd.set("id", member.id);
    fd.set("role", role);
    fd.set("side", side);
    fd.set("notes", notes);
    await updatePartyMember(fd);
  }

  async function handleRemove() {
    const fd = new FormData();
    fd.set("id", member.id);
    await deletePartyMember(fd);
    onClose();
  }

  return (
    <div className="w-[320px] flex-shrink-0 hidden lg:block sticky top-6 self-start">
      <div className="bg-surface-1 rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-text">{member.name}</h3>
            <button onClick={onClose} className="text-text-faint hover:text-text-muted p-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {guest && (
            <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${STATUS_COLORS[guest.status]}`}>
              {STATUS_LABELS[guest.status] || guest.status}
            </span>
          )}
        </div>

        <div className="p-4 max-h-[calc(100vh-280px)] overflow-y-auto space-y-4">
          {/* Guest info (read-only from guest record) */}
          {guest && (
            <div className="space-y-2">
              <div className="text-[11px] text-text-faint font-medium uppercase tracking-wider">Gasteinfo</div>
              {guest.email && (
                <div className="flex items-center gap-2 text-[12px]">
                  <svg className="w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="text-text-muted">{guest.email}</span>
                </div>
              )}
              {guest.phone && (
                <div className="flex items-center gap-2 text-[12px]">
                  <svg className="w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span className="text-text-muted">{guest.phone}</span>
                </div>
              )}
              {guest.inviteSent && (
                <div className="text-[11px] text-emerald-600 font-medium">Einladung gesendet</div>
              )}
              {guest.diet && (
                <div className="text-[11px] text-text-muted">Ernährung: {guest.diet}</div>
              )}
              {guest.seatingTableName && (
                <div className="flex items-center justify-between p-2 bg-surface-2 rounded-lg">
                  <div className="text-[12px] text-text-muted">Tisch: {guest.seatingTableName}</div>
                  <a href="/seating" className="text-[11px] text-text-faint hover:text-text-muted flex items-center gap-0.5">
                    Sitzplan
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              )}
              {/* Link to guest list */}
              <a
                href="/guests"
                className="flex items-center justify-between p-2 bg-surface-2 rounded-lg text-[12px] text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
              >
                <span>Gästeprofil öffnen</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          )}

          <div className="border-t border-border pt-3">
            <div className="text-[11px] text-text-faint font-medium uppercase tracking-wider mb-2">Rolle & Seite</div>

            {/* Role select */}
            <div className="mb-3">
              <label className="text-[11px] text-text-faint mb-0.5 block">Rolle</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-[13px] text-text border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-border bg-surface-1"
              >
                {Object.entries(WEDDING_PARTY_ROLE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            {/* Side select */}
            <div className="mb-3">
              <label className="text-[11px] text-text-faint mb-0.5 block">Seite</label>
              <div className="flex gap-1.5">
                {[
                  { value: "", label: "Keine" },
                  { value: "BRIDE", label: "Brautseite" },
                  { value: "GROOM", label: "Bräutigamseite" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSide(opt.value)}
                    className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${
                      side === opt.value ? "border-gray-900 bg-gray-900 text-white" : "border-border text-text-faint hover:border-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-3">
              <label className="text-[11px] text-text-faint mb-0.5 block">Notizen</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Aufgaben, Hinweise..."
                className="w-full text-[13px] text-text border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-border bg-surface-1 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleSave}
            className="w-full py-2 text-[13px] font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Speichern
          </button>
          <button
            onClick={handleRemove}
            className="w-full py-1.5 text-[12px] text-red-400 hover:text-red-600 transition-colors"
          >
            Aus Hochzeitsgesellschaft entfernen
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Member Form (Guest Picker) ────────────────

function AddMemberForm({ projectId, availableGuests, onClose }: {
  projectId: string;
  availableGuests: AvailableGuest[];
  onClose: () => void;
}) {
  const [step, setStep] = useState<"pick" | "new">("pick");
  const [search, setSearch] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [side, setSide] = useState("");

  // For "new guest" flow
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const filteredGuests = useMemo(() => {
    const available = availableGuests.filter((g) => !g.alreadyInParty);
    if (!search) return available;
    const q = search.toLowerCase();
    return available.filter((g) => {
      const name = `${g.firstName} ${g.lastName}`.toLowerCase();
      return name.includes(q) || (g.email || "").toLowerCase().includes(q);
    });
  }, [availableGuests, search]);

  const selectedGuest = availableGuests.find((g) => g.id === selectedGuestId);

  async function handleSubmit() {
    if (!role) return;
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("role", role);
    fd.set("side", side);

    if (step === "pick" && selectedGuestId) {
      fd.set("guestId", selectedGuestId);
    } else if (step === "new" && newName.trim()) {
      fd.set("name", newName.trim());
      if (newEmail) fd.set("email", newEmail);
    } else {
      return;
    }

    await createPartyMember(fd);
    onClose();
  }

  // Step 1: Pick a guest
  if (!selectedGuestId && step === "pick") {
    return (
      <div className="space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Gast suchen..."
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-lg bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-border"
            autoFocus
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {filteredGuests.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGuestId(g.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-surface-2 transition-colors"
            >
              <div>
                <div className="text-[13px] font-medium text-text">{g.firstName} {g.lastName}</div>
                {g.email && <div className="text-[11px] text-text-faint">{g.email}</div>}
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[g.status]}`}>
                {STATUS_LABELS[g.status]}
              </span>
            </button>
          ))}
          {filteredGuests.length === 0 && (
            <div className="text-center py-6 text-[13px] text-text-faint">
              Kein passender Gast gefunden
            </div>
          )}
        </div>

        <div className="border-t border-border pt-3">
          <button
            onClick={() => setStep("new")}
            className="w-full text-center text-[12px] text-text-muted hover:text-text py-2"
          >
            Neuen Gast erstellen und hinzufügen
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Assign role + side (after picking guest or new guest)
  return (
    <div className="space-y-4">
      {/* Selected guest display / New guest name */}
      {step === "pick" && selectedGuest && (
        <div className="flex items-center justify-between p-3 bg-surface-2 rounded-xl">
          <div>
            <div className="text-[13px] font-medium text-text">{selectedGuest.firstName} {selectedGuest.lastName}</div>
            {selectedGuest.email && <div className="text-[11px] text-text-faint">{selectedGuest.email}</div>}
          </div>
          <button onClick={() => setSelectedGuestId(null)} className="text-[11px] text-text-faint hover:text-text-muted">
            Ändern
          </button>
        </div>
      )}

      {step === "new" && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-text-faint mb-1 block">Name *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Vorname Nachname"
              className="w-full text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-border bg-surface-1 text-text"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[11px] text-text-faint mb-1 block">E-Mail</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="optional"
              className="w-full text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-border bg-surface-1 text-text"
            />
          </div>
          <button onClick={() => { setStep("pick"); setNewName(""); setNewEmail(""); }} className="text-[11px] text-text-faint hover:text-text-muted">
            Bestehenden Gast waehlen
          </button>
        </div>
      )}

      {/* Role */}
      <div>
        <label className="text-[11px] text-text-faint mb-1 block">Rolle *</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-border bg-surface-1 text-text"
        >
          <option value="">Rolle waehlen...</option>
          {Object.entries(WEDDING_PARTY_ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Side */}
      <div>
        <label className="text-[11px] text-text-faint mb-1 block">Seite</label>
        <div className="flex gap-2">
          {[
            { value: "", label: "Keine" },
            { value: "BRIDE", label: "Brautseite" },
            { value: "GROOM", label: "Bräutigamseite" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSide(opt.value)}
              className={`flex-1 py-2 text-[12px] font-medium rounded-lg border transition-colors ${
                side === opt.value ? "border-gray-900 bg-gray-900 text-white" : "border-border text-text-muted hover:border-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!role || (step === "pick" && !selectedGuestId) || (step === "new" && !newName.trim())}
        className="w-full py-2.5 text-[13px] font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Mitglied hinzufügen
      </button>
    </div>
  );
}
