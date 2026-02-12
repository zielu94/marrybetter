"use client";

import { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { type TableShape, type RoomItemType, TABLE_SHAPE_DEFAULTS, ROOM_ITEM_TYPE_LABELS } from "@/types";
import {
  createTable, createRoomItem, assignGuest, unassignGuest, updateGuestSeat,
  deleteTable, deleteRoomItem, updateTable, updateRoomItem,
} from "@/actions/seating.actions";
import { useCanvasZoomPan } from "@/hooks/useCanvasZoomPan";
import { useAutosave } from "@/hooks/useAutosave";
import GuestSidebar from "./GuestSidebar";
import RoomCanvas from "./RoomCanvas";
import CanvasViewport from "./CanvasViewport";
import CanvasControls from "./CanvasControls";
import TableNode from "./TableNode";
import RoomItemNode from "./RoomItemNode";
import DetailPanel from "./DetailPanel";
import PrintView from "./PrintView";

// ── Types ──────────────────────────────────────────

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  seatingTableId: string | null;
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

interface SeatingBuilderProps {
  projectId: string;
  initialTables: TableData[];
  initialGuests: GuestData[];
  initialRoomItems: RoomItemData[];
}

// ── Component ──────────────────────────────────────

export default function SeatingBuilder({
  projectId, initialTables, initialGuests, initialRoomItems,
}: SeatingBuilderProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // ── State ────────────────────────────────────────
  const [tables, setTables] = useState<TableData[]>(initialTables);
  const [guests, setGuests] = useState<GuestData[]>(initialGuests);
  const [roomItems, setRoomItems] = useState<RoomItemData[]>(initialRoomItems);

  useEffect(() => { setTables(initialTables); }, [initialTables]);
  useEffect(() => { setGuests(initialGuests); }, [initialGuests]);
  useEffect(() => { setRoomItems(initialRoomItems); }, [initialRoomItems]);

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedRoomItemId, setSelectedRoomItemId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const {
    zoom, panX, panY, isPanning,
    zoomIn, zoomOut, resetView,
    handleWheel, handlePointerDown, handlePointerMove, handlePointerUp,
  } = useCanvasZoomPan();

  const { isSaving, lastSaved, queuePositionSave } = useAutosave();
  const GRID_SIZE = 20;

  const refreshData = useCallback(() => {
    startTransition(() => { router.refresh(); });
  }, [router, startTransition]);

  // ── Keyboard Delete/Backspace + Escape ───────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedTableId) {
          const id = selectedTableId;
          setSelectedTableId(null);
          const fd = new FormData();
          fd.set("id", id);
          deleteTable(fd).then(() => startTransition(() => { router.refresh(); }));
        } else if (selectedRoomItemId) {
          const id = selectedRoomItemId;
          setSelectedRoomItemId(null);
          const fd = new FormData();
          fd.set("id", id);
          deleteRoomItem(fd).then(() => startTransition(() => { router.refresh(); }));
        }
      }
      if (e.key === "Escape") {
        setSelectedTableId(null);
        setSelectedRoomItemId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTableId, selectedRoomItemId, router, startTransition]);

  // ── Selection ────────────────────────────────────
  const handleSelectTable = useCallback((id: string) => {
    setSelectedTableId(id);
    setSelectedRoomItemId(null);
  }, []);

  const handleSelectRoomItem = useCallback((id: string) => {
    setSelectedRoomItemId(id);
    setSelectedTableId(null);
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedTableId(null);
    setSelectedRoomItemId(null);
  }, []);

  // ── Position changes ─────────────────────────────
  const handleTablePositionChange = useCallback((id: string, posX: number, posY: number) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, posX, posY } : t)));
  }, []);

  const handleTableDragEnd = useCallback(
    (id: string, posX: number, posY: number) => { queuePositionSave({ id, posX, posY, type: "table" }); },
    [queuePositionSave]
  );

  const handleRoomItemPositionChange = useCallback((id: string, posX: number, posY: number) => {
    setRoomItems((prev) => prev.map((item) => (item.id === id ? { ...item, posX, posY } : item)));
  }, []);

  const handleRoomItemDragEnd = useCallback(
    (id: string, posX: number, posY: number) => { queuePositionSave({ id, posX, posY, type: "roomItem" }); },
    [queuePositionSave]
  );

  // ── Size changes (optimistic + persist) ──────────
  const handleTableSizeChange = useCallback(async (id: string, width: number, height: number) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, width, height } : t)));
    const fd = new FormData();
    fd.set("id", id);
    fd.set("width", String(width));
    fd.set("height", String(height));
    await updateTable(fd);
  }, []);

  const handleRoomItemSizeChange = useCallback(async (id: string, width: number, height: number) => {
    setRoomItems((prev) => prev.map((i) => (i.id === id ? { ...i, width, height } : i)));
    const fd = new FormData();
    fd.set("id", id);
    fd.set("width", String(width));
    fd.set("height", String(height));
    await updateRoomItem(fd);
  }, []);

  // ── Rotation changes (optimistic + persist) ──────
  const handleTableRotationChange = useCallback(async (id: string, rotation: number) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, rotation } : t)));
    const fd = new FormData();
    fd.set("id", id);
    fd.set("rotation", String(rotation));
    await updateTable(fd);
  }, []);

  const handleRoomItemRotationChange = useCallback(async (id: string, rotation: number) => {
    setRoomItems((prev) => prev.map((i) => (i.id === id ? { ...i, rotation } : i)));
    const fd = new FormData();
    fd.set("id", id);
    fd.set("rotation", String(rotation));
    await updateRoomItem(fd);
  }, []);

  // ── Add table / room item ────────────────────────
  const handleAddTable = useCallback(async (shape: TableShape) => {
    const defaults = TABLE_SHAPE_DEFAULTS[shape];
    const count = tables.length;
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("name", `Tisch ${count + 1}`);
    fd.set("shape", shape);
    fd.set("capacity", String(defaults.defaultCapacity));
    fd.set("posX", String(200 + (count % 5) * 180));
    fd.set("posY", String(200 + Math.floor(count / 5) * 180));
    await createTable(fd);
    startTransition(() => { router.refresh(); });
  }, [tables.length, projectId, router, startTransition]);

  const handleAddRoomItem = useCallback(async (type: RoomItemType) => {
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("itemType", type);
    fd.set("label", ROOM_ITEM_TYPE_LABELS[type]);
    fd.set("posX", String(400 + roomItems.length * 60));
    fd.set("posY", String(400));
    await createRoomItem(fd);
    startTransition(() => { router.refresh(); });
  }, [projectId, roomItems.length, router, startTransition]);

  // ── Guest assignment ─────────────────────────────
  const handleGuestDrop = useCallback(async (guestId: string, tableId: string, seatNumber?: number) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.guests.length >= table.capacity) return;
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;

    const seat = seatNumber ?? null;
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, seatingTableId: tableId, seatNumber: seat } : g)));
    setTables((prev) => prev.map((t) => {
      if (t.guests.some((g) => g.id === guestId)) return { ...t, guests: t.guests.filter((g) => g.id !== guestId) };
      if (t.id === tableId) return { ...t, guests: [...t.guests, { ...guest, seatingTableId: tableId, seatNumber: seat }] };
      return t;
    }));

    const fd = new FormData();
    fd.set("guestId", guestId);
    fd.set("tableId", tableId);
    if (seat !== null) fd.set("seatNumber", String(seat));
    await assignGuest(fd);
  }, [tables, guests]);

  const handleGuestSeatChange = useCallback(async (guestId: string, seatNumber: number | null) => {
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, seatNumber } : g)));
    setTables((prev) => prev.map((t) => ({ ...t, guests: t.guests.map((g) => (g.id === guestId ? { ...g, seatNumber } : g)) })));
    const fd = new FormData();
    fd.set("guestId", guestId);
    if (seatNumber !== null) fd.set("seatNumber", String(seatNumber));
    await updateGuestSeat(fd);
  }, []);

  const handleUnseatGuest = useCallback(async (guestId: string) => {
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, seatingTableId: null, seatNumber: null } : g)));
    setTables((prev) => prev.map((t) => ({ ...t, guests: t.guests.filter((g) => g.id !== guestId) })));
    const fd = new FormData();
    fd.set("guestId", guestId);
    await unassignGuest(fd);
  }, []);

  // ── Delete selected ──────────────────────────────
  const handleDeleteSelected = useCallback(async () => {
    if (selectedTableId) {
      const id = selectedTableId;
      setSelectedTableId(null);
      const fd = new FormData();
      fd.set("id", id);
      await deleteTable(fd);
      startTransition(() => { router.refresh(); });
    } else if (selectedRoomItemId) {
      const id = selectedRoomItemId;
      setSelectedRoomItemId(null);
      const fd = new FormData();
      fd.set("id", id);
      await deleteRoomItem(fd);
      startTransition(() => { router.refresh(); });
    }
  }, [selectedTableId, selectedRoomItemId, router, startTransition]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  // ── Derived ──────────────────────────────────────
  const selectedTable = selectedTableId ? tables.find((t) => t.id === selectedTableId) ?? null : null;
  const selectedRoomItem = selectedRoomItemId ? roomItems.find((i) => i.id === selectedRoomItemId) ?? null : null;

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden no-print-flex" tabIndex={-1}>
      <div className="w-[200px] flex-shrink-0 no-print">
        <GuestSidebar guests={guests} tables={tables.map((t) => ({ id: t.id, name: t.name }))} onUnseatGuest={handleUnseatGuest} />
      </div>

      <div className="flex-1 relative overflow-hidden min-w-0">
        <CanvasControls
          zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onResetView={resetView}
          showGrid={showGrid} onToggleGrid={() => setShowGrid(!showGrid)}
          onAddTable={handleAddTable} onAddRoomItem={handleAddRoomItem}
          onPrint={handlePrint} isSaving={isSaving} lastSaved={lastSaved}
        />
        <RoomCanvas onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} isPanning={isPanning}>
          <CanvasViewport zoom={zoom} panX={panX} panY={panY} showGrid={showGrid}>
            {roomItems.map((item) => (
              <RoomItemNode key={item.id} item={item} isSelected={selectedRoomItemId === item.id} zoom={zoom} snapToGrid={showGrid} gridSize={GRID_SIZE}
                onSelect={handleSelectRoomItem} onPositionChange={handleRoomItemPositionChange} onDragEnd={handleRoomItemDragEnd} />
            ))}
            {tables.map((table) => (
              <TableNode key={table.id} table={table} isSelected={selectedTableId === table.id} zoom={zoom} snapToGrid={showGrid} gridSize={GRID_SIZE}
                onSelect={handleSelectTable} onPositionChange={handleTablePositionChange} onDragEnd={handleTableDragEnd} onGuestDrop={handleGuestDrop} />
            ))}
          </CanvasViewport>
        </RoomCanvas>
      </div>

      <div className="w-[220px] flex-shrink-0 no-print">
        <DetailPanel
          selectedTable={selectedTable} selectedRoomItem={selectedRoomItem}
          onDataChanged={refreshData} onGuestRemoved={handleUnseatGuest}
          onGuestSeatChange={handleGuestSeatChange}
          onTableSizeChange={handleTableSizeChange} onRoomItemSizeChange={handleRoomItemSizeChange}
          onTableRotationChange={handleTableRotationChange} onRoomItemRotationChange={handleRoomItemRotationChange}
          onDelete={handleDeleteSelected} onClose={handleDeselect}
        />
      </div>

      <PrintView tables={tables} totalGuests={guests.length} />
    </div>
  );
}
