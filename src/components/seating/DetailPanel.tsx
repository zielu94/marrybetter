"use client";

import TableDetailEditor from "./TableDetailEditor";
import RoomItemDetailEditor from "./RoomItemDetailEditor";

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

interface DetailPanelProps {
  selectedTable: TableData | null;
  selectedRoomItem: RoomItemData | null;
  onDataChanged: () => void;
  onGuestRemoved: (guestId: string) => void;
  onGuestSeatChange: (guestId: string, seatNumber: number | null) => void;
  onTableSizeChange: (id: string, width: number, height: number) => void;
  onRoomItemSizeChange: (id: string, width: number, height: number) => void;
  onTableRotationChange: (id: string, rotation: number) => void;
  onRoomItemRotationChange: (id: string, rotation: number) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function DetailPanel({
  selectedTable, selectedRoomItem, onDataChanged, onGuestRemoved, onGuestSeatChange,
  onTableSizeChange, onRoomItemSizeChange,
  onTableRotationChange, onRoomItemRotationChange,
  onDelete, onClose,
}: DetailPanelProps) {
  if (!selectedTable && !selectedRoomItem) {
    return (
      <div className="flex flex-col h-full bg-surface-1 border-l border-border">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">👆</div>
            <p className="text-sm text-text-muted">
              Waehlen Sie einen Tisch oder ein Objekt aus, um es zu bearbeiten.
            </p>
            <p className="text-xs text-text-faint mt-2">
              <kbd className="px-1.5 py-0.5 bg-surface-2 rounded text-[10px] font-mono">Del</kbd> oder{" "}
              <kbd className="px-1.5 py-0.5 bg-surface-2 rounded text-[10px] font-mono">Backspace</kbd>{" "}
              zum Löschen
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-1 border-l border-border">
      <div className="flex-1 overflow-y-auto p-3">
        {selectedTable && (
          <TableDetailEditor
            table={selectedTable}
            onTableUpdated={onDataChanged}
            onGuestRemoved={onGuestRemoved}
            onGuestSeatChange={onGuestSeatChange}
            onSizeChange={(w, h) => onTableSizeChange(selectedTable.id, w, h)}
            onRotationChange={(r) => onTableRotationChange(selectedTable.id, r)}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
        {selectedRoomItem && (
          <RoomItemDetailEditor
            item={selectedRoomItem}
            onItemUpdated={onDataChanged}
            onSizeChange={(w, h) => onRoomItemSizeChange(selectedRoomItem.id, w, h)}
            onRotationChange={(r) => onRoomItemRotationChange(selectedRoomItem.id, r)}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
