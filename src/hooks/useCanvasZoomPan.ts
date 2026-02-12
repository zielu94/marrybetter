"use client";

import { useState, useCallback, useRef, type WheelEvent as ReactWheelEvent } from "react";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

export function useCanvasZoomPan() {
  const [zoom, setZoomState] = useState(0.8);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const setZoom = useCallback((z: number) => {
    setZoomState(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z)));
  }, []);

  const zoomIn = useCallback(() => {
    setZoomState((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  }, []);

  const resetView = useCallback(() => {
    setZoomState(0.8);
    setPanX(0);
    setPanY(0);
  }, []);

  const handleWheel = useCallback(
    (e: ReactWheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoomState((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
      } else {
        setPanX((prev) => prev - e.deltaX / zoom);
        setPanY((prev) => prev - e.deltaY / zoom);
      }
    },
    [zoom]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      const isCanvas = target.dataset.canvas === "true" || target.dataset.viewport === "true";
      if (e.button === 1 || (e.button === 0 && isCanvas)) {
        e.preventDefault();
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
        // Capture on the currentTarget (RoomCanvas container), not target,
        // so child elements (tables, items) still receive their own pointer events
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [panX, panY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return;
      const dx = (e.clientX - panStart.current.x) / zoom;
      const dy = (e.clientY - panStart.current.y) / zoom;
      setPanX(panStart.current.panX + dx);
      setPanY(panStart.current.panY + dy);
    },
    [isPanning, zoom]
  );

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  return {
    zoom, panX, panY, isPanning,
    setZoom, zoomIn, zoomOut, resetView,
    handleWheel, handlePointerDown, handlePointerMove, handlePointerUp,
  };
}
