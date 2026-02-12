"use client";

import { useRef } from "react";

interface RoomCanvasProps {
  onWheel: (e: React.WheelEvent) => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  isPanning: boolean;
  children: React.ReactNode;
}

export default function RoomCanvas({
  onWheel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  isPanning,
  children,
}: RoomCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-surface-1"
      style={{ cursor: isPanning ? "grabbing" : "default" }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      data-canvas="true"
    >
      {children}
    </div>
  );
}
