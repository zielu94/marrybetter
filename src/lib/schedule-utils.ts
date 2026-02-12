// ─── Types ──────────────────────────────────────────────

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  owner: string | null;
  visibility: string | null;
}

export interface ScheduleDay {
  id: string;
  name: string;
  date: string | null;
  events: ScheduleEvent[];
}

// ─── Time helpers ───────────────────────────────────────

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesDiff(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} Min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} Std ${m} Min` : `${h} Std`;
}

export function formatDayDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDayDateShort(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

// ─── Conflict / Gap detection ───────────────────────────

interface TimeSlot {
  eventId: string;
  start: number;
  end: number;
}

export function detectConflicts(events: ScheduleEvent[]): Set<string> {
  const slots: TimeSlot[] = events
    .filter((e) => e.endTime)
    .map((e) => ({
      eventId: e.id,
      start: timeToMinutes(e.startTime),
      end: timeToMinutes(e.endTime!),
    }));

  const conflicts = new Set<string>();
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slots[i].start < slots[j].end && slots[j].start < slots[i].end) {
        conflicts.add(slots[i].eventId);
        conflicts.add(slots[j].eventId);
      }
    }
  }
  return conflicts;
}

export interface Gap {
  afterEventId: string;
  minutes: number;
  startTime: string;
  endTime: string;
}

export function detectGaps(
  events: ScheduleEvent[],
  minGapMinutes = 30
): Gap[] {
  const sorted = events
    .filter((e) => e.endTime)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const gaps: Gap[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = timeToMinutes(sorted[i].endTime!);
    const nextStart = timeToMinutes(sorted[i + 1].startTime);
    const diff = nextStart - currentEnd;
    if (diff >= minGapMinutes) {
      gaps.push({
        afterEventId: sorted[i].id,
        minutes: diff,
        startTime: sorted[i].endTime!,
        endTime: sorted[i + 1].startTime,
      });
    }
  }
  return gaps;
}
