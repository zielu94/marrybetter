"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

// ── Token Generation ────────────────────────────────

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export async function generateInvitationToken(guestId: string) {
  const token = generateToken();

  await prisma.guest.update({
    where: { id: guestId },
    data: {
      invitationToken: token,
      tokenCreatedAt: new Date(),
      rsvpStatus: "INVITED",
      inviteSent: true,
    },
  });

  revalidatePath("/guests");
  return token;
}

export async function bulkGenerateTokens(guestIds: string[]) {
  let count = 0;

  for (const guestId of guestIds) {
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest || guest.invitationToken) continue;

    const token = generateToken();
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        invitationToken: token,
        tokenCreatedAt: new Date(),
        rsvpStatus: "INVITED",
        inviteSent: true,
      },
    });
    count++;
  }

  revalidatePath("/guests");
  return count;
}

// ── Public RSVP (no auth required) ──────────────────

export async function getGuestByToken(token: string) {
  if (!token) return null;

  return prisma.guest.findUnique({
    where: { invitationToken: token },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      diet: true,
      mealType: true,
      allergiesNote: true,
      notes: true,
      rsvpStatus: true,
      rsvpRespondedAt: true,
      weddingProject: {
        select: {
          slug: true,
          weddingDate: true,
          location: true,
          user: { select: { name: true, partnerName: true } },
        },
      },
    },
  });
}

export async function submitRsvp(token: string, formData: FormData) {
  if (!token) return { error: "Ungültiger Link." };

  const guest = await prisma.guest.findUnique({
    where: { invitationToken: token },
  });

  if (!guest) return { error: "Gast nicht gefunden." };

  const rsvpStatus = formData.get("rsvpStatus") as string;
  const diet = formData.get("diet") as string;
  const mealType = formData.get("mealType") as string;
  const allergiesNote = formData.get("allergiesNote") as string;
  const notes = formData.get("notes") as string;

  if (!rsvpStatus || !["ATTENDING", "DECLINED", "MAYBE"].includes(rsvpStatus)) {
    return { error: "Bitte wähle eine Option." };
  }

  // Sync status field
  const status = rsvpStatus === "ATTENDING"
    ? "CONFIRMED"
    : rsvpStatus === "DECLINED"
      ? "DECLINED"
      : "PENDING";

  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      rsvpStatus,
      status,
      diet: diet || undefined,
      mealType: mealType || "STANDARD",
      allergiesNote: allergiesNote || undefined,
      notes: notes || undefined,
      rsvpRespondedAt: new Date(),
    },
  });

  return { success: true };
}
