"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Data Fetching ──────────────────────────────────

export async function getVenueData(userId: string) {
  return prisma.weddingProject.findUnique({
    where: { userId },
    include: {
      venueOptions: {
        orderBy: { sortOrder: "asc" },
        include: { costItems: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
}

// ── VenueOption CRUD ───────────────────────────────

export async function createVenue(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  if (!projectId || !name) return;

  // Max 5 venues
  const count = await prisma.venueOption.count({ where: { weddingProjectId: projectId } });
  if (count >= 5) return;

  const capacityStr = formData.get("capacity") as string;
  const visitDateStr = formData.get("visitDate") as string;

  await prisma.venueOption.create({
    data: {
      weddingProjectId: projectId,
      name,
      status: (formData.get("status") as string) || "IDENTIFIED",
      contactName: (formData.get("contactName") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      capacity: capacityStr ? parseInt(capacityStr) : undefined,
      imageUrl: (formData.get("imageUrl") as string) || undefined,
      pros: (formData.get("pros") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
      visitDate: visitDateStr ? new Date(visitDateStr) : undefined,
      sortOrder: count,
    },
  });
  revalidatePath("/venues");
}

export async function updateVenue(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const name = formData.get("name") as string;
  const status = formData.get("status") as string;
  const contactName = formData.get("contactName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const capacityStr = formData.get("capacity") as string;
  const capacity = capacityStr ? parseInt(capacityStr) : null;
  const imageUrl = formData.get("imageUrl") as string;
  const pros = formData.get("pros") as string;
  const notes = formData.get("notes") as string;
  const visitDateStr = formData.get("visitDate") as string;

  await prisma.venueOption.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(status && { status }),
      ...(contactName !== undefined && { contactName: contactName || null }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(website !== undefined && { website: website || null }),
      ...(address !== undefined && { address: address || null }),
      ...(city !== undefined && { city: city || null }),
      ...(capacityStr !== undefined && { capacity: capacity && !isNaN(capacity) ? capacity : null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      ...(pros !== undefined && { pros: pros || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(visitDateStr !== undefined && { visitDate: visitDateStr ? new Date(visitDateStr) : null }),
    },
  });
  revalidatePath("/venues");
}

export async function updateVenueStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;

  await prisma.venueOption.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/venues");
}

export async function deleteVenue(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.venueOption.delete({ where: { id } });
  revalidatePath("/venues");
}

// ── VenueCostItem CRUD ─────────────────────────────

export async function createVenueCostItem(formData: FormData) {
  const venueOptionId = formData.get("venueOptionId") as string;
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  if (!venueOptionId || !name || isNaN(amount)) return;

  const notes = (formData.get("notes") as string) || undefined;

  await prisma.venueCostItem.create({
    data: { venueOptionId, name, amount, notes },
  });
  revalidatePath("/venues");
}

export async function updateVenueCostItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const name = formData.get("name") as string;
  const amountStr = formData.get("amount") as string;
  const amount = amountStr ? parseFloat(amountStr) : undefined;
  const notes = formData.get("notes") as string;

  await prisma.venueCostItem.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(amount !== undefined && !isNaN(amount) && { amount }),
      ...(notes !== undefined && { notes: notes || null }),
    },
  });
  revalidatePath("/venues");
}

export async function deleteVenueCostItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.venueCostItem.delete({ where: { id } });
  revalidatePath("/venues");
}
