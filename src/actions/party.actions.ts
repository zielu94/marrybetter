"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Data Fetching ──────────────────────────────────

export async function getPartyData(userId: string) {
  return prisma.weddingProject.findUnique({
    where: { userId },
    include: {
      partyMembers: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              status: true,
              inviteSent: true,
              diet: true,
              seatingTable: { select: { id: true, name: true } },
            },
          },
        },
      },
      guests: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          partyMember: { select: { id: true } },
        },
      },
    },
  });
}

// ── Party Member CRUD ──────────────────────────────

export async function createPartyMember(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const guestId = formData.get("guestId") as string;
  const role = formData.get("role") as string;
  if (!projectId || !role) return;

  // If linking to an existing guest, pull name from guest
  if (guestId) {
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) return;

    await prisma.weddingPartyMember.create({
      data: {
        weddingProjectId: projectId,
        guestId,
        name: `${guest.firstName} ${guest.lastName}`.trim(),
        role,
        side: (formData.get("side") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
        email: guest.email || undefined,
        phone: guest.phone || undefined,
      },
    });
  } else {
    // Standalone member (edge case — create guest first)
    const name = formData.get("name") as string;
    if (!name) return;

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const guest = await prisma.guest.create({
      data: {
        weddingProjectId: projectId,
        firstName,
        lastName,
        email: (formData.get("email") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        status: "PENDING",
      },
    });

    await prisma.weddingPartyMember.create({
      data: {
        weddingProjectId: projectId,
        guestId: guest.id,
        name: name.trim(),
        role,
        side: (formData.get("side") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
        email: guest.email || undefined,
        phone: guest.phone || undefined,
      },
    });
  }

  revalidatePath("/weddingparty");
  revalidatePath("/guests");
}

export async function updatePartyMember(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.weddingPartyMember.update({
    where: { id },
    data: {
      role: formData.get("role") as string,
      side: (formData.get("side") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/weddingparty");
}

export async function deletePartyMember(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  // Only removes the party membership, NOT the guest
  await prisma.weddingPartyMember.delete({ where: { id } });
  revalidatePath("/weddingparty");
}
