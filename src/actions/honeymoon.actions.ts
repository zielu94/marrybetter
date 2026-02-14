"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resolveProjectId } from "@/lib/project-context";

export async function getHoneymoonData(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  return prisma.weddingProject.findUnique({
    where: { id: projectId },
    include: {
      honeymoonItems: {
        orderBy: [{ date: "asc" }, { createdAt: "desc" }],
      },
    },
  });
}

export async function createHoneymoonItem(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const title = formData.get("title") as string;
  if (!projectId || !title) return;

  const costStr = formData.get("cost") as string;
  const dateStr = formData.get("date") as string;

  await prisma.honeymoonItem.create({
    data: {
      weddingProjectId: projectId,
      title,
      category: (formData.get("category") as string) || "ACTIVITY",
      date: dateStr ? new Date(dateStr) : null,
      location: (formData.get("location") as string) || null,
      bookingRef: (formData.get("bookingRef") as string) || null,
      cost: costStr ? parseFloat(costStr) : null,
      status: (formData.get("status") as string) || "PLANNED",
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/honeymoon");
}

export async function updateHoneymoonItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const costStr = formData.get("cost") as string;
  const dateStr = formData.get("date") as string;

  await prisma.honeymoonItem.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      category: (formData.get("category") as string) || "ACTIVITY",
      date: dateStr ? new Date(dateStr) : null,
      location: (formData.get("location") as string) || null,
      bookingRef: (formData.get("bookingRef") as string) || null,
      cost: costStr ? parseFloat(costStr) : null,
      status: (formData.get("status") as string) || "PLANNED",
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/honeymoon");
}

export async function deleteHoneymoonItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.honeymoonItem.delete({ where: { id } });
  revalidatePath("/honeymoon");
}
