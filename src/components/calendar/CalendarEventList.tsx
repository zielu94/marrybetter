"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import type { TaskPriority, TaskStatus } from "@/types";

interface TaskEvent {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
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
  events: ScheduleEvent[];
}

interface CalendarEventListProps {
  selectedDate: string; // "YYYY-MM-DD"
  tasks: TaskEvent[];
  scheduleDays: ScheduleDay[];
  isWeddingDay: boolean;
}

const priorityBadgeVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "danger",
};

const statusBadgeVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  OPEN: "default",
  IN_PROGRESS: "info",
  DONE: "success",
};

export default function CalendarEventList({
  selectedDate,
  tasks,
  scheduleDays,
  isWeddingDay,
}: CalendarEventListProps) {
  // Filter tasks for this day
  const dayTasks = tasks.filter((t) => {
    const taskDate = new Date(t.dueDate).toISOString().split("T")[0];
    return taskDate === selectedDate;
  });

  // Filter schedule days/events for this day
  const daySchedules = scheduleDays.filter((sd) => {
    if (!sd.date) return false;
    const schedDate = new Date(sd.date).toISOString().split("T")[0];
    return schedDate === selectedDate;
  });

  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(selectedDate + "T00:00:00"));

  const hasEvents = dayTasks.length > 0 || daySchedules.length > 0 || isWeddingDay;

  return (
    <Card padding="md">
      <h3 className="text-lg font-semibold text-text mb-1">{formattedDate}</h3>

      {isWeddingDay && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="font-semibold text-red-700">Hochzeitstag!</span>
        </div>
      )}

      {!hasEvents && (
        <p className="text-text-faint text-sm py-4">Keine Ereignisse an diesem Tag.</p>
      )}

      {/* Tasks */}
      {dayTasks.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
            Aufgaben ({dayTasks.length})
          </p>
          <div className="space-y-2">
            {dayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between py-2 px-3 bg-blue-50/50 rounded-lg border border-blue-100"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className={`text-sm ${task.status === "DONE" ? "line-through text-text-faint" : "text-text"}`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={priorityBadgeVariant[task.priority] || "default"}>
                    {TASK_PRIORITY_LABELS[task.priority as TaskPriority] || task.priority}
                  </Badge>
                  <Badge variant={statusBadgeVariant[task.status] || "default"}>
                    {TASK_STATUS_LABELS[task.status as TaskStatus] || task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Events */}
      {daySchedules.map((sd) => (
        <div key={sd.id} className="mb-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
            {sd.name} ({sd.events.length} Ereignisse)
          </p>
          {sd.events.length > 0 ? (
            <div className="space-y-2">
              {sd.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 py-2 px-3 bg-green-50/50 rounded-lg border border-green-100"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">{event.title}</span>
                      <span className="text-xs text-text-muted">
                        {event.startTime}{event.endTime ? ` - ${event.endTime}` : ""}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-xs text-text-muted mt-0.5">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-faint">Keine Ereignisse geplant.</p>
          )}
        </div>
      ))}
    </Card>
  );
}
