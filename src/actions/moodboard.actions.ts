"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resolveProjectId } from "@/lib/project-context";

// ── Data Fetching ──────────────────────────────────

export async function getMoodboardData(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  return prisma.weddingProject.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      pinterestBoardUrl: true,
      pinterestEmbedEnabled: true,
      pinterestLastValidatedAt: true,
      moodItems: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });
}

// ── Pinterest Board URL ────────────────────────────

export async function savePinterestBoard(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const url = (formData.get("url") as string)?.trim();
  if (!projectId) return;

  await prisma.weddingProject.update({
    where: { id: projectId },
    data: {
      pinterestBoardUrl: url || null,
      pinterestEmbedEnabled: true,
      pinterestLastValidatedAt: url ? new Date() : null,
    },
  });
  revalidatePath("/moodboard");
}

export async function clearPinterestBoard(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  if (!projectId) return;

  await prisma.weddingProject.update({
    where: { id: projectId },
    data: {
      pinterestBoardUrl: null,
      pinterestEmbedEnabled: true,
      pinterestLastValidatedAt: null,
    },
  });
  revalidatePath("/moodboard");
}

// ── MoodItem CRUD ──────────────────────────────────

export async function createMoodItem(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  if (!projectId || !imageUrl) return;

  const sourceUrl = (formData.get("sourceUrl") as string)?.trim() || null;
  const category = (formData.get("category") as string) || "OTHER";
  const tags = (formData.get("tags") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const count = await prisma.moodItem.count({ where: { weddingProjectId: projectId } });

  await prisma.moodItem.create({
    data: {
      weddingProjectId: projectId,
      imageUrl,
      sourceUrl,
      category,
      tags,
      notes,
      sortOrder: count,
    },
  });
  revalidatePath("/moodboard");
}

export async function updateMoodItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const sourceUrl = formData.get("sourceUrl") as string;
  const category = formData.get("category") as string;
  const tags = formData.get("tags") as string;
  const notes = formData.get("notes") as string;

  await prisma.moodItem.update({
    where: { id },
    data: {
      ...(imageUrl && { imageUrl }),
      ...(sourceUrl !== undefined && { sourceUrl: sourceUrl?.trim() || null }),
      ...(category && { category }),
      ...(tags !== undefined && { tags: tags?.trim() || null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
  });
  revalidatePath("/moodboard");
}

export async function deleteMoodItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.moodItem.delete({ where: { id } });
  revalidatePath("/moodboard");
}
