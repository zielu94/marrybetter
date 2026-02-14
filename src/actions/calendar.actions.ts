"use server";

import { prisma } from "@/lib/prisma";
import { resolveProjectId } from "@/lib/project-context";

// ── Data Fetching ──────────────────────────────────

export async function getCalendarData(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  const project = await prisma.weddingProject.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        where: { dueDate: { not: null } },
        orderBy: { dueDate: "asc" },
        select: {
          id: true,
          title: true,
          dueDate: true,
          status: true,
          priority: true,
          category: true,
        },
      },
      scheduleDays: {
        orderBy: { sortOrder: "asc" },
        include: {
          events: {
            orderBy: [{ startTime: "asc" }, { sortOrder: "asc" }],
            select: {
              id: true,
              title: true,
              description: true,
              location: true,
              startTime: true,
              endTime: true,
            },
          },
          _count: { select: { events: true } },
        },
      },
    },
  });

  if (!project) return null;

  return {
    id: project.id,
    weddingDate: project.weddingDate,
    tasks: project.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate!.toISOString(),
      status: t.status,
      priority: t.priority,
      category: t.category ?? null,
    })),
    scheduleDays: project.scheduleDays.map((sd) => ({
      id: sd.id,
      name: sd.name,
      date: sd.date ? sd.date.toISOString() : null,
      eventCount: sd._count.events,
      events: sd.events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        location: e.location,
        startTime: e.startTime,
        endTime: e.endTime,
      })),
    })),
  };
}
