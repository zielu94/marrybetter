"use client";

import { useState } from "react";
import { TABLE_SHAPE_LABELS, ROOM_ITEM_TYPE_LABELS, ROOM_ITEM_TYPE_ICONS, type TableShape, type RoomItemType } from "@/types";

interface CanvasControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onAddTable: (shape: TableShape) => void;
  onAddRoomItem: (type: RoomItemType) => void;
  onPrint: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
}

export default function CanvasControls({
  zoom, onZoomIn, onZoomOut, onResetView,
  showGrid, onToggleGrid, onAddTable, onAddRoomItem, onPrint,
  isSaving, lastSaved,
}: CanvasControlsProps) {
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showItemMenu, setShowItemMenu] = useState(false);

  return (
    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none no-print">
      {/* Left: Zoom + Grid */}
      <div className="flex items-center gap-1 pointer-events-auto bg-surface-1/90 backdrop-blur-sm rounded-xl border border-border shadow-sm px-2 py-1.5">
        <button onClick={onZoomOut} className="p-1.5 hover:bg-surface-2 rounded-lg text-text-muted" title="Verkleinern">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>
        <span className="text-xs font-medium text-text-muted min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="p-1.5 hover:bg-surface-2 rounded-lg text-text-muted" title="Vergroessern">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <div className="w-px h-5 bg-border mx-1" />
        <button onClick={onResetView} className="p-1.5 hover:bg-surface-2 rounded-lg text-text-muted text-xs font-medium">
          Reset
        </button>
        <div className="w-px h-5 bg-border mx-1" />
        <button
          onClick={onToggleGrid}
          className={`p-1.5 rounded-lg text-xs font-medium ${showGrid ? "bg-primary-100 text-primary-700" : "hover:bg-surface-2 text-text-muted"}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      </div>

      {/* Center: Add buttons */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="relative">
          <button
            onClick={() => { setShowTableMenu(!showTableMenu); setShowItemMenu(false); }}
            className="px-3 py-1.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 shadow-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tisch
          </button>
          {showTableMenu && (
            <div className="absolute top-full mt-1 left-0 bg-surface-1 rounded-xl border border-border shadow-lg py-1 min-w-[160px] z-30">
              {(Object.entries(TABLE_SHAPE_LABELS) as [TableShape, string][]).map(([shape, label]) => (
                <button
                  key={shape}
                  onClick={() => { onAddTable(shape); setShowTableMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface-2"
                >
                  {shape === "ROUND" ? "\u25CF " : shape === "RECT" ? "\u25A0 " : "\u2501 "}{label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowItemMenu(!showItemMenu); setShowTableMenu(false); }}
            className="px-3 py-1.5 bg-surface-1 border border-border text-text rounded-xl text-sm font-medium hover:bg-surface-2 shadow-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Objekt
          </button>
          {showItemMenu && (
            <div className="absolute top-full mt-1 left-0 bg-surface-1 rounded-xl border border-border shadow-lg py-1 min-w-[180px] z-30">
              {(Object.entries(ROOM_ITEM_TYPE_LABELS) as [RoomItemType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => { onAddRoomItem(type); setShowItemMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface-2"
                >
                  {ROOM_ITEM_TYPE_ICONS[type]} {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Save + Print */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <span className="text-xs text-text-faint">
          {isSaving ? "Speichert..." : lastSaved ? `Gespeichert ${lastSaved.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}` : ""}
        </span>
        <button onClick={onPrint} className="px-3 py-1.5 bg-surface-1 border border-border text-text rounded-xl text-sm font-medium hover:bg-surface-2 shadow-sm flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          PDF
        </button>
      </div>
    </div>
  );
}
