"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProfileSchema, WeddingDetailsSchema, ChangePasswordSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const userId = formData.get("userId") as string;
  if (!userId) return { error: "Benutzer nicht gefunden" };

  const rawData = {
    name: formData.get("name") as string,
    partnerName: formData.get("partnerName") as string,
    email: formData.get("email") as string,
  };

  const validated = ProfileSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Check email uniqueness (exclude current user)
  const existingUser = await prisma.user.findFirst({
    where: {
      email: validated.data.email,
      NOT: { id: userId },
    },
  });

  if (existingUser) {
    return { error: "Diese E-Mail-Adresse wird bereits verwendet" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: validated.data.name,
      partnerName: validated.data.partnerName,
      email: validated.data.email,
    },
  });

  revalidatePath("/settings");
  return { success: "Profil erfolgreich aktualisiert" };
}

export async function updateWeddingDetails(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  if (!projectId) return { error: "Projekt nicht gefunden" };

  const rawData = {
    weddingDate: (formData.get("weddingDate") as string) || undefined,
    hasNoDate: formData.get("hasNoDate") === "true",
    location: (formData.get("location") as string) || undefined,
  };

  const validated = WeddingDetailsSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const weddingDate =
    validated.data.hasNoDate || !validated.data.weddingDate
      ? null
      : new Date(validated.data.weddingDate);

  await prisma.weddingProject.update({
    where: { id: projectId },
    data: {
      weddingDate,
      hasNoDate: validated.data.hasNoDate,
      location: validated.data.location || null,
    },
  });

  revalidatePath("/settings");
  return { success: "Hochzeitsdetails erfolgreich aktualisiert" };
}

export async function changePassword(formData: FormData) {
  const userId = formData.get("userId") as string;
  if (!userId) return { error: "Benutzer nicht gefunden" };

  const rawData = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmNewPassword: formData.get("confirmNewPassword") as string,
  };

  const validated = ChangePasswordSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    return { error: "Benutzer nicht gefunden" };
  }

  const isValid = await bcrypt.compare(validated.data.currentPassword, user.password);
  if (!isValid) {
    return { error: "Aktuelles Passwort ist falsch" };
  }

  const hashedPassword = await bcrypt.hash(validated.data.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  revalidatePath("/settings");
  return { success: "Passwort erfolgreich geändert" };
}

export async function updateSidebarConfig(projectId: string, configJson: string) {
  if (!projectId) return { error: "Projekt nicht gefunden" };

  await prisma.weddingProject.update({
    where: { id: projectId },
    data: { sidebarConfig: configJson },
  });

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: "Seitenleiste aktualisiert" };
}

export async function updateTheme(projectId: string, theme: string) {
  if (!projectId) return { error: "Projekt nicht gefunden" };
  if (!["light", "dark", "system"].includes(theme)) return { error: "Ungültiges Theme" };

  await prisma.weddingProject.update({
    where: { id: projectId },
    data: { theme },
  });

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: "Erscheinungsbild aktualisiert" };
}

export async function updateWeddingDetailsExtended(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  if (!projectId) return { error: "Projekt nicht gefunden" };

  const weddingDateStr = formData.get("weddingDate") as string;
  const hasNoDate = formData.get("hasNoDate") === "true";
  const location = formData.get("location") as string;
  const currency = formData.get("currency") as string;
  const guestCountTargetStr = formData.get("guestCountTarget") as string;

  const weddingDate = hasNoDate || !weddingDateStr ? null : new Date(weddingDateStr);
  const guestCountTarget = guestCountTargetStr ? parseInt(guestCountTargetStr) : 0;

  await prisma.weddingProject.update({
    where: { id: projectId },
    data: {
      weddingDate,
      hasNoDate,
      location: location || null,
      currency: currency || "EUR",
      guestCountTarget: isNaN(guestCountTarget) ? 0 : guestCountTarget,
    },
  });

  revalidatePath("/settings");
  return { success: "Hochzeitsdetails erfolgreich aktualisiert" };
}

// ── Support Messages ──────────────────────────────────

export async function sendSupportMessage(data: {
  userId: string;
  subject: string;
  message: string;
}) {
  try {
    const { userId, subject, message } = data;

    if (!userId || !subject || !message) {
      return { success: false, error: "Betreff und Nachricht sind erforderlich." };
    }
    if (subject.length > 200) {
      return { success: false, error: "Der Betreff darf maximal 200 Zeichen lang sein." };
    }
    if (message.length > 5000) {
      return { success: false, error: "Die Nachricht darf maximal 5000 Zeichen lang sein." };
    }

    await prisma.supportMessage.create({
      data: { userId, subject, message },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("sendSupportMessage error:", error);
    return { success: false, error: "Fehler beim Senden der Nachricht." };
  }
}

export async function getSupportMessages(userId: string) {
  return prisma.supportMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
