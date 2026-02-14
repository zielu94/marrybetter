"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resolveProjectId } from "@/lib/project-context";

// ── Data Fetching ──────────────────────────────────

export async function getGuestsData(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  return prisma.weddingProject.findUnique({
    where: { id: projectId },
    include: {
      guests: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: {
          seatingTable: { select: { id: true, name: true } },
          household: { select: { id: true, name: true } },
        },
      },
      households: {
        include: {
          guests: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });
}

export async function getProjectSlug(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  const project = await prisma.weddingProject.findUnique({
    where: { id: projectId },
    select: { slug: true, isPublicWebsite: true },
  });
  return project;
}

// ── Guest CRUD ─────────────────────────────────────

export async function createGuest(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  if (!projectId || !firstName) return;

  await prisma.guest.create({
    data: {
      weddingProjectId: projectId,
      firstName,
      lastName: lastName || "",
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      source: (formData.get("source") as string) || undefined,
      category: (formData.get("category") as string) || undefined,
      role: (formData.get("role") as string) || undefined,
      age: (formData.get("age") as string) || undefined,
      diet: (formData.get("diet") as string) || undefined,
      status: (formData.get("status") as string) || "PENDING",
      inviteSent: formData.get("inviteSent") === "true",
      tableNumber: formData.get("tableNumber") ? parseInt(formData.get("tableNumber") as string) : undefined,
      notes: (formData.get("notes") as string) || undefined,
    },
  });
  revalidatePath("/guests");
}

export async function updateGuest(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const source = formData.get("source") as string;
  const category = formData.get("category") as string;
  const role = formData.get("role") as string;
  const age = formData.get("age") as string;
  const diet = formData.get("diet") as string;
  const status = formData.get("status") as string;
  const inviteSentStr = formData.get("inviteSent") as string;
  const tableNumberStr = formData.get("tableNumber") as string;
  const notes = formData.get("notes") as string;

  await prisma.guest.update({
    where: { id },
    data: {
      ...(firstName !== null && { firstName }),
      ...(lastName !== null && { lastName: lastName || "" }),
      ...(email !== null && { email: email || null }),
      ...(phone !== null && { phone: phone || null }),
      ...(address !== null && { address: address || null }),
      ...(source !== null && { source: source || null }),
      ...(category !== null && { category: category || null }),
      ...(role !== null && { role: role || null }),
      ...(age !== null && { age: age || null }),
      ...(diet !== null && { diet: diet || null }),
      ...(status !== null && { status: status || "PENDING" }),
      ...(inviteSentStr !== null && { inviteSent: inviteSentStr === "true" }),
      ...(tableNumberStr !== null && { tableNumber: tableNumberStr ? parseInt(tableNumberStr) : null }),
      ...(notes !== null && { notes: notes || null }),
    },
  });
  revalidatePath("/guests");
}

export async function updateGuestStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;
  await prisma.guest.update({ where: { id }, data: { status } });
  revalidatePath("/guests");
}

export async function deleteGuest(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.guest.delete({ where: { id } });
  revalidatePath("/guests");
}

export async function toggleInviteSent(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest) return;

  await prisma.guest.update({ where: { id }, data: { inviteSent: !guest.inviteSent } });
  revalidatePath("/guests");
}

// ── Bulk Actions ───────────────────────────────────

export async function bulkUpdateGuestStatus(formData: FormData) {
  const ids = (formData.get("ids") as string)?.split(",").filter(Boolean);
  const status = formData.get("status") as string;
  if (!ids?.length || !status) return;

  await prisma.guest.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
  revalidatePath("/guests");
}

export async function bulkMarkInviteSent(formData: FormData) {
  const ids = (formData.get("ids") as string)?.split(",").filter(Boolean);
  if (!ids?.length) return;

  await prisma.guest.updateMany({
    where: { id: { in: ids } },
    data: { inviteSent: true },
  });
  revalidatePath("/guests");
}

// ── Wizard / Household Actions ────────────────────

