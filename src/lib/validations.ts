import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

export const OnboardingSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  partnerName: z.string().min(1, "Name des Partners ist erforderlich"),
  weddingDate: z.string().optional(),
  hasNoDate: z.boolean().default(false),
});

export const BudgetCategorySchema = z.object({
  name: z.string().min(1, "Kategoriename ist erforderlich"),
  plannedAmount: z.coerce.number().min(0, "Betrag muss positiv sein"),
});

export const BudgetItemSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1, "Name ist erforderlich"),
  plannedAmount: z.coerce.number().min(0),
  actualAmount: z.coerce.number().min(0).optional(),
  paymentStatus: z.enum(["UNPAID", "DEPOSIT_PAID", "PARTIALLY_PAID", "FULLY_PAID"]).optional(),
  notes: z.string().optional(),
});

export const TaskSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]).optional(),
});

export const ProfileSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  partnerName: z.string().min(1, "Name des Partners ist erforderlich"),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
});

export const WeddingDetailsSchema = z.object({
  weddingDate: z.string().optional(),
  hasNoDate: z.boolean().default(false),
  location: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  newPassword: z.string().min(6, "Neues Passwort muss mindestens 6 Zeichen lang sein"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmNewPassword"],
});

export const GuestSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  source: z.enum(["GROOM_SIDE", "BRIDE_SIDE"]).optional().nullable(),
  category: z.enum(["FRIEND", "FAMILY", "COLLEAGUE", "STRANGER"]).optional().nullable(),
  role: z.enum(["GENERAL_INVITE", "PLUS_ONE"]).optional().nullable(),
  age: z.enum(["ADULT", "TEENAGER", "KID", "BABY"]).optional().nullable(),
  diet: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "DECLINED"]).optional(),
  tableNumber: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
});
