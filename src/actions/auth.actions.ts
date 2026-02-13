"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { RegisterSchema, OnboardingSchema } from "@/lib/validations";
import {
  DEFAULT_BUDGET_CATEGORIES,
  DEFAULT_TASK_TEMPLATES,
  DEFAULT_FOOD_CATEGORIES,
  DEFAULT_DRINK_CATEGORIES,
  DEFAULT_PACKING_ITEMS_WEDDING,
  DEFAULT_PACKING_ITEMS_HONEYMOON,
  DEFAULT_SCHEDULE_EVENTS,
} from "@/types";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function register(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = RegisterSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { email, password } = validated.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Diese E-Mail-Adresse ist bereits registriert." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Registrierung fehlgeschlagen." };
    }
    throw error;
  }

  redirect("/onboarding");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Ungültige E-Mail oder Passwort." };
    }
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.onboarded) {
    redirect("/dashboard");
  } else {
    redirect("/onboarding");
  }
}

function generateSlugFromNames(name: string, partnerName: string): string {
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/[ß]/g, "ss")
      .replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const first = normalize(name.split(" ")[0] || name);
  const second = normalize(partnerName.split(" ")[0] || partnerName);
  return `${first}-${second}`;
}

export async function completeOnboarding(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    partnerName: formData.get("partnerName") as string,
    weddingDate: formData.get("weddingDate") as string || undefined,
    hasNoDate: formData.get("hasNoDate") === "on",
  };

  const validated = OnboardingSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { name, partnerName, weddingDate, hasNoDate } = validated.data;

  const userId = formData.get("userId") as string;
  if (!userId) return { error: "User nicht gefunden." };

  const parsedDate = weddingDate && !hasNoDate ? new Date(weddingDate) : null;

  // Check if already onboarded (prevent double-submit)
  const existingProject = await prisma.weddingProject.findUnique({ where: { userId } });
  if (existingProject) {
    redirect("/dashboard");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      partnerName,
      onboarded: true,
    },
  });

  // Generate slug
  let slug = generateSlugFromNames(name, partnerName);
  const existingSlug = await prisma.weddingProject.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const project = await prisma.weddingProject.create({
    data: {
      userId,
      weddingDate: parsedDate,
      hasNoDate,
      slug,
    },
  });

  // ── 1. Budget categories ──
  await prisma.budgetCategory.createMany({
    data: DEFAULT_BUDGET_CATEGORIES.map((catName, index) => ({
      weddingProjectId: project.id,
      name: catName,
      sortOrder: index,
    })),
  });

  // ── 2. Tasks ──
  if (parsedDate) {
    const tasks = DEFAULT_TASK_TEMPLATES.map((template, index) => {
      const dueDate = new Date(parsedDate);
      dueDate.setMonth(dueDate.getMonth() - template.monthsBefore);
      return {
        weddingProjectId: project.id,
        title: template.title,
        category: template.category,
        dueDate,
        priority: template.priority,
        isFromTemplate: true,
        sortOrder: index,
      };
    });
    await prisma.task.createMany({ data: tasks });
  } else {
    const tasks = DEFAULT_TASK_TEMPLATES.map((template, index) => ({
      weddingProjectId: project.id,
      title: template.title,
      category: template.category,
      priority: template.priority,
      isFromTemplate: true,
      sortOrder: index,
    }));
    await prisma.task.createMany({ data: tasks });
  }

  // ── 3. Food categories (Speisen + Getränke) ──
  const allFoodCategories = [
    ...DEFAULT_FOOD_CATEGORIES.map((catName, i) => ({ name: catName, sortOrder: i })),
    ...DEFAULT_DRINK_CATEGORIES.map((catName, i) => ({ name: catName, sortOrder: DEFAULT_FOOD_CATEGORIES.length + i })),
  ];
  await prisma.foodCategory.createMany({
    data: allFoodCategories.map((cat) => ({
      weddingProjectId: project.id,
      name: cat.name,
      sortOrder: cat.sortOrder,
    })),
  });

  // ── 4. Packing items ──
  const packingItems = [
    ...DEFAULT_PACKING_ITEMS_WEDDING.map((itemName, i) => ({
      weddingProjectId: project.id,
      name: itemName,
      category: "WEDDING_WEEKEND",
      sortOrder: i,
    })),
    ...DEFAULT_PACKING_ITEMS_HONEYMOON.map((itemName, i) => ({
      weddingProjectId: project.id,
      name: itemName,
      category: "HONEYMOON",
      sortOrder: DEFAULT_PACKING_ITEMS_WEDDING.length + i,
    })),
  ];
  await prisma.packingItem.createMany({ data: packingItems });

  // ── 5. Schedule (wedding day template) ──
  const scheduleDay = await prisma.scheduleDay.create({
    data: {
      weddingProjectId: project.id,
      name: "Hochzeitstag",
      date: parsedDate,
      sortOrder: 0,
    },
  });

  await prisma.scheduleEvent.createMany({
    data: DEFAULT_SCHEDULE_EVENTS.map((event, index) => ({
      scheduleDayId: scheduleDay.id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      owner: event.owner ?? null,
      sortOrder: index,
    })),
  });

  redirect("/dashboard");
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/");
}
