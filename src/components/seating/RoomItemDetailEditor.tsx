"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ROOM_ITEM_TYPE_LABELS, ROOM_ITEM_TYPE_ICONS, type RoomItemType } from "@/types";
import { updateRoomItem } from "@/actions/seating.actions";

interface RoomItemData {
  id: string;
  itemType: string;
  label: string | null;
  posX: number;
  posY: number;
  width: number;
  height: number;
  rotation: number;
}

interface RoomItemDetailEditorProps {
  item: RoomItemData;
  onItemUpdated: () => void;
  onSizeChange: (width: number, height: number) => void;
  onRotationChange: (rotation: number) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function RoomItemDetailEditor({
  item, onItemUpdated, onSizeChange, onRotationChange, onDelete, onClose,
}: RoomItemDetailEditorProps) {
  const [label, setLabel] = useState(item.label || "");
  const [itemType, setItemType] = useState(item.itemType);
  const [width, setWidth] = useState(item.width);
  const [height, setHeight] = useState(item.height);
  const [rotation, setRotation] = useState(item.rotation);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLabel(item.label || "");
    setItemType(item.itemType);
    setWidth(item.width);
    setHeight(item.height);
    setRotation(item.rotation);
  }, [item.id, item.label, item.itemType, item.width, item.height, item.rotation]);

  const saveChanges = useCallback(
    (overrides?: Partial<{ label: string; itemType: string }>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const fd = new FormData();
        fd.set("id", item.id);
        fd.set("label", overrides?.label ?? label);
        fd.set("itemType", overrides?.itemType ?? itemType);
        await updateRoomItem(fd);
        onItemUpdated();
      }, 400);
    },
    [item.id, label, itemType, onItemUpdated]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text">Objekt bearbeiten</h3>
        <button onClick={onClose} className="p-1 hover:bg-surface-2 rounded-lg text-text-faint">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Label */}
      <div>
        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Beschriftung</label>
        <input type="text" value={label}
          onChange={(e) => { setLabel(e.target.value); saveChanges({ label: e.target.value }); }}
          placeholder={ROOM_ITEM_TYPE_LABELS[itemType as RoomItemType] || "Beschriftung"}
          className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-surface-1 text-text focus:outline-none focus:ring-1 focus:ring-primary-300"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Typ</label>
        <div className="grid grid-cols-2 gap-1">
          {(Object.entries(ROOM_ITEM_TYPE_LABELS) as [RoomItemType, string][]).map(([type, typeLabel]) => (
            <button key={type}
              onClick={() => { setItemType(type); saveChanges({ itemType: type }); }}
              className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                itemType === type ? "bg-primary-100 text-primary-700 border border-primary-300"
                  : "bg-surface-2 text-text-muted border border-transparent hover:bg-surface-2"
              }`}>
              <span>{ROOM_ITEM_TYPE_ICONS[type]}</span>
              <span className="truncate">{typeLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
          Größe ({Math.round(width)} × {Math.round(height)})
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[9px] text-text-faint">Breite</label>
            <input type="number" min={20} max={600} value={Math.round(width)}
              onChange={(e) => { const w = Math.max(20, parseInt(e.target.value) || 20); setWidth(w); onSizeChange(w, height); }}
              className="w-full px-2 py-1 text-xs border border-border rounded-lg bg-surface-1 text-text focus:outline-none focus:ring-1 focus:ring-primary-300"
            />
          </div>
          <div className="flex-1">
            <label className="text-[9px] text-text-faint">Hoehe</label>
            <input type="number" min={20} max={600} value={Math.round(height)}
              onChange={(e) => { const h = Math.max(20, parseInt(e.target.value) || 20); setHeight(h); onSizeChange(width, h); }}
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

      {/* Delete */}
      <div className="pt-2 border-t border-border">
        <button onClick={onDelete}
          className="w-full px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
          Löschen
        </button>
      </div>
      <p className="text-[10px] text-text-faint text-center">
        <kbd className="px-1 py-0.5 bg-surface-2 rounded font-mono">Del</kbd> zum Löschen
      </p>
    </div>
  );
}
