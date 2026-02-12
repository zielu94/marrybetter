"use client";

import { useCallback } from "react";

interface GuestListItemProps {
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
    seatingTableId: string | null;
    seatNumber: number | null;
  };
  tableName?: string;
  onUnseat?: (guestId: string) => void;
}

function statusBadge(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";
    case "DECLINED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-surface-2 text-text-muted";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "CONFIRMED": return "Bestätigt";
    case "DECLINED": return "Abgesagt";
    default: return "Offen";
  }
}

export default function GuestListItem({ guest, tableName, onUnseat }: GuestListItemProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("guestId", guest.id);
      e.dataTransfer.effectAllowed = "move";
    },
    [guest.id]
  );

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group flex items-center gap-2 px-3 py-1.5 hover:bg-surface-2 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">
          {guest.firstName} {guest.lastName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusBadge(guest.status)}`}>
            {statusLabel(guest.status)}
          </span>
          {tableName && (
            <span className="text-[10px] text-text-faint truncate">
              {tableName}{guest.seatNumber ? ` #${guest.seatNumber}` : ""}
            </span>
          )}
        </div>
      </div>
      {guest.seatingTableId && onUnseat && (
        <button
          onClick={(e) => { e.stopPropagation(); onUnseat(guest.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600 transition-all"
          title="Platz aufheben"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