export async function createGuestWizard(data: {
  projectId: string;
  guestType: string;
  guests: Array<{
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    age?: string;
    diet?: string;
    allergiesNote?: string;
    isWeddingParty?: boolean;
    notes?: string;
  }>;
  address?: {
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
}) {
  try {
    const { projectId, guestType, guests, address } = data;

    if (!projectId || !guests.length) {
      return { success: false, error: "Projekt-ID und mindestens ein Gast sind erforderlich." };
    }

    let householdId: string | undefined;

    // For COUPLE or FAMILY, create a Household first
    if (guestType === "COUPLE" || guestType === "FAMILY") {
      const firstGuest = guests[0];
      const householdName =
        guestType === "FAMILY"
          ? `Familie ${firstGuest.lastName}`
          : `${firstGuest.lastName} Haushalt`;

      const household = await prisma.household.create({
        data: {
          weddingProjectId: projectId,
          name: householdName,
          address: address?.address || undefined,
          city: address?.city || undefined,
          zip: address?.zip || undefined,
          country: address?.country || undefined,
        },
      });
      householdId = household.id;
    }

    // Create all guests
    for (const guest of guests) {
      await prisma.guest.create({
        data: {
          weddingProjectId: projectId,
          householdId: householdId || undefined,
          guestType,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email || undefined,
          phone: guest.phone || undefined,
          age: guest.age || undefined,
          diet: guest.diet || undefined,
          allergiesNote: guest.allergiesNote || undefined,
          isWeddingParty: guest.isWeddingParty || false,
          notes: guest.notes || undefined,
          // For SINGLE guests, store address directly on the guest
          ...(guestType === "SINGLE" && address
            ? {
                address: address.address || undefined,
                city: address.city || undefined,
                zip: address.zip || undefined,
                country: address.country || undefined,
              }
            : {}),
          status: "PENDING",
          rsvpStatus: "NOT_SENT",
        },
      });
    }

    revalidatePath("/guests");
    return { success: true, count: guests.length };
  } catch (error) {
    console.error("createGuestWizard error:", error);
    return { success: false, error: "Fehler beim Erstellen der Gäste." };
  }
}

export async function createHousehold(data: {
  projectId: string;
  name: string;
  guestIds: string[];
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
}) {
  try {
    const { projectId, name, guestIds, address, city, zip, country } = data;

    if (!projectId || !name || !guestIds.length) {
      return { success: false, error: "Projekt-ID, Name und Gäste sind erforderlich." };
    }

    const household = await prisma.household.create({
      data: {
        weddingProjectId: projectId,
        name,
        address: address || undefined,
        city: city || undefined,
        zip: zip || undefined,
        country: country || undefined,
      },
    });

    await prisma.guest.updateMany({
      where: { id: { in: guestIds } },
      data: { householdId: household.id },
    });

    revalidatePath("/guests");
    return { success: true, householdId: household.id };
  } catch (error) {
    console.error("createHousehold error:", error);
    return { success: false, error: "Fehler beim Erstellen des Haushalts." };
  }
}

export async function removeFromHousehold(guestId: string) {
  try {
    if (!guestId) {
      return { success: false, error: "Gast-ID ist erforderlich." };
    }

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { householdId: true },
    });

    if (!guest || !guest.householdId) {
      return { success: false, error: "Gast gehört keinem Haushalt an." };
    }

    const householdId = guest.householdId;

    // Remove guest from household
    await prisma.guest.update({
      where: { id: guestId },
      data: { householdId: null },
    });

    // Check if household now has 0 guests
    const remainingGuests = await prisma.guest.count({
      where: { householdId },
    });

    if (remainingGuests === 0) {
      await prisma.household.delete({
        where: { id: householdId },
      });
    }

    revalidatePath("/guests");
    return { success: true };
  } catch (error) {
    console.error("removeFromHousehold error:", error);
    return { success: false, error: "Fehler beim Entfernen aus dem Haushalt." };
  }
}

export async function updateRsvpStatus(guestId: string, rsvpStatus: string) {
  try {
    if (!guestId || !rsvpStatus) {
      return { success: false, error: "Gast-ID und RSVP-Status sind erforderlich." };
    }

    const updateData: { rsvpStatus: string; status?: string } = { rsvpStatus };

    if (rsvpStatus === "ATTENDING") {
      updateData.status = "CONFIRMED";
    } else if (rsvpStatus === "DECLINED") {
      updateData.status = "DECLINED";
    }

    await prisma.guest.update({
      where: { id: guestId },
      data: updateData,
    });

    revalidatePath("/guests");
    return { success: true };
  } catch (error) {
    console.error("updateRsvpStatus error:", error);
    return { success: false, error: "Fehler beim Aktualisieren des RSVP-Status." };
  }
}

export async function importGuestsFromCSV(data: {
  projectId: string;
  guests: Array<{
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    category?: string;
    source?: string;
    diet?: string;
    notes?: string;
  }>;
}) {
  try {
    const { projectId, guests } = data;

    if (!projectId || !guests.length) {
      return { success: false, error: "Projekt-ID und Gäste sind erforderlich." };
    }

    await prisma.guest.createMany({
      data: guests.map((guest) => ({
        weddingProjectId: projectId,
        firstName: guest.firstName,
        lastName: guest.lastName || "",
        email: guest.email || undefined,
        phone: guest.phone || undefined,
        category: guest.category || undefined,
        source: guest.source || undefined,
        diet: guest.diet || undefined,
        notes: guest.notes || undefined,
        status: "PENDING",
        rsvpStatus: "NOT_SENT",
      })),
    });

    revalidatePath("/guests");
    return { success: true, count: guests.length };
  } catch (error) {
    console.error("importGuestsFromCSV error:", error);
    return { success: false, error: "Fehler beim Importieren der Gäste." };
  }
}
