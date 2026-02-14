"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resolveProjectId } from "@/lib/project-context";

export async function getTasksData(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  return prisma.weddingProject.findUnique({
    where: { id: projectId },
    include: { tasks: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });
}

export async function createTask(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const title = formData.get("title") as string;
  if (!projectId || !title) return;

  const description = (formData.get("description") as string) || undefined;
  const category = (formData.get("category") as string) || undefined;
  const dueDateStr = formData.get("dueDate") as string;
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;
  const count = await prisma.task.count({ where: { weddingProjectId: projectId } });

  await prisma.task.create({ data: { weddingProjectId: projectId, title, description, category, dueDate, priority, sortOrder: count } });
  revalidatePath("/tasks");
}

export async function updateTask(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const priority = formData.get("priority") as string;
  const status = formData.get("status") as string;

  await prisma.task.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(category !== undefined && { category: category || null }),
      ...(dueDateStr !== undefined && { dueDate: dueDateStr ? new Date(dueDateStr) : null }),
      ...(priority && { priority }),
      ...(status && { status }),
    },
  });
  revalidatePath("/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;

  await prisma.task.update({ where: { id }, data: { status } });
  revalidatePath("/tasks");
  revalidatePath("/calendar");
}

export async function deleteTask(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
}

export async function createBulkTasks(projectId: string, tasks: { title: string; category?: string; priority?: string }[]) {
  const count = await prisma.task.count({ where: { weddingProjectId: projectId } });
  await prisma.task.createMany({
    data: tasks.map((t, i) => ({
      weddingProjectId: projectId,
      title: t.title,
      category: t.category || null,
      priority: t.priority || "MEDIUM",
      isFromTemplate: true,
      sortOrder: count + i,
    })),
  });
  revalidatePath("/tasks");
}
