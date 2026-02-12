"use client";

import { useEffect } from "react";
import {
  type ScheduleDay,
  detectConflicts,
  minutesDiff,
  formatDuration,
  formatDayDate,
} from "@/lib/schedule-utils";
import { VENDOR_CATEGORY_LABELS } from "@/types";

/* ─── Types ─── */

interface VendorContact {
  name: string;
  category: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
}

interface PrintMeta {
  coupleName: string;
  weddingDate: string | null;
  location: string | null;
}

interface PrintOptions {
  detail: boolean;
  contacts: boolean;
  conflicts: boolean;
}

interface SchedulePrintViewProps {
  days: ScheduleDay[];
  vendors: VendorContact[];
  meta: PrintMeta;
  options: PrintOptions;
}

/* ─── Main Component ─── */

export default function SchedulePrintView({
  days,
  vendors,
  meta,
  options,
}: SchedulePrintViewProps) {
  // Auto-trigger print dialog after render
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, []);

  const now = new Date();
  const exportTimestamp =
    now.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    ", " +
    now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="print-view">
      {/* ═══ Header ═══ */}
      <header className="print-header">
        <h1 className="print-title">Hochzeit &mdash; Ablaufplan</h1>
        {meta.coupleName && (
          <p className="print-couple">{meta.coupleName}</p>
        )}
        {meta.weddingDate && (
          <p className="print-date">{formatDayDate(meta.weddingDate)}</p>
        )}
        {meta.location && (
          <p className="print-location">{meta.location}</p>
        )}
        <p className="print-timestamp">Stand: {exportTimestamp}</p>
      </header>

      {/* ═══ Per-day sections ═══ */}
      {days.map((day) => {
        const conflictSet = options.conflicts
          ? detectConflicts(day.events)
          : new Set<string>();
        const sortedEvents = [...day.events].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );

        return (
          <section key={day.id} className="print-day-section">
            <h2 className="print-day-heading">
              {day.name}
              {day.date && (
                <span className="print-day-date">
                  {" "}
                  &mdash; {formatDayDate(day.date)}
                </span>
              )}
            </h2>

            {sortedEvents.length > 0 ? (
              <table className="print-event-table">
                <tbody>
                  {sortedEvents.map((event) => {
                    const hasConflict = conflictSet.has(event.id);
                    const duration =
                      event.endTime
                        ? minutesDiff(event.startTime, event.endTime)
                        : null;

                    return (
                      <tr key={event.id} className="print-event-row">
                        {/* Time column */}
                        <td className="print-time-cell">
                          <span className="print-start-time">
                            {event.startTime}
                          </span>
                          {event.endTime && (
                            <>
                              <br />
                              <span className="print-end-time">
                                {event.endTime}
                              </span>
                            </>
                          )}
                          {duration !== null && duration > 0 && (
                            <>
                              <br />
                              <span className="print-duration">
                                ({formatDuration(duration)})
                              </span>
                            </>
                          )}
                        </td>

                        {/* Content column */}
                        <td className="print-content-cell">
                          <span className="print-event-title">
                            {event.title}
                          </span>
                          {hasConflict && (
                            <span className="print-conflict-badge">
                              Zeitkonflikt
                            </span>
                          )}
                          {event.location && (
                            <span className="print-event-location">
                              📍 {event.location}
                            </span>
                          )}
                          {options.detail && event.owner && (
                            <span className="print-event-owner">
                              Verantw.: {event.owner}
                            </span>
                          )}
                          {options.detail && event.description && (
                            <span className="print-event-notes">
                              {event.description}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="print-empty">Keine Programmpunkte.</p>
            )}
          </section>
        );
      })}

      {/* ═══ Vendor contacts (opt-in) ═══ */}
      {options.contacts && vendors.length > 0 && (
        <section className="print-vendors-section">
          <h2 className="print-day-heading">Kontaktdaten Dienstleister</h2>
          <table className="print-vendor-table">
            <thead>
              <tr>
                <th>Kategorie</th>
                <th>Name</th>
                <th>Ansprechpartner</th>
                <th>Kontakt</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, i) => (
                <tr key={i}>
                  <td>
                    {(VENDOR_CATEGORY_LABELS as Record<string, string>)[
                      v.category
                    ] ?? v.category}
                  </td>
                  <td>{v.name}</td>
                  <td>{v.contactName ?? "\u2014"}</td>
                  <td>
                    {[v.phone, v.email].filter(Boolean).join(" | ") || "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ═══ Footer (rendered on each printed page via CSS) ═══ */}
      <footer className="print-footer">
        Erstellt mit MarryBetter.com
      </footer>

      {/* ═══ Screen-only controls ═══ */}
      <div className="no-print" style={{ textAlign: "center", padding: "2rem" }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "0.75rem 2rem",
            background: "#111",
            color: "#fff",
            borderRadius: "0.75rem",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            marginRight: "0.5rem",
          }}
        >
          Drucken / PDF speichern
        </button>
        <button
          onClick={() => window.close()}
          style={{
            padding: "0.75rem 2rem",
            background: "#f3f4f6",
            color: "#374151",
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Schliessen
        </button>
      </div>
    </div>
  );
}
