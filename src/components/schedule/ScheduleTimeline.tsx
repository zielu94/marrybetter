"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import ScheduleEventForm from "./ScheduleEventForm";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
}

interface ScheduleTimelineProps {
  dayId: string;
  events: ScheduleEvent[];
}

export default function ScheduleTimeline({ dayId, events }: ScheduleTimelineProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  return (
    <div>
      {events.length > 0 ? (
        <div className="space-y-0">
          {events.map((event, index) => {
            const isLast = index === events.length - 1;
            return (
              <div key={event.id} className="flex items-stretch gap-4">
                {/* Time column */}
                <div className="w-20 flex-shrink-0 text-right pt-1.5">
                  <p className="text-sm font-medium text-text-muted">{event.startTime}</p>
                  {event.endTime && (
                    <p className="text-xs text-text-faint">- {event.endTime}</p>
                  )}
                </div>

                {/* Timeline dot + line */}
                <div className="relative flex-shrink-0 w-6 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary-500 mt-2 flex-shrink-0 z-10" />
                  {!isLast && (
                    <div className="flex-1 w-0.5 bg-border mt-1" />
                  )}
                </div>

                {/* Event card */}
                <div
                  className="flex-1 mb-4 bg-surface-1 rounded-xl border border-border shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => setEditingEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text">{event.title}</h4>
                      {event.location && (
                        <p className="text-sm text-text-muted mt-0.5 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-text-faint mt-1 line-clamp-2">{event.description}</p>
                      )}
                    </div>

                    {/* Edit icon */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingEvent(event); }}
                      className="p-1.5 text-text-faint hover:text-primary-500 rounded-lg hover:bg-surface-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-text-faint">
          <svg className="w-16 h-16 mx-auto mb-4 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Noch keine Programmpunkte.</p>
          <p className="text-sm mt-1">Fügen Sie den ersten Punkt hinzu.</p>
        </div>
      )}

      {/* Add event button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowEventForm(true)}
          className="px-4 py-2 rounded-full bg-surface-1 border border-border text-sm font-medium text-text-muted hover:bg-surface-2 hover:border-primary-300 transition-colors"
        >
          + Programmpunkt hinzufügen
        </button>
      </div>

      {/* Event Form Modal */}
      <Modal
        open={showEventForm || !!editingEvent}
        onClose={() => { setShowEventForm(false); setEditingEvent(null); }}
        title={editingEvent ? "Programmpunkt bearbeiten" : "Neuer Programmpunkt"}
      >
        <ScheduleEventForm
          dayId={dayId}
          event={editingEvent}
          onClose={() => { setShowEventForm(false); setEditingEvent(null); }}
        />
      </Modal>
    </div>
  );
}
