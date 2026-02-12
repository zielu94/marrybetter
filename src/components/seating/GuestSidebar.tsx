"use client";

import { useState, useMemo } from "react";
import GuestListItem from "./GuestListItem";

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  seatingTableId: string | null;
  seatNumber: number | null;
}

interface TableData {
  id: string;
  name: string;
}

interface GuestSidebarProps {
  guests: GuestData[];
  tables: TableData[];
  onUnseatGuest: (guestId: string) => void;
}

export default function GuestSidebar({ guests, tables, onUnseatGuest }: GuestSidebarProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showSeated, setShowSeated] = useState(false);

  const tableMap = useMemo(() => {
    const map: Record<string, string> = {};
    tables.forEach((t) => { map[t.id] = t.name; });
    return map;
  }, [tables]);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (statusFilter !== "ALL" && g.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          g.firstName.toLowerCase().includes(q) ||
          g.lastName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [guests, search, statusFilter]);

  const unseated = filteredGuests.filter((g) => !g.seatingTableId);
  const seated = filteredGuests.filter((g) => g.seatingTableId);

  const totalUnseated = guests.filter((g) => !g.seatingTableId).length;

  return (
    <div className="flex flex-col h-full bg-surface-1 border-r border-border">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-text">Gäste</h2>
          <span className="text-xs font-medium text-white bg-primary-500 rounded-full px-2 py-0.5">
            {totalUnseated} frei
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-300 bg-surface-1 text-text"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 mt-2">
          {[
            { value: "ALL", label: "Alle" },
            { value: "CONFIRMED", label: "Bestätigt" },
            { value: "PENDING", label: "Offen" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                statusFilter === f.value
                  ? "bg-primary-100 text-primary-700"
                  : "bg-surface-2 text-text-muted hover:bg-surface-2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guest list */}
      <div className="flex-1 overflow-y-auto">
        {/* Unseated */}
        <div className="px-2 pt-2">
          <div className="flex items-center gap-1.5 px-1 mb-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Ohne Platz
            </span>
            <span className="text-[10px] text-text-faint">({unseated.length})</span>
          </div>
          {unseated.length === 0 ? (
            <p className="text-xs text-text-faint px-3 py-2">
              {search || statusFilter !== "ALL" ? "Keine Ergebnisse" : "Alle Gäste haben einen Platz!"}
            </p>
          ) : (
            unseated.map((g) => (
              <GuestListItem key={g.id} guest={g} />
            ))
          )}
        </div>

        {/* Seated */}
        <div className="px-2 pt-3 pb-2">
          <button
            onClick={() => setShowSeated(!showSeated)}
            className="flex items-center gap-1.5 px-1 mb-1 w-full"
          >
            <svg
              className={`w-3 h-3 text-text-faint transition-transform ${showSeated ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Mit Platz
            </span>
            <span className="text-[10px] text-text-faint">({seated.length})</span>
          </button>
          {showSeated &&
            seated.map((g) => (
              <GuestListItem
                key={g.id}
                guest={g}
                tableName={g.seatingTableId ? tableMap[g.seatingTableId] : undefined}
                onUnseat={onUnseatGuest}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
