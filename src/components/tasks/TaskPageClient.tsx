"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import type { TaskPriority, TaskStatus } from "@/types";
import { updateTaskStatus, deleteTask, createBulkTasks } from "@/actions/task.actions";
import TaskForm from "./TaskForm";

// ─── Types ──────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  dueDate: Date | null;
  priority: string;
  status: string;
}

interface TaskPageClientProps {
  tasks: Task[];
  projectId: string;
}

// ─── Date helpers ───────────────────────────────────────

function isToday(d: Date) {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isThisWeek(d: Date) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return d >= startOfWeek && d <= endOfWeek;
}

function isOverdue(task: Task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
}

function dueDateLabel(d: Date) {
  const now = new Date();
  const date = new Date(d);
  if (isToday(date)) return "Heute";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (date.getFullYear() === tomorrow.getFullYear() && date.getMonth() === tomorrow.getMonth() && date.getDate() === tomorrow.getDate()) return "Morgen";
  return formatDate(d);
}

// ─── Templates ──────────────────────────────────────────

const TEMPLATES = [
  {
    id: "12-months",
    name: "12-Monats-Plan",
    description: "Komplette Hochzeitsplanung von Anfang an",
    tasks: [
      { title: "Budget festlegen", category: "Budget", priority: "HIGH" },
      { title: "Gästeliste erstellen (erste Version)", category: "Gäste", priority: "HIGH" },
      { title: "Hochzeitsdatum festlegen", category: "Planung", priority: "HIGH" },
      { title: "Location besichtigen und buchen", category: "Location", priority: "HIGH" },
      { title: "Fotograf suchen und buchen", category: "Fotografie", priority: "HIGH" },
      { title: "Catering auswählen", category: "Catering", priority: "MEDIUM" },
      { title: "DJ oder Band buchen", category: "Musik", priority: "MEDIUM" },
      { title: "Florist auswählen", category: "Dekoration", priority: "MEDIUM" },
      { title: "Save-the-Date Karten versenden", category: "Einladungen", priority: "MEDIUM" },
      { title: "Brautkleid / Anzug auswählen", category: "Outfit", priority: "MEDIUM" },
      { title: "Eheringe aussuchen", category: "Ringe", priority: "MEDIUM" },
      { title: "Einladungen gestalten und versenden", category: "Einladungen", priority: "MEDIUM" },
      { title: "Sitzplan erstellen", category: "Gäste", priority: "LOW" },
      { title: "Flitterwochen planen", category: "Flitterwochen", priority: "LOW" },
      { title: "Hochzeitstorte bestellen", category: "Catering", priority: "LOW" },
    ],
  },
  {
    id: "3-months",
    name: "3-Monats-Sprint",
    description: "Für Paare die schnell planen",
    tasks: [
      { title: "Budget und Gästeliste finalisieren", category: "Planung", priority: "HIGH" },
      { title: "Location und Catering buchen", category: "Location", priority: "HIGH" },
      { title: "Einladungen versenden", category: "Einladungen", priority: "HIGH" },
      { title: "Outfit und Ringe besorgen", category: "Outfit", priority: "HIGH" },
      { title: "Fotograf buchen", category: "Fotografie", priority: "HIGH" },
      { title: "Musik organisieren", category: "Musik", priority: "MEDIUM" },
      { title: "Dekoration planen", category: "Dekoration", priority: "MEDIUM" },
      { title: "Sitzplan erstellen", category: "Gäste", priority: "MEDIUM" },
    ],
  },
  {
    id: "week-of",
    name: "Hochzeitswoche",
    description: "Letzte Vorbereitungen",
    tasks: [
      { title: "Letzte Gästeliste prüfen", category: "Gäste", priority: "HIGH" },
      { title: "Sitzplan finalisieren", category: "Gäste", priority: "HIGH" },
      { title: "Ablauf mit DJ/Band besprechen", category: "Musik", priority: "HIGH" },
      { title: "Letzte Anprobe", category: "Outfit", priority: "MEDIUM" },
      { title: "Notfallkit zusammenstellen", category: "Planung", priority: "MEDIUM" },
      { title: "Reden vorbereiten", category: "Planung", priority: "MEDIUM" },
      { title: "Dekoration und Blumen abholen", category: "Dekoration", priority: "HIGH" },
    ],
  },
];

// ─── Priority variant ───────────────────────────────────

const priorityVariant: Record<string, "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

// ─── Filter types ───────────────────────────────────────

type FilterType = "all" | "open" | "done" | "overdue" | "today" | "this-week";
type GroupMode = "time" | "category" | "none";

