"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { updateTaskStatus } from "@/actions/task.actions";
import { TASK_PRIORITY_LABELS } from "@/types";
import type { TaskPriority } from "@/types";

// ─── Types ──────────────────────────────────────────────

interface TaskEvent {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
  category: string | null;
}

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
}

interface ScheduleDay {
  id: string;
  name: string;
  date: string | null;
  eventCount: number;
  events: ScheduleEvent[];
}

interface CalendarPageClientProps {
  weddingDate: string | null;
  tasks: TaskEvent[];
  scheduleDays: ScheduleDay[];
}

// ─── Helpers ────────────────────────────────────────────

type ViewMode = "month" | "agenda";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
}

function daysFromNow(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Main Component ─────────────────────────────────────

export default function CalendarPageClient({
  weddingDate,
  tasks,
  scheduleDays,
}: CalendarPageClientProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(today));
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const todayStr = toDateStr(today);
  const weddingDateStr = weddingDate ? toDateStr(new Date(weddingDate)) : null;

  // ── Event maps ──
  const tasksByDate = useMemo(() => {
    const map: Record<string, TaskEvent[]> = {};
    for (const task of tasks) {
      const dateStr = new Date(task.dueDate).toISOString().split("T")[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(task);
    }
    return map;
  }, [tasks]);

  const scheduleDaysByDate = useMemo(() => {
    const map: Record<string, ScheduleDay[]> = {};
    for (const sd of scheduleDays) {
      if (sd.date) {
        const dateStr = new Date(sd.date).toISOString().split("T")[0];
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(sd);
      }
    }
    return map;
  }, [scheduleDays]);

  // ── Calendar grid ──
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: Array<{ day: number | null; dateStr: string | null }> = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push({ day: null, dateStr: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      days.push({ day: d, dateStr: toDateStr(date) });
    }
    const remainder = days.length % 7;
    if (remainder > 0) {
      for (let i = 0; i < 7 - remainder; i++) days.push({ day: null, dateStr: null });
    }
    return days;
  }, [currentMonth, currentYear]);

  const monthLabel = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" })
    .format(new Date(currentYear, currentMonth, 1));

  // ── Agenda data ──
  const agendaItems = useMemo(() => {
    const items: Array<{ dateStr: string; type: "task" | "schedule"; task?: TaskEvent; scheduleDay?: ScheduleDay }> = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + 30);

    for (const task of tasks) {
      const d = new Date(task.dueDate);
      if (d >= now && d <= cutoff && task.status !== "DONE") {
        items.push({ dateStr: d.toISOString().split("T")[0], type: "task", task });
      }
    }
    for (const sd of scheduleDays) {
      if (sd.date) {
        const d = new Date(sd.date);
        if (d >= now && d <= cutoff) {
          items.push({ dateStr: d.toISOString().split("T")[0], type: "schedule", scheduleDay: sd });
        }
      }
    }
    items.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    return items;
  }, [tasks, scheduleDays]);

  // Group agenda by date
  const agendaGrouped = useMemo(() => {
    const groups: Array<{ dateStr: string; items: typeof agendaItems }> = [];
    let current: typeof agendaItems = [];
    let currentDate = "";
    for (const item of agendaItems) {
      if (item.dateStr !== currentDate) {
        if (current.length > 0) groups.push({ dateStr: currentDate, items: current });
        current = [];
        currentDate = item.dateStr;
      }
      current.push(item);
    }
    if (current.length > 0) groups.push({ dateStr: currentDate, items: current });
    return groups;
  }, [agendaItems]);

  // ── Navigation ──
  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };
  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(todayStr);
  };

  // ── Day sidebar data ──
  const selectedTasks = tasksByDate[selectedDate] || [];
  const selectedSchedules = scheduleDaysByDate[selectedDate] || [];
  const isWeddingDaySelected = selectedDate === weddingDateStr;
  const hasContent = selectedTasks.length > 0 || selectedSchedules.length > 0 || isWeddingDaySelected;

  // ── Counts for summary ──
  const upcomingTaskCount = tasks.filter((t) => t.status !== "DONE" && new Date(t.dueDate) >= today).length;
  const overdueTaskCount = tasks.filter((t) => t.status !== "DONE" && new Date(t.dueDate) < today).length;
  const timelineDayCount = scheduleDays.filter((sd) => sd.date).length;

  return (
    <div className="space-y-4 max-w-6xl">

      {/* ──────────────────────────────────────────────────────
          1. COMMAND BAR HEADER
          ──────────────────────────────────────────────────── */}
      <div className="bg-surface-1 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text tracking-tight">Kalender</h1>
            <div className="flex items-center gap-3 mt-1">
              {upcomingTaskCount > 0 && (
                <span className="text-[12px] text-text-faint">
                  {upcomingTaskCount} {upcomingTaskCount === 1 ? "Aufgabe" : "Aufgaben"} geplant
                </span>
              )}
              {overdueTaskCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {overdueTaskCount} überfällig
                </span>
              )}
              {timelineDayCount > 0 && (
                <span className="text-[12px] text-text-faint">
                  {timelineDayCount} {timelineDayCount === 1 ? "Zeitplan-Tag" : "Zeitplan-Tage"}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="bg-surface-2 rounded-lg p-0.5 inline-flex gap-0.5">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                  viewMode === "month" ? "bg-surface-1 text-text shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                Monat
              </button>
              <button
                onClick={() => setViewMode("agenda")}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                  viewMode === "agenda" ? "bg-surface-1 text-text shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                Agenda
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-2 rounded-lg text-[13px] font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              Heute
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────
          2. MONTH VIEW — Calendar + Day sidebar
          ──────────────────────────────────────────────────── */}
      {viewMode === "month" && (
        <div className="flex gap-4">
          {/* Calendar grid */}
          <div className="flex-1 min-w-0">
            <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden">
              {/* Month nav */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <button onClick={goToPrevMonth} className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-[15px] font-semibold text-text capitalize">{monthLabel}</h2>
                <button onClick={goToNextMonth} className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 px-3 pt-3">
                {WEEKDAY_LABELS.map((label, i) => (
                  <div key={label} className={`text-center text-[11px] font-medium uppercase tracking-wider py-2 ${i >= 5 ? "text-text-faint" : "text-text-faint"}`}>
                    {label}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-px px-3 pb-3">
                {calendarDays.map((cell, idx) => {
                  if (cell.day === null) return <div key={idx} className="h-14" />;

                  const dateStr = cell.dateStr!;
                  const isToday = dateStr === todayStr;
                  const isWedding = dateStr === weddingDateStr;
                  const isSelected = dateStr === selectedDate;
                  const dayTasks = tasksByDate[dateStr] || [];
                  const daySchedules = scheduleDaysByDate[dateStr] || [];
                  const openTasks = dayTasks.filter((t) => t.status !== "DONE").length;
                  const weekend = isWeekend(dateStr);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-14 w-full rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 relative ${
                        isSelected
                          ? "bg-gray-900 text-white"
                          : isToday
                          ? "bg-blue-50 text-blue-600"
                          : isWedding
                          ? "bg-rose-50 text-rose-600"
                          : weekend
                          ? "text-text-faint hover:bg-surface-2"
                          : "text-text-muted hover:bg-surface-2"
                      }`}
                    >
                      <span className={`text-[13px] font-medium ${isSelected ? "text-white" : ""}`}>
                        {cell.day}
                      </span>

                      {/* Indicators */}
                      <div className="flex items-center gap-0.5">
                        {openTasks > 0 && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-300" : "bg-blue-400"}`} />
                        )}
                        {daySchedules.length > 0 && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-300" : "bg-emerald-400"}`} />
                        )}
                        {isWedding && !isSelected && (
                          <svg className="w-2.5 h-2.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 px-5 py-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-[11px] text-text-faint">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Aufgaben
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-text-faint">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Timeline
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-text-faint">
                  <svg className="w-2.5 h-2.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  Hochzeitstag
                </div>
              </div>
            </div>
          </div>

          {/* Day sidebar */}
          <div className="w-80 flex-shrink-0 hidden md:block">
            <DaySidebar
              dateStr={selectedDate}
              tasks={selectedTasks}
              schedules={selectedSchedules}
              isWeddingDay={isWeddingDaySelected}
              isToday={selectedDate === todayStr}
              weddingDateStr={weddingDateStr}
            />
          </div>
        </div>
      )}

      {/* Mobile: Day sidebar below calendar when in month view */}
      {viewMode === "month" && (
        <div className="md:hidden">
          <DaySidebar
            dateStr={selectedDate}
            tasks={selectedTasks}
            schedules={selectedSchedules}
            isWeddingDay={isWeddingDaySelected}
            isToday={selectedDate === todayStr}
            weddingDateStr={weddingDateStr}
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────
          3. AGENDA VIEW
          ──────────────────────────────────────────────────── */}
      {viewMode === "agenda" && (
        <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-[15px] font-semibold text-text">Nächste 30 Tage</h2>
            <p className="text-[12px] text-text-faint mt-0.5">{agendaItems.length} Einträge</p>
          </div>

          {agendaGrouped.length > 0 ? (
            <div className="divide-y divide-border">
              {agendaGrouped.map((group) => {
                const diff = daysFromNow(group.dateStr);
                const isGroupToday = group.dateStr === todayStr;
                const isGroupWedding = group.dateStr === weddingDateStr;

                return (
                  <div key={group.dateStr} className="px-5 py-3">
                    {/* Date header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[13px] font-semibold ${isGroupToday ? "text-blue-600" : isGroupWedding ? "text-rose-600" : "text-text"}`}>
                        {formatDateShort(group.dateStr)}
                      </span>
                      {isGroupToday && (
                        <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase">Heute</span>
                      )}
                      {isGroupWedding && (
                        <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      )}
                      {diff > 0 && !isGroupToday && (
                        <span className="text-[11px] text-text-faint">in {diff} {diff === 1 ? "Tag" : "Tagen"}</span>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 pl-1">
                      {group.items.map((item, i) => {
                        if (item.type === "task" && item.task) {
                          return (
                            <div key={`t-${item.task.id}`} className="flex items-center gap-3 py-1.5">
                              <form action={updateTaskStatus} className="flex-shrink-0">
                                <input type="hidden" name="id" value={item.task.id} />
                                <input type="hidden" name="status" value="DONE" />
                                <button type="submit" className="w-[16px] h-[16px] rounded-full border-2 border-border hover:border-blue-400 transition-colors" />
                              </form>
                              <span className="text-[13px] text-text flex-1 min-w-0 truncate">{item.task.title}</span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                item.task.priority === "HIGH" ? "text-red-600 bg-red-50" :
                                item.task.priority === "MEDIUM" ? "text-amber-600 bg-amber-50" :
                                "text-text-muted bg-surface-2"
                              }`}>
                                {TASK_PRIORITY_LABELS[item.task.priority as TaskPriority] || item.task.priority}
                              </span>
                            </div>
                          );
                        }
                        if (item.type === "schedule" && item.scheduleDay) {
                          return (
                            <div key={`s-${item.scheduleDay.id}`} className="py-1.5">
                              <Link
                                href="/schedule"
                                className="flex items-center gap-2 text-[13px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                {item.scheduleDay.name}
                                <span className="text-[11px] text-text-faint font-normal">{item.scheduleDay.eventCount} Punkte</span>
                                <svg className="w-3 h-3 text-text-faint ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-text">Keine anstehenden Termine</p>
              <p className="text-[13px] text-text-faint mt-1">In den nächsten 30 Tagen sind keine Aufgaben oder Zeitplan-Einträge geplant.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Day Sidebar ─────────────────────────────────────────

function DaySidebar({ dateStr, tasks, schedules, isWeddingDay, isToday, weddingDateStr }: {
  dateStr: string;
  tasks: TaskEvent[];
  schedules: ScheduleDay[];
  isWeddingDay: boolean;
  isToday: boolean;
  weddingDateStr: string | null;
}) {
  const openTasks = tasks.filter((t) => t.status !== "DONE");
  const doneTasks = tasks.filter((t) => t.status === "DONE");
  const hasContent = tasks.length > 0 || schedules.length > 0 || isWeddingDay;

  // Days until wedding
  const daysUntilWedding = weddingDateStr ? daysFromNow(weddingDateStr) : null;

  return (
    <div className="bg-surface-1 rounded-2xl shadow-sm sticky top-20 overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 border-b ${isWeddingDay ? "border-rose-100 bg-rose-50/50" : "border-border"}`}>
        <div className="flex items-center gap-2">
          <h3 className={`text-[15px] font-semibold ${isToday ? "text-blue-600" : isWeddingDay ? "text-rose-600" : "text-text"}`}>
            {formatDateLong(dateStr)}
          </h3>
        </div>
        {isToday && <span className="text-[11px] font-medium text-blue-500 mt-0.5 block">Heute</span>}
        {isWeddingDay && (
          <div className="flex items-center gap-1.5 mt-1">
            <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-[12px] font-semibold text-rose-600">Hochzeitstag!</span>
          </div>
        )}
      </div>

      {!hasContent ? (
        <div className="px-5 py-8 text-center">
          <p className="text-[13px] text-text-faint">Keine Einträge an diesem Tag.</p>
          {daysUntilWedding !== null && daysUntilWedding > 0 && !isWeddingDay && (
            <p className="text-[12px] text-text-faint mt-2">
              Noch {daysUntilWedding} {daysUntilWedding === 1 ? "Tag" : "Tage"} bis zur Hochzeit
            </p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {/* Tasks section */}
          {openTasks.length > 0 && (
            <div className="px-5 py-3">
              <p className="text-[11px] font-semibold text-text-faint uppercase tracking-wider mb-2">
                Aufgaben ({openTasks.length})
              </p>
              <div className="space-y-1">
                {openTasks.map((task) => {
                  const nextStatus = "DONE";
                  return (
                    <div key={task.id} className="flex items-center gap-2.5 py-1.5 group">
                      <form action={updateTaskStatus} className="flex-shrink-0">
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="status" value={nextStatus} />
                        <button type="submit" className="w-[16px] h-[16px] rounded-full border-2 border-border hover:border-blue-400 transition-colors flex-shrink-0" />
                      </form>
                      <span className="text-[13px] text-text flex-1 min-w-0 truncate">{task.title}</span>
                      {task.priority === "HIGH" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Done tasks (collapsed) */}
          {doneTasks.length > 0 && (
            <div className="px-5 py-3">
              <p className="text-[11px] text-text-faint mb-1">{doneTasks.length} erledigt</p>
              <div className="space-y-1 opacity-50">
                {doneTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-2.5 py-1">
                    <div className="w-[16px] h-[16px] rounded-full border-2 border-emerald-400 bg-emerald-400 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-text-faint line-through truncate">{task.title}</span>
                  </div>
                ))}
                {doneTasks.length > 3 && (
                  <p className="text-[11px] text-text-faint pl-7">+ {doneTasks.length - 3} weitere</p>
                )}
              </div>
            </div>
          )}

          {/* Timeline / Schedule section */}
          {schedules.map((sd) => (
            <div key={sd.id} className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                  {sd.name}
                </p>
                <Link
                  href="/schedule"
                  className="text-[11px] text-text-faint hover:text-blue-500 transition-colors flex items-center gap-0.5"
                >
                  Timeline öffnen
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {sd.events.length > 0 ? (
                <div className="space-y-1">
                  {sd.events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center gap-2 py-1">
                      <span className="text-[12px] text-text-faint tabular-nums w-10 flex-shrink-0">{event.startTime}</span>
                      <span className="text-[13px] text-text truncate">{event.title}</span>
                    </div>
                  ))}
                  {sd.events.length > 5 && (
                    <Link href="/schedule" className="text-[11px] text-blue-500 hover:text-blue-600 pl-12">
                      + {sd.events.length - 5} weitere Punkte
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-[12px] text-text-faint">{sd.eventCount} Programmpunkte geplant</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
