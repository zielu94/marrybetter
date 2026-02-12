"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVendorsData(userId: string) {
  return prisma.weddingProject.findUnique({
    where: { userId },
    include: { vendors: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
  });
}

export async function createVendor(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  if (!projectId || !name || !category) return;

  const meetingDateStr = formData.get("meetingDate") as string;

  await prisma.vendor.create({
    data: {
      weddingProjectId: projectId,
      name,
      category,
      contactName: (formData.get("contactName") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
      status: (formData.get("status") as string) || "IDENTIFIED",
      estimatedCost: formData.get("estimatedCost") ? parseFloat(formData.get("estimatedCost") as string) : undefined,
      actualCost: formData.get("actualCost") ? parseFloat(formData.get("actualCost") as string) : undefined,
      nextAction: (formData.get("nextAction") as string) || undefined,
      meetingDate: meetingDateStr ? new Date(meetingDateStr) : undefined,
      notes: (formData.get("notes") as string) || undefined,
    },
  });
  revalidatePath("/vendors");
}

export async function updateVendor(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const meetingDateStr = formData.get("meetingDate") as string;

  await prisma.vendor.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      contactName: (formData.get("contactName") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      website: (formData.get("website") as string) || null,
      status: (formData.get("status") as string) || "IDENTIFIED",
      estimatedCost: formData.get("estimatedCost") ? parseFloat(formData.get("estimatedCost") as string) : null,
      actualCost: formData.get("actualCost") ? parseFloat(formData.get("actualCost") as string) : null,
      nextAction: (formData.get("nextAction") as string) || null,
      meetingDate: meetingDateStr !== undefined ? (meetingDateStr ? new Date(meetingDateStr) : null) : undefined,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/vendors");
}

export async function updateVendorStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;

  await prisma.vendor.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/vendors");
}

export async function deleteVendor(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.vendor.delete({ where: { id } });
  revalidatePath("/vendors");
}
