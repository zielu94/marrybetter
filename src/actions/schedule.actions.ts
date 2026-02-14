"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MAX_SCHEDULE_DAYS } from "@/types";
import { resolveProjectId } from "@/lib/project-context";

// ── Data Fetching ──────────────────────────────────

export async function getScheduleData(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  return prisma.weddingProject.findUnique({
    where: { id: projectId },
    include: {
      scheduleDays: {
        orderBy: { sortOrder: "asc" },
        include: {
          events: { orderBy: [{ startTime: "asc" }, { sortOrder: "asc" }] },
        },
      },
    },
  });
}

// ── Print Data Fetching ───────────────────────────

export async function getSchedulePrintData(
  userId: string,
  dayIds?: string[]
) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  return prisma.weddingProject.findUnique({
    where: { id: projectId },
    include: {
      user: { select: { name: true, partnerName: true } },
      scheduleDays: {
        orderBy: { sortOrder: "asc" },
        include: {
          events: { orderBy: [{ startTime: "asc" }, { sortOrder: "asc" }] },
        },
        ...(dayIds && dayIds.length > 0
          ? { where: { id: { in: dayIds } } }
          : {}),
      },
      vendors: {
        where: { status: "BOOKED" },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      },
    },
  });
}

// ── ScheduleDay CRUD ───────────────────────────────

export async function createScheduleDay(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;
  if (!projectId || !name) return;

  // Enforce max days
  const count = await prisma.scheduleDay.count({ where: { weddingProjectId: projectId } });
  if (count >= MAX_SCHEDULE_DAYS) return;

  const date = dateStr ? new Date(dateStr) : undefined;
  await prisma.scheduleDay.create({
    data: { weddingProjectId: projectId, name, date, sortOrder: count },
  });
  revalidatePath("/schedule");
}

export async function updateScheduleDay(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;

  await prisma.scheduleDay.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(dateStr !== undefined && { date: dateStr ? new Date(dateStr) : null }),
    },
  });
  revalidatePath("/schedule");
}

export async function deleteScheduleDay(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.scheduleDay.delete({ where: { id } });
  revalidatePath("/schedule");
}

// ── ScheduleEvent CRUD ─────────────────────────────

export async function createScheduleEvent(formData: FormData) {
  const dayId = formData.get("dayId") as string;
  const title = formData.get("title") as string;
  const startTime = formData.get("startTime") as string;
  if (!dayId || !title || !startTime) return;

  const endTime = (formData.get("endTime") as string) || undefined;
  const description = (formData.get("description") as string) || undefined;
  const location = (formData.get("location") as string) || undefined;
  const owner = (formData.get("owner") as string) || undefined;
  const visibility = (formData.get("visibility") as string) || undefined;
  const count = await prisma.scheduleEvent.count({ where: { scheduleDayId: dayId } });

  await prisma.scheduleEvent.create({
    data: { scheduleDayId: dayId, title, startTime, endTime, description, location, owner, visibility, sortOrder: count },
  });
  revalidatePath("/schedule");
}

export async function updateScheduleEvent(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const title = formData.get("title") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const owner = formData.get("owner") as string;
  const visibility = formData.get("visibility") as string;

  await prisma.scheduleEvent.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(startTime && { startTime }),
      ...(endTime !== undefined && { endTime: endTime || null }),
      ...(description !== undefined && { description: description || null }),
      ...(location !== undefined && { location: location || null }),
      ...(owner !== undefined && { owner: owner || null }),
      ...(visibility !== undefined && { visibility: visibility || null }),
    },
  });
  revalidatePath("/schedule");
}

export async function deleteScheduleEvent(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.scheduleEvent.delete({ where: { id } });
  revalidatePath("/schedule");
}

// ── Bulk template events ───────────────────────────

export async function createBulkScheduleEvents(
  dayId: string,
  events: { title: string; startTime: string; endTime?: string; location?: string }[]
) {
  const count = await prisma.scheduleEvent.count({ where: { scheduleDayId: dayId } });
  await prisma.scheduleEvent.createMany({
    data: events.map((e, i) => ({
      scheduleDayId: dayId,
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime || null,
      location: e.location || null,
      sortOrder: count + i,
    })),
  });
  revalidatePath("/schedule");
}
