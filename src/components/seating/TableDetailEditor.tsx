"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TABLE_SHAPE_LABELS, type TableShape } from "@/types";
import { updateTable, duplicateTable } from "@/actions/seating.actions";

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  seatNumber: number | null;
}

interface TableData {
  id: string;
  name: string;
  capacity: number;
  shape: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  rotation: number;
  guests: GuestData[];
}

interface TableDetailEditorProps {
  table: TableData;
  onTableUpdated: () => void;
  onGuestRemoved: (guestId: string) => void;
  onGuestSeatChange: (guestId: string, seatNumber: number | null) => void;
  onSizeChange: (width: number, height: number) => void;
  onRotationChange: (rotation: number) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function TableDetailEditor({
  table, onTableUpdated, onGuestRemoved, onGuestSeatChange,
  onSizeChange, onRotationChange, onDelete, onClose,
}: TableDetailEditorProps) {
  const [name, setName] = useState(table.name);
  const [capacity, setCapacity] = useState(table.capacity);
  const [shape, setShape] = useState(table.shape);
  const [width, setWidth] = useState(table.width);
  const [height, setHeight] = useState(table.height);
  const [rotation, setRotation] = useState(table.rotation);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setName(table.name);
    setCapacity(table.capacity);
    setShape(table.shape);
    setWidth(table.width);
    setHeight(table.height);
    setRotation(table.rotation);
  }, [table.id, table.name, table.capacity, table.shape, table.width, table.height, table.rotation]);

  const saveChanges = useCallback(
    (overrides?: Partial<{ name: string; capacity: number; shape: string }>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const fd = new FormData();
        fd.set("id", table.id);
        fd.set("name", overrides?.name ?? name);
        fd.set("capacity", String(overrides?.capacity ?? capacity));
        fd.set("shape", overrides?.shape ?? shape);
        await updateTable(fd);
        onTableUpdated();
      }, 400);
    },
    [table.id, name, capacity, shape, onTableUpdated]
  );

  const handleDuplicate = async () => {
    const fd = new FormData();
    fd.set("id", table.id);
    await duplicateTable(fd);
    onTableUpdated();
  };

  // Build seat map: seatNumber -> guest
  const seatMap = new Map<number, GuestData>();
  table.guests.forEach((g) => {
    if (g.seatNumber !== null) seatMap.set(g.seatNumber, g);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text">Tisch bearbeiten</h3>
        <button onClick={onClose} className="p-1 hover:bg-surface-2 rounded-lg text-text-faint">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Name</label>
        <input type="text" value={name}
          onChange={(e) => { setName(e.target.value); saveChanges({ name: e.target.value }); }}
          className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-surface-1 text-text focus:outline-none focus:ring-1 focus:ring-primary-300"
        />
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
          Plaetze ({table.guests.length}/{capacity})
        </label>
        <input type="number" min={1} max={50} value={capacity}
          onChange={(e) => { const val = parseInt(e.target.value) || 1; setCapacity(val); saveChanges({ capacity: val }); }}
          className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-surface-1 text-text focus:outline-none focus:ring-1 focus:ring-primary-300"
        />
      </div>

      {/* Shape */}
      <div>
        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Form</label>
        <div className="flex gap-1">
          {(Object.entries(TABLE_SHAPE_LABELS) as [TableShape, string][]).map(([s, label]) => (
            <button key={s}
              onClick={() => { setShape(s); saveChanges({ shape: s }); }}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                shape === s ? "bg-primary-100 text-primary-700 border border-primary-300"
                  : "bg-surface-2 text-text-muted border border-transparent hover:bg-surface-2"
              }`}>
              {s === "ROUND" ? "\u25CF " : s === "RECT" ? "\u25A0 " : "\u2501 "}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Size (Width x Height) */}
      <div>
        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
          Größe ({Math.round(width)} × {Math.round(height)})
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[9px] text-text-faint">Breite</label>
            <input type="number" min={40} max={600} value={Math.round(width)}
              onChange={(e) => { const w = Math.max(40, parseInt(e.target.value) || 40); setWidth(w); onSizeChange(w, height); }}
              className="w-full px-2 py-1 text-xs border border-border rounded-lg bg-surface-1 text-text focus:outline-none focus:ring-1 focus:ring-primary-300"
            />
          </div>
          <div className="flex-1">
            <label className="text-[9px] text-text-faint">Hoehe</label>
            <input type="number" min={40} max={600} value={Math.round(height)}
              onChange={(e) => { const h = Math.max(40, parseInt(e.target.value) || 40); setHeight(h); onSizeChange(width, h); }}
              className="w-full px-2 py-1 text-xs border border-border rounded-lg bg-surface-1 text-text focus:outline-none focus:ring-1 focus:ring-primary-300"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
          Drehung ({Math.round(rotation)}&deg;)
        </label>
        <input type="range" min={0} max={359} value={rotation}
          onChange={(e) => { const val = parseFloat(e.target.value); setRotation(val); onRotationChange(val); }}
          className="w-full accent-primary-500"
        />
      </div>

      {/* Seat Assignment */}
      <div>
        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
          Sitzplaetze ({table.guests.length}/{capacity})
        </label>
        {table.guests.length === 0 ? (
          <p className="text-xs text-text-faint py-1">Ziehen Sie Gäste auf den Tisch.</p>
        ) : (
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {table.guests.map((g) => (
              <div key={g.id} className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-2 border border-border">
                {/* Seat number selector */}
                <select
                  value={g.seatNumber ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    onGuestSeatChange(g.id, val);
                  }}
                  className="w-10 text-center text-xs font-bold bg-primary-50 border border-primary-200 rounded px-0.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-300"
                  title="Sitznummer"
                >
                  <option value="">-</option>
                  {Array.from({ length: capacity }, (_, i) => {
                    const seatNum = i + 1;
                    const taken = seatMap.has(seatNum) && seatMap.get(seatNum)!.id !== g.id;
                    return (
                      <option key={seatNum} value={seatNum} disabled={taken}>
                        {seatNum}{taken ? " ✗" : ""}
                      </option>
                    );
                  })}
                </select>
                <span className="flex-1 text-xs text-text truncate">
                  {g.firstName} {g.lastName}
                </span>
                <button onClick={() => onGuestRemoved(g.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition-opacity" title="Entfernen">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <button onClick={handleDuplicate}
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-2 text-text rounded-lg hover:bg-surface-2 transition-colors">
          Duplizieren
        </button>
        <button onClick={onDelete}
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
          Löschen
        </button>
      </div>
      <p className="text-[10px] text-text-faint text-center">
        <kbd className="px-1 py-0.5 bg-surface-2 rounded font-mono">Del</kbd> zum Löschen
      </p>
    </div>
  );
}
