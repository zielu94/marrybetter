interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  sortOrder: number;
}

interface ScheduleDay {
  id: string;
  name: string;
  date: Date | null;
  events: ScheduleEvent[];
  sortOrder: number;
}

interface WeddingScheduleProps {
  scheduleDays: ScheduleDay[];
}

export default function WeddingSchedule({ scheduleDays }: WeddingScheduleProps) {
  // Filter out days with no events
  const daysWithEvents = scheduleDays.filter((d) => d.events.length > 0);
  if (daysWithEvents.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-3">
            Ablauf
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Tagesablauf
          </h2>
        </div>

        <div className="space-y-10">
          {daysWithEvents.map((day) => (
            <div key={day.id}>
              {/* Day Header */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {day.name}
                </h3>
                {day.date && (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                    {new Date(day.date).toLocaleDateString("de-DE", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[47px] sm:left-[55px] top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />

                <div className="space-y-0">
                  {day.events.map((event, idx) => (
                    <div key={event.id} className="relative flex gap-4 sm:gap-6 py-4">
                      {/* Time */}
                      <div className="w-[40px] sm:w-[48px] flex-shrink-0 text-right">
                        <span className="text-sm font-medium text-zinc-900 dark:text-white tabular-nums">
                          {event.startTime}
                        </span>
                      </div>

                      {/* Dot */}
                      <div className="relative flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 mt-1" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {event.title}
                        </h4>
                        {event.endTime && (
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {event.startTime} – {event.endTime} Uhr
                          </p>
                        )}
                        {event.description && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {event.description}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
