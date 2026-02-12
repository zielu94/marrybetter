"use client";

import { useState, useRef, useCallback } from "react";
import { batchUpdatePositions } from "@/actions/seating.actions";

interface PositionUpdate {
  id: string;
  posX: number;
  posY: number;
  type: "table" | "roomItem";
}

export function useAutosave() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const pendingUpdates = useRef<Map<string, PositionUpdate>>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flush = useCallback(async () => {
    const updates = Array.from(pendingUpdates.current.values());
    if (updates.length === 0) return;
    pendingUpdates.current.clear();

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.set("positions", JSON.stringify(updates));
      await batchUpdatePositions(fd);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Autosave failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const queuePositionSave = useCallback(
    (update: PositionUpdate) => {
      pendingUpdates.current.set(update.id, update);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, 500);
    },
    [flush]
  );

  const flushNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await flush();
  }, [flush]);

  return { isSaving, lastSaved, queuePositionSave, flushNow };
}
