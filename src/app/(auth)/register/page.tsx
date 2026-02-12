import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Registrieren | MarryBetter.com",
  description: "Erstelle dein MarryBetter.com Konto",
};

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text tracking-tight">
          Konto erstellen
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Lass uns mit der Hochzeitsplanung beginnen.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
