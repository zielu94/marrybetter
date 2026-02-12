"use client";

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
  guests: GuestData[];
}

interface PrintViewProps {
  tables: TableData[];
  totalGuests: number;
}

export default function PrintView({ tables, totalGuests }: PrintViewProps) {
  const totalSeated = tables.reduce((sum, t) => sum + t.guests.length, 0);
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

  return (
    <div className="print-only hidden">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-1">Sitzplan</h1>
        <p className="text-sm text-text-muted mb-6">
          {tables.length} Tische &middot; {totalSeated}/{totalGuests} Gäste platziert &middot; {totalCapacity} Plaetze gesamt
        </p>

        <div className="grid grid-cols-2 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">{table.name}</h3>
                <span className="text-xs text-text-muted">
                  {table.guests.length}/{table.capacity} Plaetze
                </span>
              </div>
              {table.guests.length === 0 ? (
                <p className="text-xs text-text-faint italic">Keine Gäste zugewiesen</p>
              ) : (
                <ol className="text-xs space-y-0.5">
                  {table.guests.map((g, i) => (
                    <li key={g.id} className="flex items-center gap-1">
                      <span className="text-text-faint w-4">{g.seatNumber ?? (i + 1)}.</span>
                      <span>{g.firstName} {g.lastName}</span>
                      {g.status === "CONFIRMED" && (
                        <span className="text-green-600 text-[10px]">✓</span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