// ─── Main component ────────────────────────────────────

export default function TaskPageClient({ tasks, projectId }: TaskPageClientProps) {
  const [filter, setFilter] = useState<FilterType>("open");
  const [groupMode, setGroupMode] = useState<GroupMode>("time");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const now = new Date();

  // ── Counts ──
  const counts = useMemo(() => {
    const overdue = tasks.filter((t) => isOverdue(t)).length;
    const today = tasks.filter((t) => t.status !== "DONE" && t.dueDate && isToday(new Date(t.dueDate))).length;
    const thisWeek = tasks.filter((t) => t.status !== "DONE" && t.dueDate && isThisWeek(new Date(t.dueDate))).length;
    const open = tasks.filter((t) => t.status !== "DONE").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    return { all: tasks.length, open, done, overdue, today, thisWeek };
  }, [tasks]);

  // ── Filtered tasks ──
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (search && !task.title.toLowerCase().includes(search.toLowerCase()) &&
          !(task.category && task.category.toLowerCase().includes(search.toLowerCase()))) return false;

      switch (filter) {
        case "open": return task.status !== "DONE";
        case "done": return task.status === "DONE";
        case "overdue": return isOverdue(task);
        case "today": return task.status !== "DONE" && task.dueDate && isToday(new Date(task.dueDate));
        case "this-week": return task.status !== "DONE" && task.dueDate && isThisWeek(new Date(task.dueDate));
        default: return true;
      }
    });
  }, [tasks, filter, search]);

  // ── Grouped tasks ──
  const groupedTasks = useMemo(() => {
    if (groupMode === "none" || filter === "done") {
      return [{ label: "", tasks: filteredTasks }];
    }

    if (groupMode === "category") {
      const groups: Record<string, Task[]> = {};
      filteredTasks.forEach((t) => {
        const key = t.category || "Ohne Kategorie";
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
      });
      return Object.entries(groups).map(([label, tasks]) => ({ label, tasks }));
    }

    // group by time
    const overdue: Task[] = [];
    const today: Task[] = [];
    const thisWeek: Task[] = [];
    const later: Task[] = [];
    const noDue: Task[] = [];

    filteredTasks.forEach((t) => {
      if (t.status === "DONE") return;
      if (!t.dueDate) { noDue.push(t); return; }
      const d = new Date(t.dueDate);
      if (d < now && t.status !== "DONE") { overdue.push(t); return; }
      if (isToday(d)) { today.push(t); return; }
      if (isThisWeek(d)) { thisWeek.push(t); return; }
      later.push(t);
    });

    const groups: { label: string; tasks: Task[]; color?: string }[] = [];
    if (overdue.length) groups.push({ label: `Überfällig (${overdue.length})`, tasks: overdue, color: "text-red-600" });
    if (today.length) groups.push({ label: `Heute (${today.length})`, tasks: today, color: "text-blue-600" });
    if (thisWeek.length) groups.push({ label: `Diese Woche (${thisWeek.length})`, tasks: thisWeek });
    if (later.length) groups.push({ label: `Später (${later.length})`, tasks: later });
    if (noDue.length) groups.push({ label: `Ohne Datum (${noDue.length})`, tasks: noDue });
    return groups;
  }, [filteredTasks, groupMode, filter, now]);

  // ── Completed tasks (separate) ──
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "DONE"), [tasks]);
  const donePercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4 max-w-5xl">

      {/* ──────────────────────────────────────────────────────
          1. COMMAND BAR HEADER
          ──────────────────────────────────────────────────── */}
      <div className="bg-surface-1 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text tracking-tight">Aufgaben</h1>
            <p className="text-[14px] text-text-muted mt-0.5">
              {completedTasks.length}/{tasks.length} erledigt &middot; {donePercent}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Vorlage
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Aufgabe
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${donePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────
          2. FOCUS AREA — Today / This week / Overdue
          ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setFilter(filter === "overdue" ? "open" : "overdue")}
          className={`bg-surface-1 rounded-2xl shadow-sm p-4 text-center hover:shadow-md transition-all ${filter === "overdue" ? "ring-2 ring-red-200" : ""}`}
        >
          <p className={`text-2xl font-bold ${counts.overdue > 0 ? "text-red-600" : "text-text"}`}>{counts.overdue}</p>
          <p className="text-[12px] text-text-muted mt-0.5">Überfällig</p>
        </button>
        <button
          onClick={() => setFilter(filter === "today" ? "open" : "today")}
          className={`bg-surface-1 rounded-2xl shadow-sm p-4 text-center hover:shadow-md transition-all ${filter === "today" ? "ring-2 ring-blue-200" : ""}`}
        >
          <p className="text-2xl font-bold text-text">{counts.today}</p>
          <p className="text-[12px] text-text-muted mt-0.5">Heute faellig</p>
        </button>
        <button
          onClick={() => setFilter(filter === "this-week" ? "open" : "this-week")}
          className={`bg-surface-1 rounded-2xl shadow-sm p-4 text-center hover:shadow-md transition-all ${filter === "this-week" ? "ring-2 ring-blue-200" : ""}`}
        >
          <p className="text-2xl font-bold text-text">{counts.thisWeek}</p>
          <p className="text-[12px] text-text-muted mt-0.5">Diese Woche</p>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────
          3. TOOLBAR — Search + Filters + Group
          ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Filter pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {([
            { value: "open", label: "Offen", count: counts.open },
            { value: "all", label: "Alle", count: counts.all },
            { value: "done", label: "Erledigt", count: counts.done },
          ] as const).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                filter === f.value
                  ? "bg-gray-900 text-white"
                  : "text-text-muted hover:text-text hover:bg-surface-2"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}

          {/* Group toggle */}
          <div className="h-4 w-px bg-border mx-1.5" />
          <button
            onClick={() => setGroupMode(groupMode === "time" ? "category" : groupMode === "category" ? "none" : "time")}
            className="px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-text-faint hover:text-text hover:bg-surface-2 transition-colors"
          >
            {groupMode === "time" ? "Zeitlich" : groupMode === "category" ? "Kategorie" : "Ungroupiert"}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────
          4. TASK LIST + INSPECTOR — 2-pane layout
          ──────────────────────────────────────────────────── */}
      <div className="flex gap-4">
        {/* Main task list */}
        <div className={`flex-1 min-w-0 ${selectedTask ? "hidden md:block" : ""}`}>
          {filter !== "done" && groupedTasks.length > 0 ? (
            <div className="space-y-4">
              {groupedTasks.map((group) => (
                <div key={group.label || "all"}>
                  {group.label && (
                    <h3 className={`text-[13px] font-semibold uppercase tracking-wider mb-2 ${"color" in group && group.color ? group.color : "text-text-faint"}`}>
                      {group.label}
                    </h3>
                  )}
                  <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
                    {group.tasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isSelected={selectedTask?.id === task.id}
                        onSelect={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                        onEdit={() => setEditingTask(task)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filter === "done" ? (
            <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
              {completedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isSelected={selectedTask?.id === task.id}
                  onSelect={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                  onEdit={() => setEditingTask(task)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface-1 rounded-2xl shadow-sm p-8 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-[15px] font-medium text-text">Keine Aufgaben gefunden</p>
              <p className="text-[13px] text-text-faint mt-1">Alle erledigt oder Filter anpassen</p>
            </div>
          )}

          {/* Completed section (collapsed by default, only when not showing "done" filter) */}
          {filter !== "done" && completedTasks.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-[13px] font-medium text-text-faint hover:text-text-muted transition-colors mb-2"
              >
                <svg className={`w-3 h-3 transition-transform ${showCompleted ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Erledigt ({completedTasks.length})
              </button>
              {showCompleted && (
                <div className="bg-surface-1 rounded-2xl shadow-sm overflow-hidden divide-y divide-border opacity-60">
                  {completedTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isSelected={selectedTask?.id === task.id}
                      onSelect={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                      onEdit={() => setEditingTask(task)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inspector panel (desktop) */}
        {selectedTask && (
          <div className="w-full md:w-80 flex-shrink-0">
            <TaskInspector
              task={selectedTask}
              onEdit={() => setEditingTask(selectedTask)}
              onClose={() => setSelectedTask(null)}
            />
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────
          MODALS
          ──────────────────────────────────────────────────── */}
      <Modal
        open={showForm || !!editingTask}
        onClose={() => { setShowForm(false); setEditingTask(null); }}
        title={editingTask ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
      >
        <TaskForm
          projectId={projectId}
          task={editingTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      </Modal>

      {/* Templates modal */}
      <Modal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Aufgaben aus Vorlage"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-text-muted mb-4">
            Waehle eine Vorlage, um typische Hochzeitsaufgaben hinzuzufuegen.
          </p>
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={async () => {
                await createBulkTasks(projectId, tmpl.tasks);
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
                  {tmpl.tasks.length} Aufgaben
                </span>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

// ─── Task Row ───────────────────────────────────────────

function TaskRow({ task, isSelected, onSelect, onEdit }: {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) {
  const overdue = isOverdue(task);
  const nextStatus = task.status === "DONE" ? "OPEN" : "DONE";

  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-2/80 transition-colors cursor-pointer group ${isSelected ? "bg-blue-50/50" : ""}`}>
      {/* Checkbox */}
      <form action={updateTaskStatus} onClick={(e) => e.stopPropagation()}>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="status" value={nextStatus} />
        <button type="submit" className="flex-shrink-0">
          <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${
            task.status === "DONE" ? "border-emerald-500 bg-emerald-500" : overdue ? "border-red-300 hover:border-red-500" : "border-border hover:border-blue-400"
          }`}>
            {task.status === "DONE" && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>
      </form>

      {/* Content — clickable for inspector */}
      <div className="flex-1 min-w-0" onClick={onSelect}>
        <div className="flex items-center gap-2">
          <p className={`text-[14px] truncate ${task.status === "DONE" ? "line-through text-text-faint" : "font-medium text-text"}`}>
            {task.title}
          </p>
          {task.priority === "HIGH" && task.status !== "DONE" && (
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {task.dueDate && (
            <span className={`text-[11px] ${overdue ? "text-red-500 font-medium" : "text-text-faint"}`}>
              {overdue ? "Überfällig" : dueDateLabel(new Date(task.dueDate))}
            </span>
          )}
          {task.category && (
            <>
              {task.dueDate && <span className="text-border">&middot;</span>}
              <span className="text-[11px] text-text-faint">{task.category}</span>
            </>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1.5 rounded-lg text-text-faint hover:text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <form action={deleteTask} onClick={(e) => e.stopPropagation()}>
          <input type="hidden" name="id" value={task.id} />
          <button type="submit" className="p-1.5 rounded-lg text-text-faint hover:text-red-500 hover:bg-red-50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Task Inspector Panel ──────────────────────────────

function TaskInspector({ task, onEdit, onClose }: { task: Task; onEdit: () => void; onClose: () => void }) {
  const overdue = isOverdue(task);

  return (
    <div className="bg-surface-1 rounded-2xl shadow-sm p-5 sticky top-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-[16px] font-semibold pr-6 ${task.status === "DONE" ? "text-text-faint line-through" : "text-text"}`}>
          {task.title}
        </h3>
        <button onClick={onClose} className="p-1 rounded-lg text-text-faint hover:text-text-muted hover:bg-surface-2 transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-[12px] text-text-faint uppercase tracking-wider">Status</span>
          <Badge variant={task.status === "DONE" ? "success" : task.status === "IN_PROGRESS" ? "info" : "default"}>
            {TASK_STATUS_LABELS[task.status as TaskStatus] || task.status}
          </Badge>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-[12px] text-text-faint uppercase tracking-wider">Prioritaet</span>
          <Badge variant={priorityVariant[task.priority] || "default"}>
            {TASK_PRIORITY_LABELS[task.priority as TaskPriority] || task.priority}
          </Badge>
        </div>

        {/* Due date */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-[12px] text-text-faint uppercase tracking-wider">Fällig</span>
          {task.dueDate ? (
            <span className={`text-[13px] font-medium ${overdue ? "text-red-500" : "text-text"}`}>
              {formatDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-[13px] text-text-faint">Kein Datum</span>
          )}
        </div>

        {/* Category */}
        {task.category && (
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-[12px] text-text-faint uppercase tracking-wider">Kategorie</span>
            <span className="text-[13px] text-text">{task.category}</span>
          </div>
        )}

        {/* Description */}
        {task.description && (
          <div className="pt-2">
            <span className="text-[12px] text-text-faint uppercase tracking-wider block mb-1">Notizen</span>
            <p className="text-[13px] text-text-muted leading-relaxed">{task.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-border flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 rounded-lg bg-surface-2 text-[13px] font-medium text-text-muted hover:bg-surface-2 transition-colors text-center"
        >
          Bearbeiten
        </button>
        <form action={updateTaskStatus} className="flex-1">
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="status" value={task.status === "DONE" ? "OPEN" : "DONE"} />
          <button
            type="submit"
            className={`w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-center ${
              task.status === "DONE"
                ? "bg-surface-2 text-text-muted hover:bg-surface-2"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {task.status === "DONE" ? "Wieder öffnen" : "Erledigt"}
          </button>
        </form>
      </div>
    </div>
  );
}
