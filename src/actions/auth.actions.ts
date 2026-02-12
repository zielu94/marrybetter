"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { RegisterSchema, OnboardingSchema } from "@/lib/validations";
import { DEFAULT_BUDGET_CATEGORIES, DEFAULT_TASK_TEMPLATES } from "@/types";
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

  const project = await prisma.weddingProject.create({
    data: {
      userId,
      weddingDate: parsedDate,
      hasNoDate,
    },
  });

  // Seed default budget categories
  await prisma.budgetCategory.createMany({
    data: DEFAULT_BUDGET_CATEGORIES.map((name, index) => ({
      weddingProjectId: project.id,
      name,
      sortOrder: index,
    })),
  });

  // Seed default tasks
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
    // Create tasks without dates
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

  redirect("/dashboard");
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/");
}
