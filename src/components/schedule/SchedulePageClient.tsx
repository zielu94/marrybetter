"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import {
  createScheduleDay,
  updateScheduleDay,
  deleteScheduleDay,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
  createBulkScheduleEvents,
} from "@/actions/schedule.actions";
import { MAX_SCHEDULE_DAYS } from "@/types";
import {
  type ScheduleEvent,
  type ScheduleDay,
  timeToMinutes,
  minutesDiff,
  formatDuration,
  formatDayDate,
  formatDayDateShort,
  detectConflicts,
  detectGaps,
} from "@/lib/schedule-utils";

interface SchedulePageClientProps {
  days: ScheduleDay[];
  projectId: string;
}

const TIMELINE_TEMPLATES = [
  {
    id: "classic",
    name: "Klassische Hochzeit",
    description: "Typischer Tagesablauf mit Trauung, Empfang und Feier",
    events: [
      { title: "Getting Ready Braut", startTime: "09:00", endTime: "12:00" },
      { title: "Getting Ready Bräutigam", startTime: "10:00", endTime: "12:00" },
      { title: "First Look", startTime: "12:30", endTime: "13:00" },
      { title: "Paarshooting", startTime: "13:00", endTime: "14:00" },
      { title: "Standesamtliche Trauung", startTime: "14:00", endTime: "14:45" },
      { title: "Sektempfang", startTime: "15:00", endTime: "16:00" },
      { title: "Kaffee und Kuchen", startTime: "16:00", endTime: "17:00" },
      { title: "Gruppenfoto", startTime: "17:00", endTime: "17:30" },
      { title: "Abendessen", startTime: "18:00", endTime: "19:30" },
      { title: "Eröffnungstanz", startTime: "20:00", endTime: "20:15" },
      { title: "Reden und Spiele", startTime: "20:15", endTime: "21:30" },
      { title: "Party und Tanz", startTime: "21:30", endTime: "02:00" },
    ],
  },
  {
    id: "intimate",
    name: "Intime Feier",
    description: "Kompakter Ablauf für kleine Hochzeiten",
    events: [
      { title: "Getting Ready", startTime: "11:00", endTime: "13:00" },
      { title: "Freie Trauung", startTime: "14:00", endTime: "15:00" },
      { title: "Empfang und Fotos", startTime: "15:00", endTime: "16:30" },
      { title: "Dinner", startTime: "17:00", endTime: "19:00" },
      { title: "Reden", startTime: "19:00", endTime: "19:30" },
      { title: "Eröffnungstanz", startTime: "19:30", endTime: "19:45" },
      { title: "Abendprogramm", startTime: "20:00", endTime: "00:00" },
    ],
  },
  {
    id: "brunch",
    name: "Brunch am Sonntag",
    description: "Entspannter Morgen nach der Hochzeit",
    events: [
      { title: "Brunch-Empfang", startTime: "10:30", endTime: "11:00" },
      { title: "Gemeinsames Frühstück", startTime: "11:00", endTime: "13:00" },
      { title: "Verabschiedung", startTime: "13:00", endTime: "14:00" },
    ],
  },
];

// ─── Owner / Visibility options ─────────────────────────

const OWNER_OPTIONS = [
  { value: "", label: "Keine Auswahl" },
  { value: "Braut", label: "Braut" },
  { value: "Bräutigam", label: "Bräutigam" },
  { value: "Planer", label: "Planer" },
  { value: "Dienstleister", label: "Dienstleister" },
];

const VISIBILITY_OPTIONS = [
  { value: "", label: "Keine Auswahl" },
  { value: "couple", label: "Nur Brautpaar" },
  { value: "weddingparty", label: "Hochzeitsgesellschaft" },
  { value: "vendors", label: "Dienstleister" },
];

// ─── Main Component ─────────────────────────────────────

