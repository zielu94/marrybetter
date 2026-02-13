"use client";

import { useState, useRef, useCallback, useMemo } from "react";

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

interface TableNodeProps {
  table: TableData;
  isSelected: boolean;
  zoom: number;
  snapToGrid: boolean;
  gridSize: number;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, posX: number, posY: number) => void;
  onDragEnd: (id: string, posX: number, posY: number) => void;
  onGuestDrop: (guestId: string, tableId: string, seatNumber?: number) => void;
}

function getOccupancyColor(guests: number, capacity: number) {
  const ratio = guests / capacity;
  if (ratio >= 1) return "border-red-400 bg-red-50";
  if (ratio >= 0.8) return "border-yellow-400 bg-yellow-50";
  return "border-green-400 bg-green-50";
}

export default function TableNode({
  table, isSelected, zoom, snapToGrid, gridSize,
  onSelect, onPositionChange, onDragEnd, onGuestDrop,
}: TableNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hoverSeat, setHoverSeat] = useState<number | null>(null);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const didMove = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Build seat map: seatNumber -> guest
  const seatMap = useMemo(() => {
    const map = new Map<number, GuestData>();
    table.guests.forEach((g) => {
      if (g.seatNumber !== null) map.set(g.seatNumber, g);
    });
    return map;
  }, [table.guests]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      setIsDragging(true);
      didMove.current = false;
      dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, posX: table.posX, posY: table.posY };
      nodeRef.current?.setPointerCapture(e.pointerId);
    },
    [table.posX, table.posY]
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
      onPositionChange(table.id, newX, newY);
    },
    [isDragging, zoom, snapToGrid, gridSize, table.id, onPositionChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.stopPropagation();
      nodeRef.current?.releasePointerCapture(e.pointerId);
      setIsDragging(false);
      if (didMove.current) {
        onDragEnd(table.id, table.posX, table.posY);
      } else {
        onSelect(table.id);
      }
    },
    [isDragging, table.id, table.posX, table.posY, onDragEnd, onSelect]
  );

  // HTML Drag API for guest drops
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
    setHoverSeat(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setHoverSeat(null);
      const guestId = e.dataTransfer.getData("guestId");
      if (guestId) onGuestDrop(guestId, table.id);
    },
    [table.id, onGuestDrop]
  );

  // Seat-specific drop
  const handleSeatDrop = useCallback(
    (e: React.DragEvent, seatNum: number) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setHoverSeat(null);
      const guestId = e.dataTransfer.getData("guestId");
      if (guestId) onGuestDrop(guestId, table.id, seatNum);
    },
    [table.id, onGuestDrop]
  );

  const occupancyColor = getOccupancyColor(table.guests.length, table.capacity);
  const isFull = table.guests.length >= table.capacity;

  const shapeStyle: React.CSSProperties = {
    width: table.width,
    height: table.height,
    borderRadius: table.shape === "ROUND" ? "50%" : "12px",
  };

  return (
    <div
      ref={nodeRef}
      className="absolute select-none touch-none"
      style={{
        left: table.posX, top: table.posY,
        transform: `rotate(${table.rotation}deg)`,
        zIndex: isDragging ? 50 : isSelected ? 40 : 10,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`
          relative flex flex-col items-center justify-center border-2 transition-all duration-150
          ${occupancyColor}
          ${isSelected ? "ring-2 ring-primary-400 ring-offset-2" : ""}
          ${isDragOver && !isFull ? "ring-2 ring-blue-400 scale-105" : ""}
          ${isDragOver && isFull ? "ring-2 ring-red-400" : ""}
          ${isDragging ? "shadow-xl opacity-90" : "shadow-md hover:shadow-lg"}
        `}
        style={shapeStyle}
      >
        <span className="text-xs font-bold text-text leading-tight text-center px-1">
          {table.name}
        </span>
        <span className={`text-[10px] font-semibold mt-0.5 ${isFull ? "text-red-600" : "text-text-muted"}`}>
          {table.guests.length}/{table.capacity}
        </span>
      </div>

      {/* Seat indicator dots — now interactive */}
      {Array.from({ length: table.capacity }).map((_, i) => {
        const seatNum = i + 1;
        const angle = (360 / table.capacity) * i - 90;
        const radians = (angle * Math.PI) / 180;
        const radiusX = table.width / 2 + 14;
        const radiusY = table.height / 2 + 14;
        const cx = table.width / 2 + Math.cos(radians) * radiusX;
        const cy = table.height / 2 + Math.sin(radians) * radiusY;

        const guestInSeat = seatMap.get(seatNum);
        const isOccupied = !!guestInSeat;
        const isHovered = hoverSeat === seatNum;

        // Build initials from guest name (e.g. "Max Mustermann" → "MM")
        const initials = guestInSeat
          ? (guestInSeat.firstName[0] + (guestInSeat.lastName[0] || "")).toUpperCase()
          : "";

        return (
          <div
            key={i}
            className={`absolute rounded-full border-2 flex items-center justify-center font-bold transition-all cursor-default
              ${isOccupied
                ? "w-6 h-6 text-[7px] bg-primary-400 border-primary-500 text-white"
                : isHovered
                  ? "w-5 h-5 text-[8px] bg-blue-200 border-blue-400 text-blue-700 scale-125"
                  : "w-5 h-5 text-[8px] bg-surface-1 border-border text-text-faint hover:border-primary-300 hover:text-primary-500"
              }
            `}
            style={{ left: cx - (isOccupied ? 12 : 10), top: cy - (isOccupied ? 12 : 10) }}
            title={isOccupied ? `${seatNum}: ${guestInSeat.firstName} ${guestInSeat.lastName}` : `Platz ${seatNum}`}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setHoverSeat(seatNum); }}
            onDragLeave={() => setHoverSeat(null)}
            onDrop={(e) => handleSeatDrop(e, seatNum)}
          >
            {isOccupied ? initials : seatNum}
          </div>
        );
      })}
    </div>
  );
}
