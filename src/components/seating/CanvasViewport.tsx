"use client";

import { forwardRef } from "react";

interface CanvasViewportProps {
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  children: React.ReactNode;
}

const CANVAS_WIDTH = 3000;
const CANVAS_HEIGHT = 2000;
const GRID_SIZE = 20;

const CanvasViewport = forwardRef<HTMLDivElement, CanvasViewportProps>(
  function CanvasViewport({ zoom, panX, panY, showGrid, children }, ref) {
    const gridBg = showGrid
      ? {
          backgroundImage: `
            radial-gradient(circle, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }
      : {};

    return (
      <div
        ref={ref}
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: "0 0",
          position: "relative",
          ...gridBg,
        }}
        className="bg-surface-2/50"
        data-viewport="true"
      >
        {children}
      </div>
    );
  }
);

export default CanvasViewport;
