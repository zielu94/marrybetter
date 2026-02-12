"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPackingData(userId: string) {
  return prisma.weddingProject.findUnique({
    where: { userId },
    include: {
      packingItems: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
}

export async function createPackingItem(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  if (!projectId || !name) return;

  await prisma.packingItem.create({
    data: {
      weddingProjectId: projectId,
      name,
      category: (formData.get("category") as string) || "WEDDING_WEEKEND",
      personInCharge: (formData.get("personInCharge") as string) || undefined,
      status: (formData.get("status") as string) || "PENDING",
    },
  });
  revalidatePath("/packing");
}

export async function updatePackingItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.packingItem.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      category: (formData.get("category") as string) || "WEDDING_WEEKEND",
      personInCharge: (formData.get("personInCharge") as string) || null,
      status: (formData.get("status") as string) || "PENDING",
    },
  });
  revalidatePath("/packing");
}

export async function deletePackingItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.packingItem.delete({ where: { id } });
  revalidatePath("/packing");
}

export async function togglePackingStatus(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const item = await prisma.packingItem.findUnique({ where: { id } });
  if (!item) return;

  // Cycle: PENDING → PACKED → DONE → PENDING
  const nextStatus: Record<string, string> = {
    PENDING: "PACKED",
    PACKED: "DONE",
    DONE: "PENDING",
  };

  await prisma.packingItem.update({
    where: { id },
    data: { status: nextStatus[item.status] || "PENDING" },
  });
  revalidatePath("/packing");
}
