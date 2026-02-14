"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resolveProjectId } from "@/lib/project-context";

export async function getPhotoData(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  return prisma.weddingProject.findUnique({
    where: { id: projectId },
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createPhoto(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const url = formData.get("url") as string;
  if (!projectId || !url) return;

  await prisma.photo.create({
    data: {
      weddingProjectId: projectId,
      title: (formData.get("title") as string) || null,
      url,
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || "OTHER",
    },
  });
  revalidatePath("/photos");
}

export async function updatePhoto(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.photo.update({
    where: { id },
    data: {
      title: (formData.get("title") as string) || null,
      url: formData.get("url") as string,
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || "OTHER",
    },
  });
  revalidatePath("/photos");
}

export async function deletePhoto(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.photo.delete({ where: { id } });
  revalidatePath("/photos");
}
