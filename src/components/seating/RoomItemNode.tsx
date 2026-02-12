"use client";

import { useState, useRef, useCallback } from "react";
import { ROOM_ITEM_TYPE_LABELS, ROOM_ITEM_TYPE_ICONS, type RoomItemType } from "@/types";

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

interface RoomItemNodeProps {
  item: RoomItemData;
  isSelected: boolean;
  zoom: number;
  snapToGrid: boolean;
  gridSize: number;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, posX: number, posY: number) => void;
  onDragEnd: (id: string, posX: number, posY: number) => void;
}

export default function RoomItemNode({
  item, isSelected, zoom, snapToGrid, gridSize,
  onSelect, onPositionChange, onDragEnd,
}: RoomItemNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const didMove = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      setIsDragging(true);
      didMove.current = false;
      dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, posX: item.posX, posY: item.posY };
      nodeRef.current?.setPointerCapture(e.pointerId);
    },
    [item.posX, item.posY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.stopPropagation();
      const dx = (e.clientX - dragStart.current.mouseX) / zoom;
      const dy = (e.clientY - dragStart.current.mouseY) / zoom;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didMove.current = true;
      let newX = Math.max(0, dragStart.current.posX + dx);
      let newY = Math.max(0, dragStart.current.posY + dy);
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      onPositionChange(item.id, newX, newY);
    },
    [isDragging, zoom, snapToGrid, gridSize, item.id, onPositionChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.stopPropagation();
      nodeRef.current?.releasePointerCapture(e.pointerId);
      setIsDragging(false);
      if (didMove.current) {
        onDragEnd(item.id, item.posX, item.posY);
      } else {
        onSelect(item.id);
      }
    },
    [isDragging, item.id, item.posX, item.posY, onDragEnd, onSelect]
  );

  const icon = ROOM_ITEM_TYPE_ICONS[item.itemType as RoomItemType] || "\uD83D\uDCE6";
  const typeLabel = ROOM_ITEM_TYPE_LABELS[item.itemType as RoomItemType] || item.itemType;

  return (
    <div
      ref={nodeRef}
      className="absolute select-none touch-none"
      style={{
        left: item.posX, top: item.posY,
        transform: `rotate(${item.rotation}deg)`,
        zIndex: isDragging ? 50 : isSelected ? 40 : 5,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className={`
          flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-150
          bg-surface-2/80 border-border
          ${isSelected ? "ring-2 ring-primary-400 ring-offset-2" : ""}
          ${isDragging ? "shadow-xl opacity-90" : "shadow-sm hover:shadow-md"}
        `}
        style={{ width: item.width, height: item.height }}
      >
        <span className="text-2xl leading-none">{icon}</span>
        <span className="text-[10px] font-medium text-text-muted mt-1 text-center px-1 leading-tight">
          {item.label || typeLabel}
        </span>
      </div>
    </div>
  );
}