export default function SchedulePageClient({ days, projectId }: SchedulePageClientProps) {
  const [activeDayId, setActiveDayId] = useState<string | null>(days[0]?.id ?? null);
  const [showDayForm, setShowDayForm] = useState(false);
  const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const activeDay = days.find((d) => d.id === activeDayId) || days[0] || null;

  // Conflict + gap detection for active day
  const conflicts = useMemo(() => (activeDay ? detectConflicts(activeDay.events) : new Set<string>()), [activeDay]);
  const gaps = useMemo(() => (activeDay ? detectGaps(activeDay.events) : []), [activeDay]);

  // Summary counts
  const totalEvents = activeDay?.events.length ?? 0;
  const conflictCount = conflicts.size > 0 ? Math.floor(conflicts.size / 2) : 0; // pairs
  const gapCount = gaps.length;

  // Time span
  const timeSpan = useMemo(() => {
    if (!activeDay || activeDay.events.length === 0) return null;
    const sorted = [...activeDay.events].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const first = sorted[0].startTime;
    const lastEvent = sorted[sorted.length - 1];
    const last = lastEvent.endTime || lastEvent.startTime;
    return { from: first, to: last };
  }, [activeDay]);

  // Export active day as CSV
  function handleCsvExport() {
    if (!activeDay) return;
    const sorted = [...activeDay.events].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const escCsv = (val: string | null | undefined) => {
      if (!val) return "";
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const header = "Startzeit,Endzeit,Titel,Ort,Beschreibung,Verantwortlich";
    const rows = sorted.map((e) =>
      [
        e.startTime,
        e.endTime ?? "",
        escCsv(e.title),
        escCsv(e.location),
        escCsv(e.description),
        escCsv(e.owner),
      ].join(",")
    );

    const bom = "\uFEFF"; // UTF-8 BOM for Excel
    const csv = bom + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = activeDay.name.replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g, "").trim() || "Timeline";
    a.download = `${safeName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 max-w-5xl">

      {/* ──────────────────────────────────────────────────────
          1. COMMAND BAR HEADER
          ──────────────────────────────────────────────────── */}
      <div className="bg-surface-1 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text tracking-tight">Timeline</h1>
            {activeDay && timeSpan && (
              <p className="text-[14px] text-text-muted mt-0.5">
                {timeSpan.from} – {timeSpan.to} Uhr
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeDay && activeDay.events.length > 0 && (
              <>
                <button
                  onClick={handleCsvExport}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                  title="Als CSV exportieren"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  CSV
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                  title="PDF für Dienstleister erstellen"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Dienstleister-PDF
                </button>
              </>
            )}
            {activeDay && (
              <button
                onClick={() => setShowAddEvent(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Programmpunkt
              </button>
            )}
          </div>
        </div>

        {/* Summary line */}
        {activeDay && totalEvents > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
            <span className="text-[12px] text-text-faint">
              {totalEvents} {totalEvents === 1 ? "Punkt" : "Punkte"}
            </span>
            {conflictCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {conflictCount} {conflictCount === 1 ? "Konflikt" : "Konflikte"}
              </span>
            )}
            {gapCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[12px] text-text-faint">
                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                {gapCount} {gapCount === 1 ? "Luecke" : "Luecken"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────
          2. NO DAYS — Empty State
          ──────────────────────────────────────────────────── */}
      {days.length === 0 ? (
        <div className="bg-surface-1 rounded-2xl shadow-sm py-8">
          <EmptyState
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Noch kein Zeitplan vorhanden"
            description="Erstelle deinen ersten Hochzeitstag, um den Tagesablauf zu planen."
            action={
              <Button onClick={() => setShowDayForm(true)}>
                + Ersten Tag hinzufügen
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* ──────────────────────────────────────────────────────
              3. DAY TABS — Premium segmented control
              ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <div className="bg-surface-2/80 rounded-xl p-1 inline-flex gap-1">
              {days.map((day) => {
                const isActive = activeDay?.id === day.id;
                return (
                  <button
                    key={day.id}
                    onClick={() => { setActiveDayId(day.id); setSelectedEvent(null); }}
                    className={`relative px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-surface-1 text-text shadow-sm"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <span>{day.name}</span>
                    {day.date && (
                      <span className="ml-1.5 text-text-faint text-[12px]">
                        {formatDayDateShort(day.date)}
                      </span>
                    )}
                    {isActive && day.events.length > 0 && (
                      <span className="ml-1.5 text-[11px] text-text-faint">{day.events.length}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Edit active day */}
            {activeDay && (
              <button
                onClick={() => setEditingDay(activeDay)}
                className="p-2 text-text-faint hover:text-text-muted rounded-lg hover:bg-surface-2 transition-colors"
                title="Tag bearbeiten"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}

            {/* Add day */}
            {days.length < MAX_SCHEDULE_DAYS && (
              <button
                onClick={() => setShowDayForm(true)}
                className="p-2 text-text-faint hover:text-text-muted rounded-lg hover:bg-surface-2 transition-colors"
                title="Weiteren Tag hinzufügen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────
              4. TIMELINE + INSPECTOR — 2-pane layout
              ──────────────────────────────────────────────────── */}
          {activeDay && (
            <div className="flex gap-4">
              {/* Main timeline */}
              <div className={`flex-1 min-w-0 ${selectedEvent ? "hidden md:block" : ""}`}>
                <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden">
                  {/* Day header bar */}
                  <div className="px-5 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-[16px] font-semibold text-text">{activeDay.name}</h2>
                        {activeDay.date && (
                          <p className="text-[13px] text-text-faint mt-0.5">{formatDayDate(activeDay.date)}</p>
                        )}
                      </div>
                      {activeDay.events.length === 0 && (
                        <button
                          onClick={() => setShowTemplates(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          Vorlage verwenden
                        </button>
                      )}
                    </div>
                  </div>

                  {activeDay.events.length > 0 ? (
                    <div className="divide-y divide-border">
                      {activeDay.events.map((event, index) => {
                        const hasConflict = conflicts.has(event.id);
                        const isSelected = selectedEvent?.id === event.id;
                        const duration = event.endTime ? minutesDiff(event.startTime, event.endTime) : null;

                        // Check if there's a gap after this event
                        const gapAfter = gaps.find((g) => g.afterEventId === event.id);

                        return (
                          <div key={event.id}>
                            {/* Event row */}
                            <div
                              className={`flex items-start gap-0 hover:bg-surface-2/60 transition-colors cursor-pointer group ${isSelected ? "bg-blue-50/40" : ""}`}
                              onClick={() => setSelectedEvent(isSelected ? null : event)}
                            >
                              {/* Time column — fixed width */}
                              <div className="w-24 flex-shrink-0 py-3.5 pl-5 pr-2 text-right">
                                <p className="text-[14px] font-semibold text-text tabular-nums">{event.startTime}</p>
                                {event.endTime && (
                                  <p className="text-[12px] text-text-faint tabular-nums">{event.endTime}</p>
                                )}
                              </div>

                              {/* Timeline line + dot */}
                              <div className="relative flex-shrink-0 w-8 flex flex-col items-center py-3.5">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                                  hasConflict ? "bg-amber-400 ring-2 ring-amber-100" : "bg-blue-400"
                                }`} />
                                {index < activeDay.events.length - 1 && (
                                  <div className="flex-1 w-px bg-border mt-1.5" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 py-3.5 pr-4">
                                <div className="flex items-center gap-2">
                                  <p className="text-[14px] font-medium text-text truncate">{event.title}</p>
                                  {hasConflict && (
                                    <span className="flex-shrink-0 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                      Konflikt
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {duration && duration > 0 && (
                                    <span className="text-[12px] text-text-faint">{formatDuration(duration)}</span>
                                  )}
                                  {event.location && (
                                    <>
                                      {duration && <span className="text-border">&middot;</span>}
                                      <span className="text-[12px] text-text-faint flex items-center gap-0.5">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                                        </svg>
                                        {event.location}
                                      </span>
                                    </>
                                  )}
                                  {event.description && (
                                    <>
                                      <span className="text-border">&middot;</span>
                                      <span className="text-[12px] text-text-faint truncate max-w-48">{event.description}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Hover actions */}
                              <div className="flex items-center gap-0.5 py-3.5 pr-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                                  className="p-1.5 rounded-lg text-text-faint hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                  title="Bearbeiten"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <form action={deleteScheduleEvent} onClick={(e) => e.stopPropagation()}>
                                  <input type="hidden" name="id" value={event.id} />
                                  <button type="submit" className="p-1.5 rounded-lg text-text-faint hover:text-red-500 hover:bg-red-50 transition-colors" title="Löschen">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </form>
                              </div>
                            </div>

                            {/* Gap indicator */}
                            {gapAfter && (
                              <div className="flex items-center gap-0 px-0">
                                <div className="w-24 flex-shrink-0" />
                                <div className="w-8 flex-shrink-0 flex justify-center">
                                  <div className="w-px h-6 border-l border-dashed border-border" />
                                </div>
                                <div className="flex-1 py-1.5">
                                  <button
                                    onClick={() => setShowAddEvent(true)}
                                    className="inline-flex items-center gap-1.5 text-[11px] text-text-faint hover:text-blue-500 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    {formatDuration(gapAfter.minutes)} frei ({gapAfter.startTime} – {gapAfter.endTime})
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add at bottom */}
                      <div className="px-5 py-3 flex items-center justify-between">
                        <button
                          onClick={() => setShowAddEvent(true)}
                          className="inline-flex items-center gap-1.5 text-[13px] text-blue-500 hover:text-blue-600 font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Programmpunkt hinzufügen
                        </button>
                        <button
                          onClick={() => setShowTemplates(true)}
                          className="text-[12px] text-text-faint hover:text-text-muted transition-colors"
                        >
                          Vorlage
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Empty day state */
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-[14px] font-medium text-text">Noch keine Programmpunkte</p>
                      <p className="text-[13px] text-text-faint mt-1 mb-4">Starte mit einer Vorlage oder fuege einzelne Punkte hinzu.</p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setShowTemplates(true)}
                          className="px-4 py-2 rounded-lg bg-surface-2 text-[13px] font-medium text-text-muted hover:bg-surface-2 transition-colors"
                        >
                          Vorlage verwenden
                        </button>
                        <button
                          onClick={() => setShowAddEvent(true)}
                          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition-colors"
                        >
                          + Programmpunkt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inspector panel */}
              {selectedEvent && (
                <div className="w-full md:w-80 flex-shrink-0">
                  <EventInspector
                    event={selectedEvent}
                    dayId={activeDay.id}
                    hasConflict={conflicts.has(selectedEvent.id)}
                    onClose={() => setSelectedEvent(null)}
                    showMoreOptions={showMoreOptions}
                    onToggleMore={() => setShowMoreOptions(!showMoreOptions)}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ──────────────────────────────────────────────────────
          MODALS
          ──────────────────────────────────────────────────── */}

      {/* Day form modal */}
      <Modal
        open={showDayForm || !!editingDay}
        onClose={() => { setShowDayForm(false); setEditingDay(null); }}
        title={editingDay ? "Tag bearbeiten" : "Neuer Tag"}
      >
        <DayFormInline
          projectId={projectId}
          day={editingDay ? { id: editingDay.id, name: editingDay.name, date: editingDay.date } : null}
          onClose={() => { setShowDayForm(false); setEditingDay(null); }}
        />
      </Modal>

      {/* Add event modal */}
      <Modal
        open={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        title="Neuer Programmpunkt"
      >
        {activeDay && (
          <EventFormInline
            dayId={activeDay.id}
            event={null}
            onClose={() => setShowAddEvent(false)}
          />
        )}
      </Modal>

      {/* Templates modal */}
      <Modal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Vorlage verwenden"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-text-muted mb-4">
            Waehle eine Vorlage, um typische Programmpunkte hinzuzufuegen.
          </p>
          {TIMELINE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={async () => {
                if (!activeDay) return;
                await createBulkScheduleEvents(activeDay.id, tmpl.events);
                setShowTemplates(false);
              }}
              className="w-full text-left p-4 rounded-xl border border-border hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-text group-hover:text-blue-600 transition-colors">{tmpl.name}</p>
                  <p className="text-[12px] text-text-faint mt-0.5">{tmpl.description}</p>
                </div>
                <span className="text-[12px] text-text-faint bg-surface-2 px-2 py-0.5 rounded-full">
                  {tmpl.events.length} Punkte
                </span>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Export PDF modal */}
      <Modal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="PDF für Dienstleister"
      >
        <ExportPdfModal
          days={days}
          onClose={() => setShowExportModal(false)}
        />
      </Modal>
    </div>
  );
}

/* ─── Export PDF Modal ─────────────────────────────────── */

function ExportPdfModal({
  days,
  onClose,
}: {
  days: ScheduleDay[];
  onClose: () => void;
}) {
  const [selectedDayIds, setSelectedDayIds] = useState<Set<string>>(
    new Set(days.map((d) => d.id))
  );
  const [detailLevel, setDetailLevel] = useState<"kurz" | "detail">("kurz");
  const [showContacts, setShowContacts] = useState(false);
  const [showConflicts, setShowConflicts] = useState(true);

  function toggleDay(id: string) {
    setSelectedDayIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedDayIds.size === days.length) {
      setSelectedDayIds(new Set());
    } else {
      setSelectedDayIds(new Set(days.map((d) => d.id)));
    }
  }

  function handleCreate() {
    const params = new URLSearchParams();
    if (selectedDayIds.size < days.length) {
      params.set("days", Array.from(selectedDayIds).join(","));
    }
    if (detailLevel === "detail") params.set("detail", "true");
    if (showContacts) params.set("contacts", "true");
    if (!showConflicts) params.set("conflicts", "false");

    const qs = params.toString();
    const url = `/schedule-print${qs ? `?${qs}` : ""}`;
    window.open(url, "_blank");
    onClose();
  }

  const hasSelection = selectedDayIds.size > 0;

  return (
    <div className="space-y-5">
      <p className="text-[13px] text-text-muted">
        Erstelle einen druckfreundlichen Ablaufplan für deine Dienstleister.
      </p>

      {/* Day selection */}
      <div>
        <label className="block text-[13px] font-medium text-text-muted mb-2">
          Tage
        </label>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[13px] text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={selectedDayIds.size === days.length}
              onChange={toggleAll}
              className="rounded border-border text-primary-600 focus:ring-primary-500"
            />
            Alle Tage
          </label>
          {days.map((day) => (
            <label
              key={day.id}
              className="flex items-center gap-2 text-[13px] text-text-muted cursor-pointer ml-5"
            >
              <input
                type="checkbox"
                checked={selectedDayIds.has(day.id)}
                onChange={() => toggleDay(day.id)}
                className="rounded border-border text-primary-600 focus:ring-primary-500"
              />
              {day.name}
              {day.date && (
                <span className="text-text-faint text-[12px]">
                  ({formatDayDateShort(day.date)})
                </span>
              )}
              <span className="text-text-faint text-[11px]">
                {day.events.length} Punkte
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Detail level */}
      <div>
        <label className="block text-[13px] font-medium text-text-muted mb-2">
          Detailgrad
        </label>
        <div className="flex gap-2">
          {(["kurz", "detail"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDetailLevel(level)}
              className={`flex-1 px-3 py-2.5 rounded-xl text-[13px] font-medium border transition-all text-left ${
                detailLevel === level
                  ? "border-primary-300 bg-primary-50 text-primary-700"
                  : "border-border text-text-muted hover:bg-surface-2"
              }`}
            >
              {level === "kurz" ? "Kurz" : "Detail"}
              <span className="block text-[11px] font-normal mt-0.5 opacity-70">
                {level === "kurz"
                  ? "Zeiten, Titel, Ort"
                  : "+ Notizen, Verantwortliche"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-text-muted">
            Kontaktdaten anzeigen
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showContacts}
            onClick={() => setShowContacts(!showContacts)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              showContacts ? "bg-primary-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                showContacts ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-text-muted">
            Konflikte anzeigen
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showConflicts}
            onClick={() => setShowConflicts(!showConflicts)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              showConflicts ? "bg-primary-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                showConflicts ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action */}
      <div className="pt-2">
        <Button onClick={handleCreate} disabled={!hasSelection}>
          PDF erstellen
        </Button>
      </div>
    </div>
  );
}

// ─── Event Inspector ─────────────────────────────────────

function EventInspector({ event, dayId, hasConflict, onClose, showMoreOptions, onToggleMore }: {
  event: ScheduleEvent;
  dayId: string;
  hasConflict: boolean;
  onClose: () => void;
  showMoreOptions: boolean;
  onToggleMore: () => void;
}) {
  const duration = event.endTime ? minutesDiff(event.startTime, event.endTime) : null;

  return (
    <div className="bg-surface-1 rounded-2xl shadow-sm sticky top-20 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between">
          <h3 className="text-[16px] font-semibold text-text pr-6">{event.title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-text-faint hover:text-text-muted hover:bg-surface-2 transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {hasConflict && (
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Zeitkonflikt mit einem anderen Punkt
          </div>
        )}
      </div>

      {/* Edit form */}
      <form
        action={async (formData) => {
          formData.set("id", event.id);
          await updateScheduleEvent(formData);
        }}
        className="p-5 space-y-4"
      >
        <Input name="title" label="Titel" defaultValue={event.title} required />

        <div className="grid grid-cols-2 gap-3">
          <Input name="startTime" label="Von" type="time" defaultValue={event.startTime} required />
          <Input name="endTime" label="Bis" type="time" defaultValue={event.endTime || ""} />
        </div>

        {duration && duration > 0 && (
          <p className="text-[12px] text-text-faint -mt-2">Dauer: {formatDuration(duration)}</p>
        )}

        <Input name="location" label="Ort" defaultValue={event.location || ""} placeholder="z.B. Schlosspark" />

        <div className="w-full">
          <label className="block text-[13px] font-medium text-text-muted mb-1.5">Notizen</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={event.description || ""}
            placeholder="Details zum Programmpunkt..."
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-1 text-[13px] text-text focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-text-faint"
          />
        </div>

        {/* More options toggle */}
        <button
          type="button"
          onClick={onToggleMore}
          className="flex items-center gap-1 text-[12px] text-text-faint hover:text-text-muted transition-colors"
        >
          <svg className={`w-3 h-3 transition-transform ${showMoreOptions ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Erweiterte Optionen
        </button>

        {showMoreOptions && (
          <div className="space-y-3 pt-1">
            <Select
              name="owner"
              label="Verantwortlich"
              options={OWNER_OPTIONS}
              defaultValue={event.owner || ""}
            />
            <Select
              name="visibility"
              label="Sichtbarkeit"
              options={VISIBILITY_OPTIONS}
              defaultValue={event.visibility || ""}
            />
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          <Button type="submit" size="sm" fullWidth>Speichern</Button>
        </div>
      </form>

      {/* Delete */}
      <div className="px-5 pb-4">
        <form action={deleteScheduleEvent}>
          <input type="hidden" name="id" value={event.id} />
          <button type="submit" className="text-[12px] text-text-faint hover:text-red-500 transition-colors">
            Programmpunkt löschen
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Day Form (inline in modal) ──────────────────────────

function DayFormInline({ projectId, day, onClose }: {
  projectId: string;
  day: { id: string; name: string; date: string | null } | null;
  onClose: () => void;
}) {
  async function handleSubmit(formData: FormData) {
    if (day) {
      formData.set("id", day.id);
      await updateScheduleDay(formData);
    } else {
      formData.set("projectId", projectId);
      await createScheduleDay(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!day) return;
    const fd = new FormData();
    fd.set("id", day.id);
    await deleteScheduleDay(fd);
    onClose();
  }

  const dateValue = day?.date ? new Date(day.date).toISOString().split("T")[0] : "";

  return (
    <form action={handleSubmit} className="space-y-5">
      <Input name="name" label="Name" placeholder="z.B. Hochzeitstag" defaultValue={day?.name || ""} required />
      <Input name="date" label="Datum" type="date" defaultValue={dateValue} />
      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          {day ? "Speichern" : "Hinzufügen"}
        </Button>
        {day && (
          <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-medium hover:text-red-600">
            Tag löschen
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Event Form (inline in modal for "Add") ──────────────

function EventFormInline({ dayId, event, onClose }: {
  dayId: string;
  event: ScheduleEvent | null;
  onClose: () => void;
}) {
  async function handleSubmit(formData: FormData) {
    if (event) {
      formData.set("id", event.id);
      await updateScheduleEvent(formData);
    } else {
      formData.set("dayId", dayId);
      await createScheduleEvent(formData);
    }
    onClose();
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <Input name="title" label="Titel" placeholder="z.B. Standesamtliche Trauung" defaultValue={event?.title || ""} required />
      <div className="grid grid-cols-2 gap-4">
        <Input name="startTime" label="Startzeit" type="time" defaultValue={event?.startTime || ""} required />
        <Input name="endTime" label="Endzeit (optional)" type="time" defaultValue={event?.endTime || ""} />
      </div>
      <Input name="location" label="Ort (optional)" placeholder="z.B. Schlosspark" defaultValue={event?.location || ""} />
      <div className="w-full">
        <label className="block text-[13px] font-medium text-text-muted mb-1.5">Beschreibung (optional)</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={event?.description || ""}
          placeholder="Details zum Programmpunkt..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200 placeholder:text-text-faint"
        />
      </div>
      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          {event ? "Speichern" : "Hinzufügen"}
        </Button>
      </div>
    </form>
  );
}
